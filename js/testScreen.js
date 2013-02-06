//Replace these values with height and width retrieved from phone

window.onload = execute();

var width = $(window).width(); 
var height = $(window).height(); 
var frac = 0;
var length = 0;
var questionData = {};

function execute() {
    Crafty.init($(window).width(), $(window).height());
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
	
	Crafty.e("2D, DOM, Text, Mouse").attr({w: width, h: height, x: 0, y: 0})
		  .css({ "margin-left": "auto",
            "background-color": "#000000", 
            "padding-top":"50px",
            "text-align": "center" }).bind('Click',function(){console.log("clicked");});
	
    Crafty.e("2D, DOM, Text, Mouse").attr({w: width*7/8, h: height*5/12, x: width*1/16, y:height*1/16})
		  .text("QUESTION SCREEN")
		  .css({ "margin-left": "auto",
            "background-color": "#eeeeee", 
            "padding-top":"50px",
            "text-align": "center" }).bind('Click',function(){console.log("clicked");});
            
    Crafty.e("2D, DOM, Text, Mouse, Image").attr({w: width*7/8, h: height*1/5, x: width*1/16, y: height*1/8 + height*1/2})
		  .text("RACING SCREEN")
		  //.image('./img/road.jpg')
		  .css({ "margin-left": "auto",
		    "background" :"url('./img/road.jpg')",
		    "background-size" : width*7/8+"px "+height*1/5+"px",
            "padding-top":"50px",
            "text-align": "center" }).bind('Click',function(){console.log("clicked");});
});

//automatically play the loading scene
Crafty.scene("loading");