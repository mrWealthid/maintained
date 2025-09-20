import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Check, X as XIcon, Plus, Save } from "lucide-react";

import { useUpdateUnitLabel, useDeleteUnit } from "../hooks/onboardingHooks"; // update path if placed elsewhere
import { UnitOption } from "./PropertyUnitGroupArray";

type EditableUnitChipProps = {
  unit: UnitOption;
  selected: boolean;
  onToggle: (id: string) => void;
  businessId: string;
  propertyId: string;
};

export function EditableUnitChip({
  unit,
  selected,
  businessId,
  propertyId,
}: EditableUnitChipProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(unit.label);

  const { mutate: save, isPending: saving } = useUpdateUnitLabel(
    businessId,
    propertyId
  );
  const { mutate: remove, isPending: deleting } = useDeleteUnit(
    businessId,
    propertyId
  );

  // sync local input if server refetch updated the label
  useEffect(() => setValue(unit.label), [unit.label]);

  const handleSave = () => {
    if (!value.trim() || value.trim() === unit.label) {
      setEditing(false);
      setValue(unit.label);
      return;
    }
    save(
      { unitId: unit._id, label: value.trim() },
      {
        onSuccess: () => setEditing(false),
      }
    );
  };

  const handleDelete = () => {
    // keep it simple; replace with a nice AlertDialog if you prefer
    if (confirm(`Delete unit "${unit.label}"? This cannot be undone.`)) {
      remove({ unitId: unit._id });
    }
  };

  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-2xl border px-3 py-1 text-sm",
        "bg-background",
      ].join(" ")}
    >
      {editing ? (
        <>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-7 w-40"
          />
          <Button
            type="button"
            size="sm"
            variant={"outline"}
            className="h-7 px-2"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => {
              setEditing(false);
              setValue(unit.label);
            }}
            disabled={saving}
          >
            <XIcon className="h-3.5 w-3.5" />
          </Button>
        </>
      ) : (
        <>
          <span className="font-medium">{unit.label}</span>

          {/* Select / unselect (kept from your earlier flow) */}

          {/* Edit */}

          <div className="">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>

            {/* Delete */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
