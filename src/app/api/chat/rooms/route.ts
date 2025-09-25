// app/api/chat/rooms/route.ts
import "@/models/ticketModel";
import "@/models/userModel";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import ChatRoom from "@/models/chatRoom";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import Ticket from "@/models/ticketModel";
import ChatMessage from "@/models/chatMessage";

export async function GET(req: Request) {
  try {
    const verify = await getUserFromCookies();
    if (!verify?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!Types.ObjectId.isValid(verify.id)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    // --- business filter (from user’s current business) ---
    const businessId = verify.currentBusiness; // ensure your auth sets this
    if (!businessId || !Types.ObjectId.isValid(businessId)) {
      return NextResponse.json(
        { error: "Missing/invalid currentBusiness" },
        { status: 400 }
      );
    }

    // 1) tickets in this business
    const ticketIds = await Ticket.find({
      business: new Types.ObjectId(businessId),
    }).distinct("_id");

    console.log({ businessId });
    console.log({ ticketIds });

    if (ticketIds.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // 2) rooms for those tickets + user is a participant
    // const roomsRaw = await ChatRoom.find({
    //   ticket: { $in: ticketIds },
    //   "participants.user": new Types.ObjectId(verify.id),
    //   $or: [{ isArchived: { $exists: false } }, { isArchived: false }],
    // })
    //   // keep _id so we can convert to id during normalization
    //   .select("ticket participants lastMessageAt updatedAt _id")
    //   .populate({
    //     path: "ticket",
    //     select: "title status priority _id category propertyName unitLabel",
    //     populate: [
    //       { path: "category", select: "name _id" },
    //       { path: "user", select: "name _id email" },
    //     ],
    //   })
    //   .populate({ path: "participants.user", select: "name photo _id" })
    //   .sort({ lastMessageAt: -1, updatedAt: -1 })
    //   .limit(limit)
    //   .lean();

    // const data = roomsRaw.map(normalizeChatRoom);
    // return NextResponse.json({ data }, { status: 200 });

    const roomsRaw = await ChatRoom.find({
      ticket: { $in: ticketIds },
      "participants.user": new Types.ObjectId(verify.id),
      $or: [{ isArchived: { $exists: false } }, { isArchived: false }],
    })
      .select("ticket participants lastMessageAt updatedAt _id")
      .populate({
        path: "ticket",
        select: "title status priority _id category propertyName unitLabel",
        populate: [
          { path: "category", select: "name _id" },
          { path: "user", select: "name _id email" },
        ],
      })
      .populate({ path: "participants.user", select: "name photo _id" })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .limit(limit)
      .lean();

    // For each room, compute unreadCount
    const data = await Promise.all(
      roomsRaw.map(async (doc) => {
        const viewerP = doc.participants.find(
          (p: any) => String(p.user?._id ?? p.user) === verify.id
        );

        let unreadCount = 0;
        if (viewerP) {
          const baseMatch: any = {
            room: doc._id,
            sender: { $ne: new Types.ObjectId(verify.id) },
          };

          if (viewerP.lastReadMessageId) {
            baseMatch._id = {
              $gt: new Types.ObjectId(viewerP.lastReadMessageId),
            };
          } else if (viewerP.joinedAt) {
            baseMatch.createdAt = { $gte: viewerP.joinedAt };
          }

          unreadCount = await ChatMessage.countDocuments(baseMatch);
        }

        const out = normalizeChatRoom(doc);
        out.unreadCount = unreadCount;
        return out;
      })
    );

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    const msg = err?.message || "Failed to fetch chat rooms";
    const code = /unauthorized|forbidden/i.test(msg) ? 401 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}

// lib/normalizeChatRoom.ts
function normalizeChatRoom(doc: any) {
  const out: any = { ...doc };

  // room id
  if (out._id) {
    out.id = String(out._id);
    delete out._id;
  }

  // ticket id
  if (out.ticket?._id) {
    out.ticket = { ...out.ticket, id: String(out.ticket._id) };
    delete out.ticket._id;
  }

  // participants + nested user ids
  if (Array.isArray(out.participants)) {
    out.participants = out.participants.map((p: any) => {
      const np: any = { ...p };
      if (np._id) {
        np.id = String(np._id);
        delete np._id;
      }
      if (np.user?._id) {
        np.user = { ...np.user, id: String(np.user._id) };
        delete np.user._id;
      }
      return np;
    });
  }

  return out;
}
