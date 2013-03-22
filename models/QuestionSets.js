var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var QuestionSets = new mongoose.Schema({
	name:String,
	serial:Number,
	data:String
});

module.exports = mongoose.model('QuestionSets', QuestionSets);

