import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITicketActivity extends Document {
	ticket: Types.ObjectId;
	action:
		| 'created'
		| 'updated'
		| 'assigned'
		| 'commented'
		| 'completed'
		| 'status-changed'
		| 'type-changed'
		| 'actioned-by';
	description?: string;
	changedBy: Types.ObjectId; // user
	timestamp: Date;
	metadata?: Record<string, any>; // Optional: diff, assignee info, etc.
}

const ticketActivitySchema = new Schema<ITicketActivity>(
	{
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
				'status-changed',
				'type-changed',
				'actioned-by'
			]
		},
		description: { type: String },
		changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		timestamp: { type: Date, default: Date.now },
		metadata: { type: Schema.Types.Mixed }
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

ticketActivitySchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function (_doc, ret: Record<string, any>) {
		ret.id = ret._id?.toString();
		delete ret._id;
	}
});

export const TicketActivity =
	mongoose.models.TicketActivity ||
	mongoose.model<ITicketActivity>('TicketActivity', ticketActivitySchema);
