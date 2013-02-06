//Replace these values with height and width retrieved from phone

window.onload = execute();

var width = $(window).width(); 
var height = $(window).height(); 
var questionData = {};

function execute() {
    Crafty.init($(window).width(), $(window).height());
    
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
                        console.log('data:');
                        console.log(data['list']);
                        console.log('stringify:');
                        questionData = data; 
                        console.log(JSON.stringify(questionData));
                    }
                },
                function onError(data){
                    console.log(JSON.stringify(data));
    });
};

//the loading screen
Crafty.scene("loading", function () {
    //load takes an array of assets and a callback when complete
    Crafty.load(['./img/logo.png'], function () {
        Crafty.scene("main"); //when everything is loaded, run the main scene
    });

    //black background with some loading text
    Crafty.background("#EEE");
    Crafty.e("2D, DOM, Text").attr({ w: width, h: height, x: 0, y: 0 })
         .text("Loading")
         .css({ "text-align": "center",
                "padding-top": "50px" });
});

Crafty.scene("main", function() { 
	Crafty.background("#FFF");
	
    Crafty.e("2D, DOM, Text, Mouse").attr({w: width, h: height, x: 0, y: 0})
		  .text("HOME SCREEN")
		  .css({ "margin-left": "auto",
            "background-color": "#eeeeee", 
            "padding-top":"50px",
            "text-align": "center" }).bind('Click',function(){Crafty.scene('question');});

    // Crafty.e("")

    // Crafty.e("2D, DOM, Text")
});
	
Crafty.scene("question", function() { 
    Crafty.background("#AAA");
    
    var screen = Crafty.e("2D, DOM, Text, Mouse").attr({w: width, h: height, x: 0, y: 0})
          .text("QUESTION SCREEN")
          .css({ "margin-left": "auto",
            "background-color": "#eeeeee", 
            "padding-top":"50px",
            "text-align": "center" }).bind('Click',function(){Crafty.scene('main');});

    var box = Crafty.e("2D, Color, Text, Mouse").attr({w:(0.9*width), h:(0.9*height), x:(0.05*width), y:(0.05*height)})
            .text("AAAAA")
            .color("#000000");
});

//automatically play the loading scene
//Crafty.init(300, 400);
Crafty.scene("loading");
