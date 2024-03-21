const businessSchema = new mongoose.Schema({
	businessName: {
		type: String,
		required: true
	},
	registrationId: {
		type: String,
		required: true
	},
	businessContact: {
		type: String,
		required: true
	},
	country: {
		type: String,
		required: true
	},
	businessAddress: {
		type: String,
		required: true
	},
	description: String,
	createdAt: {
		type: Date,
		default: Date.now
	},
	businessEmail: {
		type: String,
		required: [true, 'Please provide your business email'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email']
	},
	businessCreator: {
		type: String,
		required: true
	},
	// businessCreatorId: {
	// 	type: String,
	// 	required: true
	// },
	logo: { type: String, default: 'default.jpg' }

	// businessUsers: {
	// 	type: mongoose.Schema.ObjectId,
	// 	ref: User
	// 	// required: [true, 'User must belong to a business']
	// },
	// businessLogo: String

	// Add other fields as needed
});

businessSchema.pre(/^find/, function (next) {
	this.find({ active: { $ne: false } });
	next();
});

businessSchema.virtual('businessUsers', {
	ref: 'User',
	foreignField: 'businessId',
	localField: '_id'
});
const Business =
	mongoose.models.Business || mongoose.model('Business', businessSchema);

// Make.init().then((x) => console.log(x));
module.exports = Business;
