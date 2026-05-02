import { MessageSkeleton } from "./MessageSkeleton";

export const MessageListSkeleton = () => (
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <MessageSkeleton key={i} />
    ))}
  </div>
);
