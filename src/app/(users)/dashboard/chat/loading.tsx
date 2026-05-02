import { ChatSkeleton } from "@/features/chat/components/ChatSkeleton";

// Delegates this route segment to the shared chat skeleton.
export default function Loading() {
  return <ChatSkeleton />;
}
