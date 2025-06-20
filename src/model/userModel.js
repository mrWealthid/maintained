const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Business = require('@/model/businessModel');

const userSchema = new mongoose.Schema({
	name: { type: String, required: [true, 'Please tell us your name!'] },
	email: {
		type: String,
		required: [true, 'Please provide your email'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email']
	},
	photo: { type: String, default: 'default.jpg' },
	role: {
		type: String,
		enum: ['USER', 'ADMIN', 'SUPER_ADMIN', 'TECHNICIAN', 'OWNER'],
		default: 'USER'
	},
	password: {
		type: String,
		required: [true, 'Please provide a password'],
		minlength: 8,
		select: false
	},

	business: {
		type: mongoose.Schema.ObjectId,
		ref: Business,
		required: [true, 'User must belong to a business']
	},
	createdAt: {
		type: Date,
		default: Date.now(),
		select: false
	},

	dateOfBirth: {
		type: Date
		// required: [true, 'Please add date of birth'],
	},

	inviteToken: String,
	inviteTokenExpires: Date,
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: Boolean,
		default: true,
		select: false
	},
	status: {
		type: String,
		enum: ['INVITED', 'ACTIVATED', 'DEACTIVATED']
	}
});

userSchema.pre('save', async function (next) {
	//Only run function if password was modified
	if (!this.isModified('password')) return next();

	//salting simply means its adding strings to the password so that two same passwords don't generate the same hash

	//hash the password with cost of 12
	this.password = await bcrypt.hash(this.password, 10);

	//delete the password confirm field

	next();
});

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimeStamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10
		);
		return JWTTimestamp < changedTimeStamp;
	}
	return false;
};

userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next();
	this.passwordChangedAt = Date.now() - 1000;
	//I did that substraction because the token is created faster most times before this runs...It's a quick fix
	next();
});

userSchema.methods.correctPassword = async function (
	newPassword,
	userPassword
) {
	return await bcrypt.compare(newPassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	console.log({ resetToken }, this.passwordResetToken);
	//for 10mins
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
	return resetToken;
};

userSchema.methods.createUserInviteToken = function () {
	const inviteToken = crypto.randomBytes(32).toString('hex');
	this.inviteToken = crypto
		.createHash('sha256')
		.update(inviteToken)
		.digest('hex');

	console.log({ inviteToken }, this.inviteToken);
	//for 24hrs
	this.inviteTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
	return inviteToken;
};

userSchema.pre(/^find/, function (next) {
	this.find({ active: { $ne: false } });
	next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

//Use this if you drop the DB for indexing
// User.init().then((x) => console.log(x));
module.exports = User;
