const mongoose = require('mongoose');

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
	}
});

const Request =
	mongoose.models.Request || mongoose.model('Request', requestSchema);

// Make.init().then((x) => console.log(x));
module.exports = Request;
