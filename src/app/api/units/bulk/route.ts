// app/api/units/bulk/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import Unit from "@/models/unitModel";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";

// ---- Validation -------------------------------------------------------------
const BodySchema = z.object({
  businessId: z.string().min(1),
  properties: z
    .array(
      z.object({
        propertyId: z.string().min(1),
        unitIds: z.array(z.string()).default([]),
        newUnitLabels: z.array(z.string().min(1)).default([]),
      })
    )
    .min(1, "properties must have at least one item"),
});
type Body = z.infer<typeof BodySchema>;

// ---- Helpers ----------------------------------------------------------------
const normalize = (s: string) => s.trim().replace(/\s+/g, " ");
const toKey = (s: string) => normalize(s).toLowerCase();

// ---- POST -------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    // Auth
    const me = await getUserFromCookies();
    if (!me?.isAdminRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse
    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { businessId, properties } = parsed.data as Body;

    const results: Array<{
      propertyId: string;
      createdUnits: Array<{ _id: string; label: string }>;
      skippedLabels: string[]; // already existed (by normalized label)
      validatedSelectedUnitIds: string[]; // unitIds that matched this property
      invalidSelectedUnitIds: string[]; // unitIds that didn't match
      totalUnitsAfter: number;
    }> = [];

    // Process each property group
    for (const group of properties) {
      const { propertyId, unitIds = [], newUnitLabels = [] } = group;

      // 1) Validate selected existing unitIds
      let validatedSelectedUnitIds: string[] = [];
      let invalidSelectedUnitIds: string[] = [];

      if (unitIds.length) {
        const found = await Unit.find({
          _id: { $in: unitIds },
          business: businessId,
          property: propertyId,
        }).select("_id");

        const validSet = new Set(found.map((u) => String(u._id)));
        validatedSelectedUnitIds = unitIds.filter((id) =>
          validSet.has(String(id))
        );
        invalidSelectedUnitIds = unitIds.filter(
          (id) => !validSet.has(String(id))
        );
      }

      // 2) Create new units (idempotent by normalized label)
      let createdUnits: Array<{ _id: string; label: string }> = [];
      let skippedLabels: string[] = [];

      if (newUnitLabels.length) {
        // Load existing labels for this property once
        const existing = await Unit.find({
          business: businessId,
          property: propertyId,
        }).select("label");

        const existingKeys = new Set(existing.map((u) => toKey(u.label)));

        // Normalize + dedupe incoming labels
        const incoming = Array.from(
          new Set(newUnitLabels.map((l) => normalize(l)).filter(Boolean))
        );

        const toCreate = [];
        for (const lbl of incoming) {
          const key = toKey(lbl);
          if (existingKeys.has(key)) {
            skippedLabels.push(lbl);
            continue;
          }
          toCreate.push({
            business: businessId,
            property: propertyId,
            label: lbl,
            isActive: true,
          });
          // prevent duplicates within same request
          existingKeys.add(key);
        }

        if (toCreate.length) {
          const inserted = await Unit.insertMany(toCreate, { ordered: false });
          createdUnits = inserted.map((u) => ({
            _id: String(u._id),
            label: u.label,
          }));
        }
      }

      // 3) Count total units after
      const totalUnitsAfter = await Unit.countDocuments({
        business: businessId,
        property: propertyId,
      });

      results.push({
        propertyId,
        createdUnits,
        skippedLabels,
        validatedSelectedUnitIds,
        invalidSelectedUnitIds,
        totalUnitsAfter,
      });
    }

    return NextResponse.json(
      { status: "success", data: results },
      { status: 201 }
    );
  } catch (e: any) {
    // Duplicate label race conditions will typically bubble as E11000 if you add a unique index.
    if (e?.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate unit label", details: e?.keyValue ?? null },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
