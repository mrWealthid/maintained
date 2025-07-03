import mongoose, { Document, Schema, Model } from 'mongoose';
import type { ObjectId } from 'mongoose';
import Business from './businessModel';
import User from './userModel';
import Category from './ticketCategoryModel';
import { TECHNICIAN_RESPONSE, TICKET_STATUS } from '@/app/shared/enums/enums';

interface ITicket extends Document {
	title: string;
	area: string;
	description: string;
	category: ObjectId;
	status:
		| 'PENDING'
		| 'PROCESSING'
		| 'ASSIGNED'
		| 'DECLINED'
		| 'COMPLETED'
		| 'SCHEDULED';
	videos: string[];
	images: string[];
	createdAt: Date;
	user: ObjectId;
	business: ObjectId;
	actionedBy: ObjectId;
	assignedTo?: ObjectId;
	relatedTo?: ObjectId;
	type: ObjectId;
	technicianResponse?: {
		response: TECHNICIAN_RESPONSE;
		message: string;
		respondedAt: Date;
	};
}

const allowedTransitions: Record<string, string[]> = {
	PENDING: ['PROCESSING', 'DECLINED'],
	PROCESSING: ['PENDING_ASSIGNMENT', 'PENDING', 'DECLINED'],
	PENDING_ASSIGNMENT: ['ASSIGNED', 'PROCESSING', 'DECLINED'],
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
			enum:TICKET_STATUS,
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
		},
		actionedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: User
		},
		assignedTo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: User
		},
		type: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'TicketType',
			required: true
		},
		technicianResponse: {
			response: {
				type: String,
				enum: TECHNICIAN_RESPONSE,
				required: true
			},
			message: String,
			respondedAt: Date
		}
	},

	{ timestamps: false }
);

// TicketSchema.pre<ITicket>('save', async function (next) {
// 	if (!this.isModified('status')) return next();

// 	if (!this.isNew) {
// 		const original = await (this.constructor as Model<ITicket>).findById(
// 			this._id
// 		);
// 		const oldStatus = original?.status;
// 		const newStatus = this.status;

// 		const allowed =
// 			allowedTransitions[oldStatus as keyof typeof allowedTransitions] ||
// 			[];

// 		if (!allowed.includes(newStatus)) {
// 			return next(
// 				new Error(
// 					`Invalid status transition from '${oldStatus}' to '${newStatus}'`
// 				)
// 			);
// 		}
// 	}

// 	next();
// });

TicketSchema.pre('findOneAndUpdate', async function (next) {
	const update = this.getUpdate() as any;
	if (!update.status) return next();

	const docToUpdate = await this.model.findOne(this.getQuery());
	const oldStatus = docToUpdate?.status;
	const newStatus = update.status;

	const allowed =
		allowedTransitions[oldStatus as keyof typeof allowedTransitions] || [];

	if (!allowed.includes(newStatus)) {
		return next(
			new Error(
				`Invalid status transition from '${oldStatus}' to '${newStatus}'`
			)
		);
	}
	next();
});
const Ticket =
	(mongoose.models.Ticket as Model<ITicket>) ||
	mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
