import mongoose, { Document, Schema, Model } from 'mongoose';
import validator from 'validator';

export interface IBusiness extends Document {
	businessName: string;
	registrationId: string;
	businessContact: string;
	country: string;
	businessAddress: string;
	description?: string;
	createdAt: Date;
	businessEmail: string;
	businessCreator: string;
	logo?: string;
	active?: boolean;
}

const businessSchema = new Schema<IBusiness>(
	{
		businessName: { type: String, required: true },
		registrationId: { type: String, required: true },
		businessContact: { type: String, required: true },
		country: { type: String, required: true },
		businessAddress: { type: String, required: true },
		description: { type: String },
		createdAt: { type: Date, default: Date.now },
		businessEmail: {
			type: String,
			required: [true, 'Please provide your business email'],
			unique: true,
			lowercase: true,
			validate: [validator.isEmail, 'Please provide a valid email']
		},
		businessCreator: { type: String, required: true },
		logo: { type: String, default: 'default.jpg' },
		active: { type: Boolean, default: true }
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

businessSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function (_doc, ret: Record<string, any>) {
		ret.id = ret._id?.toString();
		delete ret._id;
	}
});

businessSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
	this.find({ active: { $ne: false } });
	next();
});

businessSchema.virtual('businessUsers', {
	ref: 'User',
	foreignField: 'business',
	localField: '_id'
});

const Business: Model<IBusiness> =
	mongoose.models.Business ||
	mongoose.model<IBusiness>('Business', businessSchema);

export default Business;
