const mongoose = require('mongoose');

const { Schema } = mongoose;

const urlSchema = new Schema({
	origin: {
		type: 'string',
		unique: true,
		required: true,
	},

	shortUrl: {
		type: 'string',
		unique: true,
		required: true,
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
});

module.exports = mongoose.model('Url', urlSchema);
