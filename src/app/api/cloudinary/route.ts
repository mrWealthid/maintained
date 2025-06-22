import { NextRequest, NextResponse } from 'next/server';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function DELETE(request: NextRequest) {
	try {
		const { publicId, resourceType } = await request.json();
		await cloudinary.v2.uploader.destroy(publicId, {
			resource_type: resourceType || 'image'
		});
		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to delete from Cloudinary' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const resourceType =
			(formData.get('resourceType') as "image" | "raw" | "video" | "auto") || 'image';

		if (!file) {
			return NextResponse.json(
				{ error: 'No file provided' },
				{ status: 400 }
			);
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const result = await new Promise<any>((resolve, reject) => {
			const stream = cloudinary.v2.uploader.upload_stream(
				{ resource_type: resourceType },
				(error, result) => {
					if (error) reject(error);
					else resolve(result);
				}
			);
			stream.end(buffer);
		});

		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to upload to Cloudinary' },
			{ status: 500 }
		);
	}
}
