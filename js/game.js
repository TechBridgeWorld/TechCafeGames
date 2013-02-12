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
                }
            },
        function onError(data){ 
            }
    );

    var width = window.innerWidth;
    var windowHeight = window.innerHeight;
    var height = 0.9*windowHeight;
    var road;
    var road2; 
    var car; 
    var carPos; 
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
    var score;  
    var carMargin; 
    var questionInterval;
    var questionFlag = false;
    var obstacle;
    var allObstacles=["cone", "coin", "manhole"];
    var obsArr=[];
    var timer = 0;
    var allPoints=[-10, 20, -20];
    var obstacleInterval;
    var roadImage = new Image();
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

    console.log(questionData);
    function setup(){    
        score = 0;
        $('#headerDiv').height('' + 0.1*windowHeight + 'px');
        carWidth = 0.1*width; 
        carHeight = 0.2*width;
        carMargin = height - 1.5*carHeight;
        carPos = width/2 - 0.05 * width;
        canvas = document.getElementById('gameCanvas');
        ctx = $('#gameCanvas')[0].getContext('2d');
        ctx.canvas.width = width; 
        ctx.canvas.height = height;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0,0,width,height); 
        roadY = 0; 
        road2Y = -height; 
         obstacles = [];
         numObstacles = 0;
        canvas.addEventListener('touchmove', setupEventListener, false);

        drawRoad();
        
        interval = setInterval(draw, 50);

        //obstacleInterval = setInterval(addObstacle, 2000);

        questionInterval = setInterval(function(){
            questionFlag = true;
            
            window.clearInterval(obstacleInterval);
            setTimeout(function(){
                questionFlag = false;
                //obstacleInterval = setInterval(addObstacle, 1000);
                canvas.addEventListener('touchmove', setupEventListener, false);
            }, 10000);
        }, 20000);
    }

    setup();

    function setupEventListener(event){
        for (var i = 0; i < event.touches.length; i++) {
            var touch = event.touches[i];
            carPos = touch.pageX;
            if (carPos <= width/5) carPos = width/5;
            if (carPos >= width-width/3.6) carPos = width - width/3.6;              
        }
    }

    function draw(){
        drawRoad();
        drawCar();
        if (questionFlag) drawQuestionBox();
        else {
            drawScore();
            //**obstacles**
            timer++;
            if (timer%150 === 0) {
                var index = Math.floor(Math.random()*(allObstacles.length));
                var x;
                var rand = Math.floor(Math.random()*3);
         if (rand == 0)
             x = width/4-carWidth/2; 
         if (rand == 1)
             x = width/2-carWidth/2; 
         if (rand == 2)
             x = width*0.70-carWidth/2;
                obsArr.push(new Obs(allObstacles[index], allPoints[index], x, 0));
            }
            
            for(var i = 0; i < obsArr.length; i++) {
            obsArr[i].update(carPos, carMargin);
            if(obsArr[i].eaten) {
                if(obsArr[i].points >= 0) {
                    $("body").append('<div id="pts"><p>+'+obsArr[i].points+'</p></div>');
                    $("#pts").css("color","green");
                }
                else {
                    $("body").append('<div id="pts"><p>'+obsArr[i].points+'</p></div>');
                    $("#pts").css("color","red");
                }
                $("body").css("position","relative");
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
            else 
            {
                if(obsArr[i].name == "cone") ctx.drawImage(coneImage, obsArr[i].x, obsArr[i].y, carWidth, carHeight/2);
                
                if(obsArr[i].name == "coin") ctx.drawImage(coinImage, obsArr[i].x, obsArr[i].y, carWidth, carHeight/2);
                
                if(obsArr[i].name == "manhole") ctx.drawImage(manholeImage, obsArr[i].x, obsArr[i].y, carWidth, carHeight/2);
            }
            }
            //****
        }
    }

    function drawRoad(){
        if (roadY >= height)
            {
                roadY = road2Y-height;
            }
        roadY += 50;
        if (road2Y >= height)
            { 
                road2Y = roadY-height;
            }
        road2Y += 50;
        ctx.drawImage(roadImage, 0, road2Y, width, height);
        ctx.drawImage(roadImage, 0, roadY, width, height);
    }

    function drawCar(){
        ctx.drawImage(carImage, carPos, carMargin, carWidth, carHeight);
    }  

    function drawScore(){
        $('#score').text('Score: '+score);
        score++;
    }

    function drawQuestionBox(){
        canvas.removeEventListener('touchmove', setupEventListener, false);
        ctx.drawImage(questionBoxImage, 0.1*width, 0.1*height, 0.8*width, 0.8*height);
        ctx.textAlign = 'center';
        ctx.fillText('question',width/2,height/4);
        ctx.fillText('answer1', width/3.5,height/2);
        ctx.fillText('answer2', width*0.7, height/2);
        ctx.fillText('answer3', width/3.5, height*0.75);
        ctx.fillText('answer4', width*0.7, height*0.75);
    }



     /*function addObstacle(){
         var rand = Math.floor(Math.random()*3);
         var obs = new Object(); 
         obs.y = 0; 
         if (rand == 0)
             obs.x = width/4; 
         if (rand == 1)
             obs.x = width/2; 
         if (rand == 2)
             obs.x = width*0.70;
          obstacles.push(obs);
         numObstacles++;
     }

     function drawObstacle(){
         for (var i = 0; i < obstacles.length;i++){
             console.log(i);
             ctx.drawImage(coneImage, obstacles[i].x, obstacles[i].y,carWidth,carWidth);
             obstacles[i].y+=10;
         }
     }*/

}


