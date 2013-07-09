var http = require('http');
var events = new require('events');
var eventResp = new events.EventEmitter;
eventResp.setMaxListeners(0);

var options = {  
	host: 'localhost',
	port: 3000, 
	method: 'GET',
};

function setListener(event, callback){
	if (str === undefined){
		eventResp.once(event, function(data){
			if (data !== 'null'){ 
				try{
					callback(JSON.parse(data));
				}
				catch(err){
					callback("Error");
				}
			}
			else{
				callback("No data found.");
			}
		});
		eventResp.once('error', function(err){
			callback('Error: ' + err);
		});
	}
	else{
		callback(str);
	}
}

var str; 

// Returns a list of all teachers in the database
// Format: [{username:Teacher1}, 
//			{username:Teacher2},...]
exports.getTeacherList = function(callback){
	var opt = options; 
	opt.path = '/users/teacher_list.json';
	
	http.request(opt,function(response){
		var str = ''; 
		response.on('error', function(err){
			console.log('Error: ' + err);
			eventResp.emit('error', err);
		});
		response.on('data', function (chunk) 
			{ str += chunk; }
		);
		response.on('end', function () { 
			eventResp.emit('completeTeacherList', str);
		});
	}).end();

	setListener('completeTeacherList',callback);
}

// Returns a list of all content sets in the database
//Format: {ContentSet1: Questions, ContentSet2: Questions, ...}
exports.getContentSetList = function(callback){
	var opt = options; 
	opt.path = '/content_sets/get_content_sets.json';
	
	http.request(opt,function(response){
		var str = ''; 
		response.on('error', function(err){
			console.log('Error: ' + err);
			eventResp.emit('error', err);
		});
		response.on('data', function (chunk) 
			{ str += chunk; }
		);
		response.on('end', function () { 
			eventResp.emit('completeContentSetList', str);
		});
	}).end();

	setListener('completeContentSetList', callback);
}

//Returns JSON containing all content sets for given teacher ID
// Format: {
//			username: 'username', content_sets: 
//			[{name:ContentSet1, questions:Questions},
//			{name:ContentSet2, questions:Questions}, ...]
//			}
exports.getContentByTeacher = function(tid, callback){
	var opt = options; 
	opt.path = '/users/teacher_content.json?name='+tid+'&include_content_sets=true';
	
	http.request(opt,function(response){
		var str = ''; 
		response.on('error', function(err){
			console.log('Error: ' + err);
			eventResp.emit('error', err);
		});
		response.on('data', function (chunk) 
			{ str += chunk; }
		);
		response.on('end', function () { 
			eventResp.emit('teacherContent'+tid, str);
		});
	}).end();

	setListener('teacherContent'+tid, callback);	
}
