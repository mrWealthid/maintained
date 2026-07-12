import mongoose from "mongoose";

import AppConfig from "@/models/appConfigModel";
import AuthSession from "@/models/authSessionModel";
import Business from "@/models/businessModel";
import ChatMessage from "@/models/chatMessage";
import ChatRoom from "@/models/chatRoom";
import Conversation from "@/models/conversationModel";
import ConversationMessage from "@/models/conversationMessageModel";
import Property from "@/models/propertyModel";
import RoleDefinition from "@/models/roleDefinitionModel";
import RepairRequest from "@/models/repairRequestModel";
import RepairQuote from "@/models/repairQuoteModel";
import { TechnicianRequest } from "@/models/technicanRequest";
import { TicketActivity } from "@/models/ticketActivity";
import TicketCategory from "@/models/ticketCategoryModel";
import Ticket from "@/models/ticketModel";
import TicketType from "@/models/ticketTypeModel";
import Unit from "@/models/unitModel";
import User from "@/models/userModel";
import UserPermissionOverride from "@/models/userPermissionOverrideModel";
import WorkspaceInvite from "@/models/workspaceInviteModel";
import WorkspaceMembership from "@/models/workspaceMembershipModel";

let registered = false;

const REQUIRED_MODEL_NAMES = [
  "AppConfig",
  "AuthSession",
  "Business",
  "ChatMessage",
  "ChatRoom",
  "Conversation",
  "ConversationMessage",
  "Property",
  "RoleDefinition",
  "RepairRequest",
  "RepairQuote",
  "TechnicianRequest",
  "TicketActivity",
  "TicketCategory",
  "Ticket",
  "TicketType",
  "Unit",
  "User",
  "UserPermissionOverride",
  "WorkspaceInvite",
  "WorkspaceMembership",
] as const;

function touchModelExports() {
  void AppConfig;
  void AuthSession;
  void Business;
  void ChatMessage;
  void ChatRoom;
  void Conversation;
  void ConversationMessage;
  void Property;
  void RoleDefinition;
  void RepairRequest;
  void RepairQuote;
  void TechnicianRequest;
  void TicketActivity;
  void TicketCategory;
  void Ticket;
  void TicketType;
  void Unit;
  void User;
  void UserPermissionOverride;
  void WorkspaceInvite;
  void WorkspaceMembership;
}

function assertRequiredModelsRegistered() {
  const missingModels = REQUIRED_MODEL_NAMES.filter(
    (modelName) => !mongoose.models[modelName],
  );

  if (missingModels.length) {
    throw new Error(
      `Missing registered Mongoose model(s): ${missingModels.join(", ")}`,
    );
  }
}

export function registerModels() {
  if (registered) {
    assertRequiredModelsRegistered();
    return;
  }

  // Touch model exports so Mongoose compiles/registers them once per runtime.
  // Required so .populate() works in routes that only import a single model.
  touchModelExports();
  assertRequiredModelsRegistered();

  registered = true;
}
