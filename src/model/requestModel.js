const mongoose = require('mongoose');
const Business = require('./businessModel');
const User = require('./userModel');
const Category = require('./categoryModel');

const requestSchema = new mongoose.Schema({
	title: { type: String, required: true },
	area: { type: String, required: true },
	description: { type: String, required: true },
	category: {
		type: mongoose.Schema.ObjectId,
		ref: Category,
		required: [true, 'Request must belong to a category']
	},
	status: {
		type: String,
		enum: ['PENDING', 'ASSIGNED', 'DECLINED', 'COMPLETED'],
		default: 'PENDING'
	},
	videos: [String],
	images: [String],
	createdAt: {
		type: Date,
		default: Date.now()
		// select: false
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: User,
		required: [true, 'Request must belong to a User']
	},
	business: {
		type: mongoose.Schema.ObjectId,
		ref: Business,
		required: [true, 'Request must belong to a business']
	}
});

const Request =
	mongoose.models.Request || mongoose.model('Request', requestSchema);

// Make.init().then((x) => console.log(x));
module.exports = Request;
