window.onload = execute();

function execute(){

	// testing switches for sound and random answers
    var randomChoiceFlag = true;    // randomize answers in question
    var trackDataFlag = true;       // track all user data for testing purposes
    var gameData = {};              // array to store tracking data
    var eatenPowerFlag;             // false when user hasn't eaten any powers yet
    var questionSets;
    
    // important game variables
    var width = window.innerWidth;
    var height = window.innerHeight * 0.99999;

    var interval;
    var intervalTime = 50;  // 50 ms for screen refresh
    var updateCounter;      // counts how many times update function is called
    var ctx;
    var canvas;
    var fileFlag = true;

    var carX; 
    var carY; 
    var carWidth; 
    var carHeight;

    var score;  

	var level;
    var questionInterval;
    var questionFlag = false;
    var pauseFlag = false;
    var questionTime = 31000; //31 seconds

    var obstacleHeight; 
    var allObstacles=["obs", "coin"];
    var obsArr;
    var objectSpeed; 
    var obsCarTransparency;
    var timer;

    var allPowers=["gas", "crossout", "timeplus", "invincible"];
    var powerUps=[];
    var storedPowers=[];
    var invincibleFlag = false;
    var invincibleDuration;
    var flameTransparency;
    var xClip;
    var animationTime = 400;
    var feedbackDelay = 2000;   //time to delay animation when showing question feedback
    var countdownInt;           // countdown interval
    var qTimeout;               // timeout for question
    
    var allPoints=[-10, 20];
    var questionPoint = 200;
    var boostPointIncrease = 5;
    var lane1X; 
    var lane2X; 
    var lane3X;

    var numRightQuestion;
    var numQuestions;
    var totalNumQuestions;

    var init=false;

	var instructions = new InstructionPage(animationTime);
	
	var gasMeter;

    var maxNameLength = 25;     // max # of chars to display in high score name
    
    //jquery caching
    var $screen = $('#screen');
	
	/*********************************
	 * Game initialization functions *
	 * *******************************/ 
    // start screen actions
    // ALL ONE TIME EVENT LISTENERS GO HERE
    function startScreen(){
        var teachers = [];
        // hide all other screens
        $("#screen").hide();
        $("#end").hide();
        $("#startGo").hide();
        $("#instructions").hide();
        $("#highscores").hide();
        $("#questionsCompleteScreen").hide();
        $("#chooseLevelScreen").show();
        $(".levelBtn").remove();

        ajaxRequest("/getTeachers", function(data){
            // console.log(data);
            for(var i = 0; i < data.length; i++){
                // console.log("t: "+data[i].username);
                $("#chooseLevelButtons").append('<div id="'+data[i].username+'" class="levelBtn"><h2>'+data[i].username+'</h2></div>');
                $("#"+data[i].username).bind("click", function(){
                    getContent(this.id);
                });
            }
        }, 
        function(err){});

        for(var i = 0; i < teachers.length; i++) {
            // console.log("t: "+teachers[i]);
            $("#chooseLevelScreen").append('<div id="'+teachers[i]+'" class="levelBtn"><h2>+'+teachers[i]+'+</h2></div>');

        }

        if(init==false) {
            init=true;

        // pressing start button
        $("#startBtn").bind("click", function(){
            showLevels();
        });
        $(".startBtn").live("touch", function(){
            showLevels();
        });

        // pressing instructions button
        $("#instructionBtn").bind("click", function(){
            instructions.show();
        });
        $("#instructionBtn").live("touch", function(){
            instructions.show();
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
            pauseGame("pause");
        });

        $("#resumeBtn").bind("click",function(){
            resumeGame(1000, "pause");   // resume game but add 1 second of delay
        })

        $("#endGameBtn").bind("click",function(){
            resumeGame(animationTime, "pause");      // resume game with normal delay
            endGame();
        })
        
        //INSTRUCTION SCREEN EVENT LISTENERS:

        // nav buttons
        $("#instructions-nav .back").bind("click", function(){
            instructions.hide();
        });
        $("#instructions-nav .back").live("touch", function(){
            instructions.hide();
        });

        $("#instructions-nav .right").bind("click", function(){
            instructions.page2();
        });
        $("#instructions-nav .right").live("touch", function(){
            instructions.page2();
        });

        $("#instructions-nav .left").bind("click", function(){
            instructions.page1();
        });

        $("#instructions-nav .left").live("touch", function(){
            instructions.page1();
        });

        // HIGH SCORE PAGE EVENT LISTENERS: 

        // back button
        $("#highscores .back").bind("click", function(){
            hideHighscores();
        });
        $("#highscores .back").live("touch", function(){
            hideHighscores();
        });

        $("#backToTeachers").bind("click", function(){
            $("#backToTeachers").css("display","none");
            startScreen();
        });

        $("#backToTeachers").live("touch", function(){
            $("#backToTeachers").css("display","none");
            startScreen();
        });

        // END SCREEN EVENT LISTENERS: 

        // send name button
        $("#send").bind("click", function(){
            sendScore($("#name").val(),score);
            $("#entername").fadeOut(animationTime); 
            $("#againBtn").fadeIn(animationTime);
            $("#homeBtn").fadeIn(animationTime);
        });
        
        // go back home
        $("#homeBtn").bind("click", function(){
            goHome();
            startScreen();
        });
        $("#homeBtn").live("touch", function(){
            goHome();
            startScreen();
        });

        // bind action to race again button
        $("#againBtn").bind("click", function(){
            startScreen(); 
            $("#end").slideUp();
        });
        $("#againBtn").live("touch", function(){
            startScreen(); 
            $("#end").slideUp();
        });  
        }  

    }

	function getContent(username) {
    $(".levelBtn").remove();
    ajaxPost({tid:username}, "/getContent", function(data){
            // console.log(data);
            data=data.content_sets;
            $("#choosePageTitle").removeClass("chooseTeacherTitle").addClass("chooseContentSetTitle");
            for(var i = 0; i < data.length; i++){
                // console.log("c: "+data[i].name);
                $("#chooseLevelButtons").append('<div id="'+i+'" class="levelBtn"><h2>'+data[i].name+'</h2></div>');
                $("#"+i).bind("click", function(){
                    // console.log("clicked");
                  questionData = data[(parseInt(this.id))].questions;
                  // console.log(questionData);
                  $(".levelBtn").remove();
                  $("#backToTeachers").css("display","none");
                  startGame();
                });
            }
            $("#backToTeachers").css("display","inline");
        }, 
        function(err){});
	}  

	function startGame(){
        $("#screen").show();
        // $("#sendScoreSuccess").hide();
        $("#chooseLevelScreen").slideUp(animationTime); 
        setup();
    }
    
    function setup(){    
        /* General variables */
        timer = 0;
        updateCounter = 0; 
        score = 0;
        
        numRightQuestion=0;
        numQuestions=0;

        pauseFlag=false;

		numTotalQuestions = questionData.length;

        /* Gas Meter */  
        gasMeter = new GasMeter(feedbackDelay, numTotalQuestions);

        /* Canvas+DOM variables */
        
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        ctx.canvas.width = width; 
        ctx.canvas.height = height;
        ctx.clearRect(0,0,width,height);
        
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
        flameTransparency = 1;
        obsCarTransparency = 1;
        
        /*stored Power-ups array */
        storedPowers=[];
        storedPowers.push(new Power("crossout"));
        storedPowers.push(new Power("timeplus"));
        storedPowers.push(new Power("invincible"));

        canvas.addEventListener('touchmove', setupEventListener, false);
        
        if(interval != undefined)
          window.clearInterval(interval);
        interval = setInterval(update, intervalTime);

        // show game screen
        $("#screen").show();
        // show "GO!"
        $("#startGo").fadeIn(animationTime*2).fadeOut(animationTime);
        $("#sendScoreSuccess").hide();

        // hide curr powerups
        $('#currPowers').hide();
        $('#currBoost').hide();
        $('#currTime').hide();
        $('#currEliminate').hide();
        $('#currTime .num').hide();
        $('#currEliminate .num').hide();

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

	function setupEventListener(event){
        event.preventDefault();   
        for (var i = 0; i < event.touches.length; i++) {
            var touch = event.touches[i];
            carX = touch.pageX;
            if (carX <= width/5) carX = width/5;
            if (carX >= width-width/3.6) carX = width - width/3.6;              
        }
    }
    
    // show start screen
    startScreen();
    
    /**********************
     * Gameplay functions *
	 *********************/

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

	/*************************
	 * Game update functions *
	 * **********************/
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
        if (questionFlag) drawQuestionBox();
        else if (pauseFlag) {}
        else {
            if (!invincibleFlag) {
				var gameOver = gasMeter.updateBar(invincibleFlag);
				if (gameOver) endGame();
			}
            updateObstacles();
            updatePowerUps();
            updateScore(); 
        }
        draw(); 
        ctx.drawImage(canvas,0,0);
    }
    
    // Update Score
    function updateScore(){
        score++;
        if (invincibleFlag){
            score+=boostPointIncrease;
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
                loopSound(countdownTick);
            }
            if (sec===0){
                countdownTick.stop();
                countdownBeep.play();
            }
        }

        // make timer blink when time is low
        if (sec<=10){
            $('#countdown-inner').addClass('alert');

            var timeLimit = questionTime;
            
            if (storedPowers[1].count > 0) {
                storedPowers[1].decrement();
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
                    if (/*soundOn*/ true){
                        bgMusic.load();
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
                    gasMeter.gasLevel+=obsArr[i].points;  // decrease gas

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
        if (timer%50 == 0 && timer%27 > 4 && timer%27 < 23) {
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
                else if (powerUps[i].name == "invincible" && invincibleFlag == false) {
                    if (trackDataFlag){
                        gameData.powersData.numBoostPowersEaten++;
                    }
                    if (soundOn){           // play sound
                        boostSfx.play();
                    }
                    invincibleFlag = true;  // set flag
                    objectSpeed = 40;       // change speed of objects on road
                    storedPowers[2].increment();            // add to active power
                    obsCarTransparency = 0.2;
                    setTimeout(function() {                 // set duration
                        objectSpeed = 20;
                        flameTransparency = 0.7;
                        obsCarTransparency = 0.4;
                    }, invincibleDuration-1000);
                    setTimeout(function() {                 // set duration
                        objectSpeed = 15;
                        flameTransparency = 0.4;
                        obsCarTransparency = 0.7;
                    }, invincibleDuration-500);
                    setTimeout(function() {                 // set duration
                        objectSpeed = 10;
                        storedPowers[2].decrement();
                        invincibleFlag = false;
                        flameTransparency = 1;
                        obsCarTransparency = 1;
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
    
    // check if answer is correct after answering
    function checkAns(right, choice, choiceTd, rightTd, questionNum) {
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
            if (/*soundOn*/ true){               // play sound
                correctSfx.play();
            }
            numRightQuestion++;         // keep track of right questions
            gasMeter.meterUp();                  // increase gas
			
            // show correct feedback
            var $feedback = $("<div class='qFeedback correct' style='display:none'></div>");
            $(rightTd).append($feedback);
            $feedback.fadeIn(animationTime);
            
            //remove question from the questionData set
			questionData.splice(questionNum, 1);
			if (questionData.length == 0) {
                stopAsking();
				pauseGame("questions completed");
			}
        }
        else{
            // play error sound
            if (/*soundOn*/ true){
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

    /******************
     * Draw functions *
     * ***************/
    function draw() {
		if (invincibleFlag) drawFlames(flameTransparency);
		drawCurrPowers();
		drawScore();
        drawCar();
        drawObjects(obsCarTransparency);
	}

    // draw flames behind car in boost mode
    function drawFlames(transparency){
		ctx.globalAlpha = transparency;
        ctx.drawImage(fire, xClip, 0, 200, 200, carX - carWidth, carY+carHeight*0.9, carWidth*3, carHeight);
        ctx.globalAlpha = 1;
        xClip = (xClip + 200)%800; 
    }

     // Draw score
    function drawScore(){
        $('#score').text(score);
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
        var answerID = [];
        var ansIndex = [];
        
        if (randomChoiceFlag) {
        //scramble the answers
			for(var i = 0; i < 4; i++) {
				var index1 = Math.floor(Math.random() * question.answers.length);
				var index2 = Math.floor(Math.random() * question.answers.length);
				var temp = question.answers[index1];
				question.answers[index1] = question.answers[index2];
				question.answers[index2] = temp;
			}
		}
		
        for(var i = 0; i < question.answers.length; i++) {
			if(question.answers[i].correct){
				ansIndex.push(i);
                var idNum = i+1;
                answerID.push("#choice"+idNum);
            }
		}
		
		//make sure answer is one of the first four answers
        for(var i = 0; i < ansIndex.length; i++) {
        if (ansIndex[i] > 3) {
			var prevAnsIndex = ansIndex;
			ansIndex[i] = Math.floor(Math.random() * 4);
			var idNum = ansIndex+1;
            answerID[i] = "#choice"+idNum;
			question.answers[prevAnsIndex] = question.answers[ansIndex[i]];
			question.answers[ansIndex[i]] = question.a;
		}
    }
		
        // get answers for question
        for(var i = 0; i < 4; i++) {
            if(question.answers[i] != undefined) {		
				choiceArr[i] = question.answers[i].answer;
			}
            else choiceArr[i] = "";
        }

        

        // fade out background
        $("#backgroundFader").fadeIn();

        // add question div
        var $qTable = $('<div id="ques" style="display:none"><table id="popQ"><tr id="Q"><td colspan=2>'+question.question+'</td></tr><tr><td colspan=2 id="progressBar"><div id="progressBarInner"></div><a>'+numRightQuestion+'/'+numTotalQuestions+' complete</a></td></tr><tr><td id="choice1">'+choiceArr[0]+'</td><td id="choice2">'+choiceArr[1]+'</td></tr><tr><td id="choice3">'+choiceArr[2]+'</td><td id="choice4">'+choiceArr[3]+'</td></tr></table></div>')
        var $countDown = $('<div id="countdown"><div id="countdown-inner"></div></div>');
        $qTable.append($countDown);

        var $powers = $('<div id="qPowers"></div>');
        $choice2 = $("#choice2");
        $choice3 = $("#choice3");
        $choice4 = $("#choice4");

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
        var progressLength = (($('#progressBar').width())*numRightQuestion)/numTotalQuestions;
        $('#progressBarInner').width(progressLength);

        // show timer countdown
        var cw = $('#countdown').width();
        $('#countdown').css({
            'height': cw + 'px'
        });

        // bind actions when choosing answer
        $("#choice1").on("click", function(){
            for(var i = 0; i < ansIndex.length; i ++)
               checkAns(question.answers[ansIndex[i]].answer,choiceArr[0],"#choice1",answerID[i],c);
        });
        $("#choice1").on('touchstart', function(){
            for(var i = 0; i < ansIndex.length; i ++)
            checkAns(question.answers[ansIndex[i]].answer,choiceArr[0],"#choice1",answerID[i],c);
        });
        $("#choice2").on("click", function(){
            for(var i = 0; i < ansIndex.length; i ++)
            checkAns(question.answers[ansIndex[i]].answer,choiceArr[1],"#choice2",answerID[i],c);
        });
        $("#choice2").on('touchstart', function(){
            for(var i = 0; i < ansIndex.length; i ++)
            checkAns(question.answers[ansIndex[i]].answer,choiceArr[1],"#choice2",answerID[i],c);
        });
        $("#choice3").on("click", function(){
            for(var i = 0; i < ansIndex.length; i ++)
            checkAns(question.answers[ansIndex[i]].answer,choiceArr[2],"#choice3",answerID[i],c);
        });
        $("#choice3").on('touchstart', function(){
            for(var i = 0; i < ansIndex.length; i ++)
            checkAns(question.answers[ansIndex[i]].answer,choiceArr[2],"#choice3",answerID[i],c);
        });
        $("#choice4").on("click", function(){
            for(var i = 0; i < ansIndex.length; i ++)
            checkAns(question.answers[ansIndex[i]].answer,choiceArr[3],"#choice4",answerID[i],c);
        });
        $("#choice4").on('touchstart', function(){
            for(var i = 0; i < ansIndex.length; i ++)
            checkAns(question.answers[ansIndex[i]].answer,choiceArr[3],"#choice4",answerID[i],c);
        });
        
        // disable clicks for empty answer
        for (var i = question.answers.length; i < choiceArr.length; i++) {
            switch (i) {
                case 2:
                    $choice3.off();
                    break;
                case 3:
                    $choice4.off();
                    break;
                default:
                    break;
            }
        }
        
        // decreasing used power-ups
        if (storedPowers[0].count != 0) {
            storedPowers[0].decrement();
            var del = Math.floor(Math.random() * question.answers.length);
            while (del == ansIndex) {
                var del = Math.floor(Math.random() * question.answers.length);
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

    //draw obstacles and power ups
    function drawObjects(obsCarTransparency) {
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
                if (invincibleFlag){ctx.globalAlpha = obsCarTransparency;}
				ctx.drawImage(obsImage, obsArr[i].x, obsArr[i].y, powerUpWidth, carHeight); 
                if (invincibleFlag){ctx.globalAlpha = 1;}
            }
            // draw coin
            if(obsArr[i].name == "coin"){
                ctx.drawImage(coinImage, obsArr[i].x, obsArr[i].y, powerUpWidth, coinHeight);
    		}
    	}
    }
    
    // draw display of current active power-ups
    function drawCurrPowers(){
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
    
	/*********************
	 * Endgame functions *
	 * ******************/	 
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
            soundManager.stopAll();
            alertSfx.stop();
            gameoverSfx.play(); // play "game over"
        }

        // stop updating canvas
        window.clearInterval(interval);

        $("#end").slideDown(animationTime);
        $("#screen").fadeOut(animationTime);

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
        $("#entername").show();

    }

	// go back to home page from end page
    function goHome(){
        $("#start").show();
        $("#end").slideUp(animationTime);
    }
    
    // send score to server
    function sendScore(name, score) {
        ajaxPost(
        {
            name: name,
            score:score
        },
        '/postScore',
        function onSuccess(data){
            $("#sendScoreSuccess").fadeIn(animationTime);
        },
        function onError(data){
        });
    }
    
    // go back to home page from end page
    function goHome(){
        $("#start").show();
        $("#end").slideUp(animationTime);
    }
    
    // send game statistics to server
    function sendGameData() {
        // semicolon-delimited string of jsons because mongo doesn't like arrays
        var stringifiedQuestionData = "";
        for (var i=0; i<gameData.questionData.length; i++){
            stringifiedQuestionData = stringifiedQuestionData + JSON.stringify(gameData.questionData[i]) + ";";
        }
        // console.log(stringifiedQuestionData);

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

    // send score to server
    function sendScore(name, score) {
        ajaxPost(
        {
            name: name,
            score:score
        },
        '/postScore',
        function onSuccess(data){
            $("#sendScoreSuccess").fadeIn(animationTime);
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
        // console.log(stringifiedQuestionData);

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

	/******************************
     * Misc. functions and events *
     *****************************/  
    function parser(JSONdata){
        var newData=new Array(JSONdata.length);
        for(var i = 0; i < JSONdata.length; i++){
            newData[i]=JSON.parse(JSONdata[i]);
        }
        return newData;
    }
    
    function showLevels(){
        $("#chooseLevelScreen").show();
        $("#start").slideUp(animationTime);  
    }
    
    // show high scores screen
    function showHighscores(){
        $("#highscores").show();
        $("#highscoresList").show();
        $("#start").slideUp(animationTime);
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
          }
        });
    }

    // hide high scores screen
    function hideHighscores(){
        $("#start").slideDown(animationTime);
        window.setTimeout(function(){$("#highscores").hide();},animationTime);
    }
    
    // pause game
    function pauseGame(type){
        pauseFlag = true;
        canvas.removeEventListener('touchmove', setupEventListener, false);

        // stop road from moving
        freezeRoad();
		if (type === "pause") {
			$("#pauseScreen").fadeIn(animationTime);
		}
		else if (type === "questions completed") {
            $("#completedTitle").html("Score: "+score);
            $("#questionNumberTitle").html("You've completed all "+numTotalQuestions+" </br> questions in this level! </br> Choose a new level to continue playing");
			$("#questionsCompleteScreen").fadeIn(3*animationTime);
            window.clearInterval(interval);
            window.setTimeout(bindButtons, animationTime);
        }
    }
    
    // resume game after pause
    function resumeGame(type, delay){
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

    function bindButtons() {
        $("#endGameBtn2").bind("click", function(){
            $("#questionsCompleteScreen").fadeOut(animationTime); 
            removeEvents();
            endGame();
            //goHome();
            //startScreen();
        });
        $("#endGameBtn2").live("touch", function(){
            $("#questionsCompleteScreen").fadeOut(animationTime); 
            removeEvents();
            endGame();
            //goHome();
            //startScreen();
        });
        $("#startOverBtn").bind("click", function(){
            $("#questionsCompleteScreen").fadeOut(animationTime); 
            removeEvents();
            startScreen();
        });
        $("#startOverBtn").live("touch", function(){
            $("#questionsCompleteScreen").fadeOut(animationTime); 
            removeEvents();
            startScreen();
        });

    }

	function removeEvents(){
        $("#endGameBtn2").off("click");
        $("#endGameBtn2").off("touch");
        $("#startOverBtn").off("click");
        $("#startOverBtn").off("touch");
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
}
