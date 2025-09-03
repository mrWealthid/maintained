// app/api/pusher/auth/route.ts
import { NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies"; // your auth helper
import { pusherServer } from "@/lib/pusher/pusher";

export async function POST(req: Request) {
  try {
    // Pusher sends x-www-form-urlencoded with socket_id & channel_name
    const form = await req.formData();
    const socketId = form.get("socket_id") as string | null;
    const channelName = form.get("channel_name") as string | null;

    if (!socketId || !channelName) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    // Authenticate your user however you do it
    const me = await getUserFromCookies();
    if (!me?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If channel is "presence-...", you should include presence data
    // If it's "private-...", omit the 3rd arg (or pass undefined)
    let auth: any;
    if (channelName.startsWith("presence-")) {
      const presenceData = {
        user_id: String(me.id),
        // user_info: {
        //   name: me.name,
        //   avatar: me.photo,
        //   // add any lightweight info you want all members to see
        // },
      };
      auth = pusherServer.authenticate(socketId, channelName, presenceData);
    } else {
      auth = pusherServer.authenticate(socketId, channelName);
    }

    return NextResponse.json(auth);
  } catch (e) {
    console.error("Pusher auth error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
