import mongoose from "mongoose";
import { registerModels } from "@/models/registerModels";

let cachedPromise: Promise<typeof mongoose> | null = null;

export async function connect() {
  // Ensure referenced schemas are registered before any populate() runs.
  registerModels();

  // 1 = connected, 2 = connecting
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState === 2) {
    if (cachedPromise) await cachedPromise;
    return;
  }

  const DB = process.env.DATABASE_URI?.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD ?? "",
  );

  if (!DB || !process.env.DATABASE_PASSWORD) {
    throw new Error("Database URI or password is not defined in env variables");
  }

  cachedPromise = mongoose
    .connect(DB, {
      bufferCommands: false,
    })
    .then((m) => {
      console.log("✅ MongoDB connected:", m.connection.host);
      return m;
    })
    .catch((err) => {
      cachedPromise = null;
      console.error("❌ MongoDB connection error:", err);
      throw err;
    });

  await cachedPromise;
}
