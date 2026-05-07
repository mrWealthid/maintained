/* eslint-disable no-console */
import mongoose from "mongoose";

async function main() {
  const uri = process.env.DATABASE_URI;
  if (!uri) {
    console.error("DATABASE_URI is not set. Aborting.");
    process.exit(1);
  }

  // Parse the database name out of the URI for an explicit log line.
  const dbName = (() => {
    try {
      const path = new URL(uri).pathname.replace(/^\//, "");
      return path.split("?")[0] || "(default)";
    } catch {
      return "(unparseable)";
    }
  })();

  const confirm = process.argv.includes("--yes");

  console.log(`Target database: ${dbName}`);
  console.log(`URI host:        ${new URL(uri).host}`);

  if (!confirm) {
    console.log("\nDry run. Re-run with --yes to actually drop.");
    process.exit(0);
  }

  await mongoose.connect(uri);
  const conn = mongoose.connection;
  console.log(`Connected to ${conn.name}. Dropping…`);
  await conn.dropDatabase();
  console.log(`Dropped ${conn.name}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
