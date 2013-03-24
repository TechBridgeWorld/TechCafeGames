var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var QuestionSet = new mongoose.Schema({
	name:String,
	dataAdded:String,
	data:Array
});

module.exports = mongoose.model('QuestionSet', QuestionSet);

