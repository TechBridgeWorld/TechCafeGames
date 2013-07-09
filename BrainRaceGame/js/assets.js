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

var soundOn=false; 

var bgMusic; 
var carSfx;
var coinSfx;
var correctSfx;
var errorSfx;
var powerupSfx;
var questionSfx;
var boostSfx;
var crashSfx;
var countdownSfx;
var countdownTick;
var countdownBeep;
var alertSfx;
var gameoverSfx;
var loopSound;
var bgMusicPosition = 0;

//***********
soundManager.setup({
		  // where to find flash audio SWFs, as needed
		  url: './swf',
		  // optional: prefer HTML5 over Flash for MP3/MP4
		  // preferFlash: false,
		  onready: function() {
    		  bgMusic = soundManager.createSound({
    		  id: 'bgMusic',
    		  url: './sounds/racing-bgm.mp3'
    		  });
    		  carSfx = soundManager.createSound({
    		  id: 'carSfx',
    		  url: './sounds/car-sfx.mp3'
    		  });
    		  coinSfx = soundManager.createSound({
    		  id: 'coinSfx',
    		  url: './sounds/coin.mp3'
    		  });
    		  correctSfx = soundManager.createSound({
    		  id: 'correctSfx',
    		  url: 'sounds/correct.mp3'
    		  });
    		  errorSfx = soundManager.createSound({
    		  id: 'errorSfx',
    		  url: 'sounds/error.mp3'
    		  });
    		  powerupSfx = soundManager.createSound({
    		  id: 'powerupSfx',
    		  url: 'sounds/powerup.mp3'
    		  });
    		  questionSfx = soundManager.createSound({
    		  id: 'questionSfx',
    		  url: 'sounds/question.mp3'
    		  });
    		  boostSfx = soundManager.createSound({
    		  id: 'boostSfx',
    		  url: 'sounds/blast.mp3'
    		  });
    		  crashSfx = soundManager.createSound({
    		  id: 'crashSfx',
    		  url: 'sounds/crash.mp3'
    		  });
    		  countdownSfx = soundManager.createSound({
    		  id: 'countdownSfx',
    		  url: 'sounds/countdown.mp3'
    		  });
    		  countdownTick = soundManager.createSound({
    		  id: 'countdownTick',
    		  url: 'sounds/countdown-tick.mp3'
    		  });
    		  countdownBeep = soundManager.createSound({
    		  id: 'countdownBeep',
    		  url: 'sounds/countdown-beep.mp3'
    		  });
    		  alertSfx = soundManager.createSound({
    		  id: 'alertSfx',
    		  url: 'sounds/alert.mp3'
    		  });
    		  gameoverSfx = soundManager.createSound({
    		  id: 'gameoverSfx',
    		  url: 'sounds/gameover.mp3'
		      });

               

		    
              loopSound = function(sound) {
		            coinSfx.load();
    		        sound.play({
        		    position: bgMusicPosition,
        		    onfinish: function() {
        		      loopSound(sound);
        		    }
    		    },
    		    {volume:30});
    		  }
		  }
});
		
