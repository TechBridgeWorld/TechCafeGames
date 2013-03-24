window.onload = execute();

function execute(){

    // testing switches for sound and random answers
    var soundOn = false;             // turns on game sounds
    var randomChoiceFlag = true;    // randomize answers in question
    var trackDataFlag = true;       // track all user data for testing purposes
    var gameData = {};              // array to store tracking data
    var eatenPowerFlag;             // false when user hasn't eaten any powers yet
    var questionSets;
    
    var ajaxRequest = function(url, fnSuccess, fnError){
        $.ajax({
            url: url,
            data: 'GET',
            success: fnSuccess,
            error: fnError
        });
    };

   var ajaxPost = function(json, url, onSuccess, onError){
    var data = new FormData();

    for (var key in json){
        data.append(key, json[key]);
    }
    
        $.ajax({
            url: url,
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: onSuccess,
            error: onError});
    }   

    ajaxRequest( 
        '/register', 
        function onSuccess(data){
            if(data)
                {   
                    // console.log(data);
                    // console.log(JSON.parse(data[0].data).easy);
                    // var dataObj = JSON.parse(data);
                    // console.log(dataObj);
                    questionSets = JSON.parse(data[0].data);
                    console.log(questionSets);
                }
            },
        function onError(data){ 
            alert("There was an error retrieving the question file");
            fileFlag=false;
            }
    );

    // important game variables
    var width = window.innerWidth;
    var height = window.innerHeight * 0.99999;

    // var width = 450;
    // var height = 700;

    var interval;
    var intervalTime = 50;  // 50 ms for screen refresh
    var updateCounter;      // counts how many times update function is called
    var ctx;
    var canvas;
    var buffer;
    var fileFlag = true;

    var carX; 
    var carY; 
    var carWidth; 
    var carHeight;

    var score;  

    var questionInterval;
    var questionFlag = false;
    var pauseFlag = false;
    var questionTime = 31000; //31 seconds

    var obstacleHeight; 
    var allObstacles=["obs", "coin"];
    var obsArr;
    var objectSpeed; 
    var timer;

    var allPowers=["gas", "crossout", "timeplus", "invincible"];
    var powerUps=[];
    var storedPowers=[];
    var invincibleFlag = false;
    var invincibleDuration;
    var xClip;
    var animationTime = 400;
    var feedbackDelay = 2000;   //time to delay animation when showing question feedback
    var countdownInt;           // countdown interval
    var qTimeout;               // timeout for question

    var barStart;
    var barWidth;
    var barHeight;
    var barTop;
    var barFrac=100;
    
    var allPoints=[-10, 20];
    var questionPoint = 200;
    var boostPointIncrease = 5;
    var lane1X; 
    var lane2X; 
    var lane3X;
    var difficulty="easy";

    var numRightQuestion;
    var numQuestions;

    var maxNameLength = 25;     // max # of chars to display in high score name

    // images

    var carImage = new Image(); 
    carImage.src = "img/race-assets/car.png";

    var questionBoxImage = new Image();
    questionBoxImage.src = "img/race-assets/question-bg.png";

    var obsImage = new Image(); 
    obsImage.src = "img/race-assets/obstacle-car.png";
    
    var coinImage = new Image(); 
    coinImage.src = "img/race-assets/coin.png";
    
    var gasimg = new Image(); 
    gasimg.src = "img/race-assets/powerup-gas.png";
    
    var crossout = new Image(); 
    crossout.src = "img/race-assets/powerup-eliminate.png";
    
    var timeplus = new Image(); 
    timeplus.src = "img/race-assets/powerup-time.png";
    
    var invincible = new Image(); 
    invincible.src = "img/race-assets/powerup-boost.png";

    var fire = new Image(); 
    fire.src = 'img/race-assets/fire-sprite2.png';

    // sounds

    if (soundOn){
        var bgm = new Audio("sounds/racing-bgm.mp3");
        bgm.loop = true;
        bgm.volume = 0.4;
        bgm.load();

        var carSfx = new Audio("sounds/car-sfx.mp3");
        carSfx.loop = true;
        carSfx.load();

        var coinSfx = new Audio("sounds/coin.mp3");
        var correctSfx = new Audio("sounds/correct.mp3");
        var errorSfx = new Audio("sounds/error.mp3");
        var powerupSfx = new Audio("sounds/powerup.mp3");
        powerupSfx.volume = 0.5;
        var questionSfx = new Audio("sounds/question.mp3");
        var boostSfx = new Audio("sounds/blast.mp3");
        boostSfx.volume = 0.6;
        var crashSfx = new Audio("sounds/crash.mp3");

        var countdownSfx = new Audio("sounds/countdown.mp3");
        var countdownTick = new Audio("sounds/countdown-tick.mp3");
        countdownTick.loop = true;
        var countdownBeep = new Audio("sounds/countdown-beep.mp3");

        var alertSfx = new Audio("sounds/alert.mp3");
        alertSfx.loop = true;
        alertSfx.volume = 0.3;

        var gameoverSfx = new Audio("sounds/gameover.mp3");

        var nonBgmSounds = [carSfx, coinSfx, correctSfx, errorSfx, powerupSfx, 
            questionSfx, boostSfx, crashSfx, countdownSfx, countdownTick, 
            countdownBeep, alertSfx];
    }
    
    function setup(){    
        
        /* General variables */
        timer = 0;
        updateCounter = 0; 
        score = 0;
        
        barFrac=100;
        numRightQuestion=0;
        numQuestions=0;
        
        /* Canvas+DOM variables */
        buffer = document.createElement('canvas');
        
        canvas = document.getElementById('gameCanvas');
        ctx_visible = canvas.getContext('2d');
        ctx_visible.canvas.width = width; 
        ctx_visible.canvas.height = height;
        ctx_visible.clearRect(0,0,width,height);
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        
        ctx = buffer.getContext('2d');
        
        /* Car variables */
        carWidth = 0.1*width; 
        carHeight = 0.2*width;
        carY = height - 2*carHeight;
        carX = width/2 - 0.05 * width;
        xClip = 0;
        
        /* Obstacle Variables */
        obstacleHeight = carHeight/2;
        obstacleWidth = 1.5*carWidth;
        coinHeight = 1.6*carWidth;
        lane1X = width/4-carWidth/2;
        lane2X = width*.47-carWidth/2; 
        lane3X = width*0.70-carWidth/2;
        objectSpeed = 15;
        obsArr = []; 

        /* powerup variables */
        powerUpWidth = 1.5*carWidth;
        powerUpSpawnTime = 50;
        powerUps=[];
        invincibleDuration = 5000;
        
        /*stored Power-ups array */
        storedPowers=[];
        storedPowers.push(new Power("crossout"));
        storedPowers.push(new Power("timeplus"));
        storedPowers.push(new Power("invincible"));

        canvas.addEventListener('touchmove', setupEventListener, false);
        
        window.clearInterval(interval);
        interval = setInterval(update, intervalTime);

        // show game screen
        $("#screen").show();
        // show "GO!"
        $("#startGo").fadeIn(animationTime*2).fadeOut(animationTime);

        // hide curr powerups
        $('#currPowers').hide();
        $('#currBoost').hide();
        $('#currTime').hide();
        $('#currEliminate').hide();
        $('#currTime .num').hide();
        $('#currEliminate .num').hide();

        if (soundOn){
            carSfx.play();
        }

        // setup data tracking
        // var timestamp = new Date();
        // var year = timestamp.getFullYear();
        // var month = timestamp.getMonth() + 1
        // var day = timestamp.getDate();
        // var hours = timestamp.getHours()
        // var minutes = timestamp.getMinutes()
        // if (minutes < 10){
        //     minutes = "0" + minutes;
        // }
        // timestamp = year + "/" + month + "/" + day + " " + hours + ":" + minutes;
        gameData = {
            "gameLength":0,
            "timestamp": new Date(),
            "score":0,
            "name":"",
            "numTotalQuestions":0,
            "numRightQuestions":0,
            "numTimeoutQuestions":0,
            "numObstaclesEaten":0,
            "numObstaclesSpawned":0,
            "numCoinsEaten":0,
            "numCoinsSpawned":0,
            "powersData":{
                "numPowersEaten":0,
                "numPowersSpawned":0,
                "numPowersMissedInitially":0,
                "numGasPowersEaten":0,
                "numGasPowersSpawned":0,
                "numBoostPowersEaten":0,
                "numBoostPowersSpawned":0,
                "numCrossoutPowersEaten":0,
                "numCrossoutPowersSpawned":0,
                "numTimePowersEaten":0,
                "numTimePowersSpawned":0,
            },
            "questionData":[]
        };
        eatenPowerFlag = false;     // used to track how many powers user misses before eating one
    }

    // power ups
    function Power(name) {
        this.name = name;
        this.count = 0;
        this.increment = function() {this.count++;};
        this.decrement = function() {this.count--;};
    }

    // obstacles & coins
    function Obs(name, points, x, y, width, height) {
        this.name = name;
        this.points = points;
        this.x=x;
        this.y=y;
        this.width = width;
        this.height = height;
        this.eaten=false;
    }

    // update location of obstacle & coin
    Obs.prototype.update = function(){
        this.y+=objectSpeed;
        if (invincibleFlag && this.name == 'obs') return;
        else{
            if (this.y <= carY - this.height) return;
            else if(this.x > carX-this.width && this.x < carX+carWidth && this.y+obstacleHeight+25 >= carY && this.y <= carY+carHeight) {
                this.eaten=true;
            }
        }
    }

    // start screen actions
    // ALL ONE TIME EVENT LISTENERS GO HERE
    function startScreen(){
        // hide all other screens
        $("#screen").hide();
        $("#end").hide();
        $("#startGo").hide();
        $("#instructions").hide();
        $("#highscores").hide();

        // play music
        if (soundOn){
            bgm.play();
        }

        if(fileFlag) {
            // pressing start button
            $("#startBtn").bind("click", function(){
                showLevels();
            });
            $(".startBtn").live("touch", function(){
                showLevels();
            });
        }

        // choosing level
        $("#basicBeginnerBtn").bind("click", function(){
            questionData = questionSets.easy;
            // console.log(questionData);
            startGame();
        });
        $("#basicBeginnerBtn").live("touch", function(){
            questionData = questionSets.easy;
            startGame();
        });
        $("#beginnerBtn").bind("click", function(){
            questionData = questionSets.medium;
            startGame();
        });
        $("#beginnerBtn").live("touch", function(){
            questionData = questionSets.medium;
            startGame();
        });
        $("#intermediateBtn").bind("click", function(){
            questionData = questionSets.hard;
            startGame();
        });
        $("#intermediateBtn").live("touch", function(){
            questionData = questionSets.hard;
            startGame();
        });

        // pressing instructions button
        $("#instructionBtn").bind("click", function(){
            showInstructions();
        });
        $("#instructionBtn").live("touch", function(){
            showInstructions();
        });

        // pressing high scores button
        $("#hiScoreBtn").bind("click", function(){
            showHighscores();
        });
        $("#hiScoreBtn").live("touch", function(){
            showHighscores();
        });

        // PAUSE BUTTON & SCREEN EVENT LISTENER
        $("#pauseBtn").bind("click",function(){
            pauseGame();
        });

        $("#resumeBtn").bind("click",function(){
            resumeGame(1000);   // resume game but add 1 second of delay
        })

        $("#endGameBtn").bind("click",function(){
            resumeGame(animationTime);      // resume game with normal delay
            endGame();
        })
        
        //INSTRUCTION SCREEN EVENT LISTENERS:

        // nav buttons
        $("#instructions-nav .back").bind("click", function(){
            hideInstructions();
        });
        $("#instructions-nav .back").live("touch", function(){
            hideInstructions();
        });

        $("#instructions-nav .right").bind("click", function(){
            instructionsPg2();
        });
        $("#instructions-nav .right").live("touch", function(){
            instructionsPg2();
        });

        $("#instructions-nav .left").bind("click", function(){
            instructionsPg1();
        });

        $("#instructions-nav .left").live("touch", function(){
            instructionsPg1();
        });

        // HIGH SCORE PAGE EVENT LISTENERS: 

        // back button
        $("#highscores .back").bind("click", function(){
            hideHighscores();
        });
        $("#highscores .back").live("touch", function(){
            hideHighscores();
        });


        // END SCREEN EVENT LISTENERS: 

        // send name button
        $("#send").bind("click", function(){
            if (trackDataFlag){
                gameData.name = $("#name").val();
                console.log(gameData);
            }
            sendScore($("#name").val(),numRightQuestion,numQuestions,score);
            $("#entername").fadeOut(animationTime); 
            $("#againBtn").fadeIn(animationTime);
            $("#homeBtn").fadeIn(animationTime);
        });
        
        // go back home
        $("#homeBtn").bind("click", function(){
            goHome();
        });
        $("#homeBtn").live("touch", function(){
            goHome();
        });

        // bind action to race again button
        $("#againBtn").bind("click", function(){setup(); $("#end").slideUp();});
        $("#againBtn").live("touch", function(){setup(); $("#end").slideUp();});    

    }

    function showLevels(){
        $("#chooseLevelScreen").show();
        $("#start").slideUp(animationTime);  
    }

    function startGame(){
        $("#screen").show();
        $("#chooseLevelScreen").slideUp(animationTime); 
        setup();
    }

    // show instructions screen from home screen
    function showInstructions(){
        $("#instructions").slideDown(animationTime);
        $("#instructions-powers").hide();
        $("#instructions-howto").hide();
        $("#instructions-howto").fadeIn(animationTime);
        $("#instructions-nav").removeClass("page2");
        $("#instructions-nav").addClass("page1");
        $("#instructions-nav").show();
    }

    // switching to instruction page2
    function instructionsPg2(){
        $("#instructions-howto").fadeOut(animationTime);
        $("#instructions-powers").fadeIn(animationTime);

        $("#instructions-nav").removeClass("page1");
        $("#instructions-nav").addClass("page2");
    }

    // switching to instruction page1
    function instructionsPg1(){
        $("#instructions-powers").fadeOut(animationTime);
        $("#instructions-howto").fadeIn(animationTime);

        $("#instructions-nav").removeClass("page2");
        $("#instructions-nav").addClass("page1");
    }

    // hide instruction
    function hideInstructions(){
        $("#instructions").slideUp(animationTime);
    }

    // show instructions screen from home screen
    function showHighscores(){
        $("#highscoresList").show();
        $("#highscores").slideDown(animationTime);
        $("#highscoresList").html("");

        // get top scores and add to list
        $.ajax({
          url: "/getScores",
          context: document.body,
          success: function displayScores (list) {
              if (list.length === 0){
                $("#highscoresList").append("<div class='none'>No high scores yet.</div>");
              }
              else{
                for (var i=0; i<list.length; i++){
                    // truncate name when it's too long
                    var playerName = list[i].name;
                    if (playerName.length > maxNameLength){
                        playerName = playerName.substring(0, maxNameLength-4) + "...";
                    }
                    $("#highscoresList").append("<div class='line'><div class='name'>"+playerName+"</div><div class='score'>"+list[i].score+"</div></div>");
                }
              }
          },
          error: function showError (err) {
              alert("There was an error retreiving high scores");
              //console.log(err);
          }
        });
    }

    // hide high scores screen
    function hideHighscores(){
        $("#highscores").slideUp(animationTime);
    }

    // show start screen
    startScreen();

    function setupEventListener(event){
        event.preventDefault();   
        for (var i = 0; i < event.touches.length; i++) {
            var touch = event.touches[i];
            carX = touch.pageX;
            if (carX <= width/5) carX = width/5;
            if (carX >= width-width/3.6) carX = width - width/3.6;              
        }
    }

    // update canvas
    function update(){
        // track how long the game is (in seconds)
        updateCounter++;
        if (trackDataFlag){
            if (updateCounter%(1000/intervalTime) === 0){
                // console.log(gameData.gameLen)
                gameData.gameLength++;
            }
        }

        ctx.clearRect(0,0,width,height);
        draw(); 
        if (questionFlag) drawQuestionBox();
        else if (pauseFlag) {}
        else {
            if (invincibleFlag) drawFlames();
            updateBar();
            updateObstacles();
            updatePowerUps();
            updateScore(); 
        }
        ctx_visible.clearRect(0, 0, width, height);
        ctx_visible.drawImage(buffer,0,0);
    }
    
    function draw() {
		drawScore();
        drawCar();
        drawObjects();
	}

    // draw flames behind car in boost mode
    function drawFlames(){
        ctx.drawImage(fire, xClip, 0, 200, 200, carX - carWidth, carY+carHeight*0.9, carWidth*3, carHeight);
        xClip = (xClip + 200)%800; 
    }

    // Update Score
    function updateScore(){
        score++;
        if (invincibleFlag){
            score+=boostPointIncrease;
        }
    }

     // Draw score
    function drawScore(){
        $('#score').text(score);
    }

    // update gas meter
    function updateBar(){
        barStart = $("#gasIcon").width()/2-5;
        if(barFrac>0 && !invincibleFlag) barFrac-=.1;
        if(barFrac <= 0) endGame();
        if(barFrac > 100) barFrac=100;
        barWidth = (barFrac/100)*(.93*($("#gasBar").width()-barStart+12));

        // change color when gas is low, add warning sound when super low
        if (barFrac<50){
            $("#innerMeter").removeClass("normal");
            $("#innerMeter").addClass("warning");
        }
        else{
            $("#innerMeter").removeClass("warning");
            $("#innerMeter").addClass("normal");
        }
        if (barFrac<25){
            $("#innerMeter").removeClass("normal");
            $("#innerMeter").removeClass("warning");
            $("#innerMeter").addClass("danger");
            if (soundOn){
                alertSfx.play();
            }
        }
        else{
            $("#innerMeter").removeClass("danger");
            if (soundOn){
                alertSfx.pause();
            }
        }

        // keep gas meter inside of bar image
        barHeight = $("#gasBar").height()*(3/5);
        barTop = $("#gasBar").height()*(1/5)+15;
        
        $("#innerMeter").css("left", 22+barStart + "px");
        $("#innerMeter").css("width", barWidth);
        $("#innerMeter").css("height", barHeight);
        $("#innerMeter").css("top", barTop);
    }

    // pause game
    function pauseGame(){
        pauseFlag = true;
        canvas.removeEventListener('touchmove', setupEventListener, false);

        // stop road from moving
        freezeRoad();

        $("#pauseScreen").fadeIn(animationTime);
    }

    // resume game after pause
    function resumeGame(delay){
        $("#pauseScreen").fadeOut(delay);

        var resumeDelayTimeout = window.setTimeout(function(){
            pauseFlag = false;
            canvas.addEventListener('touchmove', setupEventListener, false);

            // resume moving road
            unfreezeRoad();
        }, delay);
        
    }
    
    function freezeRoad(){
        $("#one").addClass("stop");
        $("#two").addClass("stop");
    }

    function unfreezeRoad(){
        $("#one").removeClass("stop");
        $("#two").removeClass("stop");
    }

    // when you lose
    function endGame(){
        // when tracking data, update data
        if (trackDataFlag){
            gameData.score = score;
            gameData.numTotalQuestions = numQuestions;
            gameData.numRightQuestions = numRightQuestion;

            sendGameData();
        }

        if (soundOn){
            // stop all non-bgm music
            for (var i=0; i<nonBgmSounds.length; i++){
                nonBgmSounds[i].loop = false;
                nonBgmSounds[i].pause();
            }
            carSfx.loop = true;
            countdownTick.loop = true;
            gameoverSfx.play(); // play "game over"
        }

        // stop updating canvas
        window.clearInterval(interval);

        $("#end").slideDown(animationTime);
        $("#screen").fadeOut(animationTime);

        // hide "play again" initially and show enter name
        // TEMP: show play again button right away
        // $("#againBtn").hide();
        // $("#homeBtn").hide();

        // show end screen div
        $("#end").slideDown(animationTime);

        // show score
        $("#endScore").html("Score: "+score);
        if (numQuestions == 1){
            $("#questionScore").html(numRightQuestion + " / " + numQuestions + " question correct");
        }
        else{
            $("#questionScore").html(numRightQuestion + " / " + numQuestions + " questions correct");
        }

        // TEMP: don't ask for name
        $("#entername").hide();

    }

    // go back to home page from end page
    function goHome(){
        $("#start").show();
        $("#end").slideUp(animationTime);
    }
    
    // send score to server
    function sendScore(name, numRight, numTotal,score) {
        ajaxPost(
        {
            name: name,
            numRight: numRight, 
            numTotal: numTotal,
            score:score
        },
        '/postScore',
        function onSuccess(data){
        },
        function onError(data){
        });
    }

    // send game statistics to server
    function sendGameData() {
        // semicolon-delimited string of jsons because mongo doesn't like arrays
        var stringifiedQuestionData = "";
        for (var i=0; i<gameData.questionData.length; i++){
            stringifiedQuestionData = stringifiedQuestionData + JSON.stringify(gameData.questionData[i]) + ";";
        }
        console.log(stringifiedQuestionData);

        ajaxPost(
        {
            gameLength: gameData.gameLength, 
            name: gameData.name || "[anonymous]", 
            numCoinsEaten: gameData.numCoinsEaten, 
            numCoinsSpawned: gameData.numCoinsSpawned, 
            numObstaclesEaten: gameData.numObstaclesEaten, 
            numObstaclesSpawned: gameData.numObstaclesSpawned, 
            numRightQuestions: gameData.numRightQuestions, 
            numTimeoutQuestions: gameData.numTimeoutQuestions, 
            numTotalQuestions: gameData.numTotalQuestions, 
            numBoostPowersEaten: gameData.powersData.numBoostPowersEaten, 
            numBoostPowersSpawned: gameData.powersData.numBoostPowersSpawned, 
            numCrossoutPowersEaten: gameData.powersData.numCrossoutPowersEaten, 
            numCrossoutPowersSpawned: gameData.powersData.numCrossoutPowersSpawned, 
            numGasPowersEaten: gameData.powersData.numGasPowersEaten,
            numGasPowersSpawned: gameData.powersData.numPowersSpawned, 
            numPowersEaten: gameData.powersData.numPowersEaten, 
            numPowersMissedInitially: gameData.powersData.numPowersMissedInitially, 
            numPowersSpawned: gameData.powersData.numPowersSpawned, 
            numTimePowersEaten: gameData.powersData.numTimePowersEaten, 
            numTimePowersSpawned: gameData.powersData.numTimePowersSpawned,
            score: gameData.score, 
            timestamp: new Date(),
            questionData: stringifiedQuestionData
        },
        '/postGameData',
        function onSuccess(data){
        },
        function onError(data){
        });
    }

    // update player car
    function drawCar(){
        ctx.drawImage(carImage, carX, carY, carWidth, carHeight);
    }  

   
    // draw question
    function drawQuestionBox(){
    if($("#ques").length == 0) {
        canvas.removeEventListener('touchmove', setupEventListener, false);

        // stop road from moving
        $("#one").addClass("stop");
        $("#two").addClass("stop");

        // track data
        if (trackDataFlag){
            gameData.questionData.push({
                "answerTime":0,
                "correctAnswer":false,
                "answerPosition":0
            });
        }
        
        // randomly gets question
        var c = Math.round((questionData.length-1)*Math.random());
        var question = questionData[c];
        var choiceArr =[];
        var answerID;
        var ansIndex;
        
        if (randomChoiceFlag) {
        //scramble the answers
			for(var i = 0; i < 4; i++) {
				var index1 = Math.floor(Math.random() * question.choices.length);
				var index2 = Math.floor(Math.random() * question.choices.length);
				var temp = question.choices[index1];
				question.choices[index1] = question.choices[index2];
				question.choices[index2] = temp;
			}
		}
		
        for(var i = 0; i < question.choices.length; i++) {
			if(question.choices[i].toString()===question.a.toString()){
				ansIndex = i;
                var idNum = i+1;
                answerID = "#choice"+idNum;
            }
		}
		
		//make sure answer is one of the first four choices
        if (ansIndex > 3) {
			var prevAnsIndex = ansIndex;
			ansIndex = Math.floor(Math.random() * 4);
			var idNum = ansIndex+1;
            answerID = "#choice"+idNum;
			question.choices[prevAnsIndex] = question.choices[ansIndex];
			question.choices[ansIndex] = question.a;
		}
		
        // get choices for question
        for(var i = 0; i < 4; i++) {
            if(question.choices[i] != undefined) {		
				choiceArr[i] = question.choices[i];
			}
            else choiceArr[i] = "";
        }

        

        // fade out background
        $("#backgroundFader").fadeIn();

        // add question div
        var $qTable = $('<div id="ques" style="display:none"><table id="popQ"><tr id="Q"><td colspan=2>'+question.q+'</td></tr><tr><td id="choice1">'+choiceArr[0]+'</td><td id="choice2">'+choiceArr[1]+'</td></tr><tr><td id="choice3">'+choiceArr[2]+'</td><td id="choice4">'+choiceArr[3]+'</td></tr></table></div>')
        var $countDown = $('<div id="countdown"><div id="countdown-inner"></div></div>');
        $qTable.append($countDown);

        var $powers = $('<div id="qPowers"></div>');

        // add active power-ups, if any, for this question
        var crossout = 0;
        var timeplus = 1;
        var hasPowers = false;
        if (storedPowers[crossout].count>0){
            hasPowers = true;
            $powers.append('<div class="power eliminate"></div>');
        }
        if (storedPowers[timeplus].count>0){
            hasPowers = true;
            $powers.append('<div class="power time"></div>');
        }
        if (hasPowers === true){
            $qTable.append($powers);
        }

        // show question div
        $("body").append($qTable);
        $qTable.fadeIn(animationTime);

        // show timer countdown
        var cw = $('#countdown').width();
        $('#countdown').css({
            'height': cw + 'px'
        });

        // bind actions when choosing answer
        $("#choice1").on("click", function(){
            checkAns(question.a,choiceArr[0],"#choice1",answerID);
        });
        $("#choice1").on('touchstart', function(){
            checkAns(question.a,choiceArr[0],"#choice1",answerID);
        });
        $("#choice2").on("click", function(){
            checkAns(question.a,choiceArr[1],"#choice2",answerID);
        });
        $("#choice2").on('touchstart', function(){
            checkAns(question.a,choiceArr[1],"#choice2",answerID);
        });
        $("#choice3").on("click", function(){
            checkAns(question.a,choiceArr[2],"#choice3",answerID);
        });
        $("#choice3").on('touchstart', function(){
            checkAns(question.a,choiceArr[2],"#choice3",answerID);
        });
        $("#choice4").on("click", function(){
            checkAns(question.a,choiceArr[3],"#choice4",answerID);
        });
        $("#choice4").on('touchstart', function(){
            checkAns(question.a,choiceArr[3],"#choice4",answerID);
        });
        
        // disable clicks for empty answer
        for (var i = question.choices.length; i < choiceArr.length; i++) {
            switch (i) {
                case 2:
                    $("#choice3").off();
                    break;
                case 3:
                    $("#choice4").off();
                    break;
                default:
                    break;
            }
        }
        
        // decreasing used power-ups
        if (storedPowers[0].count != 0) {
            storedPowers[0].decrement();
            updateCurrPowers();
            var del = Math.floor(Math.random() * question.choices.length);
            while (del == ansIndex) {
                var del = Math.floor(Math.random() * question.choices.length);
            }
            del++;
            var removeChoice = "#choice" + del;
            $(removeChoice).addClass("crossed");
            $(removeChoice).off();
            }

            // get amount of countdown (in case of timeplus powerup)
            var timeLimit = questionTime;
            if (storedPowers[1].count > 0) {
                storedPowers[1].decrement();
                updateCurrPowers();
                timeLimit += 10000;
            }

            // set & show countdown
            var sec=timeLimit/1000-1; // 1 second less to count down to 
            $('#countdown-inner').html(sec);

            var countdownCounter = sec;

            // update countdown every second
            countdownInt = window.setInterval(function(){
                countdownCounter--;
                updateCountdown(countdownCounter)
            },1000);

            // remove question if not answered in time
            qTimeout = window.setTimeout(stopAsking, timeLimit);
        }
    }

    // update countdown
    function updateCountdown(sec){
        // set number
        $('#countdown-inner').html(sec);

        // track data
        if (trackDataFlag){
            var thisQuestion = gameData.questionData[gameData.questionData.length-1];
            thisQuestion.answerTime++;
        }

        // play countdown sound
        if (soundOn){
            if (sec===10){
                countdownTick.play();
            }
            if (sec===0){
                countdownTick.pause();
                countdownBeep.play();
            }
        }

        // make timer blink when time is low
        if (sec<=10){
            $('#countdown-inner').addClass('alert');

            var timeLimit = questionTime;
            
            if (storedPowers[1].count > 0) {
                storedPowers[1].decrement();
                updateCurrPowers();
                timeLimit += 10000;
            }
        }
        if (sec === 0){
            if (trackDataFlag){
                // add timeout data to tracking
                gameData.numTimeoutQuestions++;
            }
        }
    }

    
    // remove question
    function stopAsking(){
        // fade in background
        $("#backgroundFader").fadeOut();

        numQuestions++; // keep track of number of questions

        // fade out question screen if question is up
        if($("#ques").length > 0) {
            questionFlag=false;
            $("#ques").fadeOut(animationTime, function(){$("#ques").remove()});
            canvas.addEventListener('touchmove', setupEventListener, false);
        }

        // resume moving road
        $("#one").removeClass("stop");
        $("#two").removeClass("stop");

        // clear counters
        window.clearTimeout(qTimeout);
        window.clearInterval(countdownInt);

        // make countdown not blink anymore
        $('#countdown-inner').removeClass('alert');
    }
    
    // increase gas meter when answer correctly
    function meterUp(){
        var animateInt = window.setInterval(function(){barFrac+=2; updateBar();},feedbackDelay/30);
        window.setTimeout(function(){window.clearInterval(animateInt)},feedbackDelay/3);
    }
    
    // check if answer is correct after answering
    function checkAns(right, choice, choiceTd, rightTd) {
        if (trackDataFlag){
            var thisQuestion = gameData.questionData[gameData.questionData.length-1];
            thisQuestion.answerPosition = choiceTd.charAt(choiceTd.length-1);
        }

        // clear counters
        window.clearTimeout(qTimeout);
        window.clearInterval(countdownInt);

        // stop countdown sound
        if (soundOn){
            countdownTick.pause();
        }

        // if answer is right...
        if(right===choice){
            if (trackDataFlag){
                var thisQuestion = gameData.questionData[gameData.questionData.length-1];
                thisQuestion.correctAnswer = true;
            }

            score+=questionPoint;       // add score
            $("#score").html(score);    // show score
            if (soundOn){               // play sound
                correctSfx.play();
            }
            numRightQuestion++;         // keep track of right questions
            meterUp();                  // increase gas

            // show correct feedback
            var $feedback = $("<div class='qFeedback correct' style='display:none'></div>");
            $(rightTd).append($feedback);
            $feedback.fadeIn(animationTime);
        }
        else{
            // play error sound
            if (soundOn){
                errorSfx.play();
            }

            // show feedback for wrong & right answers
            var $choiceFeedback = $("<div class='qFeedback wrong-choice' style='display:none'></div>");
            var $rightFeedback = $("<div class='qFeedback wrong-right' style='display:none'></div>");
            $(rightTd).append($rightFeedback);  
            $(choiceTd).append($choiceFeedback);
            $choiceFeedback.fadeIn(animationTime);
            $rightFeedback.fadeIn(animationTime);
        }
        
        // disable answering again after one has been clicked
        $("#choice1").off();
        $("#choice2").off();
        $("#choice3").off();
        $("#choice4").off();
        
        // remove question after a few seconds
        window.setTimeout(stopAsking, feedbackDelay);
    }

    // randomly choose which lane stuff drops in
    function chooseLane() {
        var rand = Math.floor(Math.random()*3);
            if (rand == 0)
                x = lane1X; 
            else if (rand == 1)
                x = lane2X; 
            else if (rand == 2)
                x = lane3X;
         return x;
    }

    // draw obstacles & coins on road
    function updateObstacles(){
        timer++;

        // draw an obstacle every 27*drawInterval ms
        if (timer%27 == 0) {
            var index = Math.floor(Math.random()*(allObstacles.length));
            var x = chooseLane();
            if(allObstacles[index]=="coin") {
                if (trackDataFlag){
                    gameData.numCoinsSpawned++;
                }
                obsArr.push(new Obs(allObstacles[index], allPoints[index], x, -coinHeight, powerUpWidth, coinHeight));
            }
            else{
                if (trackDataFlag){
                    gameData.numObstaclesSpawned++;
                }
                obsArr.push(new Obs(allObstacles[index], allPoints[index], x, -obstacleHeight, powerUpWidth, carHeight));
            }
        }   

        // update objects and detect collisions
        for(var i = 0; i < obsArr.length; i++) {
            obsArr[i].update(carX, carY);   // move object
            // if object eaten
            if(obsArr[i].eaten) {
                // add points and play sound for positive objects (i.e. coins)
                if(obsArr[i].points >= 0) {
                    score+=obsArr[i].points;
                    if (soundOn){
                        coinSfx.play();
                    }
                    if (trackDataFlag){
                        gameData.numCoinsEaten++;
                    }
                }
                // crashing negative objects (i.e. cars)
                else {
                    if (trackDataFlag){
                        gameData.numObstaclesEaten++;
                    }
                    barFrac+=obsArr[i].points;  // decrease gas

                    // show crash effect
                    var $crashFx = $("<div id='explode'></div>");
                    $("body").append($crashFx);
                    $crashFx.css("display","none");
                    $crashFx.css("margin-top",-(height-obsArr[i].y)-25);
                    $crashFx.css("margin-left",obsArr[i].x-25);
                    $crashFx.fadeIn(animationTime/2).fadeOut(animationTime/2);
                    window.setTimeout(function(){
                        $crashFx.remove();
                    },1000);

                    // play crash sound
                    if (soundOn){
                        crashSfx.play();
                    }
                }
                obsArr.splice(i,1); //remove object
            }
            // remove objects off screen
            else if(obsArr[i].y >= height) {
                obsArr.splice(i,1);
            }
        }
    }
    
    // update power up information
    function updatePowerUps() {
        // draw new one every 50*drawInterval ms
        if (timer%50 == 0) {
            var index = Math.floor(Math.random()*(allPowers.length*2));
            if (index>=allPowers.length){
                index = 0;
            }
            var x = chooseLane();
            powerUps.push(new Obs(allPowers[index], 0, x, -obstacleHeight, powerUpWidth, powerUpWidth));
            
            // track data
            if (trackDataFlag){
                gameData.powersData.numPowersSpawned++;
                if (powerUps[powerUps.length-1].name == "gas") {
                    gameData.powersData.numGasPowersSpawned++;
                }
                else if (powerUps[powerUps.length-1].name == "invincible") {
                    gameData.powersData.numBoostPowersSpawned++;
                }
                else if (powerUps[powerUps.length-1].name == "crossout") {
                    gameData.powersData.numCrossoutPowersSpawned++;
                }
                else if (powerUps[powerUps.length-1].name == "timeplus") {
                    gameData.powersData.numTimePowersSpawned++;
                }
            }

        }
        // update existing ones
        for(var i = 0; i < powerUps.length; i++) {
            powerUps[i].update(carX, carY);     // update location
            // detect collision
            if (powerUps[i].eaten) {
                if (eatenPowerFlag === false){eatenPowerFlag = true};
                if (trackDataFlag){
                    gameData.powersData.numPowersEaten++;
                }
                // when eating gas powerup, play sound and show question
                if (powerUps[i].name == "gas") {
                    if (trackDataFlag){
                        gameData.powersData.numGasPowersEaten++;
                    }
                    if (soundOn){
                        questionSfx.play();
                    }
                    questionFlag = true;
                }
                // when eating boost powerup
                else if (powerUps[i].name == "invincible") {
                    if (trackDataFlag){
                        gameData.powersData.numBoostPowersEaten++;
                    }
                    if (soundOn){           // play sound
                        boostSfx.play();
                    }
                    invincibleFlag = true;  // set flag
                    objectSpeed = 40;       // change speed of objects on road
                    storedPowers[2].increment();            // add to active power
                    updateCurrPowers();                     // show
                    setTimeout(function() {                 // set duration
                        objectSpeed = 10;
                        storedPowers[2].decrement();
                        updateCurrPowers();
                        invincibleFlag = false;
                    }, invincibleDuration);
                }
                // other powerups
                else {
                    if (soundOn){       //play sound
                        powerupSfx.play();
                    }
                    if (powerUps[i].name == "crossout") {
                        if (trackDataFlag){
                            gameData.powersData.numCrossoutPowersEaten++;
                        }
                        storedPowers[0].increment();
                    }
                    if (powerUps[i].name == "timeplus") {
                        if (trackDataFlag){
                            gameData.powersData.numTimePowersEaten++;
                        }
                        storedPowers[1].increment();
                    }
                    updateCurrPowers();
                }
                powerUps.splice(i, 1);
            }
            // remove powerups off screen
            else if(powerUps[i].y >= height) {
                powerUps.splice(i,1);

                // track how many powers user misses before eating one
                if (trackDataFlag){
                    if (eatenPowerFlag === false){
                        gameData.powersData.numPowersMissedInitially++;
                    }
                }
            }
        }
    }
    
    //draw obstacles and power ups
    function drawObjects() {
		for (var i = 0; i < powerUps.length; i++) {
			if(powerUps[i].name == "gas")
				ctx.drawImage(gasimg, powerUps[i].x, powerUps[i].y, powerUpWidth, powerUpWidth);
			if(powerUps[i].name == "crossout") 
				ctx.drawImage(crossout, powerUps[i].x, powerUps[i].y, powerUpWidth, powerUpWidth);       
			if(powerUps[i].name == "timeplus") 
				ctx.drawImage(timeplus, powerUps[i].x, powerUps[i].y, powerUpWidth, powerUpWidth);
			if(powerUps[i].name == "invincible") 
				ctx.drawImage(invincible, powerUps[i].x, powerUps[i].y, powerUpWidth, powerUpWidth);
        }
        for (var i = 0; i < obsArr.length; i++) {
			if(obsArr[i].name == "obs") {
                if (invincibleFlag){ctx.globalAlpha = 0.2;}
				ctx.drawImage(obsImage, obsArr[i].x, obsArr[i].y, powerUpWidth, carHeight); 
                if (invincibleFlag){ctx.globalAlpha = 1;}
            }
            // draw coin
            if(obsArr[i].name == "coin"){
                ctx.drawImage(coinImage, obsArr[i].x, obsArr[i].y, powerUpWidth, coinHeight);
    		}
    	}
    }

    // update display of current active power-ups
    function updateCurrPowers(){
        var crossout = 0;
        var timeplus = 1;
        var invincible = 2;

        // count each
        var numTime = storedPowers[timeplus].count;
        var numCrossOut = storedPowers[crossout].count;
        var numInvincible = storedPowers[invincible].count;

        // show current powers div if any exists
        if (numTime+numCrossOut+numInvincible>0){
            $('#currPowers').show(animationTime);
        }
        else{
            $('#currPowers').hide(animationTime);
        }

        // show invincible icon if any exists
        if (numInvincible > 0){
            $('#currBoost').show(animationTime);
        }
        else {
            $('#currBoost').hide(animationTime);
        }

        // show time icon if any exists
        if (numTime > 0){
            $('#currTime').show(animationTime);
            if (numTime>1){
                $('#currTime .num').html("x"+numTime);
                $('#currTime .num').show(animationTime);
            }
            else{
                $('#currTime .num').hide(animationTime);
            }
        }
        else{
            $('#currTime').hide(animationTime);
        }

        // show eliminate if any exists
        if (numCrossOut > 0){
            $('#currEliminate').show(animationTime);
            if (numCrossOut>1){
                $('#currEliminate .num').html("x"+numCrossOut);
                $('#currEliminate .num').show(animationTime);
            }
            else{
                $('#currEliminate .num').hide(animationTime);
            }
        }
        else{
            $('#currEliminate').hide(animationTime);
        }
    }
}
