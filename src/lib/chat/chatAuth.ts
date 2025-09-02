// lib/chatAuth.ts
import ChatRoom from "@/models/chatRoom";

export async function assertRoomAccess(roomId: string, userId: string) {
  const room = await ChatRoom.findById(roomId, {
    participants: 1,
    isArchived: 1,
  });
  if (!room || room.isArchived) throw new Error("Room not found");
  const ok = room.participants.some((p: any) => p.user.toString() === userId);
  if (!ok) throw new Error("Forbidden");
  return room;
}
