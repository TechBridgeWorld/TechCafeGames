var express = require("express");
var app = express();
var wwwDir = "/";
var http = require('http');
app.use(express.bodyParser());
app.use("/", express.static(__dirname + wwwDir));
app.get("/", function(req, res) { res.render(wwwDir + "/index.html");});
app.listen(8080);
var xml2js = require('xml2js');
var scoreData = []; 

function isEmpty(obj){
	for(var i in obj){
		if(obj.hasOwnProperty(i)){
			return false;
		}
	}
	return true;
}

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
	scoreObj.name = req.body.name;
	scoreObj.numRight = req.body.numRight; 
	scoreObj.numTotal = req.body.numTotal;

	scoreData.push(scoreObj);

	return res.send("Registered.");
});

app.get("/getscore", function(req, res){
	res.send(scoreData);
});