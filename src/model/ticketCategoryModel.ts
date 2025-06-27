import mongoose, { Document, Schema, Model } from 'mongoose';
import Business from './businessModel';

interface ITicketCategory extends Document {
	name: string;
	description?: string;
	createdAt: Date;
	business: mongoose.Types.ObjectId;
}

const ticketCategorySchema = new Schema<ITicketCategory>({
	name: { type: String, required: true },
	description: { type: String },
	createdAt: {
		type: Date,
		default: Date.now,
		select: false
	},

	business: {
		type: mongoose.Schema.Types.ObjectId,
		ref: Business,
		required: [true, 'User must belong to a business']
	}
});

const TicketCategory: Model<ITicketCategory> =
	mongoose.models.TicketCategory ||
	mongoose.model<ITicketCategory>('TicketCategory', ticketCategorySchema);

export default TicketCategory;
