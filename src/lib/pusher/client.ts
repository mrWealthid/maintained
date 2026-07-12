import PusherClient from "pusher-js";

let client: PusherClient | null = null;

export function getPusherClient() {
  if (typeof window === "undefined") return null;
  if (client) return client;

  client = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true,
    authEndpoint: "/api/pusher/auth",
  });

  return client;
}
