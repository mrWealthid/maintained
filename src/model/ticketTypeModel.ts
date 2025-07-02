import mongoose, { Schema } from 'mongoose';
import Business from './businessModel';

interface ITicketType extends Document {
	name: string;
	description: string;
	isActive: boolean;
	business?: mongoose.Types.ObjectId;
	isDefault?: boolean;
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
	isActive: { type: Boolean, default: true }
});

export const TicketType = mongoose.model('TicketType', ticketTypeSchema);
