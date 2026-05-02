import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { z } from "zod";

import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteCloudinaryAssetSchema = z.object({
  publicId: z.string().min(1, "publicId is required"),
  resourceType: z.enum(["image", "raw", "video"]).optional().default("image"),
});

export async function DELETE(request: NextRequest) {
  try {
    const { publicId, resourceType } = parseOrThrow(
      deleteCloudinaryAssetSchema,
      await request.json()
    );
    await cloudinary.v2.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const resourceType =
      (formData.get("resourceType") as "image" | "raw" | "video" | "auto") ||
      "image";

    if (!file) throw ApiError.badRequest("No file provided");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { resource_type: resourceType },
        (error, uploaded) => {
          if (error) reject(error);
          else resolve(uploaded);
        },
      );
      stream.end(buffer);
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
