var express = require("express");
var wwwDir = "/";
var http = require('http');
var xml2js = require('xml2js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');

var mongoUri = process.env.MONGOLAB_URI || 
  'mongodb://localhost:27017'; 

var app = express.createServer();
var Teacher = require('./models/Teacher.js');
var Student = require('./models/Student.js');
var Content = require('./models/Content.js');
var QuestionSet = require('./models/QuestionSet.js');
var Score = require('./models/Score.js');

var mainContent; 
Content.findOne({id : 0}, function(err, existingUser) {
    if (err){
        return res.send({'err': err});
    }
    if (existingUser) {
        mainContent = existingUser;
	}
	else{
		mainContent = new Content({
			id: 0,
			url: "http://server2.tbw.ri.cmu.edu/CafeTeach/SilviaPessoa/data/qs-03e9dom8uo5vqganvgbm30knc7.xml",
			count: 0
		});			
	}
});

var mainScore = new Content({
	id: 0, 
	scores: []
});

var port = process.env.PORT || 8080;

function isEmpty(obj){
	for(var i in obj){
		if(obj.hasOwnProperty(i)){
			return false;
		}
	}
	return true;
}

function init(){
    configureExpress(app);

	mongoose.connect(mongoUri);

    var User = initPassportUser();

	app.listen(port);
}

init();

function initPassportUser(){
    var Teacher = require('./models/Teacher');

    passport.use(new LocalStrategy(Teacher.authenticate()));

    passport.serializeUser(Teacher.serializeUser());
    passport.deserializeUser(Teacher.deserializeUser());

    return Teacher;
}

function configureExpress(app){
	app.configure(function(){
		var Teacher = initPassportUser();
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.favicon());
		app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
        app.use(express.cookieParser('teacherportal'));
		app.use(express.session({secret: 'teacherportal'}));
		app.use(passport.initialize());
		app.use(passport.session());
		app.use("/", express.static(__dirname + wwwDir));
		app.get("/", function(req, res) { res.render(wwwDir + "/index.html");});
	});
};

app.post('/loginAdmin', function(req,res){
	var username = req.body.username;
	var password = req.body.password;
	if (!(username == 'admin' && password == 'tbwadmin')) {
		res.send('Invalid credentials');
	} 
	else{
		var data = ["Teacher Accounts:"];
		Teacher.find(function(err,responseText){
			data.push(responseText);
			Student.find(function(err,responseText){
				if (err) console.log(err);
				data.push("Student Accounts:");
				console.log(data);
				console.log(responseText);
				data.push(responseText);
				res.send(data);
			});
		});
	}
});

app.post("/registerUser", function(req, res){
	var username = req.body.username;

	Teacher.findOne({username : username }, function(err, existingUser) {
	    if (err){
	        return res.send({'err': err});
	    }
	    if (existingUser) {
	        return res.send('user exists');
	    }

    var teacher = new Teacher({ username : req.body.username, password: req.body.password});

    teacher.registeredTimestamp = new Date();
    	teacher.setPassword(req.body.password, function(err) {
		    if (err) {
		        return res.send({'err': err});
		    }
		    teacher.save(function(err) {
			    if (err) {
			        return res.send({'err': err});
			    }
			    return res.send('success');
		    });	
        });  
    });
});

app.post('/loginUser', passport.authenticate('local'), function(req, res) {
    req.user.lastUserAgent = req.headers['user-agent'];

    req.user.lastIp = req.ip;
    req.user.lastHost = req.host;
    req.user.lastLoginTimestamp = new Date();
    req.user.save();
    return res.send('success');
});

app.post('/updateXML', function(req,res){
	try{
		var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function() {
			
			if (this.readyState == 4) {
				parser.parseString(this.responseText);
			}
		};
		var parser = new xml2js.Parser();
		xhr.open("GET", req.body.url);
		xhr.send();

		parser.on('end', function(result) {
			// if (result.list.m2qslist[0].m2qs){
			var numqs = result.list.m2qslist[0].m2qs.length;
			var questionData = {};
			questionData['easy'] = [];
			questionData['medium'] = [];
			questionData['hard'] = [];

		    for (var i = 0; i < numqs; i++)
		    {	  
		  		var currentObj = {};
			  	currentObj['q'] = result.list.m2qslist[0].m2qs[i]["m2-qs"][0];
			  	currentObj['a'] = result.list.m2qslist[0].m2qs[i]["m2-ans"][0];
			  	currentObj['choices'] = []; 
			  	var temp = result.list.m2qslist[0].m2qs[i]["m2-opt"];
			  	for (var j = 0; j < temp.length; j++){
			  		if (!isEmpty(temp[j])){
			  			currentObj['choices'].push(temp[j]);
			  		}
			  	}
			  	if (result.list.m2qslist[0].m2qs[i]["m2-level"][0] == "easy"){
			  		questionData['easy'].push(currentObj);
			  	}
			  	if (result.list.m2qslist[0].m2qs[i]["m2-level"][0] == "medium"){
			  		questionData['medium'].push(currentObj);
			  	}
			  	if (result.list.m2qslist[0].m2qs[i]["m2-level"][0] == "hard"){
			  		questionData['hard'].push(currentObj);
			  	}
		 	}
		 	mainContent.count = mainContent.count + 1; 
		 	mainContent.save(); 
		 	console.log(req.body.url);
		 	var qData = JSON.stringify(questionData);
			var newContent = new QuestionSet({
				name: req.body.name,
				serial: mainContent.count,
				data: qData
			});
			QuestionSet.findOne({name:req.body.name}).remove();
			newContent.save(function(err){
				if (err) console.log('Error!');
			});
			return res.send('success');
		});
	}
	catch(err){
		console.log("Error parsing XML");
	}
});

app.get("/register", function(req,res){
	QuestionSet.find(function(err,responseText){
		res.send(responseText);
	});
});

app.post("/postGameData", function(req, res){
	var currStudent = new Student({
	gameLength : req.body.gameLength,
	name : req.body.name,
    numCoinsEaten: req.body.numCoinsEaten,
    numCoinsSpawned: req.body.numCoinsSpawned,
    numObstaclesEaten: req.body.numObstaclesEaten,
    numObstaclesSpawned: req.body.numObstaclesSpawned,
    numRightQuestions: req.body.numRightQuestions,
    numTimeoutQuestions: req.body.numTimeoutQuestions,
    numTotalQuestions: req.body.numTotalQuestions,
    numBoostPowersEaten: req.body.numBoostPowersEaten,
    numBoostPowersSpawned: req.body.numBoostPowersSpawned,
    numCrossoutPowersEaten: req.body.numCrossoutPowersEaten,
    numCrossoutPowersSpawned: req.body.numCrossoutPowersSpawned,
    numGasPowersEaten: req.body.numGasPowersEaten,
    numGasPowersSpawned: req.body.numPowersSpawned, 
    numPowersEaten: req.body.numPowersEaten,
    numPowersMissedInitially: req.body.numPowersMissedInitially,
    numPowersSpawned: req.body.numPowersSpawned,
    numTimePowersEaten: req.body.numTimePowersEaten,
    numTimePowersSpawned: req.body.numTimePowersSpawned,
    score: req.body.score,
    timestamp: req.body.timestamp,
    questionData: req.body.questionData,
	}); 

	currStudent.save(function(err){
		 if (err) {
	        return res.send({'err': err});
	    }
	    return res.send('success');
	});
});


app.post("/postScore", function(req, res){
	return res.send("Registered.");
});

app.get("/getScores", function(req, res){
	
	var scoreData = [];

	Student.find(function(err,responseText){
		if (err) console.log(err);
		
		for (var i = 0; i<responseText.length; i++){
			var tempObj = {}; 
			tempObj.name = responseText[i].name;
			tempObj.score = responseText[i].score;
			scoreData.push(tempObj);
		}

		var topTen = []; 

		function compare(a,b) {
		  if (a.score < b.score)
		     return 1;
		  if (a.score > b.score)
		    return -1;
		  return 0;
		}

		scoreData.sort(compare);

		if (scoreData.length >= 10){
			topTen = scoreData.slice(0,10);
		}
		else{
			topTen = scoreData; 
		}

		res.send(topTen);

	});	

});