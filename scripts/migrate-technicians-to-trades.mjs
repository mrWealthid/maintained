#!/usr/bin/env node

/**
 * Migrate legacy ROLES.technician workspace members into the new
 * Tradesperson + WorkspaceTrade model. Idempotent — safe to re-run.
 *
 * For each User with at least one workspace membership where role==='TECHNICIAN':
 *   1. Ensure a Tradesperson exists (one per User). Carries over name as
 *      businessName, email, specialties, accountKind=trade on the User.
 *   2. For every workspace where that user is a technician, ensure a
 *      WorkspaceTrade(status=active) exists.
 *
 * Usage:
 *   node scripts/migrate-technicians-to-trades.mjs [--dry-run] [--limit N]
 *
 * --dry-run     Don't write anything. Print what would change.
 * --limit N     Cap how many legacy technician users are processed.
 * --help        Show this help.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import mongoose from "mongoose";

const ACCOUNT_KIND_TRADE = "trade";
const ROLE_TECHNICIAN = "TECHNICIAN";
const MEMBERSHIP_ACTIVE = ["activated", "ACTIVE", "ACTIVATED"];
const WORKSPACE_TRADE_STATUS_ACTIVE = "active";
const TRADE_VERIFICATION_UNVERIFIED = "unverified";

const SHORT_ID_ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz";

function printUsage() {
  console.log(`Usage:
  node scripts/migrate-technicians-to-trades.mjs [options]

Options:
  --dry-run     Don't write anything. Print what would change.
  --limit N     Cap how many legacy technician users are processed.
  --help        Show this help.
`);
}

function parseArgs(argv) {
  const args = { dryRun: false, limit: Infinity };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      printUsage();
      process.exit(0);
    } else if (a === "--dry-run") {
      args.dryRun = true;
    } else if (a === "--limit") {
      args.limit = Number(argv[i + 1] ?? "0");
      i += 1;
      if (!Number.isFinite(args.limit) || args.limit <= 0) {
        throw new Error("--limit must be a positive number");
      }
    }
  }
  return args;
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function resolveDatabaseUri() {
  const uri = process.env.DATABASE_URI ?? "";
  const pw = process.env.DATABASE_PASSWORD ?? "";
  if (!uri) throw new Error("DATABASE_URI is missing in .env");
  return uri.replace("<PASSWORD>", pw);
}

function slugify(input) {
  if (!input) return "";
  const ascii = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii.slice(0, 60).replace(/-+$/g, "");
}

function shortId(len = 6) {
  const hex = crypto.randomBytes(16).toString("hex");
  let out = "";
  for (let i = 0; i < len; i++) {
    const nibble = parseInt(hex[i] ?? "0", 16);
    out += SHORT_ID_ALPHABET[nibble % SHORT_ID_ALPHABET.length];
  }
  return out;
}

function buildTradeSlug(businessName) {
  const base = slugify(businessName) || "trade";
  return `${base}-${shortId()}`;
}

function isActiveMembership(m) {
  if (!m) return false;
  if (typeof m.status === "string") {
    return MEMBERSHIP_ACTIVE.includes(m.status);
  }
  return true; // some legacy memberships have no status field
}

async function run() {
  const args = parseArgs(process.argv);
  loadEnvFile();
  const uri = resolveDatabaseUri();

  console.log(
    args.dryRun
      ? "🟡 DRY RUN — no writes will be performed"
      : "🟢 LIVE — writes will be applied",
  );

  await mongoose.connect(uri, { bufferCommands: false });

  const users = mongoose.connection.collection("users");
  const tradespeople = mongoose.connection.collection("tradespeople");
  const workspaceTrades = mongoose.connection.collection("workspacetrades");

  const cursor = users
    .find({ "memberships.role": ROLE_TECHNICIAN })
    .limit(args.limit === Infinity ? 0 : args.limit);

  let processed = 0;
  let createdTrades = 0;
  let updatedUsers = 0;
  let createdLinks = 0;

  for await (const user of cursor) {
    processed += 1;
    const techMemberships = (user.memberships ?? []).filter(
      (m) => m.role === ROLE_TECHNICIAN && isActiveMembership(m),
    );
    if (techMemberships.length === 0) continue;

    // Aggregate specialties across all technician memberships. Default to
    // GENERAL_HANDYMAN when the legacy record has none so the resulting
    // Tradesperson satisfies the ≥1-specialty invariant (broadcast routing
    // filters by specialty).
    const specialtySet = new Set();
    for (const m of techMemberships) {
      for (const s of m.specialties ?? []) specialtySet.add(s);
    }
    const specialties = specialtySet.size > 0
      ? Array.from(specialtySet)
      : ["GENERAL_HANDYMAN"];

    // 1. Find or create Tradesperson for this user.
    let trade = await tradespeople.findOne({ userId: user._id });
    if (!trade) {
      const slug = buildTradeSlug(user.name ?? "");
      const now = new Date();
      const doc = {
        userId: user._id,
        slug,
        businessName: user.name ?? "Tradesperson",
        contactEmail: user.email,
        contactPhone: user.contact,
        specialties,
        verificationStatus: TRADE_VERIFICATION_UNVERIFIED,
        isActive: true,
        onboarding: { completedAt: now }, // legacy techs are pre-onboarded
        createdAt: now,
        updatedAt: now,
      };
      if (args.dryRun) {
        console.log(`  + Tradesperson(slug=${slug}) for user ${user.email}`);
      } else {
        await tradespeople.insertOne(doc);
      }
      createdTrades += 1;
      trade = doc;
    }

    // 2. Set accountKind on the user (idempotent — only writes if missing).
    if (user.accountKind !== ACCOUNT_KIND_TRADE) {
      if (args.dryRun) {
        console.log(`  ~ User ${user.email} accountKind → ${ACCOUNT_KIND_TRADE}`);
      } else {
        await users.updateOne(
          { _id: user._id },
          { $set: { accountKind: ACCOUNT_KIND_TRADE } },
        );
      }
      updatedUsers += 1;
    }

    // 3. For each workspace, ensure a WorkspaceTrade row.
    for (const m of techMemberships) {
      const tradeId =
        trade._id ??
        (await tradespeople.findOne({ userId: user._id }))?._id; // freshly inserted
      if (!tradeId) continue;
      const existing = await workspaceTrades.findOne({
        workspace: m.business,
        tradesperson: tradeId,
      });
      if (existing) continue;
      const now = new Date();
      const doc = {
        workspace: m.business,
        tradesperson: tradeId,
        addedBy: user._id, // best available — the user themself
        status: WORKSPACE_TRADE_STATUS_ACTIVE,
        invitedEmail: user.email,
        createdAt: now,
        updatedAt: now,
      };
      if (args.dryRun) {
        console.log(
          `  + WorkspaceTrade(workspace=${m.business}, trade=${tradeId})`,
        );
      } else {
        await workspaceTrades.insertOne(doc);
      }
      createdLinks += 1;
    }
  }

  console.log("");
  console.log("Summary");
  console.log(`  Users processed     : ${processed}`);
  console.log(`  Tradespeople created: ${createdTrades}`);
  console.log(`  Users updated       : ${updatedUsers}`);
  console.log(`  Workspace links     : ${createdLinks}`);
  console.log(args.dryRun ? "(dry run — nothing was written)" : "Done.");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
