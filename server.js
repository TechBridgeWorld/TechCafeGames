var express = require("express");
var app = express();
var wwwDir = "/";
var http = require('http');
app.use(express.bodyParser());
app.use("/", express.static(__dirname + wwwDir));
app.get("/", function(req, res) { res.render(wwwDir + "/index.html");});
app.listen(8080);

var https = require('http');
var options = {
    host    : 'http://server2.tbw.ri.cmu.edu',
    method  : 'GET',
    path    : '/CafeTeach/SilviaPessoa/data/qs-eau2rqip4l5inmroldp32ln755.xml'
};
var output = {};
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

parser.on('end', function(result) {
  output = result;
  console.log(JSON.stringify(output));
});

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var xhr = new XMLHttpRequest();

xhr.onreadystatechange = function() {
	console.log("State: " + this.readyState);
	
	if (this.readyState == 4) {
		console.log("Complete.\nBody length: " + this.responseText.length);
		// console.log('Response:' + this.responseText);
		console.log('Output:');
		parser.parseString(this.responseText);
	}
};

xhr.open("GET", 'http://server2.tbw.ri.cmu.edu/CafeTeach/SilviaPessoa/data/qs-eau2rqip4l5inmroldp32ln755.xml');
xhr.send();	

app.get("/register", function(req,res){
	res.send(output);
})


