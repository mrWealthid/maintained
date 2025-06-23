import mongoose, { Document, Schema, Model } from 'mongoose';

 interface ITicketCategory extends Document {
    name: string;
    description?: string;
    createdAt: Date;
}

const ticketCategorySchema = new Schema<ITicketCategory>({
    name: { type: String, required: true },
    description: { type: String },
    createdAt: {
        type: Date,
        default: Date.now,
        select: false,
    },
});

const TicketCategory: Model<ITicketCategory> =
    mongoose.models.TicketCategory ||
    mongoose.model<ITicketCategory>('TicketCategory', ticketCategorySchema);

export default TicketCategory;