import type mongoose from "mongoose";

import Category from "@/models/ticketCategoryModel";

type DefaultTicketCategorySeed = {
  key: string;
  name: string;
  description: string;
  legacyKeys?: readonly string[];
  legacyNames?: readonly string[];
};

export const DEFAULT_TICKET_CATEGORIES: readonly DefaultTicketCategorySeed[] = [
  {
    key: "plumbing",
    name: "Plumbing",
    description: "Leaks, clogs, fixtures, drains, and water-related repairs.",
  },
  {
    key: "electrical",
    name: "Electrical",
    description: "Power, outlets, lighting, breakers, and electrical safety.",
  },
  {
    key: "hvac",
    name: "HVAC",
    description: "Heating, cooling, ventilation, thermostats, and air quality.",
  },
  {
    key: "appliance",
    name: "Appliance",
    description: "Refrigerators, ovens, washers, dryers, and other appliances.",
    legacyKeys: ["appliances"],
    legacyNames: ["Appliances"],
  },
  {
    key: "pest-control",
    name: "Pest Control",
    description: "Pest sightings, treatments, and prevention requests.",
  },
  {
    key: "structural",
    name: "Structural",
    description:
      "Walls, ceilings, floors, foundations, railings, and building damage.",
  },
  {
    key: "doors-locks",
    name: "Doors/Locks",
    description:
      "Interior doors, exterior doors, handles, hinges, keys, and lock issues.",
  },
  {
    key: "internet-technology",
    name: "Internet/Technology",
    description:
      "Wi-Fi, routers, access systems, smart devices, and technology support.",
  },
  {
    key: "cleaning-sanitation",
    name: "Cleaning/Sanitation",
    description: "Common-area cleaning, trash, spills, and sanitation issues.",
    legacyKeys: ["cleaning"],
    legacyNames: ["Cleaning"],
  },
  {
    key: "safety-security",
    name: "Safety/Security",
    description:
      "Smoke detectors, alarms, cameras, safety hazards, and security concerns.",
    legacyKeys: ["security-access"],
    legacyNames: ["Security & Access"],
  },
  {
    key: "landscaping-grounds",
    name: "Landscaping & Grounds",
    description: "Exterior grounds, parking areas, sidewalks, and landscaping.",
  },
  {
    key: "general-maintenance",
    name: "General Maintenance",
    description: "General repairs that do not fit another category.",
  },
  {
    key: "other",
    name: "Other",
    description: "Requests that need review before assigning a category.",
  },
] as const;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function ensureDefaultTicketCategories(options?: {
  session?: mongoose.ClientSession | null;
}) {
  for (const category of DEFAULT_TICKET_CATEGORIES) {
    const keys = [category.key, ...(category.legacyKeys ?? [])];
    const names = [category.name, ...(category.legacyNames ?? [])];

    await Category.findOneAndUpdate(
      {
        $or: [
          ...keys.flatMap((key) => [
            { key, business: null },
            { key, business: { $exists: false } },
          ]),
          ...names.flatMap((name) => [
            {
              name: new RegExp(`^${escapeRegExp(name)}$`, "i"),
              business: null,
            },
            {
              name: new RegExp(`^${escapeRegExp(name)}$`, "i"),
              business: { $exists: false },
            },
          ]),
        ],
      },
      {
        $set: {
          key: category.key,
          name: category.name,
          description: category.description,
          business: null,
          isDefault: true,
          isSystem: true,
          isActive: true,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        session: options?.session ?? undefined,
      },
    );
  }
}
