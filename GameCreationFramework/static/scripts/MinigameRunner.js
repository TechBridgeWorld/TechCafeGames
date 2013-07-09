/*
 * MinigameRunner.js - contains the functions necessary for loading data about
 *                     a minigame from the MinigameData collection and
 *                     running a game based on this data.
 *                     used by minigameRunner.html, which is the game-playing
 *                     view.
 */

/*
 * MinigameRunner - main object for running minigames, contains all relevant
 *                  fields and methods. need only be instanciated once per
 *                  visit to minigameRunner.html.
 *                  will rewrite its own properties to move forward to next
 *                  minigame in queue
 */
function MinigameRunner (data, rows, cols, fromEditor, minigameId) {
  this.minigameQueue = data.slice(0); /* non-destructive copy */
  this.fromEditor = fromEditor;
  this.canvas = $("#play-canvas");
  this.ctx = this.canvas[0].getContext("2d");
  this.clicks = [];        /* which mouse clicks have happened? */
  this.mode;
  this.hasGravity;
  this.paused = false;     /* should the game appear to be running? */
  this.keepRunning = true; /* should timer keep calling itself? */
  this.keys = {            /* which keys are currently held? */
    "space": false,
    "left": false,
    "up": false,
    "right": false, 
    "down": false
  };
  this.delay = 50;         /* ms between timer calls */
  this.gameElements = [];  /* elements in currently running game */
  this.origin;             /* player start position */
  this.player;
  this.vs = 0.5;           /* vertical player movement sensitivity */
  this.hs = 0.06;           /* horizontal player movement sensitivity */
  this.xVelMax = 0.02;
  this.yVelMax = 0.1;
  this.blockFurtherActions; /* in case the game ends, stop mid-timer */
  this.width = this.canvas[0].width;
  this.height = this.canvas[0].height;
  this.rows = rows;
  this.cols = cols;
  this.side = this.width / this.cols;
  this.vertScale = 1 / this.rows;
  this.horizScale = 1 / this.cols;
  this.wallBouncePercent = 0.4;
  this.heldObject; /* only in tap mode */
  this.tooFar = 0.25; /* how far can we drag a ball without dropping it? */
  this.pairs = [
    {"key": "jump", "code": 38},
    {"key": "left",  "code": 37},
    {"key": "up",    "code": 38},
    {"key": "right", "code": 39},
    {"key": "down",  "code": 40}
  ];
  this.pauseCounter = 10;
  this.minigameId = minigameId;
  this.lastTouch;
}

/*
 * methods for MinigameRunner class
 */
MinigameRunner.prototype = {
  /*
   * MinigameRunner.enter - do all actions associated with entering the
   *                        minigameRunner view. bind event handlers, start
   *                        the timer.
   */
  "enter": function () {
    /* check css to determine whether device has been detected as mobile */
    this.mobile = ($("#mobile-overlay-wrapper").css("display") !== "none");

    /* initialize view and toolbars */
    this.initView();
  
    /* initialize first minigame */
    this.next();

    /* start timer */
    this.timer();
  },
  /*
   * MinigameRunner.addListeners - add all event listeners appropriate for the
   *                               current game mode
   */
  "addListeners": function () {
    this.canvas.off();

    if (this.mobile) {
      if (this.mode === "tap") {
        this.canvas.on("touchstart", function (e) {
          var touches = e.originalEvent.targetTouches;
          if (touches.length < 1) return;
          var touch = pageToOffset(this, touches);
          this.lastTouch = touch;
          this.handleMouseDown.call(this, touch);
          e.preventDefault();
          e.stopPropagation();
        }.bind(this));

        this.canvas.on("touchmove", function (e) {
          var touches = e.originalEvent.targetTouches;
          if (touches.length < 1) return;
          var touch = pageToOffset(this, touches);
          this.lastTouch = touch;
          this.handleMouseMove.call(this, touch);
          e.preventDefault();
          e.stopPropagation();
        }.bind(this));

        this.canvas.on("touchend", function (e) {
          e.preventDefault();
          e.stopPropagation();
          this.lastTouch = undefined;
        }.bind(this));

      } else {
        $(this.pairs).each(function (i, pair) {
          /* bind the mobile keydown to the physical keydown handler */
          $("#mobile-" + pair.key + "-button").on("touchstart", function (e) {
            this.handleKeydown.call(this, {"which": pair.code});
            e.preventDefault();
            e.stopPropagation();
          }.bind(this));

          /* bind the mobile keyup to the physical keyup handler */
          $("#mobile-" + pair.key + "-button").on("touchend", function (e) {
            this.handleKeyup.call(this, {"which": pair.code});
            e.preventDefault();
            e.stopPropagation();
          }.bind(this));
        }.bind(this));
      }
    } else {
      this.canvas.on("mousedown", this.handleMouseDown.bind(this));
      this.canvas.on("mouseup", this.handleMouseUp.bind(this));
      this.canvas.on("mousemove", this.handleMouseMove.bind(this));
      this.canvas.on("mouseleave", this.handleMouseLeave.bind(this));
    }
    
    $(document).on("keydown", this.handleKeydown.bind(this));
    $(document).on("keyup", this.handleKeyup.bind(this));
  },
  /*
   * MinigameRunner.initView - hide the current DOM elements and show the
   *                           elements related to the minigame runner view
   */
  "initView": function () {
    /* set up buttons */
    $("#play-pause").on("click", (function (e) {
      e.preventDefault();
      this.togglePause();
    }).bind(this));

    $("#exit-runner").on("click", (function (e) {
      e.preventDefault();
      this.exit();
    }).bind(this));

    /* set up answer option hover handlers */
    for (var i = 1; i < 5; i++) {
      (function (num) {
        $("#answer" + num).on("mouseover", function () {
          highlightAnswer(this, num, 500, undefined);
        }.bind(this));
      }.bind(this))(i);
    }
  },
  /*
   * MinigameRunner.exit - do all actions associated with exiting the
   *                       minigameRunner view. unbind event handlers, stop
   *                       the timer.
   */
  "exit": function () {
    /* remove event listeners */
    this.canvas.off();
    $(document).off();
    $("#play-pause").off();
    $("#exit-runner").off();
    for (var i = 1; i <= 4; i++) {
      (function (num) {
        $("#answer" + num).off();
      }) (i);
    }
    $(this.pairs).each(function (i, pair) {
      $("#mobile-" + pair.key + "-button").off();
    });

    /* remove answer option hover handlers */
    for (var i = 1; i < 5; i++) {
      (function (num) {
        $("#answer" + num).off();
      })(i);
    }

    /* stop timer */
    this.keepRunning = false;

    /* restore css */
    var displayValue = (this.mobile) ? "block" : "none";
    $("#mobile-overlay-wrapper").css("display", displayValue);

    /* return to home page */
    if (this.fromEditor) {
      goToEditPage(this.currGame, this.minigameId);
    } else {
      initHomePage(true);
    }
  },
  /*
   * handleMouseDown - if the mouse is clicked down over an element that is
   *                   moveable, pick it up
   */
  "handleMouseDown": function (e) {
    if (this.paused) return;

    if (this.mode === "directional") {
      if (!this.mobile) {
        promptOverlay(this, undefined, true);
      }
      return;
    }

    /* fake mouse as a ball element */
    var mouse = {
      "type": "mouse", 
      "pos": [e.offsetX/this.width, e.offsetY/this.height]
    };

    /* check if it's on an object */
    for (var i = 0; i < this.gameElements.length; i++) {
      var elem = this.gameElements[i];
      if (!elem.removed &&
          isBall(elem) &&
          touching(this, mouse, elem)) {
        elem.clicked(this);
        return;
      }
    }
  },
  /*
   * handleMouseUp - if the move is picked up, drop any held object
   */
  "handleMouseUp": function (e) {
    if (this.heldObject !== undefined) {
      this.heldObject.held = false;
    }
    this.heldObject = undefined;
  },
  /*
   * handleMouseLeave - if the move leaves the canvas before mousemove
   *                    notices, still drop the ball
   */
  "handleMouseLeave": function (e) {
    if (this.heldObject !== undefined) {
      this.heldObject.held = false;
    }
    this.heldObject = undefined;
  },
  /*
   * handleMouseMove - if the mouse is moved and there is a held object,
   *                   try to move it to its new location.
   *                   check for collisions at intervals along the path
   *                   to this new location.
   *                   if it is moved too quickly, drop it.
   */
  "handleMouseMove": function (e) {
    if ((this.heldObject === undefined) ||
       (this.paused)) {
      return;
    }

    /* first, stop any momentum */
    this.heldObject.vel = [0, 0];
    this.heldObject.accel = [0, 0];

    var vrad = this.heldObject.rad;
    var hrad = vrad * this.height / this.width;
    var mouseX = e.offsetX / this.width;// - hrad;
    var mouseY = e.offsetY / this.height;// - vrad;
    var mousePos = [mouseX, mouseY];
    var newX = mouseX - hrad;
    var newY = mouseY - vrad;
    var newPos = [newX, newY];
 

    if (newX < -2 * hrad || 1 < newX ||
        newY < -2 * vrad || 1 < newY ||
        this.tooFar < distPoints(this, this.heldObject.pos, mousePos)) {
      /* if newPos is off move than a radius off canvas
         or too far from pos, drop heldObject */
      this.heldObject.held = false;
      this.heldObject = undefined;
      return;
    } else if (newX < 0 || 1 < newX + 2 * hrad ||
               newY < 0 || 1 < newY + 2 * vrad) {
      /* if newPos is just a little off canvas, don't drop, but don't move
         it there either */
      return;
    }

    /* try to move to new position, colliding as we go */
    var numSteps = 10;
    var diff = addPoints(newPos, multPoint(-1, this.heldObject.pos));
    var step = multPoint(1/numSteps, diff);
    var stepsTaken = 0;
    while(stepsTaken < numSteps) {
      /* move the object one step forward */
      this.heldObject.pos = addPoints(this.heldObject.pos, step);
      stepsTaken++;

      /* check collisions */
      if (this.heldObject.checkWalls(this) ||
          this.heldObject.checkElems(this) ||
          this.heldObject.checkWalls(this)) {
        break;    
      }
    };
  },
  /*
   * handleKeydown - event handler for keydown event. register key as pressed.
   */
  "handleKeydown": function (e) {
    if (this.mode === "directional" || e.which === 32) {
      // added to get rid of prompt instead of tapping
      switch (e.which) {
        case 32: this.keys.space = true;
                 break;
        case 37: this.keys.left = true;
                 break;
        case 38: this.keys.up = true;
                 break;
        case 39: this.keys.right = true;
                 break;
        case 40: this.keys.down = true;
                 break;
      }
    } else {
      promptOverlay(this, undefined, true);
    }
  },
  /*
   * handleKeyup - event handler for keyup event. register key as not pressed.
   */
  "handleKeyup": function (e) {
    switch (e.which) {
      case 32: this.keys.space = false;
               break;
      case 37: this.keys.left = false;
               break;
      case 38: this.keys.up = false;
               break;
      case 39: this.keys.right = false;
               break;
      case 40: this.keys.down = false;
               break;
    }
  },
  /*
   * MinigameRunner.togglePause - switch between paused and unpaused if it's
   *                              been long enough since the last toggle.
   *                              Reset the pause counter
   */
  "togglePause": function () {
    if (this.pauseCounter === 0) {
      this.pauseCounter = 10;
      this.paused = !this.paused;
      if (this.paused) {
        $("#play-pause").addClass("play-button");
      } else {
        $("#play-pause").removeClass("play-button");
      }
    }
  },
  /*
   * MinigameRunner.processEvents - process the events that have accumulated
   *                                this.keys since the last run of timer().
   *
   * NOTE: assumes that all events in keys were put there because
   *       clicks or keys are valid in the current game mode.
   */
  "processEvents": function () {
    /* process keys */
    for (key in this.keys) {
      if (this.keys[key]) {
        if (key === "space") {
          this.togglePause();
        } else if (!this.paused) {
          this.moveAvatar(key);
        }
        if (key === "left" || key === "right" ||
            key === "down" || key === "up") {
          console.log("hi");
          //deleteAnyPromptOverlay();
        }
      }
    }
  },
  /*
   * MinigameRunner.moveAvatar - based on which keys the user has pressed,
   *                             adjust the velocity of the player avatar
   *                             so that it can be moved later on
   */
  "moveAvatar": function (dir) {
    var dPos;
    switch (dir) {
      case "left":  this.player.extraVel = addPoints(this.player.extraVel,
                                        [-1 * this.hs * this.horizScale, 0]);
                    break;
      case "up":    if (this.hasGravity) {
                      if ((this.player.vel[1] >= -.005) &&
                          floatEquals(this.player.accel[1], 0)) {
                        /* prevent infinite jumping */
                        this.player.extraVel = addPoints(this.player.extraVel,
                                          [0, -1 * this.vs * this.vertScale]);
                      }
                    } else {
                      this.player.extraVel = addPoints(this.player.extraVel,
                                          [0, -1 * this.hs * this.vertScale]);
                    }
                    break;
      case "right": this.player.extraVel = addPoints(this.player.extraVel,
                                        [this.hs * this.horizScale, 0]);
                    break;
      case "down":  this.player.extraVel = addPoints(this.player.extraVel,
                                        [0, this.hs * this.vertScale]);
                    break;
    }
  },
  /*
   * MinigameRunner.timer - steps the currently running minigame forward,
   *                        unless it's paused.
   */
  "timer": function () {
    if (!this.keepRunning) return; /* timer will not be called again */
    this.pauseCounter = (this.pauseCounter > 0) ? this.pauseCounter - 1 : 0;
    this.processEvents();
    if (!this.paused) {
      this.moveAll();
      this.collideAll();
      // should be taken care of in collideAll:
      this.unmoveAny();
    }
    this.redrawAll();
    setTimeout(this.timer.bind(this), this.delay);
  },
  /* MinigameRunner.moveAll - move all GameElements, including player */
  "moveAll": function () {
    for (var i = 0; i < this.gameElements.length; i++) {
      var elem = this.gameElements[i];
      if (!elem.removed) elem.move(this);
      elem.collidedWith = {}; // reset collision variable
    } 
  },
  /* MinigameRunner.collideAll - do collisions for all GameElements */
  "collideAll": function () {
    for (var i = 0; i < this.gameElements.length; i++) {
      var elem = this.gameElements[i];
      if (!elem.removed) {
        /* collide with walls and unmove if so */
        elem.checkWalls(this);

        /* collide with other game elements */
        elem.checkElems(this);
        
        /* recheck walls to account for cases in which another elem pushed
         * it past a wall */
        elem.checkWalls(this);
      }
    }
  },
  /*
   * MinigameRunner.unmoveAny - restore the old positions of any Game Elements
   *                            which were involved in a movement-reseting
   *                            collision during the most recent timer
   *                            (i.e. have this.resetPos === true)    
   */
  "unmoveAny": function () {
    for (var i = 0; i < this.gameElements.length; i++) {
      var elem = this.gameElements[i];
      if (!elem.removed) {
        if (elem.resetX) {
          elem.pos[0] = elem.oldPos[0]; /* reset x-coordinate */
          elem.resetX = false;
        }
        if (elem.resetY) {
          elem.pos[1] = elem.oldPos[1]; /* reset y-coordinate */
          elem.resetY = false;
        }
      }
    }
  },
  /*
   * MinigameRunner.redrawAll - draw all GameElements currently in
   *                            this.gameElements
   */
  "redrawAll": function () {
    /* clear canvas */
    this.ctx.clearRect(0, 0, this.width, this.height);

    /* draw GameElements */
    for (var i = 0; i < this.gameElements.length; i++) {
      var elt = this.gameElements[i];
      elt.draw(this);
    }

    /* in mobile tap mode, draw cursor */
    if (this.mobile && this.mode === "tap" && this.lastTouch !== undefined) {
      var rad = 2;
      var cx = this.lastTouch.offsetX;
      var cy = this.lastTouch.offsetY;
      this.ctx.beginPath();
      this.ctx.fillStyle = "black";
      this.ctx.arc(cx, cy, rad, 0, 2 * Math.PI, true);
      this.ctx.fill();
    }
  },
  /*
   * MinigameRunner.next - load the next minigame in the queue.
   *                       if the queue is empty, return to index.html.
   */
  "next": function () {
    /* retrieve an object containing data about the minigame to be created */
    var nextGame = this.minigameQueue.shift();
    if (nextGame === undefined) {
      /* the queue is empty, because all minigames have been played */
      this.exit();
      return;
    }
    this.load(nextGame); /* gets question then calls load */
  },
  /*
   * MinigameRunner.grabQuestion - grabs a random question from 
   *   the server's question object, then calls load to finish the setup
   */
  "grabQuestion": function(callback) {
    $.ajax({
      "url": "/info/questions",
      "type": "get",
      "data": { /* maybe add difficulty here later */ },
      "success": function(data) {
        // question data is a JSON string of the question object
        var question = data.question;
        if (question === "") {
          console.log("error in loading question!");
        }
        else {
          qObj = question;
          // add question to top bar
          $('#runner-top-bar').html(qObj.question);
          // add answers to bottom bar
          var answerList = shuffleArray(qObj.answers);
          assert(answerList.length <= 4); /* only 4 answers or less */
          for (var i = 0; i < answerList.length; i++) {
            $('#answer' + (i+1)).html(answerList[i].answer);
          }
          // make all elements not win first
          for (var i = 0; i < 4; i++) {
            var answerObj = window.typeProperties["answer"+(i+1)];
            answerObj.collideElemSeq = 
              [elementMixins.wrong, elementMixins.roll];
          }
          // then make the right element the winner one
          for (var i = 0; i < 4; i++) {
            if (answerList[i].correct) {
              var answerObj = window.typeProperties["answer"+(i+1)];
              answerObj.collideElemSeq = 
                [elementMixins.right, elementMixins.roll];
            }
          }
          callback();
        }
      }
    });
  },
  /* MinigameRunner.win - win current game and move onto next */
  "win": function () {
    //alert("Congratulation, you won!");
    this.next();
  },
  /* MinigameRunner.lose - lose current game, so restart */
  "lose": function () {
    //alert("Better luck next time!");
    this.load(this.currGame);
  },
  /*
   * MinigameRunner.load - load a minigame from the current game data object
   */
  "load": function (data) {
    this.grabQuestion(function() {
      /* non-destructive, deep copy */
      this.currGame = $.extend(true, {}, data);

      /* reset and pause the MinigameRunner */
      this.keys = {
        "space": false,
        "left": false,
        "up": false, "right": 
        false, 
        "down": false
      };
      this.gameElements = []; /* clear any existing elements */
      this.clicks = [];
      this.paused = false;
      this.blockFurtherActions = false;
      parseMinigameData(this, data);
      this.addListeners();
      runnerLoadAnimation(this);
    }.bind(this));
  }
};
