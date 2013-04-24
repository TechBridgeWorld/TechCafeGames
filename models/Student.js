var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Student = new mongoose.Schema({
	gameLength: Number, 
	name: String, 
	numCoinsEaten: Number, 
	numCoinsSpawned: Number, 
	numObstaclesEaten: Number, 
	numObstaclesSpawned: Number, 
	numRightQuestions: Number, 
	numTimeoutQuestions: Number, 
	numTotalQuestions: Number, 
	numBoostPowersEaten: Number, 
	numBoostPowersSpawned: Number, 
	numCrossoutPowersEaten: Number, 
	numCrossoutPowersSpawned: Number, 
	numGasPowersEaten: Number,
	numGasPowersSpawned: Number, 
	numPowersEaten: Number, 
	numPowersMissedInitially: Number, 
	numPowersSpawned: Number, 
	numTimePowersEaten: Number, 
	numTimePowersSpawned: Number,
	score: Number, 
	timestamp: String,
	questionData: Array
});

module.exports = mongoose.model('Student', Student);