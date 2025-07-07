import mongoose, { Model, Schema } from 'mongoose';
import Business from './businessModel';

interface ITicketType extends Document {
	name: string;
	description: string;
	isActive: boolean;
	business?: mongoose.Types.ObjectId;
	isDefault?: boolean;
	createdAt: Date;
}
// TicketType.ts
const ticketTypeSchema = new Schema<ITicketType>({
	name: { type: String, required: true },
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
	isDefault: { type: Boolean, default: true }
});

const TicketType: Model<ITicketType> =
	mongoose.models.TicketType ||
	mongoose.model<ITicketType>('TicketType', ticketTypeSchema);

export default TicketType;
