import mongoose, { Document, Schema, Model } from 'mongoose';
import Business from './businessModel';

interface ITicketCategory extends Document {
	name: string;
	key?: string;
	description?: string;
	createdAt: Date;
	business?: mongoose.Types.ObjectId;
	isDefault?: boolean;
	isSystem?: boolean;
	isActive: boolean;
}

const ticketCategorySchema = new Schema<ITicketCategory>(
	{
		name: { type: String, required: true },
		key: { type: String, trim: true },
		description: { type: String },
		createdAt: {
			type: Date,
			default: Date.now,
			select: false
		},

		business: {
			type: mongoose.Schema.Types.ObjectId,
			ref: Business,
			required: false
			// required: [true, 'User must belong to a business']
		},
		isDefault: {
			type: Boolean,
			default: false
		},
		isSystem: { type: Boolean, default: false },
		isActive: { type: Boolean, default: true }
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

ticketCategorySchema.index(
	{ key: 1 },
	{
		unique: true,
		partialFilterExpression: {
			key: { $type: "string" },
			business: null,
			isSystem: true
		}
	}
);

ticketCategorySchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function (_doc, ret: Record<string, any>) {
		ret.id = ret._id?.toString();
		delete ret._id;
	}
});

const TicketCategory: Model<ITicketCategory> =
	mongoose.models.TicketCategory ||
	mongoose.model<ITicketCategory>('TicketCategory', ticketCategorySchema);

export default TicketCategory;
