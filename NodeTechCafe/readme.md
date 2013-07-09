TechCafe Content API
====================

About:
------

The TechCafe games platform allows game developers to create educational
games that use externally created content. This allows for developers to
focus on the core gaming experience, and for teachers to tailor content to 
their students' needs. 

Node-TechCafe is a Node.js API Implementation for TechCafe's Teacher Portal. 

Created for TechBridgeWorld/TechCafe at Carnegie Mellon University. 

Useful links:

*Teacher Portal (Content Creation Platform):*
http://techcafe-teacher.herokuapp.com

*Project page:* 
http://www.cs.cmu.edu/~239/projects/techcafe-games

Installation:
-------------

Put the folder *Node_TechCafe* under *your-app/modules* (Or wherever you prefer to save it). 

Setting Up the Connection to Teacher Portal:
------

Inside the file Node_TechCafe.js you will see a seciton similar to the one below. You need to list the URL or IP address of the machine running the teacher portal software. The port will always be 3000 assuming that this port is not being used by other applications.

	var options = {
		host: '<YOUR SERVER RUNNING TEACHER PORTAL>',
		port: 3000,
		method: 'GET',
	};

Example of Teacher Portal running on a publically available web server:
	
	var options = {
		host: 'www.myserver.com',
		port: 3000,
		method: 'GET',
	};
	
Example of specifying a machine that may be running on your local network
	
	var options = {
		host: '192.168.0.12',
		port: 3000,
		method: 'GET',
	};
	
Example of running the both the server and Brain Race game on the same machine.
	
	var options = {
		host: 'localhost',
		port: 3000,
		method: 'GET',
	};

Usage: 
------

	var techcafe = require('./modules/Node_TechCafe/node_techcafe');
	
	techcafe.getTeacherList(function(data){
		//use data
	});
	
	techcafe.getContentByTeacher('TeacherUsername', function(data){
		//use data
	});

API: 
----

###getTeacherList(function):
Returns a list of JSON objects containing all teachers in the database

*Data Format:*

	[{username:Teacher1}, {username:Teacher2},...]

###getContentSetList(function):
Returns JSON object containing all content sets in the database

*Data Format:*
	
	{ContentSet1: Questions, ContentSet2: Questions, ...}

###getContentByTeacher(teacherID, function):
Returns JSON object containing all content sets for a given teacher ID

*Data Format:*

	{
	username: 'username', 
	content_sets: 
	[{name:ContentSet1, questions:Questions},
	{name:ContentSet2, questions:Questions}, ...]
	}