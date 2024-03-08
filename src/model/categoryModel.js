const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
	name: { type: String, required: true },
	description: { type: String, required: true },
	createdAt: {
		type: Date,
		default: Date.now(),
		select: false
	}
});

const Category =
	mongoose.models.category || mongoose.model('Category', categorySchema);

// Make.init().then((x) => console.log(x));
module.exports = Category;
