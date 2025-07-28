import mongoose, { Document, Schema, Model, Types, ObjectId } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Business from './businessModel';
import { ROLES } from '@/app/shared/enums/enums';

export interface IUser extends Document {
	name: string;
	email: string;
	photo?: string;
	// role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'TECHNICIAN' | 'OWNER';
	password: string;
	// business: mongoose.Types.ObjectId;
	createdAt: Date;
	dateOfBirth?: Date;
	inviteToken?: string;
	inviteTokenExpires?: Date;
	passwordChangedAt?: Date;
	passwordResetToken?: string;
	passwordResetExpires?: Date;
	active?: boolean;
	// status?: 'INVITED' | 'ACTIVATED' | 'DEACTIVATED';
	changedPasswordAfter(JWTTimestamp: number): Promise<boolean>;
	correctPassword(
		newPassword: string,
		userPassword: string
	): Promise<boolean>;
	createPasswordResetToken(): string;
	createUserInviteToken(): string;
	passwordConfirm: string;
	memberships: {
		business: Types.ObjectId;
		role: 'USER' | 'ADMIN' | 'TECHNICIAN' | 'OWNER' | 'SUPER_ADMIN';
		status: 'INVITED' | 'ACTIVATED' | 'DEACTIVATED';
		inviteToken?: string;
		inviteTokenExpires?: Date;
	}[];
	currentBusiness: Types.ObjectId;
}

const userSchema = new Schema<IUser>(
	{
		name: { type: String, required: [true, 'Please tell us your name!'] },
		email: {
			type: String,
			required: [true, 'Please provide your email'],
			unique: true,
			lowercase: true,
			validate: [validator.isEmail, 'Please provide a valid email']
		},
		photo: { type: String, default: 'default.jpg' },
		password: {
			type: String,
			required: [true, 'Please provide a password'],
			minlength: 8,
			select: false
		},
		memberships: [
			{
				business: {
					type: mongoose.Schema.Types.ObjectId,
					ref: Business,
					required: true
				},
				status: {
					type: String,
					enum: ['INVITED', 'ACTIVATED', 'DEACTIVATED']
				},
				role: {
					type: String,
					enum: [
						'USER',
						'ADMIN',
						'TECHNICIAN',
						'OWNER',
						'SUPER_ADMIN'
					],
					required: true
				},
				inviteToken: String,
				inviteTokenExpires: Date
			}
		],
		currentBusiness: {
			type: mongoose.Schema.Types.ObjectId,
			ref: Business
		},
		createdAt: {
			type: Date,
			default: Date.now,
			select: false
		},
		dateOfBirth: { type: Date },
		passwordChangedAt: Date,
		passwordResetToken: String,
		passwordResetExpires: Date,
		active: {
			type: Boolean,
			default: true,
			select: false
		}
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

userSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function (_doc, ret: Record<string, any>) {
		ret.id = ret._id?.toString();
		delete ret._id;
	}
});

// Hash password before saving
userSchema.pre<IUser>('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

// Set passwordChangedAt
userSchema.pre<IUser>('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next();
	this.passwordChangedAt = new Date(Date.now() - 1000);
	next();
});

// Exclude inactive users from queries
userSchema.pre(/^find/, function (next) {
	(this as mongoose.Query<any, any>).where({ active: { $ne: false } });
	next();
});

// Instance methods
userSchema.methods.changedPasswordAfter = async function (
	JWTTimestamp: number
): Promise<boolean> {
	if (this.passwordChangedAt) {
		const changedTimeStamp = Math.floor(
			this.passwordChangedAt.getTime() / 1000
		);
		return JWTTimestamp < changedTimeStamp;
	}
	return false;
};

userSchema.methods.correctPassword = async function (
	newPassword: string,
	userPassword: string
): Promise<boolean> {
	return await bcrypt.compare(newPassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function (): string {
	const resetToken = crypto.randomBytes(32).toString('hex');
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');
	this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
	return resetToken;
};

userSchema.methods.createUserInviteToken = function (): string {
	const inviteToken = crypto.randomBytes(32).toString('hex');
	this.inviteToken = crypto
		.createHash('sha256')
		.update(inviteToken)
		.digest('hex');
	this.inviteTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs
	return inviteToken;
};

const User: Model<IUser> =
	mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
