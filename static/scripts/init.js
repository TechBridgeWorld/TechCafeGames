/* initializes one of three given pages, according to the input string:
    -"homepage"
    -"editpage"
    -"playpage"
*/


// hides all DOM elements inside '#playing-area'
function hideAll() {
    // for home page
    $('#homepage').hide();
    $('#minigamelibloginoverlay').hide();
    // for play page
    $('#playpage').hide();
    // for edit page
    $('#editpage').hide();
    // hide login and game code overlays
    $('#loginoverlay').hide();
    $('#gamecodeinputoverlay').hide();
    $('#questionoverlay').hide();
    // set no scroll for edit and play page
    $('#playing-area').css('overflow', 'hidden');
}

// shows all DOM elements inside '#playing-area'
function showAll() {
    // for home page
    $('#homepage').show();
    $('#minigamelibloginoverlay').show();
    // for play page
    $('#playpage').show();
    // for edit page
    $('#editpage').show();
    // hide login and game code overlays
    $('#loginoverlay').show();
    $('#gamecodeinputoverlay').show();
    $('#questionoverlay').show();
    // set no scroll for edit and play page
    $('#playing-area').css('overflow', 'auto');
}

function goToEditPage(minigameObject, minigameId) {
    // hide all the DOM elements
    hideAll();
    // show the editor html stuff
    $('#editpage').show();
    // set scroll back to top
    $('#playing-area').scrollTop(0);
    // navigate to edit view
    initEditPage(minigameObject, minigameId);
}

// gets long id from a short id using an ajax request
function getlongid(shortid, callback) {
    // shortid has to be a string with 5 characters
    if ((typeof(shortid) !== typeof("")) ||
        (shortid.length !== 5)) {
        return callback("invalid input");
    }
    $.ajax({
        type: 'get',
        url: '/longid/' + shortid,
        success: function(data, err) {
            if (data.longid === "0")
                return callback("none found");
            else
                return callback(data.longid);
        },
        error: function(err) {
            return callback("none found");
        }
    }); 
}

// shortid is taken from the 5th-9th characters (inclusive) of the mongoid
function getshortid(longid) {
    if (longid.length < 10) console.log("longid too short: ", longid);
    return longid.substring(5,10);
}

// adds a minimap within a minigame library DOM element
function addMinimap(gameId) {
    var $elem = $('#'+gameId);
    // remove everything inside in case it's an update
    $elem.empty();
    function fillMinimap($mapelem, gameData) {
        var gameCols = 15; var gameRows = 9;
        // create all the little dom elements!
        for (var i = 0; i < gameRows; i++) {
            // create a row dom element
            var $rowelem = $("<div>").addClass("maprow");
            $rowelem.addClass(i.toString());
            $rowelem.css('height', (100/gameRows)+'%');
            for (var j = 0; j < gameCols; j++) {
                // create a itty bitty dom element
                var $elemSquare = $("<div>").addClass("elemSquare");
                $elemSquare.addClass(j.toString());
                $elemSquare.css('width', (100/gameCols)+'%');
                $rowelem.append($elemSquare);
            }
            $mapelem.append($rowelem);
        }
        // fill them in with colors and shapes!
        for (var ei = 0; ei < gameData.elementData.length; ei++) {
            var gameElem = gameData.elementData[ei];
            // selects dom element in a clever classy fashion
            var row = gameElem.path[0][1];
            var col = gameElem.path[0][0];
            var $gameDOM = $mapelem.find('.'+row).find('.'+col);
            if (isBall(gameElem)) $gameDOM.addClass('ball');
            $gameDOM.addClass(gameElem.type);
        }
    }
    $.ajax({
        type: "get",
        url: "/getGameData/" + gameId,
        success: function(data){
            // make map elem and then fill it
            var $mapelem = $("<div>").addClass("mapelem");
            // just in case there is one there check that it's empty
            if ($elem.find('.mapelem').length === 0)
                $elem.append($mapelem);
            fillMinimap($mapelem, data.gameData);
        },
        error: function(data, err) {
            console.log("retrieving stored data error: ", err);
        }
    });
}

// adds minigame to homepage library
var addToMinigameLib = function(id) {
    // see if it already is in library
    if (minigameLibList.indexOf(id) >= 0) {
        return;
    } else {
        minigameLibList.push(id);
    }
    // create DOM element
    var $loadedMinigame = $('<button>');
    $loadedMinigame.attr('class', 'minigame stored');
    $loadedMinigame.attr('id', id.toString());
    $('#edit-new-game').after($loadedMinigame);
    // set height equal to width to make it square
    $loadedMinigame.css('height', minigameWidth);
    addMinimap(id);
    // when clicked, load minigame from server
    $loadedMinigame.click(function () {
        var mongoId = $(this).attr('id');
        $.ajax({
            type: "get",
            url: "/getGameData/" + mongoId,
            success: function(data){
                goToEditPage(data.gameData);
            },
            error: function(data, err) {
                console.log("retrieving stored data error: ", err);
            }
        });
    });
}

// initializes minigame library for a user
function initMinigameLibrary(username, callback) {
    // clear the minigames there right now
    $('.minigame.stored').each(function(){
        $(this).remove();
    });
    minigameLibList = [];
    curUsername = username;
    $.ajax({
        type: "get",
        url: "/minigameLib/" + curUsername,
        success: function(data){
            for (var i = 0; i < data.length; i++) {
                addToMinigameLib(data[i]);
            };
            if (callback instanceof Function) {
                callback();
            }
        },
        error: function(data, err) {
            console.log("retrieving stored data error: ", err);
        }
    });
}


// sets up home page
function initHomePage(homePageSetUp) {
    // hide all DOM elements from other pages
    hideAll();
    playingGame = false;
    // make this window scrollable
    $('#playing-area').css('overflow', 'auto');

    // check if main page was already set up
    if (!homePageSetUp) {
        setupHomePage();
    }

    // show homepage now!
    $('#homepage').show();
    // make sure these are sized right
    $('#title').fitText(.9);
    $("#play-button-text").fitText(.35);

    // if we haven't been to the home page yet, set it up
    function setupHomePage() {
        // if player is not logged in,
        // they should do tutorial, so cover the library for now
        if (curUsername === "default")
            $('#minigamelibloginoverlay').show();

        // create new game (EDIT)
        $('#edit-new-game').click(function() {
            goToEditPage();
        });

        /* transition to minigame runner view */
        $('#play-button').click(function () {
            if (playingGame) return;
            playingGame = true;
            // set scroll back to top
            $('#playing-area').scrollTop(0);
            // run game
            initRunner(undefined, false, undefined);
        });

        // show game code input overlay
        $('#load-code-button').click(function(){
            promptGameCodeInput();
        });

        // show game code input overlay
        $('#select-questions-button').click(function(){
            promptQuestionSelect();
        });

        $('#minigamelibloginoverlay').click(function(){
            promptLogin("LOG IN TO CREATE");
        });

        // initialize logout button
        $('#logoutButton').click(function(){
            $('#minigamelibloginoverlay').show();
            post('/logout', undefined, loggedOutChanges);
        });
    }
}

function makeGameDataArray(idArray, gameArray, callback) {
    if (idArray.length === 0) {
        callback(gameArray);
    }
    else {
        $.ajax({
            type: "get",
            url: "/getGameData/" + idArray[0],
            success: function(data){
                gameArray.push(data.gameData);
                idArray.shift();
                makeGameDataArray(idArray, gameArray, callback);
            },
            error: function(data, err) {
                console.log("retrieving stored data error: ", err);
            }
        });
    } 
}

// sets up play page. takes array of MinigameData objects
function initRunner(data, fromEditor, minigameId) {

    /* tutorial levels! (no user can edit these) */
    var tutorial = [
    "51800d7eba85bf4174000008", // cloud mountain
    "5180078fba85bf4174000001", // fire platformer
    "51800bd9ba85bf4174000006", // tap mode
    "51800c81ba85bf4174000007", // atop clouds
    "51800e3aba85bf4174000009", // secret wall
    "518000f86c5caf3c73000005", // block maze
    "51801579ba85bf417400000b", // fire tunnel
    "5180174aba85bf417400000f" // challenge
    ];

    // random five games from minigame library!
    var randomFiveGames = shuffleArray(minigameLibList).slice(0,5);

    var inputGameList = ((curUsername === "default") ? 
                          tutorial : randomFiveGames);

    makeGameDataArray(inputGameList, [], function(defGameArray){
        // show/hide DOM things
        hideAll();
        $('#playpage').show();
        updateCanvasSizes($("#play-canvas"), 667, 390);

        if (data === undefined) {
            data = defGameArray;
        }

        // start minigame runner
        GameElement.preloadImages(function () {
            (new MinigameRunner(data, 9, 15, fromEditor, minigameId)).enter();
        });
    });
}

// sets up edit page view
function initEditPage(minigameObject, minigameId){
    updateCanvasSizes($("#editor-canvas"), 667, 390);
    playingGame = false;

    var $keysButton = $("button.keys-icon");
    var $clickButton = $("button.click-icon");
    var $gravityButton = $("button.gravity-icon");
    var $playButton = $("button.play-icon");
    
    
    $gravityButton.click(function(e){
        if ($(this).hasClass("selected"))
            $(this).removeClass("selected");
        else
            $(this).addClass("selected");
        e.preventDefault();
    });

    // exit back to main menu button
    $('.close-icon').each(function () {
        $(this).click(function() {
            editor.destroy();
            $gravityButton.off();
            $playButton.off();
            $clickButton.off();
            $keysButton.off();
            initHomePage(true);
        });
    });
    
    $playButton.click(function(e){
        if (playingGame) return;
        playingGame = true;
        e.preventDefault();
        editor.destroy();
        $gravityButton.off();
        $playButton.off();
        $clickButton.off();
        $keysButton.off();
        initRunner([new MinigameData(editor)], true, editor.minigameId);
    });

    var starterMinigameObj = {
        "mode": "directional",
        "hasGravity": true,
        "elementData": 
          [ 
            /* origin is where player starts in directional mode
               and the goal spot for the answer ball in tap mode */
            {"type": "player", path: [[7,4]]},
            /* editor starts with 4 answer objects 
               these can only be moved, not added/removed */
            {"type": 'answer1', path: [[1,1]]},
            {"type": 'answer2', path: [[1,7]]},
            {"type": 'answer3', path: [[13,1]]},
            {"type": 'answer4', path: [[13,7]]}
          ]
    };

    // if no minigameObject given, it is a new creation, use default one
    if (minigameObject === undefined) {
        minigameObject = starterMinigameObj;
    }

    // initialize Editor object and start displaying the view!
    var editor = new EditorManager(minigameObject, 9, 15, minigameId);

    $keysButton.click(function(e){
        $keysButton.addClass("selected");
        $clickButton.removeClass("selected");

        /* if there's an origin, switch it to a player */
        for (var i = 0; i < editor.editorElements.length; i++) {
          var elem = editor.editorElements[i];
          if (elem.libraryEntry.elementType === "origin") {
            var playerPreset = editor.libraryManager.presets.player;
            var player = new CanvasElement(playerPreset,
                                          elem.elemX, elem.elemY);
            editor.editorElements[i] = player;
          }
        }

        e.preventDefault();
    });
    
    $clickButton.click(function(e){
        $clickButton.addClass("selected");
        $keysButton.removeClass("selected");

        /* if there's a player, switch it to an origin */
        for (var i = 0; i < editor.editorElements.length; i++) {
          var elem = editor.editorElements[i];
          if (elem.libraryEntry.elementType === "player") {
            var originPreset = editor.libraryManager.presets.origin;
            var origin = new CanvasElement(originPreset,
                                          elem.elemX, elem.elemY);
            editor.editorElements[i] = origin;
          }
        }

        e.preventDefault();
    });
}

// takes text and puts it on a nice overlay that disappears when clicks
function promptMessage(message) {
    // check that there isn't one already
    if ($("#prompt").length !== 0) return;
    // create overlay right here
    var $overlay = $("<div>").addClass("overlay").attr('id','prompt');
    var $messagebox = $("<div>").addClass("messagebox").html(message);
    $overlay.append($messagebox);
    $("#playing-area").append($overlay);
    // vertically center messagebox
    $messagebox.css('margin-top', 
        (($overlay.height()/2)-($messagebox.height()/2))+"px");
    
    $overlay.click(function(e) {
        $overlay.remove();
        e.preventDefault();
        e.stopPropagation();
    });
}

function promptGameCodeInput() {
    $('#gamecodemessage').html('GAME CODE INPUT');
    $('#gamecodetextbox').val("");
    $('#gamecodeinputoverlay').show();
    // vertically center the overlay box
    $('#gamecodeinputarea').css('margin-top',
        ($('#gamecodeinputoverlay').height() / 2) -
        ($('#gamecodeinputarea').height() / 2));

    $('#getgamebutton').click(function(e){
        var shortidinput = $('#gamecodetextbox').val();
        getlongid(shortidinput, function(result) {
            if (result === "invalid input") {
                $('#gamecodemessage').html('WRONG SIZE CODE');
            }
            else if (result === "none found") {
                $('#gamecodemessage').html('INCORRECT CODE');
            }
            else {
                // add it to the library
                addToMinigameLib(result);
                postToMinigameLib(result);
                // clear text box
                $('#gamecodetextbox').val("");
                // exit overlay
                $('#gamecodeinputoverlay').hide();
            }
        });

        e.preventDefault();
        e.stopPropagation();
    });

    $('#cancelgamecodebutton').click(function(e){
        // exit overlay
        $('#gamecodeinputoverlay').hide();
    });
}

function promptQuestionSelect() {
    $('#questionoverlay').show();
    // exit the question select prompt
    $("#cancelquestionButton").click(function(e){
        $("#questionoverlay").hide();
    });
    // after content set selected, change set on database
    function changeQuestionSet(qSetName, callback) {
        $.ajax({
            type: "post",
            url: "/changeQuestionSet",
            data: {'qSetName': qSetName},
            success: function(data) {
                console.log("got: ", data);
                callback();
            }
        })
    }
    // after teacher is selected, display content set choices
    function setUpContents(teacherName) {
        $.ajax({
            type: "get",
            url: "/info/contentList/" + teacherName,
            success: function(data) {
                $("#selectFields").empty();
                var contents = data.content_sets;
                for (var j = 0; j < contents.length; j++) {
                    var qset = contents[j];
                    var qName = qset.name;
                    var $questionSet = $("<div>");
                    $questionSet.addClass("question-name");
                    $questionSet.html(qName);
                    $("#selectFields").append($questionSet);
                }
                $(".question-name").click(function(e){
                    var qSetName = $(this).html();
                    console.log("qSetName: ", qSetName);
                    changeQuestionSet(qSetName, function() {
                        $('#questionoverlay').hide();
                        $('#selectFields').empty();
                    });
                });
            }
        });
    }
    // get the whole teacher list, display teacher choices
    $.ajax({
        type: "get",
        url: "/info/teacherList",
        success: function(data) {
            for (var i = 0; i < data.length; i++) {
                var teacherName = data[i].username;
                var $teacher = $("<div>");
                $teacher.addClass("question-name");
                $teacher.html(teacherName);
                $("#selectFields").append($teacher);
            }
            $(".question-name").click(function(e){
                var teacherName = $(this).html();
                setUpContents(teacherName);
            });
        }
    });
}

// this will store the current user's username
var curUsername = "default";
var minigameWidth = 0;
var minigameLibList = [];
var playingGame = false;

// initialize home page first
$(document).ready(function(){
    // so that all widths/heights are accurate for these updates
    showAll();
    // fit text
    $('#title').fitText(.9);
    $("#play-button-text").fitText(.35);
    $("#runner-top-bar").fitText(2, {minFontSize: "6px"});
    $(".answer").fitText(.5, {minFontSize: "6px"});
    // make edit new game icon square
    minigameWidth = ($("#edit-new-game").width())
              + 2*parseInt($("#edit-new-game").css('border-width')[0]);
    $("#edit-new-game").css('height', minigameWidth+'px');
    hideAll();
    checkLogin(function(result){
        if (result === false) {
            loggedOutChanges(function() {
                // go to home page
                initHomePage(false);
            });
        }
        else {
            $('#minigamelibloginoverlay').hide();
            curUsername = result;
            loggedInChanges(null, "ok", function() {
                // go to home page
                initHomePage(false);
            });
        }
    });
});
