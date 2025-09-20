// // import * as React from "react";
// // import { useEffect, useMemo } from "react";
// // import {
// //   Controller,
// //   UseFormReturn,
// //   useFieldArray,
// //   useWatch,
// //   type Path,
// //   type PathValue,
// // } from "react-hook-form";
// // import { useQuery } from "@tanstack/react-query";
// // import { Button } from "@/components/ui/button";
// // import { Label } from "@/components/ui/label";
// // import {
// //   Select,
// //   SelectTrigger,
// //   SelectValue,
// //   SelectContent,
// //   SelectItem,
// // } from "@/components/ui/select";
// // import { Badge } from "@/components/ui/badge";
// // import { X, Plus } from "lucide-react";

// // // ====== Your app types ======
// // export type PropertyUnitsGroup = { propertyId: string; units: string[] };

// // export type ManageUserForm = {
// //   // ...your other fields...
// //   propertyAccess: PropertyUnitsGroup[];
// // };

// // // Shape from your properties API
// // type PropertyOption = { _id: string; name: string };
// // // Shape from your units API
// // type UnitOption = { _id: string; label: string; property: string };

// // // ====== Hooks ======
// // // You said you already have this; ensure it returns { data?: PropertyOption[]; isFetching: boolean }
// // import { useFetchProperties } from "../hooks/onboardingHooks";
// // import { Property } from "../model/model";

// // // Typed units hook (use yours if you already have one)
// // function useFetchUnits(businessId?: string, propertyId?: string) {
// //   return useQuery<UnitOption[]>({
// //     queryKey: ["units", businessId, propertyId],
// //     queryFn: async () => {
// //       const res = await fetch(
// //         `/api/units?businessId=${businessId}&propertyId=${propertyId}`
// //       );
// //       if (!res.ok) throw new Error("Failed to load units");
// //       const json = await res.json();
// //       return (json.data ?? []) as UnitOption[];
// //     },
// //     enabled: Boolean(businessId && propertyId),
// //     staleTime: 5 * 60 * 1000,
// //   });
// // }

// // // ====== Row component (hooks live here, not in a loop) ======
// // type RowProps = {
// //   index: number;
// //   businessId: string;
// //   form: UseFormReturn<ManageUserForm>;
// //   properties: Property[];
// //   usedPropertyIds: Set<string>;
// //   isFetchingProperties: boolean;
// // };

// // function PropertyUnitGroupRow({
// //   index,
// //   businessId,
// //   form,
// //   properties,
// //   usedPropertyIds,
// //   isFetchingProperties,
// // }: RowProps) {
// //   const { control, setValue } = form;

// //   // Strongly-typed paths for this row
// //   const propertyIdPath =
// //     `propertyAccess.${index}.propertyId` as Path<ManageUserForm>;
// //   const unitsPath = `propertyAccess.${index}.units` as Path<ManageUserForm>;

// //   // Current values for this row
// //   const currentPropertyId = useWatch({
// //     control,
// //     name: propertyIdPath,
// //   }) as string;
// //   const selectedUnits = (useWatch({ control, name: unitsPath }) ??
// //     []) as string[];

// //   // Units for the selected property
// //   const { data: units = [], isFetching: isFetchingUnits } = useFetchUnits(
// //     businessId,
// //     currentPropertyId
// //   );

// //   const toggleUnit = (unitId: string) => {
// //     const next = new Set(selectedUnits);
// //     next.has(unitId) ? next.delete(unitId) : next.add(unitId);
// //     setValue(
// //       unitsPath,
// //       Array.from(next) as PathValue<ManageUserForm, typeof unitsPath>,
// //       {
// //         shouldDirty: true,
// //         shouldValidate: true,
// //       }
// //     );
// //   };

// //   const clearUnits = () =>
// //     setValue(unitsPath, [] as PathValue<ManageUserForm, typeof unitsPath>, {
// //       shouldDirty: true,
// //       shouldValidate: true,
// //     });

// //   return (
// //     <div className="rounded-lg border p-3 space-y-3">
// //       <div className="flex items-start gap-3">
// //         {/* Property select */}
// //         <div className="flex-1 space-y-2">
// //           <Label>Property</Label>
// //           <Controller
// //             control={control}
// //             name={propertyIdPath}
// //             rules={{ validate: (v) => (!!v ? true : "Property is required") }}
// //             render={({ field }) => (
// //               <Select
// //                 value={typeof field.value === "string" ? field.value : ""}
// //                 onValueChange={(val: string) => {
// //                   field.onChange(val);
// //                   // clear units when property changes
// //                   setValue(
// //                     unitsPath,
// //                     [] as PathValue<ManageUserForm, typeof unitsPath>,
// //                     {
// //                       shouldDirty: true,
// //                       shouldValidate: true,
// //                     }
// //                   );
// //                 }}
// //                 disabled={isFetchingProperties}
// //               >
// //                 <SelectTrigger>
// //                   <SelectValue
// //                     placeholder={
// //                       isFetchingProperties
// //                         ? "Loading properties..."
// //                         : "Select property"
// //                     }
// //                   />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   {properties?.map((p) => {
// //                     const alreadyUsed =
// //                       usedPropertyIds.has(p._id) && p._id !== currentPropertyId;
// //                     return (
// //                       <SelectItem
// //                         key={p._id}
// //                         value={p._id}
// //                         disabled={alreadyUsed}
// //                       >
// //                         {p.name}
// //                         {alreadyUsed ? " (already selected)" : ""}
// //                       </SelectItem>
// //                     );
// //                   })}
// //                 </SelectContent>
// //               </Select>
// //             )}
// //           />
// //         </div>

// //         {/* Remove handled by parent via a button it renders next to this row */}
// //       </div>

// //       {/* Units multi-select (chips) */}
// //       <div className="space-y-2">
// //         <Label>Units</Label>
// //         <div className="flex flex-wrap gap-2">
// //           {!currentPropertyId ? (
// //             <span className="text-sm text-muted-foreground">
// //               Select a property first
// //             </span>
// //           ) : isFetchingUnits ? (
// //             <span className="text-sm text-muted-foreground">
// //               Loading units…
// //             </span>
// //           ) : units.length === 0 ? (
// //             <span className="text-sm text-muted-foreground">
// //               No units found
// //             </span>
// //           ) : (
// //             units.map((u) => {
// //               const on = selectedUnits.includes(u._id);
// //               return (
// //                 <button
// //                   key={u._id}
// //                   type="button"
// //                   onClick={() => toggleUnit(u._id)}
// //                   aria-pressed={on}
// //                   className={[
// //                     "inline-flex items-center gap-2 rounded-2xl border px-3 py-1 text-sm transition",
// //                     on
// //                       ? "bg-primary text-primary-foreground"
// //                       : "bg-background text-foreground border-muted hover:shadow-sm",
// //                   ].join(" ")}
// //                 >
// //                   {u.label}
// //                   {on && (
// //                     <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground/20">
// //                       ✓
// //                     </span>
// //                   )}
// //                 </button>
// //               );
// //             })
// //           )}
// //         </div>

// //         {!!selectedUnits.length && (
// //           <div className="flex flex-wrap items-center gap-2 pt-1">
// //             <span className="text-sm text-muted-foreground">Selected:</span>
// //             {selectedUnits.map((id) => {
// //               const label = units.find((u) => u._id === id)?.label ?? id;
// //               return (
// //                 <Badge key={id} variant="outline" className="rounded-xl pr-1">
// //                   {label}
// //                   <button
// //                     type="button"
// //                     className="ml-1 grid h-5 w-5 place-items-center rounded-sm hover:bg-muted"
// //                     onClick={() => toggleUnit(id)}
// //                     aria-label={`Remove ${label}`}
// //                   >
// //                     <X className="h-3.5 w-3.5" />
// //                   </button>
// //                 </Badge>
// //               );
// //             })}
// //             <Button
// //               type="button"
// //               variant="ghost"
// //               size="sm"
// //               onClick={clearUnits}
// //             >
// //               Clear
// //             </Button>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // // ====== Parent field-array (no hooks inside map) ======
// // type ArrayProps = {
// //   form: UseFormReturn<ManageUserForm>;
// //   businessId: string;
// // };

// // export function PropertyUnitGroupsFieldArray({ form, businessId }: ArrayProps) {
// //   const { control, setValue } = form;

// //   const { data: properties, isFetchingProperties } = useFetchProperties();

// //   const { fields, append, remove } = useFieldArray({
// //     control,
// //     name: "propertyAccess",
// //   });

// //   const groups = useWatch({ control, name: "propertyAccess" }) as
// //     | ManageUserForm["propertyAccess"]
// //     | undefined;

// //   // ensure at least one row
// //   useEffect(() => {
// //     if (!groups || groups.length === 0) {
// //       append({ propertyId: "", units: [] });
// //     }
// //   }, [groups, append]);

// //   // prevent duplicate property selection
// //   const usedPropertyIds = useMemo(
// //     () =>
// //       new Set(
// //         (groups ?? [])
// //           .map((g) => g?.propertyId)
// //           .filter((id): id is string => Boolean(id))
// //       ),
// //     [groups]
// //   );

// //   return (
// //     <div className="space-y-4">
// //       <div className="space-y-1">
// //         <Label>Property access</Label>
// //         <p className="text-xs text-muted-foreground">
// //           Choose a property, then select one or more units. Add more property
// //           rows as needed.
// //         </p>
// //       </div>

// //       {fields.map((field, idx) => (
// //         <div key={field.id} className="relative">
// //           <PropertyUnitGroupRow
// //             index={idx}
// //             businessId={businessId}
// //             form={form}
// //             properties={properties?.data!}
// //             usedPropertyIds={usedPropertyIds}
// //             isFetchingProperties={isFetchingProperties}
// //           />
// //           <Button
// //             type="button"
// //             variant="ghost"
// //             className="absolute top-3 right-2"
// //             onClick={() => remove(idx)}
// //             aria-label="Remove property row"
// //           >
// //             <X className="h-4 w-4" />
// //           </Button>
// //         </div>
// //       ))}

// //       <Button
// //         type="button"
// //         variant="outline"
// //         onClick={() => append({ propertyId: "", units: [] })}
// //       >
// //         <Plus className="h-4 w-4 mr-2" />
// //         Add another property
// //       </Button>
// //     </div>
// //   );
// // }
// import * as React from "react";
// import { useEffect, useMemo } from "react";
// import {
//   Controller,
//   UseFormReturn,
//   useFieldArray,
//   useWatch,
//   type Path,
//   type PathValue,
// } from "react-hook-form";
// import { useQuery } from "@tanstack/react-query";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { X, Plus } from "lucide-react";
// import { Input } from "@/components/ui/input";

// // ====== Types ======
// export type PropertyUnitsGroup = {
//   propertyId: string;
//   /** selected existing unit IDs */
//   units: string[];
//   /** NEW: inline, unsaved unit labels to create for this property */
//   newUnits: { label: string }[];
// };

// export type ManageUserForm = {
//   // ...your other fields...
//   propertyAccess: PropertyUnitsGroup[];
// };

// // API shapes
// type PropertyOption = { _id: string; name: string };
// type UnitOption = { _id: string; label: string; property: string };

// // ====== Hooks ======
// // If your hook signature differs, adjust return shape below.
// import { useFetchProperties } from "../hooks/onboardingHooks";
// import type { Property } from "../model/model";

// // Units hook (or import your own)
// function useFetchUnits(businessId?: string, propertyId?: string) {
//   return useQuery<UnitOption[]>({
//     queryKey: ["units", businessId, propertyId],
//     queryFn: async () => {
//       const res = await fetch(
//         `/api/units?businessId=${businessId}&propertyId=${propertyId}`
//       );
//       if (!res.ok) throw new Error("Failed to load units");
//       const json = await res.json();
//       return (json.data ?? []) as UnitOption[];
//     },
//     enabled: Boolean(businessId && propertyId),
//     staleTime: 5 * 60 * 1000,
//   });
// }

// // ====== Row component ======
// type RowProps = {
//   index: number;
//   businessId: string;
//   form: UseFormReturn<ManageUserForm>;
//   properties: Property[];
//   usedPropertyIds: Set<string>;
//   isFetchingProperties: boolean;
// };

// function PropertyUnitGroupRow({
//   index,
//   businessId,
//   form,
//   properties,
//   usedPropertyIds,
//   isFetchingProperties,
// }: RowProps) {
//   const { control, setValue, register } = form;

//   // Typed paths for this row
//   const propertyIdPath =
//     `propertyAccess.${index}.propertyId` as Path<ManageUserForm>;
//   const unitsPath = `propertyAccess.${index}.units` as Path<ManageUserForm>;
//   const newUnitsPath =
//     `propertyAccess.${index}.newUnits` as Path<ManageUserForm>;

//   // Current values
//   const currentPropertyId = useWatch({
//     control,
//     name: propertyIdPath,
//   }) as string;
//   const selectedUnits = (useWatch({ control, name: unitsPath }) ??
//     []) as string[];

//   // Hook: units for selected property
//   const { data: units = [], isFetching: isFetchingUnits } = useFetchUnits(
//     businessId,
//     currentPropertyId
//   );

//   // Nested field-array for inline NEW unit labels
//   const {
//     fields: newUnitFields,
//     append: appendNewUnit,
//     remove: removeNewUnit,
//   } = useFieldArray({
//     control,
//     name: newUnitsPath as any,
//   });

//   const toggleUnit = (unitId: string) => {
//     const next = new Set(selectedUnits);
//     next.has(unitId) ? next.delete(unitId) : next.add(unitId);
//     setValue(
//       unitsPath,
//       Array.from(next) as PathValue<ManageUserForm, typeof unitsPath>,
//       {
//         shouldDirty: true,
//         shouldValidate: true,
//       }
//     );
//   };

//   const clearUnits = () =>
//     setValue(unitsPath, [] as PathValue<ManageUserForm, typeof unitsPath>, {
//       shouldDirty: true,
//       shouldValidate: true,
//     });

//   const addInlineUnit = () => {
//     appendNewUnit({ label: "" });
//   };

//   return (
//     <div className="rounded-lg border p-3 space-y-4">
//       {/* Property select */}
//       <div className="space-y-2">
//         <Label>Property</Label>
//         <Controller
//           control={control}
//           name={propertyIdPath}
//           rules={{ validate: (v) => (!!v ? true : "Property is required") }}
//           render={({ field }) => (
//             <Select
//               value={typeof field.value === "string" ? field.value : ""}
//               onValueChange={(val: string) => {
//                 field.onChange(val);
//                 // clear selected units & inline new units when property changes
//                 setValue(
//                   unitsPath,
//                   [] as PathValue<ManageUserForm, typeof unitsPath>,
//                   {
//                     shouldDirty: true,
//                     shouldValidate: true,
//                   }
//                 );
//                 // reset inline new units
//                 // easiest: remove all, then append none
//                 newUnitFields.forEach((_, i) => removeNewUnit(i));
//               }}
//               disabled={isFetchingProperties}
//             >
//               <SelectTrigger>
//                 <SelectValue
//                   placeholder={
//                     isFetchingProperties
//                       ? "Loading properties..."
//                       : "Select property"
//                   }
//                 />
//               </SelectTrigger>
//               <SelectContent>
//                 {properties?.map((p) => {
//                   const alreadyUsed =
//                     usedPropertyIds.has(p._id) && p._id !== currentPropertyId;
//                   return (
//                     <SelectItem
//                       key={p._id}
//                       value={p._id}
//                       disabled={alreadyUsed}
//                     >
//                       {p.name}
//                       {alreadyUsed ? " (already selected)" : ""}
//                     </SelectItem>
//                   );
//                 })}
//               </SelectContent>
//             </Select>
//           )}
//         />
//       </div>

//       {/* Existing units list / chips */}
//       <div className="space-y-2">
//         <div className="flex items-center justify-between">
//           <Label>Existing units</Label>
//           {!!currentPropertyId && (
//             <div className="text-xs text-muted-foreground">
//               {isFetchingUnits ? "Loading…" : `${units.length} found`}
//             </div>
//           )}
//         </div>

//         <div className="flex flex-wrap gap-2">
//           {!currentPropertyId ? (
//             <span className="text-sm text-muted-foreground">
//               Select a property first
//             </span>
//           ) : isFetchingUnits ? (
//             <span className="text-sm text-muted-foreground">
//               Loading units…
//             </span>
//           ) : units.length === 0 ? (
//             <span className="text-sm text-muted-foreground">
//               No units found
//             </span>
//           ) : (
//             units.map((u) => {
//               const on = selectedUnits.includes(u._id);
//               return (
//                 <button
//                   key={u._id}
//                   type="button"
//                   onClick={() => toggleUnit(u._id)}
//                   aria-pressed={on}
//                   className={[
//                     "inline-flex items-center gap-2 rounded-2xl border px-3 py-1 text-sm transition",
//                     on
//                       ? "bg-primary text-primary-foreground"
//                       : "bg-background text-foreground border-muted hover:shadow-sm",
//                   ].join(" ")}
//                 >
//                   {u.label}
//                   {on && (
//                     <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground/20">
//                       ✓
//                     </span>
//                   )}
//                 </button>
//               );
//             })
//           )}
//         </div>

//         {!!selectedUnits.length && (
//           <div className="flex flex-wrap items-center gap-2 pt-1">
//             <span className="text-sm text-muted-foreground">Selected:</span>
//             {selectedUnits.map((id) => {
//               const label = units.find((u) => u._id === id)?.label ?? id;
//               return (
//                 <Badge key={id} variant="outline" className="rounded-xl pr-1">
//                   {label}
//                   <button
//                     type="button"
//                     className="ml-1 grid h-5 w-5 place-items-center rounded-sm hover:bg-muted"
//                     onClick={() => toggleUnit(id)}
//                     aria-label={`Remove ${label}`}
//                   >
//                     <X className="h-3.5 w-3.5" />
//                   </button>
//                 </Badge>
//               );
//             })}
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               onClick={clearUnits}
//             >
//               Clear
//             </Button>
//           </div>
//         )}
//       </div>

//       {/* Inline NEW unit labels */}
//       <div className="space-y-2">
//         <div className="flex items-center justify-between">
//           <Label>New units</Label>
//           <Button
//             type="button"
//             variant="outline"
//             size="sm"
//             onClick={addInlineUnit}
//             disabled={!currentPropertyId}
//           >
//             <Plus className="h-4 w-4 mr-1" />
//             Add unit
//           </Button>
//         </div>

//         {newUnitFields.length === 0 ? (
//           <p className="text-xs text-muted-foreground">
//             Use “Add unit” to create new unit labels for this property.
//           </p>
//         ) : (
//           <div className="grid gap-2">
//             {newUnitFields.map((nf, i) => {
//               const labelPath =
//                 `propertyAccess.${index}.newUnits.${i}.label` as Path<ManageUserForm>;
//               return (
//                 <div key={nf.id} className="flex items-center gap-2">
//                   <Input
//                     placeholder="e.g., Apt A, Suite 201, Bay 3"
//                     {...register(labelPath as any, {
//                       required: "Unit label is required",
//                       minLength: {
//                         value: 1,
//                         message: "Unit label is required",
//                       },
//                     })}
//                   />
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     onClick={() => removeNewUnit(i)}
//                     aria-label="Remove new unit input"
//                   >
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//         <p className="text-xs text-muted-foreground">
//           New units will be created for the selected property when you submit.
//         </p>
//       </div>
//     </div>
//   );
// }

// // ====== Parent field-array (unchanged structurally) ======
// type ArrayProps = {
//   form: UseFormReturn<ManageUserForm>;
//   businessId: string;
// };

// export function PropertyUnitGroupsFieldArray({ form, businessId }: ArrayProps) {
//   const { control } = form;

//   const { data: properties, isFetchingProperties } = useFetchProperties();

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "propertyAccess",
//   });

//   const groups = useWatch({ control, name: "propertyAccess" }) as
//     | ManageUserForm["propertyAccess"]
//     | undefined;

//   // ensure at least one row
//   useEffect(() => {
//     if (!groups || groups.length === 0) {
//       append({ propertyId: "", units: [], newUnits: [] });
//     }
//   }, [groups, append]);

//   // prevent duplicate property selection
//   const usedPropertyIds = useMemo(
//     () =>
//       new Set(
//         (groups ?? [])
//           .map((g) => g?.propertyId)
//           .filter((id): id is string => Boolean(id))
//       ),
//     [groups]
//   );

//   return (
//     <div className="space-y-4">
//       <div className="space-y-1">
//         <Label>Property access</Label>
//         <p className="text-xs text-muted-foreground">
//           Choose a property, then select or create units. Add more property rows
//           as needed.
//         </p>
//       </div>

//       {fields.map((field, idx) => (
//         <div key={field.id} className="relative">
//           <PropertyUnitGroupRow
//             index={idx}
//             businessId={businessId}
//             form={form}
//             properties={properties?.data ?? []}
//             usedPropertyIds={usedPropertyIds}
//             isFetchingProperties={isFetchingProperties}
//           />
//           <Button
//             type="button"
//             variant="ghost"
//             className="absolute top-3 right-2"
//             onClick={() => remove(idx)}
//             aria-label="Remove property row"
//           >
//             <X className="h-4 w-4" />
//           </Button>
//         </div>
//       ))}

//       <Button
//         type="button"
//         variant="outline"
//         onClick={() => append({ propertyId: "", units: [], newUnits: [] })}
//       >
//         <Plus className="h-4 w-4 mr-2" />
//         Add another property
//       </Button>
//     </div>
//   );
// }
"use client";

import * as React from "react";
import { useEffect, useMemo } from "react";
import {
  useWatch,
  useFieldArray,
  Controller,
  type UseFormReturn,
  type Path,
  type PathValue,
} from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Home, Clock } from "lucide-react";

// ---- Types aligned with UnitForm.tsx ---------------------------------------
export type NewUnitType = "apartment" | "room" | "suite";

export type UnitsFormValues = {
  propertyAccess: Array<{
    propertyId: string;
    units: string[]; // existing unit IDs (selected)
    newUnits: { label: string; type?: NewUnitType }[];
  }>;
};

export type PropertyListItem = {
  _id: string;
  name: string;
  addressLine?: string; // optional display string
  type?: string; // "residential" | "commercial" | etc. (optional)
};

// Units from /api/units?businessId=...&propertyId=...
export type UnitOption = { _id: string; label: string; property: string };

// ---- External hooks (adapt the imports to your project) --------------------
import { useFetchProperties, useFetchUnits } from "../hooks/onboardingHooks";
import { Separator } from "@/components/ui/separator";
import { EditableUnitChip } from "./EditableUnitChip";
import axios from "axios";

// If you already have a units hook, replace this with it:

// ---- Row component (per selected property) ---------------------------------
type ManageRowProps = {
  idx: number;
  businessId: string;
  form: UseFormReturn<UnitsFormValues>;
  property: PropertyListItem;
};

function ManageRow({ idx, businessId, form, property }: ManageRowProps) {
  const { control, setValue, register } = form;

  const propertyIdPath =
    `propertyAccess.${idx}.propertyId` as Path<UnitsFormValues>;
  const unitsPath = `propertyAccess.${idx}.units` as Path<UnitsFormValues>;
  const newUnitsPath =
    `propertyAccess.${idx}.newUnits` as Path<UnitsFormValues>;

  const propertyId = useWatch({ control, name: propertyIdPath }) as string;
  const selectedUnits = (useWatch({ control, name: unitsPath }) ??
    []) as string[];

  const { units = [], isFetchingUnits } = useFetchUnits(propertyId);

  // if (units.length) {
  //   setValue(
  //     unitsPath,
  //     units.map((unit: UnitOption) => unit._id)
  //   );
  // }

  // useEffect(() => {
  //   setValue(
  //     unitsPath,
  //     units.map((unit: UnitOption) => unit._id)
  //   );
  // }, [units, unitsPath]);

  const initializedRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;

    // if we already initialized for this property, bail
    if (initializedRef.current === propertyId) return;

    // when units arrive, set them if the form array is still empty
    if (units.length > 0) {
      const current = (form.getValues(unitsPath) as string[]) ?? [];
      if (current.length === 0) {
        form.setValue(
          unitsPath as any,
          units.map((u) => u._id),
          { shouldDirty: true, shouldValidate: true }
        );
      }
      initializedRef.current = propertyId; // mark initialized
    }
  }, [units, propertyId, form, unitsPath]);

  // Nested field-array for inline new unit inputs
  const {
    fields: newUnitFields,
    append: appendNewUnit,
    remove: removeNewUnit,
  } = useFieldArray({
    control,
    name: newUnitsPath as any,
  });

  const toggleUnit = (unitId: string) => {
    const next = new Set(selectedUnits);
    next.has(unitId) ? next.delete(unitId) : next.add(unitId);
    setValue(
      unitsPath,
      Array.from(next) as PathValue<UnitsFormValues, typeof unitsPath>,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Home className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{property.name}</CardTitle>
            {property.addressLine ? (
              <p className="text-sm text-muted-foreground">
                {property.addressLine}
              </p>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Existing Units */}
        <div>
          {/* <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Existing Units</Label>
            <Badge variant="secondary" className="text-xs">
              {isFetchingUnits ? "…" : units.length}
            </Badge>
          </div> */}

          {/* <div className="flex flex-wrap gap-2">
            {isFetchingUnits ? (
              <span className="text-sm text-muted-foreground">Loading…</span>
            ) : units.length === 0 ? (
              <span className="text-sm text-muted-foreground">
                No units found
              </span>
            ) : (
              units.map((unit) => {
                // const on = selectedUnits.includes(unit._id);
                return (
                  <EditableUnitChip
                    key={unit._id}
                    unit={unit}
                    selected={selectedUnits.includes(unit._id)}
                    onToggle={toggleUnit}
                    businessId={businessId}
                    propertyId={property._id}
                  />
                );
              })
            )}
          </div> */}

          <ExistingUnitComponent
            units={units}
            isFetchingUnits={isFetchingUnits}
            propertyId={propertyId}
            businessId={businessId}
            toggleUnit={toggleUnit}
            selectedUnits={selectedUnits}
          />

          {/* {selectedUnits.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-sm text-muted-foreground">Selected:</span>
              {selectedUnits.map((id) => {
                const label =
                  units.find((unit) => unit._id === id)?.label ?? id;
                return (
                  <Badge key={id} variant="outline" className="rounded-xl">
                    {label}
                  </Badge>
                );
              })}
            </div>
          )} */}
        </div>
        <Separator />

        {/* Inline NEW units */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-3">
              <Label className="text-sm font-medium">New Units</Label>
              <Badge variant="outline" className="text-xs">
                {newUnitFields.length}
              </Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendNewUnit({ label: "", type: "apartment" })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add unit
            </Button>
          </div>

          {newUnitFields.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Use “Add unit” to create new unit labels for this property.
            </p>
          ) : (
            <div className="grid gap-2">
              {newUnitFields.map((nf, i) => {
                const labelPath =
                  `propertyAccess.${idx}.newUnits.${i}.label` as Path<UnitsFormValues>;
                const typePath =
                  `propertyAccess.${idx}.newUnits.${i}.type` as Path<UnitsFormValues>;
                return (
                  <div
                    key={nf.id}
                    className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg"
                  >
                    <Input
                      placeholder="e.g., Apt 3A, Suite 201"
                      {...register(labelPath as any, {
                        required: "Unit label is required",
                        minLength: {
                          value: 1,
                          message: "Unit label is required",
                        },
                      })}
                      className="flex-1"
                    />
                    {/* Optional type selector (kept simple) */}
                    {/* Replace with shadcn Select if you want typed kinds */}
                    {/* <Select .../> */}

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeNewUnit(i)}
                      aria-label="Remove new unit input"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            New units will be created for this property on submit.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ExistingUnitComponent({
  propertyId,
  businessId,
  selectedUnits,
  toggleUnit,
  units,
  isFetchingUnits,
}: {
  propertyId: string;
  businessId: string;
  selectedUnits: string[];
  toggleUnit: (unitId: string) => void;
  units: UnitOption[];
  isFetchingUnits: boolean;
}) {
  // const { units = [], isFetchingUnits } = useFetchUnits(propertyId);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Existing Units</Label>
        <Badge variant="secondary" className="text-xs">
          {isFetchingUnits ? "…" : units.length}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {isFetchingUnits ? (
          <span className="text-sm text-muted-foreground">Loading…</span>
        ) : units.length === 0 ? (
          <span className="text-sm text-muted-foreground">No units found</span>
        ) : (
          units.map((unit) => {
            // const on = selectedUnits.includes(unit._id);
            return (
              <EditableUnitChip
                key={unit._id}
                unit={unit}
                selected={selectedUnits.includes(unit._id)}
                onToggle={toggleUnit}
                businessId={businessId}
                propertyId={propertyId}
              />
            );

            // <button
            //   key={u._id}
            //   type="button"
            //   onClick={() => toggleUnit(u._id)}
            //   aria-pressed={on}
            //   className={[
            //     "inline-flex items-center gap-2 rounded-2xl border px-3 py-1 text-sm transition",
            //     on
            //       ? "bg-primary text-primary-foreground"
            //       : "bg-background text-foreground border-muted hover:shadow-sm",
            //   ].join(" ")}
            // >
            //   {u.label}
            //   {on && (
            //     <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground/20">
            //       ✓
            //     </span>
            //   )}
            // </button>
          })
        )}
      </div>
    </div>
  );
}
// ---- Parent: renders all selected properties (from form.propertyAccess[]) ---
type Props = {
  form: UseFormReturn<UnitsFormValues>;
  businessId: string;
  properties: PropertyListItem[];
};

export function PropertyUnitGroupsFieldArray({
  form,
  businessId,
  properties,
}: Props) {
  const { control, setValue } = form;

  // Selected groups (already chosen in the Select step)
  const groups = useWatch({
    control,
    name: "propertyAccess",
  }) as UnitsFormValues["propertyAccess"];

  // Fetch all properties (for display info)
  // const { data: propsResp, isFetchingProperties } = useFetchProperties();
  // const allProps: PropertyListItem[] = (propsResp?.data ?? []).map(
  //   (p: any) => ({
  //     _id: p._id,
  //     name: p.name,
  //     addressLine: p?.address?.line1 ?? "",
  //     type: p?.type,
  //   })
  // );

  // index by id for fast lookup
  const byId = useMemo(() => {
    const m = new Map<string, PropertyListItem>();
    properties.forEach((p) => m.set(p._id, p));
    return m;
  }, [properties]);

  if (!groups?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No properties selected yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {groups.map((g, idx) => {
        const prop = byId.get(g.propertyId);

        if (!prop) return null;
        return (
          <ManageRow
            key={g.propertyId}
            idx={idx}
            businessId={businessId}
            form={form}
            property={prop}
          />
        );
      })}
    </div>
  );
}
