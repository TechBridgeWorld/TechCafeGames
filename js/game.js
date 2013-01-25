//Replace these values with height and width retrieved from phone

window.onload = execute();

var width = $(window).width(); 
var height = $(window).height(); 

function execute() {
    Crafty.init($(window).width(), $(window).height());
    //Crafty.canvas();
};

//the loading screen
Crafty.scene("loading", function () {
    //load takes an array of assets and a callback when complete
    Crafty.load(['./img/logo.png'], function () {
        Crafty.scene("main"); //when everything is loaded, run the main scene
    });

    //black background with some loading text
    Crafty.background("#EEE");
    Crafty.e("2D, DOM, Text").attr({ w: 100, h: 20, x: 150, y: 120 })
         .text("Loading")
         .css({ "text-align": "center" });
});

Crafty.scene("main", function() { 
	Crafty.background("#FFF");
	
    Crafty.e("2D, DOM, Text, Mouse").attr({w: width, h: height, x: 0, y: 0})
		  .text("HOME SCREEN")
		  .css({ "margin-left": "auto",
            "background-color": "#eeeeee", 
            "padding-top":"50px",
            "text-align": "center" }).bind('Click',function(){Crafty.scene('question');});
});
	
Crafty.scene("question", function() { 
    Crafty.background("#AAA");
    
    Crafty.e("2D, DOM, Text, Mouse").attr({w: width, h: height, x: 0, y: 0})
          .text("QUESTION SCREEN")
          .css({ "margin-left": "auto",
            "background-color": "#eeeeee", 
            "padding-top":"50px",
            "text-align": "center" }).bind('Click',function(){Crafty.scene('main');});
});

//automatically play the loading scene
//Crafty.init(300, 400);
Crafty.scene("loading");
