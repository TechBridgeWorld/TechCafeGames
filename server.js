// server.js
// a very simple node server using the express module
var express = require("express");
var app = express();
var catlib = require("./node_modules/CATlib/CATlib");
var wwwDir = "/";
app.use("/", express.static(__dirname + wwwDir));
app.get("/", function(req, res) {res.render(wwwDir + "/index.html");});
app.listen(8080);

app.get("/test", function(req,res){
	catlib.getTeacherList(function(resp){
		res.send(resp);
	});
});



catlib.getTeacherList(function(resp){
	console.log('1.');
	console.log(resp);
	console.log();
});


catlib.getTeacherList(function(resp){
	console.log('2.');
	console.log(resp);
	console.log();
});



catlib.getContentSetList(function(resp){
	console.log('3.');
	console.log(resp);
	// console.log(Object.keys(resp));
	console.log();
});


catlib.getContentByTeacher('admin', function(resp){
	console.log('4.');
	console.log(resp);
	console.log();
});


catlib.getContentByTeacher('user', function(resp){
	console.log('5.');
	console.log(resp);
	console.log();
});


catlib.getContentByTeacher('user', function(resp){
	console.log('6.');
	console.log(resp);
	console.log();
});


catlib.getContentByTeacher('admin', function(resp){
	console.log('7.');
	console.log(resp);
	console.log();
});
