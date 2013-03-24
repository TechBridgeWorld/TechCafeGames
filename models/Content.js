var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Content = new mongoose.Schema({
	id:Number,
	url:String, 
	count: Number
});

module.exports = mongoose.model('Content', Content);

