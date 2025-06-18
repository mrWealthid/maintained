const mongoose = require('mongoose');

const ticketCategorySchema = new mongoose.Schema({
	name: { type: String, required: true },
	description: { type: String },
	createdAt: {
		type: Date,
		default: Date.now(),
		select: false
	}
});

const TicketCategory =
	mongoose.models.TicketCategory ||
	mongoose.model('TicketCategory', ticketCategorySchema);

// Make.init().then((x) => console.log(x));
module.exports = TicketCategory;
