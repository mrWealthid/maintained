// app/api/pusher/auth/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { pusherServer } from "@/lib/pusher/pusher";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const socketId = form.get("socket_id") as string | null;
    const channelName = form.get("channel_name") as string | null;

    if (!socketId || !channelName) {
      throw ApiError.badRequest("Missing socket_id or channel_name");
    }

    const me = await getUserFromCookies();
    if (!me?.id) throw ApiError.forbidden("Unauthorized");

    const auth = channelName.startsWith("presence-")
      ? pusherServer.authenticate(socketId, channelName, {
          user_id: String(me.id),
        })
      : pusherServer.authenticate(socketId, channelName);

    return NextResponse.json(auth);
  } catch (error) {
    return errorToNextResponse(error, req.headers.get("x-request-id"));
  }
}
