TechCafe Content API
====================

About:
------

Node.js API Implementation for TechCafe's Teacher Portal. 

Use externally created educational content for games built with Node.js. 

Created for TechBridgeWorld/TechCafe at Carnegie Mellon University. 

For more information, visit http://www.cs.cmu.edu/~239/projects/techcafe-games

Installation:
-------------

Put the folder *Node_TechCafe* under *your-app/node_modules*

Usage: 
------

	var techcafe = require('./node_modules/Node_TechCafe/node_techcafe');
	
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