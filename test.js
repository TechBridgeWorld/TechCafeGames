var http = require('http');

var options = {host:'gentle-shore-9072.herokuapp.com', path:'/register', method:'GET'};

var events = new require('events');
var eventResp = new events.EventEmitter;

var callback = function(response) { 
	var str = ''; 
	response.on('data', function (chunk) 
		{ str += chunk; }
	);
	response.on('end', function () { 
		eventResp.emit("complete", str);
	});
};

eventResp.on('complete', function(data){
	console.log("EVENT DETECTED");
	console.log(JSON.parse(data));
})

http.request(options,callback).end();
