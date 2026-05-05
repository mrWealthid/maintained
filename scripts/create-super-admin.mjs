#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const PLATFORM_WORKSPACE_REGISTRATION_ID = "PLATFORM-INTERNAL";

function printUsage() {
  console.log(`Usage:
  npm run create:super-admin -- --email admin@example.com --name "Platform Admin"

Options:
  --email <email>          Email address to create or promote
  --name <name>            Display name for a new account (default: "Super Admin")
  --password <password>    Set an explicit password
  --reset-password         Generate and apply a fresh password for an existing account
  --help                   Show this help text

Examples:
  npm run create:super-admin -- --email admin@example.com --name "Wealth Iduwe"
  npm run create:super-admin -- --email admin@example.com --reset-password
  npm run create:super-admin -- --email admin@example.com --password "StrongPass123!"
`);
}

function parseArgs(argv) {
  const args = {
    email: "",
    name: "Super Admin",
    password: "",
    resetPassword: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];

    if (value === "--help" || value === "-h") {
      args.help = true;
      continue;
    }
    if (value === "--reset-password") {
      args.resetPassword = true;
      continue;
    }
    if (value === "--email") {
      args.email = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (value === "--name") {
      args.name = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (value === "--password") {
      args.password = argv[i + 1] ?? "";
      i += 1;
    }
  }

  return args;
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    throw new Error("Missing .env file in the project root");
  }

  const envText = fs.readFileSync(envPath, "utf8");
  for (const rawLine of envText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function resolveDatabaseUri() {
  const uriTemplate = process.env.DATABASE_URI ?? "";
  const password = process.env.DATABASE_PASSWORD ?? "";
  if (!uriTemplate) {
    throw new Error("DATABASE_URI is missing in .env");
  }
  return uriTemplate.replace("<PASSWORD>", password);
}

function buildGeneratedPassword() {
  return crypto.randomBytes(12).toString("base64url");
}

async function ensurePlatformWorkspace(businesses) {
  const existing = await businesses.findOne({
    registrationId: PLATFORM_WORKSPACE_REGISTRATION_ID,
  });
  if (existing) return existing;

  const now = new Date();
  const result = await businesses.insertOne({
    name: "Platform",
    registrationId: PLATFORM_WORKSPACE_REGISTRATION_ID,
    contact: "platform@maintainly.app",
    countryCode: "US",
    country: "United States",
    address: "Platform internal workspace",
    description: "Internal workspace for platform admins.",
    email: `platform-${crypto.randomBytes(4).toString("hex")}@maintainly.app`,
    creator: "system",
    logo: "default.jpg",
    active: true,
    settings: {},
    createdAt: now,
    updatedAt: now,
  });

  return businesses.findOne({ _id: result.insertedId });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  const email = args.email.trim().toLowerCase();
  const name = args.name.trim() || "Super Admin";

  if (!email) {
    throw new Error("Provide --email <email>");
  }

  loadEnvFile();
  const databaseUri = resolveDatabaseUri();

  await mongoose.connect(databaseUri, { bufferCommands: false });

  const users = mongoose.connection.collection("users");
  const businesses = mongoose.connection.collection("businesses");

  const platformWorkspace = await ensurePlatformWorkspace(businesses);
  const platformWorkspaceId = platformWorkspace._id;

  const existing = await users.findOne({ email });
  const nextPassword =
    args.password || (args.resetPassword ? buildGeneratedPassword() : "");
  const passwordHash = nextPassword
    ? await bcrypt.hash(nextPassword, 10)
    : null;
  const now = new Date();

  if (existing) {
    const memberships = Array.isArray(existing.memberships)
      ? [...existing.memberships]
      : [];
    const idx = memberships.findIndex(
      (m) => String(m.business) === String(platformWorkspaceId),
    );
    const platformMembership = {
      business: platformWorkspaceId,
      role: "SUPER_ADMIN",
      status: "ACTIVATED",
      isCreator: true,
    };
    if (idx === -1) {
      memberships.push(platformMembership);
    } else {
      memberships[idx] = { ...memberships[idx], ...platformMembership };
    }

    const update = {
      $set: {
        memberships,
        currentBusiness: platformWorkspaceId,
        active: true,
        updatedAt: now,
      },
    };

    if (passwordHash) {
      update.$set.password = passwordHash;
      update.$set.passwordChangedAt = now;
    }

    await users.updateOne({ _id: existing._id }, update);

    console.log(
      JSON.stringify(
        {
          result: "promoted",
          email,
          userId: String(existing._id),
          workspaceId: String(platformWorkspaceId),
          temporaryPassword: args.resetPassword ? nextPassword : undefined,
          passwordUpdated: Boolean(passwordHash),
        },
        null,
        2,
      ),
    );

    await mongoose.disconnect();
    return;
  }

  const createdPassword = nextPassword || buildGeneratedPassword();
  const createdPasswordHash =
    passwordHash ?? (await bcrypt.hash(createdPassword, 10));

  const insertResult = await users.insertOne({
    name,
    email,
    password: createdPasswordHash,
    passwordChangedAt: now,
    memberships: [
      {
        business: platformWorkspaceId,
        role: "SUPER_ADMIN",
        status: "ACTIVATED",
        isCreator: true,
      },
    ],
    currentBusiness: platformWorkspaceId,
    active: true,
    createdAt: now,
    updatedAt: now,
  });

  console.log(
    JSON.stringify(
      {
        result: "created",
        email,
        userId: String(insertResult.insertedId),
        workspaceId: String(platformWorkspaceId),
        temporaryPassword: createdPassword,
      },
      null,
      2,
    ),
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(
    JSON.stringify(
      { error: error instanceof Error ? error.message : String(error) },
      null,
      2,
    ),
  );
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
