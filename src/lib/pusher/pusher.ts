// lib/pusher.ts
import Pusher from "pusher";
import PusherClient from "pusher-js";

// server
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// const pusher = new Pusher({
//     appId: "2042876",
//     key: "0e3bdf8427348923f508",
//     secret: "d427f929e7af528c56f0",
//     cluster: "us2",
//     useTLS: true
//   });

// client
export const getPusherClient = () =>
  new PusherClient(process.env.PUSHER_KEY!, {
    cluster: process.env.PUSHER_CLUSTER!,
    forceTLS: true,
  });
