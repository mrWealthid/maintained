import mongoose, { Model, Schema } from 'mongoose';
import Business from './businessModel';

interface ITicketType extends Document {
	name: string;
	key?: string;
	description: string;
	isActive: boolean;
	business?: mongoose.Types.ObjectId;
	isDefault?: boolean;
	isSystem?: boolean;
	createdAt: Date;
}
// TicketType.ts
const ticketTypeSchema = new Schema<ITicketType>(
	{
		name: { type: String, required: true },
		key: { type: String, trim: true },
		description: String,
		business: {
			type: mongoose.Schema.Types.ObjectId,
			ref: Business,
			required: false
		},
		createdAt: {
			type: Date,
			default: Date.now,
			select: false
		},
		isActive: { type: Boolean, default: true },
		isDefault: { type: Boolean, default: false },
		isSystem: { type: Boolean, default: false }
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

ticketTypeSchema.index(
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

ticketTypeSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function (_doc, ret: Record<string, any>) {
		ret.id = ret._id?.toString();
		delete ret._id;
	}
});

const TicketType: Model<ITicketType> =
	mongoose.models.TicketType ||
	mongoose.model<ITicketType>('TicketType', ticketTypeSchema);

export default TicketType;
