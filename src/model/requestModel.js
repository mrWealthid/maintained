const mongoose = require('mongoose');
const Business = require('./businessModel');
const User = require('./userModel');

const requestSchema = new mongoose.Schema({
	title: { type: String, required: true },
	area: { type: String, required: true },
	description: { type: String, required: true },
	category: { type: String, required: true },
	status: {
		type: String,
		enum: ['PENDING', 'ASSIGNED', 'DECLINED', 'COMPLETED'],
		default: 'PENDING'
	},
	video: [String],
	images: [String],
	createdAt: {
		type: Date,
		default: Date.now(),
		select: false
	},
	userId: {
		type: mongoose.Schema.ObjectId,
		ref: User,
		required: [true, 'Request must belong to a User']
	},
	businessId: {
		type: mongoose.Schema.ObjectId,
		ref: Business,
		required: [true, 'Request must belong to a business']
	}
});

const Request =
	mongoose.models.Request || mongoose.model('Request', requestSchema);

// Make.init().then((x) => console.log(x));
module.exports = Request;
