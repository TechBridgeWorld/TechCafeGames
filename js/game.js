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
                    console.log(questionData);
                }
            },
        function onError(data){ 
            }
    );

    var width = window.innerWidth;
    var windowHeight = window.innerHeight;
    var height = 0.9*windowHeight + 20;
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
    var questionTime = 10000;
    var obstacle;
    var allObstacles=["cone", "coin", "manhole"];
    var obsArr=[];
    var timer;
    
    var allPowers=["gas", "crossout", "timeplus", "invincible"];
    var powerUps=[];
    var storedPowers=[];
    var crossout = false;
    var invincible = true;
    var endTime;
    
    var allPoints=[-10, 20, -20];
    var obstacleInterval;
    var roadImage = new Image();
    var lane1X; 
    var lane2X; 
    var lane3X;
    var difficulty="easy";
    roadImage.src = "img/race-assets/track.png";

    var carImage = new Image(); 
    carImage.src = "img/race-assets/car.png";


    var questionBoxImage = new Image();
    questionBoxImage.src = "img/race-assets/question-bg.png";

    var coneImage = new Image(); 
    coneImage.src = "img/race-assets/obstacle-c.png";
    
    var coinImage = new Image(); 
    coinImage.src = "img/race-assets/coin.png";
    
    var manholeImage = new Image(); 
    manholeImage.src = "img/race-assets/obstacle-m.png";
    
    var gasimg = new Image(); 
    gasimg.src = "img/race-assets/powerup-gas.png";
    
    var crossout = new Image(); 
    crossout.src = "img/race-assets/powerup-eliminate.png";
    
    var timeplus = new Image(); 
    timeplus.src = "img/race-assets/powerup-time.png";
    
    var invincible = new Image(); 
    invincible.src = "img/race-assets/powerup-boost.png";

    function setup(){    
        
        /* General variables */
        timer = 0; 
        score = 0;
        
        /* Canvas+DOM variables */
        $('#headerDiv').height('' + 0.1*windowHeight + 'px');
        canvas = document.getElementById('gameCanvas');
        ctx = $('#gameCanvas')[0].getContext('2d');
        ctx.canvas.width = width; 
        ctx.canvas.height = height;
        ctx.clearRect(0,0,width,height); 
        
        /* Car variables */
        carWidth = 0.1*width; 
        carHeight = 0.2*width;
        carY = height - 1.5*carHeight;
        carX = width/2 - 0.05 * width;
        
        /* Obstacle Variables */
        obstacleHeight = carHeight/2;
        lane1X = width/4-carWidth/2;
        lane2X = width/2-carWidth/2; 
        lane3X = width*0.70-carWidth/2;

        canvas.addEventListener('touchmove', setupEventListener, false);
        
        interval = setInterval(draw, 50);
           
    }

    function Obs(name, points, x, y) {
        this.name = name;
        this.points = points;
        this.x=x;
        this.y=y;
        this.eaten=false;
    }


    Obs.prototype.update = function(){
        this.y+=10;
        if(this.x > carX-50 && this.x < carX+50 && this.y+obstacleHeight >= carY) {
            this.eaten=true;
        }
    }

    setup();

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
            drawScore();
            drawObstacles();
            drawPowerUps();
        }
    }

    function drawCar(){
        ctx.drawImage(carImage, carX, carY, carWidth, carHeight);
    }  

    function drawScore(){
        $('#score').text('Score: '+score);
        score++;
    }

    function drawQuestionBox(){
    if (!($('#ques').length)){
    
        canvas.removeEventListener('touchmove', setupEventListener, false);
        
        var c = Math.round(questionData.easy.length*Math.random());
        var question = questionData.easy[c];
        var choiceArr =[];
        for(var i = 0; i < 4; i++) {
            if(question.choices[i] != undefined) choiceArr[i] = question.choices[i];
            else choiceArr[i] = "";
        }
        
        $("body").append('<div id="ques"><table id="popQ"><tr id="Q"><td colspan=2>'+question.q+'</td></tr><tr><td id="choice1">'+choiceArr[0]+'</td><td id="choice2">'+choiceArr[1]+'</td></tr><tr><td id="choice3">'+choiceArr[2]+'</td><td id="choice4">'+choiceArr[3]+'</td></tr></table></div>');
        $("#ques").css("width",2*width/3);
        $("#ques").css("height",height/2);
        $("#popQ").css("background-color", "black");
        $("#ques").css("margin-top",-3*height/4);
        $("#ques").css("margin-left",width/6);
        $("#ques").css("position","relative");
        $("#ques").css("z-index",10);
        $("#ques").css("font-size",30);
        
        $("#choice1").bind("click", function(){checkAns(question.a,choiceArr[0]);});
        $("#choice1").live('touchstart', function(){checkAns(question.a,choiceArr[0]);});
        $("#choice2").bind("click", function(){checkAns(question.a,choiceArr[1]);});
        $("#choice2").live('touchstart', function(){checkAns(question.a,choiceArr[1]);});
        $("#choice3").bind("click", function(){checkAns(question.a,choiceArr[2]);});
        $("#choice3").live('touchstart', function(){checkAns(question.a,choiceArr[2]);});
        $("#choice4").bind("click", function(){checkAns(question.a,choiceArr[3]);});
        $("#choice4").live('touchstart', function(){checkAns(question.a,choiceArr[3]);});
        
        window.setTimeout(function(){$("#ques").remove();}, 10000);
        
    }
        /*ctx.drawImage(questionBoxImage, 0.1*width, 0.1*height, 0.8*width, 0.8*height);
        ctx.textAlign = 'center';
        ctx.fillText('question',width/2,height/4);
        ctx.fillText('answer1', width/3.5,height/2);
        ctx.fillText('answer2', width*0.7, height/2);
        ctx.fillText('answer3', width/3.5, height*0.75);
        ctx.fillText('answer4', width*0.7, height*0.75);
        */
    }
    
    function checkAns(right, choice) {
        if(right===choice) alert("Good job!");
        else alert("Wrong!");
        //questionFlag = false;
		//canvas.addEventListener('touchmove', setupEventListener, false);
    }

	function chooseLane() {
		var rand = Math.floor(Math.random()*3);
            if (rand == 0)
                x = width/4-carWidth/2; 
            else if (rand == 1)
                x = width/2-carWidth/2; 
            else if (rand == 2)
                x = width*0.70-carWidth/2;
         return x
    }

    function drawObstacles(){
        timer++;
        if (timer%150 === 0) {
            var index = Math.floor(Math.random()*(allObstacles.length));
            var x = chooseLane();
            obsArr.push(new Obs(allObstacles[index], allPoints[index], x, -obstacleHeight));
        }   
            
        for(var i = 0; i < obsArr.length; i++) {
        obsArr[i].update(carX, carY);
        if(obsArr[i].eaten) {
            if(obsArr[i].points >= 0) {
                $("body").append('<div id="pts"><p>+'+obsArr[i].points+'</p></div>');
                $("#pts").css("color","green");
            }
            else {
                $("body").append('<div id="pts"><p>'+obsArr[i].points+'</p></div>');
                $("#pts").css("color","red");
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
            if(obsArr[i].name == "cone") 
                ctx.drawImage(coneImage, obsArr[i].x, obsArr[i].y, carWidth, obstacleHeight);       
            if(obsArr[i].name == "coin") 
                ctx.drawImage(coinImage, obsArr[i].x, obsArr[i].y, carWidth, obstacleHeight);
            if(obsArr[i].name == "manhole") 
                ctx.drawImage(manholeImage, obsArr[i].x, obsArr[i].y, carWidth, obstacleHeight);
            }
        }
    }
    
    function drawPowerUps() {
		if (timer == endTime && invincible) {
			invincible = false;
			for (var i = 0; i < storedPowers.length; i++) {
				if (storedPowers[i].name == "invincible")
				storedPowers.splice(i, 1);
			}
		}
		var interval = Math.floor(Math.random()*100);
        if (timer%interval === 0) {
            var index = Math.floor(Math.random()*(allPowers.length));
            var x = chooseLane();
            powerUps.push(new Obs(allPowers[index], 0, x, -obstacleHeight));
        }
        for(var i = 0; i < powerUps.length; i++) {
			powerUps[i].update(carX, carY);
			if (powerUps[i].eaten) {
				if (powerUps[i].name == "gas") {
					questionFlag = true;
					window.clearInterval(obstacleInterval);
					setTimeout(function(){
						questionFlag = false;
						canvas.addEventListener('touchmove', setupEventListener, false);
					}, questionTime);
					//popPowers();
				}
				/*else if (powerUps[i].name == "invincible")
					invincible = true;
					endTime = timer + 5000;
					storedPowers.push(powerUps[i]); */
				else
					storedPowers.push(powerUps[i]);
				powerUps.splice(i, 1);
			}
			else if(powerUps[i].y >= height) {
            powerUps.splice(i,1);
			}
			else {
				if(powerUps[i].name == "gas")
					ctx.drawImage(gasimg, powerUps[i].x, powerUps[i].y, carWidth, obstacleHeight);
				if(powerUps[i].name == "crossout") 
					ctx.drawImage(crossout, powerUps[i].x, powerUps[i].y, carWidth, obstacleHeight);       
				if(powerUps[i].name == "timeplus") 
					ctx.drawImage(timeplus, powerUps[i].x, powerUps[i].y, carWidth, obstacleHeight);
				if(powerUps[i].name == "invincible") 
					ctx.drawImage(invincible, powerUps[i].x, powerUps[i].y, carWidth, obstacleHeight);
            }
        }
	}
}


