var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Score = new mongoose.Schema({
	name:String,
	score:Number
});

module.exports = mongoose.model('Score', Score);

