import { TECHNICIAN_RESPONSE } from '@/app/shared/enums/enums';
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITechnicianRequest extends Document {
	ticket: Types.ObjectId;
	technician: Types.ObjectId;
	status: TECHNICIAN_RESPONSE;
	quote?: {
		amount?: number;
		currency?: string;
	};
	schedule?: {
		start: string;
		end: string;
		day: string;
		date: Date;
	};
	reason?: string;
	message?: string;
	respondedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
}
const TechnicianRequestSchema = new Schema(
	{
		ticket: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Ticket',
			required: true
		},
		technician: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		status: {
			type: String,
			enum: TECHNICIAN_RESPONSE,
			default: TECHNICIAN_RESPONSE.pending
		},
		schedule: {
			date: Date,
			start: String,
			end: String,
			day: String
		},
		quote: {
			amount: Number,
			currency: { type: String, default: 'USD' }
		},
		message: String,
		reason: String,
		scheduledDate: Date,
		respondedAt: Date,
		isActive: { type: Boolean, default: true },
		expiresAt: { type: Date, required: true }
	},

	{
		timestamps: true
	}
);

export const TechnicianRequest =
	mongoose.models.TechnicianRequest ||
	mongoose.model<ITechnicianRequest>(
		'TechnicianRequest',
		TechnicianRequestSchema
	);




