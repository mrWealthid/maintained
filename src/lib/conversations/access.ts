import "server-only";
import { Types } from "mongoose";

import { ApiError } from "@/lib/errors/apiError";
import {
  getVerifiedUserState,
  VERIFIED_USER_STATE_STATUS,
  type VerifiedUser,
} from "@/lib/auth/getVerifiedUser";
import { ACCOUNT_KIND } from "@/shared/enums/account-kind";
import User from "@/models/userModel";
import Tradesperson, { type ITradesperson } from "@/models/tradespersonModel";
import { type IConversation } from "@/models/conversationModel";
import { CONVERSATION_SENDER_KIND } from "@/features/conversations/models/conversation-types.model";

export type ConversationViewer =
  | {
      role: typeof CONVERSATION_SENDER_KIND.TRADE;
      userId: string;
      tradesperson: ITradesperson;
    }
  | {
      role: typeof CONVERSATION_SENDER_KIND.MANAGER;
      userId: string;
      workspaceId: string;
      verified: VerifiedUser;
    };

/**
 * Resolve who the current session is, from the conversation's perspective.
 * Trade users (accountKind=TRADE) → trade role with the resolved profile.
 * Anyone else with an active workspace → manager role scoped to that
 * workspace. Unauthenticated / mismatched → throw.
 */
export async function resolveConversationViewer(): Promise<ConversationViewer> {
  const state = await getVerifiedUserState();
  if (state.status !== VERIFIED_USER_STATE_STATUS.AUTHORIZED) {
    throw ApiError.unauthorized();
  }

  const user = await User.findById(state.user.id)
    .select("accountKind")
    .lean<{ accountKind?: string }>();

  if (user?.accountKind === ACCOUNT_KIND.TRADE) {
    const trade = await Tradesperson.findOne({ userId: state.user.id });
    if (!trade) throw ApiError.forbidden("Trade profile required");
    return {
      role: CONVERSATION_SENDER_KIND.TRADE,
      userId: state.user.id,
      tradesperson: trade,
    };
  }

  if (!state.user.currentBusiness) {
    throw ApiError.forbidden("Workspace context required");
  }

  return {
    role: CONVERSATION_SENDER_KIND.MANAGER,
    userId: state.user.id,
    workspaceId: state.user.currentBusiness,
    verified: state.user,
  };
}

/**
 * Throw if the resolved viewer is not authorized to read/write this
 * conversation. Used by every conversation-scoped API after the
 * conversation has been loaded.
 */
export function assertCanAccessConversation(
  viewer: ConversationViewer,
  conversation: IConversation,
) {
  if (viewer.role === CONVERSATION_SENDER_KIND.TRADE) {
    if (
      String(conversation.tradesperson) !==
      String(viewer.tradesperson._id as Types.ObjectId)
    ) {
      throw ApiError.forbidden(
        "Conversation belongs to a different tradesperson",
      );
    }
    return;
  }
  if (String(conversation.workspace) !== String(viewer.workspaceId)) {
    throw ApiError.forbidden(
      "Conversation belongs to a different workspace",
    );
  }
}
