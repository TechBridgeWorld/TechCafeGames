var http = require('http');
var events = new require('events');
var eventResp = new events.EventEmitter;

var options = {  
	host: '0.0.0.0', 
	port: 3000, 
	method: 'GET'
};

function setListener(event, callback){
	if (str === undefined){
		eventResp.once(event, function(data){
			callback(JSON.parse(data));
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
	opt.path = '/users.json';
	
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
	opt.path = '/content_sets.json';
	
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
	opt.path = '/users/'+tid+'.json?include_content_sets=true';
	
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
			eventResp.emit('completeTeacherContentSetList', str);
		});
	}).end();

	setListener('completeTeacherContentSetList', callback);	
}

exports.getContentByName = function(name, callback){
	var opt = options; 
	opt.path = '/content_sets/'+name+'.json';
	
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
			console.log(str);
			eventResp.emit('completeTeacherContentSetList', str);
		});
	}).end();

	setListener('completeTeacherContentSetList', callback);	
}

exports.getByType = function(type, callback){
	if (type == 'multipleChoice'){
			
	}
	else if (type == 'fillBlanks'){

	}
}
