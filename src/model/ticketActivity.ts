import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITicketActivity extends Document {
	ticket: Types.ObjectId;
	action:
		| 'created'
		| 'updated'
		| 'assigned'
		| 'commented'
		| 'completed'
		| 'status-changed';
	description?: string;
	changedBy: Types.ObjectId; // user
	timestamp: Date;
	metadata?: Record<string, any>; // Optional: diff, assignee info, etc.
}

const ticketActivitySchema = new Schema<ITicketActivity>({
	ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
	action: {
		type: String,
		required: true,
		enum: [
			'created',
			'updated',
			'assigned',
			'commented',
			'completed',
			'status-changed'
		]
	},
	description: { type: String },
	changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	timestamp: { type: Date, default: Date.now },
	metadata: { type: Schema.Types.Mixed }
});

export const TicketActivity =
	mongoose.models.TicketActivity ||
	mongoose.model<ITicketActivity>('TicketActivity', ticketActivitySchema);
