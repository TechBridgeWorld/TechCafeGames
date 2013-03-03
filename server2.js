var express = require("express");
var wwwDir = "/";
var http = require('http');
var xml2js = require('xml2js');
var scoreData = []; 
var questionStats = [];
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//var mongoose = require('mongoose');
var app = express.createServer(express.logger());
var Teacher = require('./models/Teacher.js');
var port = process.env.PORT || 5000;

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

	//mongoose.connect('mongodb://localhost:27017');

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

app.post("/registerUser", function(req, res){
	var username = req.body.username;

    console.log("username from register: "+username);
    console.log("request: "+req.body.username);
	Teacher.findOne({username : username }, function(err, existingUser) {
	    if (err){
	        return res.send({'err': err});
	    }
	    if (existingUser) {
	        console.log("user exists");
	        return res.send('user exists');
	    }

    var teacher = new Teacher({ username : req.body.username, password: req.body.password});

    console.log("creates a new one");	
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

app.get("/register", function(req,res){
	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		console.log("State: " + this.readyState);
		
		if (this.readyState == 4) {
			console.log("Complete.\nBody length: " + this.responseText.length);
			console.log('Output:');
			parser.parseString(this.responseText);
		}
	};
	var parser = new xml2js.Parser();
	xhr.open("GET", 'http://server2.tbw.ri.cmu.edu/CafeTeach/SilviaPessoa/data/qs-eau2rqip4l5inmroldp32ln755.xml');
	xhr.send();

	parser.on('end', function(result) {
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
	  console.log(questionData);
	  res.send(questionData);
	});
});

app.post("/postScore", function(req, res){
	console.log(req.body.name);
	var scoreObj = {}; 
	var questionObj = {};
	questionObj.name = req.body.name;
	questionObj.numRight = parseInt(req.body.numRight); 
	questionObj.numTotal = parseInt(req.body.numTotal);
	scoreObj.name = req.body.name;
	scoreObj.score = parseInt(req.body.score);
	
	questionStats.push(questionObj);
	scoreData.push(scoreObj);

	console.log(scoreData);

	return res.send("Registered.");
});

app.get("/getScores", function(req, res){
	
	var topTen = []; 

	function compare(a,b) {
	  if (a.score < b.score)
	     return 1;
	  if (a.score > b.score)
	    return -1;
	  return 0;
	}

	scoreData.sort(compare);

	console.log('scoreData:');
	console.dir(scoreData);

	if (scoreData.length >= 10){
		topTen = scoreData.slice(0,10);
	}
	else{
		topTen = scoreData; 
	}

	console.log('topTen:');
	console.dir(topTen);

	res.send(topTen);

});

app.get("/getQuestionStats", function(req,res){
	res.send(questionStats);
})