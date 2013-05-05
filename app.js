var express = require("express"); // imports express
var app = express();        // create a new instance of express
var http = require('http');
var fs = require("fs");
var path = require('path');

var assert = require('./assertNode.js');
 var techcafe = require('./node_modules/node_techcafe/node_techcafe');

// for questions Erik made
var easyEnglishQuestionsPath =
    '/users/teacher_content.json?name=epintar&include_content_sets=true';

/* set up database */
// uri string: 
// mongodb://<dbuser>:<dbpassword>@dbh85.mongolab.com:27857/edugamify
var mongo = require('mongodb');
var mongoHost = 'dbh85.mongolab.com';
var mongoPort = 27857;
// for weird thing later in getGameData
var BSON = mongo.BSONPure;

var options = { w: 1 };
var ourCollName = 'minigameData';
var DB_NAME = 'edugamify';
var username = 'admin';
var password = 'kosbie';

var mongoServer = new mongo.Server(mongoHost, mongoPort);
var mongoClient = new mongo.Db(
    DB_NAME,
    mongoServer,
    options
);

// ****
// MONGO EXPRESS AUTHENTICATION
// basically just copied a lot of Evan Shapiro's code from
// https://github.com/es92/mongo-express-auth
// and modified it for this project
// ***

var mongoExpressAuth = require('mongo-express-auth');
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'secrets secrets are no fun' }));

// login uses a username and password and attempts to log in the database
app.post('/login', function(req, res){
    console.log("you are logging in!");
    mongoExpressAuth.login(req, res, function(err){
        if (err)
            res.send(err);
        else
            res.send('ok');
    });
});

// registers a new user
app.post('/register', function(req, res){
    console.log("you are registering!");
    mongoExpressAuth.register(req, function(err){
        if (err)
            res.send(err);
        else
            res.send('ok');
    });
});

// logs out user
app.post('/logout', function(req, res){
    mongoExpressAuth.logout(req, res);
    res.send('ok');
});

// GETS whether the user is logged in, and what their account info is
app.get('/me', function(req, res){
    mongoExpressAuth.checkLogin(req, res, function(err){
        if (err)
            res.send(err);
        else {
            mongoExpressAuth.getAccount(req, function(err, result){
                if (err)
                    res.send(err);
                else 
                    res.send(result);
            });
        }
    });
});

/** allows us to serve all files from the static directory
 * in other words, we can access our server at http://localhost:8889/index.html
 * instead of http://localhost:8889/static/index.html
 * See here for more details: https://piazza.com/class#spring2013/15237/168
**/
app.use(express.static(path.join(__dirname, 'static')));

var ALL_COLLECTIONS_DATA = null;
var ALL_COLLECTIONS_NAMES = ['minigameData', 'accountProfiles', 'questions'];
var QUESTION_DATA = null;

// Asynchronously read file contents, then call callbackFn
function readFile(filename, defaultData, callbackFn) {
  fs.readFile(filename, function(err, data) {
    if (err) {
      console.log("Error reading file: ", filename);
      data = defaultData;
    } else {
      console.log("Success reading file: ", filename);
    }
    if (callbackFn) callbackFn(err, data);
  });
}

// Asynchronously write file contents, then call callbackFn
function writeFile(filename, data, callbackFn) {
  fs.writeFile(filename, data, function(err) {
    if (err) {
      console.log("Error writing file: ", filename);
    } else {
      console.log("Success writing file: ", filename);
    }
    if (callbackFn) callbackFn(err);
  });
}

// either creates or updates the given minigame data, based whether an id is 
// given. On success, sends the mongo id of the updated gamedata document
app.post("/saveGameData", function(request, response){
    var gameData;
    if("gameData" in request.body){
        gameData = request.body["gameData"];
    }
    else{
        response.send(400, "missing data");
        return;
    }
    
    var _createGame = function(_gameData){
        minigameCollection.insert(_gameData, {"safe":true}, function(err,docs){
            if(err){
                response.send(500, "insert error");
            }
            else{
                console.log("created", docs[0]._id);
                response.send({
                    "status": "ok",
                    "id": docs[0]._id
                });
            }
        });
    };
    
    var minigameCollection = ALL_COLLECTIONS_DATA.minigameData;
    
    // if given existing id, update the corresponding game's data
    if("id" in request.body){
        
        var gameId = request.body['id'];
        console.log("looking for game with id", gameId);
        var mongolabId = new BSON.ObjectID(gameId);
        minigameCollection.findOne({"_id": mongolabId}, function(findErr, doc){
            if(findErr){
                response.send(500, "finding/update error");
            }
            if(doc !== null){
                minigameCollection.update({"_id": mongolabId}, {$set: gameData}, function(err){
                    if(err){
                        response.send(500, "update error");
                    }
                    else{
                        console.log("updated", gameId);
                        response.send({
                            "status": "ok",
                            "id": gameId
                        });
                    }
                });
            }
            else{
                _createGame(gameData);
            }
        
        });
    }
    
    // if not given an id, create a new one
    else {
        _createGame(gameData);
    }
});

// GETS a minigame object from the database given a mongo id
app.get("/getGameData/:mongoId", function (request, response){

    var minigameCollection = ALL_COLLECTIONS_DATA.minigameData;
    var mongoId = request.params.mongoId;

    // if given existing id, update the corresponding game's data
    if ("mongoId" !== undefined) {
        // weird thing you have to do to find the id (it's nested)
        var o_id = new BSON.ObjectID(mongoId);
        minigameCollection.findOne(
            {"_id": o_id}, 
            function(err, minigameObject){
                if(err){
                    response.send(500, "update error");
                }
                else{
                    console.log("HER IS MAH HGAME:\n", mongoId, minigameObject);
                    response.send({
                        "gameData": minigameObject
                    });
                }
        });
    }
    else {
        response.send(500, "update error");
    }
});

// POSTS a game to a user's minigameLibrary list of id's
app.post("/addToUserLib", function(request, response){
    var accountProfiles = ALL_COLLECTIONS_DATA.accountProfiles;
    var userStr = request.body['username'];
    var gameId = request.body['gameid'];
    var query = {'username': userStr};

    if ((userStr !== undefined) || (userStr !== "")) {
        accountProfiles.findOne(query, function(err, userObj){
            if(err) response.send(500, "update error");
            else {
                userObj.minigameLibrary.push(gameId);
                accountProfiles.update(query, userObj, function(err) {
                    if (err) response.send(500, "update error");
                    else {
                        response.send("ok");
                    }
                });
            }
        });
    }
});

// GETS a user's minigameLibrary
app.get("/minigameLib/:username", function(request, response) {
    var accountProfiles = ALL_COLLECTIONS_DATA.accountProfiles;
    var userStr = request.params.username;
    var query = {'username': userStr};

    if ((userStr !== undefined) || (userStr !== "")) {
        accountProfiles.findOne(query, function(err, userObj){
            if(err) response.send(500, "update error");
            else {
                response.send(userObj.minigameLibrary);
            }
        });
    }
    else {
        response.send("temporary user!");
    }
});

// PUTS a user's initial minigameLibrary and tutorials lists
app.put("/initUser/:username", function(request, response) {
    var accountProfiles = ALL_COLLECTIONS_DATA.accountProfiles;
    var userStr = request.params.username;
    // DEFAULT minigame objects!
    var newObj = {
        "username": userStr,
        "tutorials": [],
        "minigameLibrary": 
            [
            "51800d7eba85bf4174000008", // cloud mountain
            "5180078fba85bf4174000001", // fire platformer
            "51800bd9ba85bf4174000006", // tap mode
            "51800c81ba85bf4174000007", // atop clouds
            "51800e3aba85bf4174000009", // secret wall
            "518000f86c5caf3c73000005", // block maze
            "51801579ba85bf417400000b", // fire tunnel
            "5180174aba85bf417400000f" // challenge
            ]
    }
    console.log("new user: ", userStr);
    console.log("init data: ", newObj);
    accountProfiles.insert(newObj, function(err) {
        console.log("error: ", err);
        if (err) {
            response.send(400, "write error");
        }
        else {
            response.send({
                "err": err, 
                "msg": "ok"
            });
        }
    });
});

// gets the long id from a short 5 digit id
// a 1 in 100,000 chance that they won't match (pshh)
app.get("/longid/:shortid", function(request, response){
    var shortid = request.params.shortid;
    var longid = "0";
    var minigameCollection = ALL_COLLECTIONS_DATA.minigameData;

    // loop through and see if there's an id with the same first 5 digits
    minigameCollection.find().toArray(function(err, docList){ 
        if (err) console.log(err);
        for (var i = 0; i < docList.length; i++) {
            var doc = docList[i];
            var longidguess = doc._id.toString();
            // shortid is taken from the 5th-9th digits of the mongoid
            if ((longidguess.indexOf(shortid) === 5) &&
               (longid === "0")) {
                longid = longidguess;
            }
        }
        // longid will be 0 if none found or the id found
        console.log("longId found was:", longid, "type: ", typeof(longid));
        response.send({
            "longid": longid
        });
    });
});

// just give them one random question for now
app.get("/info/questions", function(request, response) {
    // question data is an array with beginner questions at index 0
    var easyEnglishQuestions = 
        (QUESTION_DATA.content_sets[0]).questions;

    var numQuestions = easyEnglishQuestions.length;
    var randQuestionUnRound = ((numQuestions)*(Math.random()));
    var randQuestionIndex = Math.floor(randQuestionUnRound);
    response.send({
        "question": easyEnglishQuestions[randQuestionIndex]
    });
});

/** returns a json of all collections in the database; for debug purposes**/
app.get("/info/collections", function(request, response){
    var output = {};
    var loadedCollections = 0;
    
    for(var collectionName in ALL_COLLECTIONS_DATA){
        var collection = ALL_COLLECTIONS_DATA[collectionName];
        // curried so that name isn't wiped out by callback
        (function(name){
            collection.find().toArray(function(err, docList){
                if(err){
                    response.send({
                        error: err
                    });
                }
            
                output[name] = docList;
                loadedCollections++;
                
                if(loadedCollections >= ALL_COLLECTIONS_NAMES.length){
                    response.send({
                        "collections": output
                    });
                }
            });
        })(collectionName);
    }
});

/*
 *
 *      SETUP
 *
 */

function launchApp(pulledContent, collectionData){
    ALL_COLLECTIONS_DATA = collectionData;

    // do another check in case the TECH CAFE database fails
    var backupQcoll = ALL_COLLECTIONS_DATA["questions"];
    backupQcoll.find().toArray(function(err, questArray) {
        // assuming there's only one object
        var backupQuestions = questArray[0];
        if (pulledContent === "use backup questions") {
            pulledContent = backupQuestions;
        }

        // now finally set it all up
        QUESTION_DATA = pulledContent;
        
        assert.assert(QUESTION_DATA !== null, 
            "did not pull content properly");
        assert.assert(ALL_COLLECTIONS_DATA !== null, 
            "did not pull collections properly");
        
        console.log('pulled content\n', QUESTION_DATA);
        console.log('loaded collections\n');
        
        var port = 8000;
        console.log("starting app on port", port);
        app.listen(port);
    });
}

// takes a function that takes a dictionary of collections
function openDb(onAllLoadedFn){
    var collectionNames = ALL_COLLECTIONS_NAMES;
    var loadedCollections = {};
    var numLoadedCollections = 0;
    
    // creates a function that will be called when a collection is loaded
    function makeCollectionReadyFn(loadedName){
        // curried so that loadedName remains local to function
        return function(err, loadedCollection){
            if (err) throw err;
            
            numLoadedCollections++;
            loadedCollections[loadedName] = loadedCollection;
            console.log(loadedName, "collection loaded!");
            if(numLoadedCollections >= collectionNames.length){
                onAllLoadedFn(loadedCollections);
            }
        }
    }
    
    // called when the database is opened; opens all collections
    function onDbReady(){
        console.log('database opened!');
        console.log('loading collections...');
        
        for(var i = 0; i < collectionNames.length; i++){
            var collectionName = collectionNames[i];
            console.log('loading ', collectionName, '...');
            mongoClient.collection(collectionName, 
                                   makeCollectionReadyFn(collectionName));
        }
    }

    // takes care of the mongolab authentication for the database
    function _databaseAuth(err, db) {
        if (err) done(err);
        console.log("authenticating mongolab database for auth...")
        db.authenticate(
            username, 
            password, 
            function(error, result) {
                if (error) done(error);
                // result being false means authentication didn't work
                if (!result) {
                    console.log("database authentication not successsful.");
                }
                else {
                    console.log("db authentication successful!");
                    onDbReady();
                }
            });
    }

    // start the callback chain!
    console.log('opening database...');
    mongoClient.open(_databaseAuth);
}

function closeDb(){
    mongoClient.close();
}

// takes a function that takes a pulled-content dictionary
function pullQuestionContent(onPulledFn){
    console.log('pulling question content from server...');
    var options = {host:'techcafe-teacher.herokuapp.com', 
                   path:easyEnglishQuestionsPath, method:'GET'};
    var	callback = function(response) { 
        var str = ''; 
        response.on('data', function (chunk){ 
            str += chunk; 
        });
        
        response.on('error' , function(err) {
            console.log("TECH CAFE DATABASE BROKEN.\n", err);
            onPulledFn("use backup questions");
        });

        response.on('end', function () { 
            var parsedVal = JSON.parse(str);
            console.log('question content pulled!');
            techcafe.getContentByTeacher('epintar', function(data){
                // Returns a list of JSON objects containing all content sets owned by teacher 'TeacherUsername'
                console.log("data pulled", data);
                onPulledFn(parsedVal);
            });
        });
    };

    http.request(options,callback).on('error', function(err){
        console.log("error while loading content", err);
    }).end();


}

/** initServer

**/
function initServer() {
    var _pulledContent = null;
    var _collectionData = null;
    
    var _contentLoaded = false;
    var _collectionsLoaded = false;
    
    function _attemptLaunch(){
        if(_contentLoaded === true && _collectionsLoaded === true){
            launchApp(_pulledContent, _collectionData);
        }
    }

    function _grabContent(){
        console.log("loaded mongo-express-auth!");
        
        pullQuestionContent(function(pulledData){
            _pulledContent = pulledData;
            _contentLoaded = true;
            _attemptLaunch();
        });
        
        openDb(function(loadedCollectionData){
            _collectionData = loadedCollectionData;
            _collectionsLoaded = true;
            _attemptLaunch();
        });
    }

    function _initUserAuth() {
        console.log("initializing mongo-express-auth...");
        mongoExpressAuth.init({
            mongo: { 
                dbName: DB_NAME,
                collectionName: 'accounts',
                host: 'dbh85.mongolab.com',
                port: 27857,
                dbusername: username,
                dbpassword: password
            }
        }, _grabContent);
    }

    _initUserAuth();
}

initServer();
