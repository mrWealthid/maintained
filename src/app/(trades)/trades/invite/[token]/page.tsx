import Link from "next/link";

import { connect } from "@/dbConfig/dbConfig";
import WorkspaceTrade from "@/models/workspaceTradeModel";
import Business from "@/models/businessModel";
import Tradesperson from "@/models/tradespersonModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AcceptInviteButton from "@/features/trades/components/AcceptInviteButton";
import { WORKSPACE_TRADE_STATUS } from "@/features/trades/models/trade-status.model";

export const dynamic = "force-dynamic";

/**
 * Public accept page for a `WorkspaceTrade` invite. Server-renders the
 * workspace context so the trade can confirm they recognise it before
 * accepting. The actual accept click hits `/api/trades/invite/accept` —
 * which itself requires an authed `accountKind=trade` session, so the
 * page also handles the "you need to sign in first" branch.
 */
export default async function TradeInviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  await connect();

  const link = await WorkspaceTrade.findOne({ inviteToken: token })
    .lean<{
      _id: unknown;
      workspace: unknown;
      tradesperson: unknown;
      status: string;
      inviteTokenExpires?: Date;
      invitedEmail?: string;
    } | null>();

  if (!link) {
    return (
      <Centered>
        <Card>
          <CardHeader>
            <CardTitle>Invite not found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This invite link is invalid or has already been used.</p>
            <p>
              If you think this is a mistake, ask the workspace to send a new
              invite.
            </p>
          </CardContent>
        </Card>
      </Centered>
    );
  }

  if (link.status === WORKSPACE_TRADE_STATUS.ACTIVE) {
    return (
      <Centered>
        <Card>
          <CardHeader>
            <CardTitle>Already accepted</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            You&apos;re already linked to this workspace.{" "}
            <Link href="/trades" className="underline underline-offset-2">
              Open my dashboard
            </Link>
          </CardContent>
        </Card>
      </Centered>
    );
  }

  if (
    link.inviteTokenExpires &&
    link.inviteTokenExpires.getTime() < Date.now()
  ) {
    return (
      <Centered>
        <Card>
          <CardHeader>
            <CardTitle>Invite expired</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Ask the workspace to send a new invite.
          </CardContent>
        </Card>
      </Centered>
    );
  }

  const [business, trade] = await Promise.all([
    Business.findById(link.workspace).select("name").lean<{ name?: string }>(),
    Tradesperson.findById(link.tradesperson)
      .select("businessName contactEmail")
      .lean<{ businessName?: string; contactEmail?: string }>(),
  ]);

  return (
    <Centered>
      <Card>
        <CardHeader>
          <CardTitle>Join {business?.name ?? "this workspace"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            You&apos;ve been invited to join{" "}
            <span className="font-semibold">{business?.name ?? "a workspace"}</span>
            &apos;s tradesperson list
            {trade?.businessName ? (
              <>
                {" "}as <span className="font-semibold">{trade.businessName}</span>
              </>
            ) : null}
            .
          </p>
          <p className="text-muted-foreground">
            Once you accept, you&apos;ll receive repair requests broadcast by
            this workspace and can submit quotes in your dashboard.
          </p>
          <AcceptInviteButton token={token} />
          <p className="text-xs text-muted-foreground">
            Not signed in?{" "}
            <Link
              href={`/auth/login?next=${encodeURIComponent(`/trades/invite/${token}`)}`}
              className="underline underline-offset-2"
            >
              Sign in to {trade?.contactEmail ?? "your trade account"}
            </Link>
            {" "}or{" "}
            <Link
              href="/trades/signup"
              className="underline underline-offset-2"
            >
              create one
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
