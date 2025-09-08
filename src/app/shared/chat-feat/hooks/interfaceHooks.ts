import { useEffect, useRef } from "react";
import { markReadUpTo } from "../services/chat.service";

export function useBottomSentinel(roomId: string, lastMessageId?: string) {
  const sentRef = useRef<HTMLDivElement | null>(null);
  const lastSentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sentRef.current || !lastMessageId) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          lastMessageId !== lastSentRef.current
        ) {
          markReadUpTo(roomId, lastMessageId)
            .then(() => {
              lastSentRef.current = lastMessageId;
            })
            .catch(() => {
              lastSentRef.current = null;
            });
        }
      },
      { root: null, rootMargin: "0px 0px 0px 0px", threshold: 0.01 }
    );
    io.observe(sentRef.current);
    return () => io.disconnect();
  }, [roomId, lastMessageId]);

  return sentRef;
}
