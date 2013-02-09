//Replace these values with height and width retrieved from phone

window.onload = execute();

var questionData = {};

function execute() {
    // Crafty.init($(window).width(), $(window).height());
    
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
                    //     console.log('data:');
                    //     console.log(data['list']);
                    //     console.log('stringify:');
                        questionData = data; 
                        // console.log(JSON.stringify(questionData));
                    }
                },
                function onError(data){
                    // console.log(JSON.stringify(data));
    });

    var width = window.innerWidth;
    var height = window.innerHeight;
    
    var stage = new Kinetic.Stage({
        container: 'gameCanvas',
        width: width, 
        height: height,
    });

    var layer = new Kinetic.Layer(); 

    var rect = new Kinetic.Rect({
        x:0,
        y:0,
        width: width, 
        height: height, 
        fill: 'yellow'
    });

    layer.add(rect); 

    var image = new Image(); 
    image.src = "img/road_vert.png";
    image.onload = function(){
        var roadY = 0; 
        var road2Y = -height;
        var road = new Kinetic.Image({
            x:0, 
            y:0,
            image:image, 
            width:width, 
            height:height 
        });
        var road2 = new Kinetic.Image({
            x:0, 
            y:-height,
            image:image, 
            width:width, 
            height:height 
        });
        layer.add(road2);
        layer.add(road);
        stage.add(layer);

        var anim = new Kinetic.Animation(function(frame){
            road.setY(roadY += 60);
            if (roadY >= height){roadY = -height;}
            road2.setY(road2Y += 60); 
            if (road2Y >= height){ road2Y = -height;}
        }, layer); 
        anim.start();
    };


};
  
