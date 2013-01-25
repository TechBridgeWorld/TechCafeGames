//Replace these values with height and width retrieved from phone

window.onload = execute();

function execute() {
    Crafty.init(300, 400);
    //Crafty.canvas();
};

//the loading screen
Crafty.scene("loading", function () {
    //load takes an array of assets and a callback when complete
    Crafty.load([], function () {
        Crafty.scene("main"); //when everything is loaded, run the main scene
    });

    //black background with some loading text
    Crafty.background("#000");
    //Crafty.e("2D, DOM, Text").attr({ w: 100, h: 20, x: 150, y: 120 })
    //      .text("Loading")
    //      .css({ "text-align": "center" });
});

Crafty.scene("main", function() { 
	Crafty.background("#FFF");
	Crafty.e("2D, Canvas, Color").color("blue").attr({w: 100, h: 20, x: 150, y: 120})
		  .text("This is the main page")
		  .css({ "text-align": "center" });
	})
	
//automatically play the loading scene
//Crafty.init(300, 400);
Crafty.scene("loading");
