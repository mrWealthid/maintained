import mongoose, { Document, Schema, Model } from 'mongoose';
import type { ObjectId } from 'mongoose';
import Business from './businessModel';
import User from './userModel';
import Category from './ticketCategoryModel';

export interface ITicket extends Document {
	title: string;
	area: string;
	description: string;
	category: ObjectId;
	status: 'PENDING' | 'ASSIGNED' | 'DECLINED' | 'COMPLETED';
	videos: string[];
	images: string[];
	createdAt: Date;
	user: ObjectId;
	business: ObjectId;
}

const allowedTransitions: Record<string, string[]> = {
	PENDING: ['PROCESSING', 'DECLINED'],
	PROCESSING: ['ASSIGNED', 'DECLINED'],
	ASSIGNED: ['SCHEDULED', 'DECLINED'],
	SCHEDULED: ['COMPLETED', 'DECLINED'],
	DECLINED: [],
	COMPLETED: []
};

const TicketSchema = new Schema<ITicket>(
	{
		title: { type: String, required: true },
		area: { type: String, required: true },
		description: { type: String, required: true },
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: Category,
			required: [true, 'Request must belong to a category']
		},
		status: {
			type: String,
			enum: [
				'PENDING',
				'PROCESSING',
				'ASSIGNED',
				'SCHEDULED',
				'DECLINED',
				'COMPLETED'
			],
			default: 'PENDING'
		},
		videos: [{ type: String }],
		images: [{ type: String }],
		createdAt: {
			type: Date,
			default: Date.now
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: User,
			required: [true, 'Request must belong to a User']
		},
		business: {
			type: mongoose.Schema.Types.ObjectId,
			ref: Business,
			required: [true, 'Request must belong to a business']
		}
	},
	{ timestamps: false }
);

TicketSchema.pre<ITicket>('save', async function (next) {
	if (!this.isModified('status')) return next();

	if (!this.isNew) {
		const original = await (this.constructor as Model<ITicket>).findById(
			this._id
		);
		const oldStatus = original?.status;
		const newStatus = this.status;

		const allowed =
			allowedTransitions[oldStatus as keyof typeof allowedTransitions] ||
			[];

		if (!allowed.includes(newStatus)) {
			return next(
				new Error(
					`Invalid status transition from '${oldStatus}' to '${newStatus}'`
				)
			);
		}
	}

	next();
});

const Ticket =
	(mongoose.models.Ticket as Model<ITicket>) ||
	mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
