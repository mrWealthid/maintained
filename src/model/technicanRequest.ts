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
	message?: string;
	scheduledDate?: Date;
	respondedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
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
		quote: {
			amount: Number,
			currency: { type: String, default: 'USD' }
		},
		message: String,
		scheduledDate: Date,
		respondedAt: Date
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
