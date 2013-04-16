CATLib
======

###Installation:

Put CATLib.js under your-app/node_modules/CATlib

###Usage: 

	var catlib = require('./node_modules/CATlib/CATlib.');
	
	catlib.getTeacherList(function(data){
	
	//use data
	
	});
	
	catlib.getContentByTeacher('TeacherUsername', function(data){
	
	//use data
	
	});

API: 
====

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