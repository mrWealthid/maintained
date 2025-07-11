import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { TechnicianRequest } from '@/model/technicanRequest';

export async function GET() {
	await mongoose.connect(process.env.MONGODB_URI!);

	const now = new Date();
	const result = await TechnicianRequest.updateMany(
		{ isActive: true, expiresAt: { $lt: now } },
		{ $set: { isActive: false, status: 'EXPIRED' } }
	);

	return NextResponse.json({ expired: result.modifiedCount });
}
