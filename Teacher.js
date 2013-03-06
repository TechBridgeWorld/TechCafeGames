var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Teacher = new mongoose.Schema({
	xml:String
});

Teacher.plugin(passportLocalMongoose); //adds username, password to schema
module.exports = mongoose.model('Teacher', Teacher);