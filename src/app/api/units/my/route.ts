// // app/api/units/my/route.ts
// import { NextResponse } from "next/server";
// import User from "@/models/userModel";
// import Unit from "@/models/unitModel";
// import Property from "@/models/propertyModel";
// import { Types } from "mongoose";
// import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";

// export async function GET(req: Request) {
//   try {
//     const me = await getUserFromCookies();
//     if (!me?.id)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const url = new URL(req.url);
//     const businessId = url.searchParams.get("businessId");
//     if (!businessId)
//       return NextResponse.json(
//         { error: "businessId required" },
//         { status: 400 }
//       );

//     const user = await User.findById(me.id).lean();
//     const membership = user?.memberships?.find(
//       (m: any) =>
//         String(m.business) === String(businessId) && m.status === "ACTIVATED"
//     );
//     if (!membership) return NextResponse.json({ data: [] }, { status: 200 });

//     const unitIds = [
//       ...(membership.unit ? [membership.unit] : []),
//       ...(membership.accessibleUnits || []),
//     ].map((id: any) => new Types.ObjectId(id));

//     if (!unitIds.length)
//       return NextResponse.json({ data: [] }, { status: 200 });

//     const units = await Unit.aggregate([
//       {
//         $match: {
//           _id: { $in: unitIds },
//           business: new Types.ObjectId(businessId),
//           isActive: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "properties",
//           localField: "property",
//           foreignField: "_id",
//           as: "prop",
//         },
//       },
//       { $unwind: "$prop" },
//       {
//         $project: { _id: 1, label: 1, property: 1, propertyName: "$prop.name" },
//       },
//     ]);

//     return NextResponse.json({ data: units }, { status: 200 });
//   } catch (e: any) {
//     return NextResponse.json({ error: e.message }, { status: 400 });
//   }
// }
