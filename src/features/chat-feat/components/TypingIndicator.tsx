import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Participant } from "../model/chat.model";

const uid = (p: Participant) =>
  typeof p.user === "string" ? p.user : (p.user.id ?? p.user.id);

const uname = (p: Participant) =>
  typeof p.user === "string" ? "" : (p.user.name ?? "");

const uphoto = (p: Participant) =>
  typeof p.user === "string" ? "" : (p.user.avatar ?? "");

export function TypingIndicator({
  typingUsers,
  participants,
  meId,
}: {
  typingUsers: Record<string, number>;
  participants: Participant[];
  meId: string;
}) {
  const typingIds = Object.keys(typingUsers).filter((id) => id !== meId);
  if (!typingIds.length) return null;

  // match typing users to participant objects (first 3)
  const people = participants
    .filter((p) => typingIds.includes(uid(p)))
    .slice(0, 3);

  // label like: "Alex is typing…" / "Alex and Beatrice…" / "Several people…"
  const names = people.map(uname).filter(Boolean);
  let label = "Several people are typing…";
  if (names.length === 1) {
    label = `${names[0]} is typing…`;
  } else if (names.length === 2) {
    label = `${names[0]} and ${names[1]} are typing…`;
  }

  return (
    <div className="flex items-center space-x-3 py-2">
      {/* show up to 3 avatars */}
      <div className="flex -space-x-2">
        {people.map((p) => {
          const name = uname(p) || "…";
          const photo = uphoto(p);
          return (
            <Avatar key={uid(p)} className="h-8 w-8 ring-2 ring-background">
              {photo ? <AvatarImage src={photo} alt={name} /> : null}
              <AvatarFallback>{name.slice(0, 2) || "…"}</AvatarFallback>
            </Avatar>
          );
        })}
      </div>

      {/* your bouncing dots bubble */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
        <div className="flex space-x-1 items-center">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <span className="ml-2 text-xs text-muted-foreground">{label}</span>
        </div>
      </div>
    </div>
  );
}
