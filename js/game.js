window.onload = execute();

function execute(){
    var questionData = {};
    
    var ajaxRequest = function(url, fnSuccess, fnError){
        $.ajax({
            url: url,
            data: 'GET',
            success: fnSuccess,
            error: fnError
        });
    };

    ajaxRequest( 
        '/register', 
        function onSuccess(data){
            if(data)
                {   
                    questionData = data; 
                    // console.log(questionData);
                }
            },
        function onError(data){ 
            }
    );

    var width = window.innerWidth;
    var height = window.innerHeight * 0.99999;
    var road;
    var road2; 
    var car; 
    var carX; 
    var carLayer; 
    var roadLayer;
    var stage;
    var interval;
    var ctx;
    var roadY; 
    var road2Y;
    var canvas;  
    var carWidth; 
    var carHeight;
    var obstacleHeight; 
    var score;  
    var carY; 
    var questionInterval;
    var questionFlag = false;
    var questionTime = 31000; //31 seconds
    var obstacle;
    var allObstacles=["obs", "coin"];
    var obsArr=[];
    var objectSpeed; 
    var timer;
    var allPowers=["gas", "crossout", "timeplus", "invincible"];
    var powerUps=[];
    var storedPowers=[];
    var crossout = false;
    var invincibleFlag = false;
    var endTime;
    var animationTime = 400;
    var feedbackDelay = 2000; //time to deplay animation when showing question feedback
    var countdownInt; // countdown interval
    var qTimeout; // timeout for question

    var barStart;
    var barWidth;
    var barHeight;
    var barTop;
    var barFrac=100;
    
    var allPoints=[-20, 20];
    var obstacleInterval;
    var roadImage = new Image();
    var lane1X; 
    var lane2X; 
    var lane3X;
    var difficulty="easy";


    // images

    roadImage.src = "img/race-assets/track.png";

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
    fire.src = 'img/race-assets/fire-sprite.png';
    
    var xClip;


    // sounds

    var bgm = new Audio("sounds/racing-bgm.mp3");
    bgm.loop = true;
    bgm.volume = 0.4;

    var carSfx = new Audio("sounds/car-sfx.mp3");
    carSfx.loop = true;

    var coinSfx = new Audio("sounds/coin.wav");
    var correctSfx = new Audio("sounds/correct.wav");
    var errorSfx = new Audio("sounds/error.mp3");
    var powerupSfx = new Audio("sounds/powerup.wav");
    powerupSfx.volume = 0.5;
    var questionSfx = new Audio("sounds/question.wav");
    var boostSfx = new Audio("sounds/blast.wav");
    boostSfx.volume = 0.6;
    var crashSfx = new Audio("sounds/crash.wav");
    var countdownSfx = new Audio("sounds/countdown.mp3");

    var alertSfx = new Audio("sounds/alert.wav");
    alertSfx.loop = true;
    alertSfx.volume = 0.3;

    var gameoverSfx = new Audio("sounds/gameover.wav");

    var nonBgmSounds = [carSfx, coinSfx, correctSfx, errorSfx, powerupSfx, 
        questionSfx, boostSfx, crashSfx, countdownSfx, alertSfx];
    
    function setup(){    
        
        /* General variables */
        timer = 0; 
        score = 0;
        
        barFrac=100;
        
        /* Canvas+DOM variables */
        canvas = document.getElementById('gameCanvas');
        ctx = $('#gameCanvas')[0].getContext('2d');
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
        lane1X = width/4-carWidth/2;
        lane2X = width*.47-carWidth/2; 
        lane3X = width*0.70-carWidth/2;
        objectSpeed = 10;

        /* powerup variables */
        powerUpWidth = 1.5*carWidth;
        powerUpSpawnTime = 50;
        powerUps=[];
        
        /*storedPowers array */
        storedPowers=[];
        storedPowers.push(new Power("crossout"));
        storedPowers.push(new Power("timeplus"));
        storedPowers.push(new Power("invincible"));

        canvas.addEventListener('touchmove', setupEventListener, false);
        
        window.clearInterval(interval);
        interval = setInterval(draw, 50);

        // hide curr powerups
        $('#currPowers').hide();
        $('#currBoost').hide();
        $('#currTime').hide();
        $('#currEliminate').hide();
        $('#currTime .num').hide();
        $('#currEliminate .num').hide();
        
    }
    
    function Power(name) {
        this.name = name;
        this.count = 0;
        this.increment = function() {this.count++;};
        this.decrement = function() {this.count--;};
    }

    function Obs(name, points, x, y, width, height) {
        this.name = name;
        this.points = points;
        this.x=x;
        this.y=y;
        this.width = width;
        this.height = height;
        this.eaten=false;
    }

    Obs.prototype.update = function(){
        this.y+=objectSpeed;
        if(this.x > carX-this.width && this.x < carX+carWidth && this.y+obstacleHeight >= carY && this.y <= carY+carHeight) {
            this.eaten=true;
        }
    }

    function startScreen(){
        $("#startGo").hide();

        bgm.play();

        $(".push").bind("click", function(){
            $("#start").slideUp(animationTime); 
            setup();
            $("#startGo").fadeIn(animationTime*2).fadeOut(animationTime);
            // $("#startGo").fadeOut(animationTime);
            carSfx.play();
        });
        $(".push").live(
            "touch", function(){$("#start").slideUp(animationTime); 
            setup();
            $("#startGo").fadeIn(animationTime*2).fadeOut(animationTime);
            carSfx.play();
        });
        $("#end").hide();
    }

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

    function draw(){
        ctx.clearRect(0,0,width,height); 
        drawCar();
        if (questionFlag) drawQuestionBox();
        else {
            if (invincibleFlag) drawFlames();
            updateBar();
            drawScore();
            drawObstacles();
            drawPowerUps();
        }
    }

    function drawFlames(){
        ctx.drawImage(fire, xClip, 0, 256, 168, carX - carWidth, carY+carHeight*0.9, carWidth*3, carHeight);
        xClip = (xClip + 256)%1536; 
    }


    function updateBar(){
        barStart = $("#gasIcon").width()/2-5;
        if(barFrac>0) barFrac-=.1;
        if(barFrac <= 0) endGame();
        if(barFrac > 100) barFrac=100;
        barWidth = (barFrac/100)*(.93*($("#gasBar").width()-barStart));

        // change color when gas is low
        if (barFrac<50){
            $("#innerMeter").addClass("warning");
        }
        else{
            $("#innerMeter").removeClass("warning");
        }

        if (barFrac<25){
            $("#innerMeter").addClass("danger");
            $("#innerMeter").removeClass("warning");
            alertSfx.play();
        }
        else{
            $("#innerMeter").removeClass("danger");
            alertSfx.pause();
            // alertSfx.currentTime = 0;  <- this line will break the game on phones only
        }

        barHeight = $("#gasBar").height()*(3/5);
        barTop = $("#gasBar").height()*(1/5)+15;
        
        $("#innerMeter").css("left", 25+barStart + "px");
        $("#innerMeter").css("width", barWidth);
        $("#innerMeter").css("height", barHeight);
        $("#innerMeter").css("top", barTop);
    }
    
    function endGame(){
        // stop all non-bgm music
        for (var i=0; i<nonBgmSounds.length; i++){
            nonBgmSounds[i].loop = false;
            nonBgmSounds[i].pause();
            // nonBgmSounds[i].currentTime = 0;
        }
        // might need to set alert loop to true again?
        carSfx.loop = true;
        gameoverSfx.play();


        window.clearInterval(interval);
        $("#end").slideDown(animationTime);
        $("#endScore").html("Score: "+score);
        $(".push").bind("click", function(){$("#end").hide(); setup();});
        $(".push").live("touch", function(){$("#end").hide(); setup();});
    }

    function drawCar(){
        ctx.drawImage(carImage, carX, carY, carWidth, carHeight);
    }  

    function drawScore(){
        $('#score').text(score);
        score++;
    }

    function drawQuestionBox(){
    if($("#ques").length == 0) {
        canvas.removeEventListener('touchmove', setupEventListener, false);
        
        var c = Math.round((questionData.easy.length-1)*Math.random());
        var question = questionData.easy[c];
        var choiceArr =[];
        var answerID;
        var ansIndex;
        for(var i = 0; i < 4; i++) {
            if(question.choices[i] != undefined) {
                choiceArr[i] = question.choices[i];
                if (question.choices[i] == question.a)
                    ansIndex = i;
            }
            else choiceArr[i] = "";
            if(choiceArr[i].toString()===question.a.toString()){
                idNum = i+1;
                answerID = "#choice"+idNum;
            }
        }


        // add question div, countdown, and active powerups
        var $qTable = $('<div id="ques" style="display:none"><table id="popQ"><tr id="Q"><td colspan=2>'+question.q+'</td></tr><tr><td id="choice1">'+choiceArr[0]+'</td><td id="choice2">'+choiceArr[1]+'</td></tr><tr><td id="choice3">'+choiceArr[2]+'</td><td id="choice4">'+choiceArr[3]+'</td></tr></table></div>')
        var $countDown = $('<div id="countdown"><div id="countdown-inner"></div></div>');
        $qTable.append($countDown);

        // add active powerups
        // 0 = crossout
        // 1 = timeplus
        // 2 = invincible

        var $powers = $('<div id="qPowers"></div>');

        var crossout = 0;
        var timeplus = 1;
        var hasPowers = false;
        if (storedPowers[crossout].count>0){
            hasPowers = true;
            $powers.append('<div class="power eliminate"></div>');
            // console.log("has eliminate");
        }
        if (storedPowers[timeplus].count>0){
            hasPowers = true;
            $powers.append('<div class="power time"></div>');
            // console.log("has time");
        }
        if (hasPowers === true){
            $qTable.append($powers);
        }


        

        $("body").append($qTable);
        $qTable.fadeIn(animationTime);

        var cw = $('#countdown').width();
        $('#countdown').css({
            'height': cw + 'px'
        });

        // $("#ques").css("width",2*width/3);
        // $("#ques").css("height",3*height/4);
        // $("#ques").css("margin-top",-3*height/3);
        // $("#ques").css("margin-left",width/6);
        
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
        
        if (storedPowers[0].count != 0) {
            storedPowers[0].decrement();
            updateCurrPowers();
            var del = Math.floor(Math.random() * question.choices.length);
            while (del == ansIndex) {
                var del = Math.floor(Math.random() * question.choices.length);
            }
            switch (del)
            {
                case 0:
                    $("#choice1").addClass("crossed");
                    // $("#choice1").css("text-decoration", "line-through");
                    $("#choice1").off();
                    break;
                case 1:
                    // $("#choice2").css("text-decoration",  "line-through");
                    $("#choice2").addClass("crossed");
                    $("#choice2").off();
                    break;
                case 2:
                    // $("#choice3").css("text-decoration",  "line-through");
                    $("#choice3").addClass("crossed");
                    $("#choice3").off();
                    break;
                case 3:
                    // $("#choice4").css("text-decoration",  "line-through");
                    $("#choice4").addClass("crossed");
                    $("#choice4").off();
                    break;
                default:
                    break;
                }
            }
            //window.setTimeout(function(){$("#ques").remove();}, questionTime);
            //questionFlag=false;
            /*ctx.drawImage(questionBoxImage, 0.1*width, 0.1*height, 0.8*width, 0.8*height);
            ctx.textAlign = 'center';
            ctx.fillText('question',width/2,height/4);
            ctx.fillText('answer1', width/3.5,height/2);
            ctx.fillText('answer2', width*0.7, height/2);
            ctx.fillText('answer3', width/3.5, height*0.75);
            ctx.fillText('answer4', width*0.7, height*0.75);
            */
            var timeLimit = questionTime;
            
            if (storedPowers[1].count > 0) {
                storedPowers[1].decrement();
                updateCurrPowers();
                timeLimit += 10000;
            }

            // set countdown

            // console.log(timeLimit);
            var sec=timeLimit/1000-1; // 1 second less to count down to 
            // console.log(sec);
            $('#countdown-inner').html(sec);

            var countdownCounter = sec;

            countdownInt = window.setInterval(function(){
                // console.log(countdownCounter);
                countdownCounter--;
                updateCountdown(countdownCounter)},1000);
            // window.setTimeout(function(){
            //     window.clearInterval(countdownInt)},timeLimit);
            
            qTimeout = window.setTimeout(stopAsking, timeLimit);
        }
    }

    function updateCountdown(sec){
        $('#countdown-inner').html(sec);
        if (sec===10){
            countdownSfx.play();
        }
        if (sec<=10){
            $('#countdown-inner').addClass('alert');

            var timeLimit = questionTime;
            
            if (storedPowers[1].count > 0) {
                storedPowers[1].decrement();
                updateCurrPowers();
                timeLimit += 10000;
            }
            
            // window.setTimeout(stopAsking, timeLimit);
        }
    }

    
    function stopAsking(){
        if($("#ques").length > 0) {
            questionFlag=false;
            $("#ques").fadeOut(animationTime, function(){$("#ques").remove()});
            canvas.addEventListener('touchmove', setupEventListener, false);
        }
        window.clearTimeout(qTimeout);
        window.clearInterval(countdownInt);
        $('#countdown-inner').removeClass('alert');
    }
    
    function meterUp(){
        var animateInt = window.setInterval(function(){barFrac+=2; updateBar();},feedbackDelay/30);
        window.setTimeout(function(){window.clearInterval(animateInt)},feedbackDelay/3);
    }
    
    function checkAns(right, choice, choiceTd, rightTd) {
        // console.log("right: " + right);
        // console.log("choice: " + choice);
        // console.log("choiceTd: " + choiceTd);
        // console.log("rightTd: " + rightTd);

        window.clearTimeout(qTimeout);

        window.clearInterval(countdownInt);

        // stop countdown sound
        countdownSfx.pause();
        // countdownSfx.currentTime = 0;

        if(right===choice){
            correctSfx.play();
            meterUp();
            var $feedback = $("<div class='qFeedback correct' style='display:none'></div>");
            $(rightTd).append($feedback);
            $feedback.fadeIn(animationTime);
        }
        else{
            // alert("Wrong!");
            // console.log(choiceTd);
            errorSfx.play();
            var $choiceFeedback = $("<div class='qFeedback wrong-choice' style='display:none'></div>");
            var $rightFeedback = $("<div class='qFeedback wrong-right' style='display:none'></div>");
            $(rightTd).append($rightFeedback);
            $(choiceTd).append($choiceFeedback);
            $choiceFeedback.fadeIn(animationTime);
            $rightFeedback.fadeIn(animationTime);
        }
        
        $("#choice1").off();
        $("#choice2").off();
        $("#choice3").off();
        $("#choice4").off();
        
        // $("#ques").hide(animationTime, function(){$("#ques").remove()});
        //canvas.addEventListener('touchmove', setupEventListener, false);
        window.setTimeout(stopAsking, feedbackDelay);
    }

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

    function drawObstacles(){
        timer++;
        if (timer%150 === 0) {
            var index = Math.floor(Math.random()*(allObstacles.length));
            var x = chooseLane();
            obsArr.push(new Obs(allObstacles[index], allPoints[index], x, -obstacleHeight, carWidth, obstacleHeight));
            if(allObstacles[index]=="coin") {
                for(var i = 0; i < 3; i++) obsArr.push(new Obs(allObstacles[index], allPoints[index], x, -obstacleHeight+20*i, carWidth, obstacleHeight));
            }
        }   
            
        for(var i = 0; i < obsArr.length; i++) {
        obsArr[i].update(carX, carY);
        if(obsArr[i].eaten) {
            if(obsArr[i].points >= 0) {
                $("body").append('<div id="pts"><p>+'+obsArr[i].points+'</p></div>');
                $("#pts").css("color","green");
                coinSfx.play();
            }
            else {
                barFrac+=obsArr[i].points;
                $("body").append('<div id="pts"><p>'+obsArr[i].points+'</p></div>');
                $("#pts").css("color","red");
                crashSfx.play();
            }
            $("#pts").css("margin-top",-(height-obsArr[i].y)-25);
            $("#pts").css("margin-left",obsArr[i].x-25);
            $("#pts").css("position","relative");
            $("#pts").css("z-index",10);
            $("#pts").css("font-size",30);
            window.setTimeout(function(){$("#pts").remove();}, 1000);
            obsArr.splice(i,1);
        }
        else if(obsArr[i].y >= height) {
            obsArr.splice(i,1);
        }
        else {
            if(obsArr[i].name == "obs") 
                ctx.drawImage(obsImage, obsArr[i].x, obsArr[i].y, carWidth, obstacleHeight);       
            if(obsArr[i].name == "coin") 
                ctx.drawImage(coinImage, obsArr[i].x, obsArr[i].y, carWidth, obstacleHeight);
            }
        }
    }
    
    function drawPowerUps() {
        var interval = Math.floor(Math.random()*powerUpSpawnTime);
        if (timer%interval === 0) {
            var index = Math.floor(Math.random()*(allPowers.length));
            var x = chooseLane();
            powerUps.push(new Obs(allPowers[index], 0, x, -obstacleHeight, powerUpWidth, powerUpWidth));
        }
        for(var i = 0; i < powerUps.length; i++) {
            powerUps[i].update(carX, carY);
            if (powerUps[i].eaten) {
                if (powerUps[i].name == "gas") {
                    questionSfx.play();
                    questionFlag = true;
                    // window.clearInterval(obstacleInterval);
                    // setTimeout(function(){
                    //  questionFlag = false;
                    //  canvas.addEventListener('touchmove', setupEventListener, false);
                    // }, questionTime);
                }
                else if (powerUps[i].name == "invincible") {
                    boostSfx.play();
                    invincibleFlag = true;
                    objectSpeed = 20;
                    endTime = timer + 50;
                    storedPowers[2].increment();
                    updateCurrPowers();
                    setTimeout(function() {
                        objectSpeed = 10;
                        storedPowers[2].decrement();
                        updateCurrPowers();
                        invincibleFlag = false;
                    }, 3000);
                }
                else {
                    powerupSfx.play();
                    if (powerUps[i].name == "crossout") {
                        storedPowers[0].increment();
                    }
                    if (powerUps[i].name == "timeplus") {
                        storedPowers[1].increment();
                    }
                    updateCurrPowers();
                }
                powerUps.splice(i, 1);
            }
            else if(powerUps[i].y >= height) {
                powerUps.splice(i,1);
            }
            else {
                if(powerUps[i].name == "gas")
                    ctx.drawImage(gasimg, powerUps[i].x, powerUps[i].y, powerUpWidth, powerUpWidth);
                if(powerUps[i].name == "crossout") 
                    ctx.drawImage(crossout, powerUps[i].x, powerUps[i].y, powerUpWidth, powerUpWidth);       
                if(powerUps[i].name == "timeplus") 
                    ctx.drawImage(timeplus, powerUps[i].x, powerUps[i].y, powerUpWidth, powerUpWidth);
                if(powerUps[i].name == "invincible") 
                    ctx.drawImage(invincible, powerUps[i].x, powerUps[i].y, powerUpWidth, powerUpWidth);
            }
        }
    }

    // update display of current active power-ups
    function updateCurrPowers(){
        // console.log(storedPowers);

        // 0 = crossout
        // 1 = timeplus
        // 2 = invincible
        var crossout = 0;
        var timeplus = 1;
        var invincible = 2;

        // count num of each powerup
        // var numTime = 0;
        // var numCrossOut = 0;
        // var numInvincible = 0;
        // for (var i=0; i<storedPowers.length; i++){
        //     if (storedPowers[i].name == "timeplus"){
        //         numTime++;
        //     }
        //     else if (storedPowers[i].name == "crossout"){
        //         numCrossOut++;
        //     }
        //     else if (storedPowers[i].name == "invincible"){
        //         numInvincible++;
        //     }
        // }
        // console.log("time = " + numTime + "; cross = " + numCrossOut + "; invincible = " + numInvincible);
        

        var numTime = storedPowers[timeplus].count;
        var numCrossOut = storedPowers[crossout].count;
        var numInvincible = storedPowers[invincible].count;

        if (numTime+numCrossOut+numInvincible>0){
            // console.log("has powers");
            $('#currPowers').show(animationTime);
        }
        else{
            $('#currPowers').hide(animationTime);
        }

        if (numInvincible > 0){
            // console.log("has invincible");
            $('#currBoost').show(animationTime);
        }
        else {
            $('#currBoost').hide(animationTime);
        }

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


