var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
	name: String,
	desc: String,
	amount: Number,
	img:
	{
		data: Buffer,
		contentType: String
	}
});

//Item is a model which has a schema itemSchema

module.exports = new mongoose.model('Item', itemSchema);
