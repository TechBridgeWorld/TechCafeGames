/*
 * GameElement.js - contains GameElement class definition and methods.
 *                  dictates how GameElements look and act.
 */


/*
 * GameElement - constructor for GameElement objects. Takes an ElementDatum
 *               object (used to store data about elements in database) and
 *               creates an interactable GameElement with the properties
 *               that it specifies.
 */
function GameElement (elementDatum, game, id) {
  this.id = id; /* unique for this minigame */
  this.type = elementDatum.type;
  this.removed = false; /* turn to true to "remove" element from game */
  this.pos = getDecimal(elementDatum.path[0], game);
  this.rad = 1 / (2 * game.rows);
  this.vel = [0, 0]; /* direction of motion along path */
  this.resetX = false;
  this.resetY = false;
  this.oldPos = this.pos;
  this.oldVel = this.vel;
  this.accel = [0, 0];
  this.extraVel = [0, 0]; /* for moving the player */
  this.collidedWith = {}; /* acts like a SET of id's (keys mean nothing) */
  this.held = false;      /* is it currently being held in tap mode? */
  this.highlighted = false;

  /* add mixins! */
  assert(elementDatum.type in window.typeProperties,
         "Invalid GameElement type: " + elementDatum.type);
  var properties = window.typeProperties[elementDatum.type];
  for (property in properties) {
    this[property] = properties[property];
  }
}

/* global physics values */
// friction is in -vel/sec
GameElement.friction = 0.001;
GameElement.gravity = 0.005;

GameElement.prototype = {
  /*
   * GameElement.draw - draw a GameElement on the given context
   */
  "draw": function (game) {
    if (!this.removed) {
      var pixels = getPixels(this.pos, game);
      var pixRad = pixelRad(game, this);

      /* draw halo if highlighted */
      if (this.highlighted) {
        var cx = pixels[0] + pixRad;
        var cy = pixels[1] + pixRad;
        game.ctx.beginPath();
        game.ctx.fillStyle = "rgba(240, 112, 0, 0.8)"; // F07000
        game.ctx.arc(cx, cy, 1.3 * pixRad, 0, 2 * Math.PI, true);
        game.ctx.fill();
      }
      
      var img = this.image;
      game.ctx.drawImage(img, pixels[0], pixels[1], game.side, game.side);
    }
  },
  /* 
   * GameElement.checkWalls - check whether the given element had hit a wall,
   *                          and bounce if it has
   */
  "checkWalls": function (game) {
    var collided = false

    var x = this.pos[0];
    var y = this.pos[1];
      
    this.resetY = false;
    this.resetX = false;
    var ballWidth = 2 * this.rad * (game.height/game.width);

    if (x <= 0 || 
        1 <= x + ballWidth) {
      collided = true

      /* bounce horizontally */
      this.vel[0] = -(this.vel[0])*game.wallBouncePercent;
      /* adjust x to be flush with the wall */
      this.pos[0] = (x <= 0) ? 0 : (1-ballWidth);
    }
    // only adjust y if it wasn't sitting on top of something,
    // this way we don't add y velocity if it is sitting on the ground,
    // and don't move it if it is already flush with the ground
    if ((y <= 0) ||
        (1 <= y + 2 * this.rad)) {
      collided = true;

      /* bounce vertically if not player (balls) */
      if (this.type !== "player")
        this.vel[1] = -(this.vel[1])*game.wallBouncePercent;
      else
        this.vel[1] = 0;
      /* adjust y to be flush with the wall */
      this.pos[1] = (y <= 0) ? 0 : (1-(2*this.rad));
    }

    return collided;
  },
  /*
   * GameElement.checkElems - check whether the given GameElement has
   *                          collided with any other GameElements, or the
   *                          player, and do collisions as necessary
   */
  "checkElems": function (game) {
    var collided = false;

    /* check other elements */
    for (var i = 0; i < game.gameElements.length; i++) {
      if (game.blockFurtherActions) return; /* if win/lose happened */
      var elem = game.gameElements[i];
      if (i != this.id && 
          !elem.removed &&
          touching(game, elem, this)) {
        collided = true;

        /* we have a collision, go thru collision list */
        for (var j = 0; j < this.collideElemSeq.length; j++) {
          // this mess calls the collide elem function for "this" elem
          ((this.collideElemSeq[j]).bind(this))(game, elem);
        }
      }
    }

    return collided;
  }
};

function removeAnyOverlay() {
  $(".answer-overlay").each(function(){
    $(this).remove();
  });
}

function timedOverlay(game, waitTime, cssClass, callback) {
    // pause player for "waitTime" milliseconds
    game.paused = true;
    // and display overlay
    $overlay = $("<div>").addClass(cssClass);
    // zoom thing for correct answer
    if (cssClass === "answer-overlay right") {
      setTimeout(function(){$overlay.addClass("zoom")},10);
    }
    $("#playing-area").append($overlay);
    setTimeout(function(){
      // remove X after waitTime is up
      $overlay.remove();
      game.paused = false;
      // do callback
      callback();
      return;
    }.bind(this), waitTime);
}

/* 
 * Methods which govern GameElement interaction and are added to GameElements
 * when they are created based on their types.
 * All methods take a reference to the main MinigameRunner object.
 */
var elementMixins = {
  /* do nothing */
  "nothing": function (game) {},
  /* fall under the influence of gravity and coast under its own momentum */
  "right": function (game, other) {
    if (other.type === "player" || other.type === "origin") {
      game.blockFurtherActions = true;
      waitTime = 1300;
      removeAnyOverlay();
      timedOverlay(game, waitTime, "answer-overlay right", function() {
        removeAnyOverlay();
        game.win()
      });
    }
  },
  "wrong": function (game, other) {
    // if it's not the player, just chill out
    if (other.type !== "player" && other.type !== "origin") {
      return;
    }
    // only show wrong screen if you already answered this question
    else {
      //this.held = false;
      //game.heldObject = undefined;
      if (!this.answered){
        this.answered = true;
        var waitTime = 500;
        // if there is already an overlay, remove it
        removeAnyOverlay();
        timedOverlay(game, waitTime, "answer-overlay wrong", function(){});
      }
    }
  },
  "physicsMove": function (game) {
    /* save old pos/vel */
    var xVel = this.vel[0];
    var yVel = this.vel[1];
    this.accel = [xVel-(this.oldVel[0]), yVel-(this.oldVel[1])];
    /* very nice for debugging, so I'll leave it here:
      console.log("type: "+ this.type + "  xVel, yVel: ", xVel*15, " ", yVel*9,
      "  xPos, yPos: ", this.pos[0]*15, this.pos[1]*9, " accel: ",
      this.accel[0]*15, this.accel[1]*9); */
    this.oldVel = [xVel, yVel];
    this.oldPos = [this.pos[0], this.pos[1]];

    /* apply friction */
    if (xVel <= 0) {
      this.vel[0] = Math.min(0, xVel + GameElement.friction);
    } else {
      this.vel[0] = Math.max(0, xVel - GameElement.friction);
    }
    if (!game.hasGravity){
      /* apply friction in y-direction only if game has no gravity */
      if (yVel <= 0) {
        this.vel[1] = Math.min(0, yVel + GameElement.friction);
      } else {
        this.vel[1] = Math.max(0, yVel - GameElement.friction);
      }
    }

    // avoid really small floating point velocities
    if (floatEquals(this.vel[0], 0)) this.vel[0] = 0;
    if (floatEquals(this.vel[1], 0)) this.vel[1] = 0;

    // check for max velocities
    if (Math.abs(this.vel[0]) > game.xVelMax)
      this.vel[0] = sign(this.vel[0])*game.xVelMax;
    if (Math.abs(this.vel[1]) > game.yVelMax)
      this.vel[1] = sign(this.vel[1])*game.yVelMax;

    /* feel gravity */
    if (game.hasGravity && this.feelsGravity && !this.held) {
      this.vel[1] += GameElement.gravity;
    }

    /* move */
    this.pos = addPoints(this.pos, this.vel);
  },

  /* move in the last specified direction, but don't maintain any momentum */
  "playerMove": function (game) {
    /* save old pos/vel */
    this.vel = addPoints(this.vel, this.extraVel);
    (elementMixins.physicsMove.bind(this))(game);
    this.extraVel = [0, 0];
  },
  /* disappear when touched by players or answers */
  "disappear": function (game, other) {
    if ((other.type === "player")||(other.type.indexOf("answer")!==-1)) {
      this.removed = true;
    }
  },
  /* kill the player or answer ball on a collision */
  "destroy": function (game, other) {
    if ((other.type === "player") ||
       (game.mode === "tap" && (other.type.indexOf("answer")!=-1))) {
      /* if other is the player */
      game.blockFurtherActions = true;
      removeAnyOverlay();
      game.lose();
    } else if (other.held) {
      game.heldObject = undefined;
      other.held = false;
    } else {
      //other.removed = true;
    }
  },
  /* become the game's heldObject */
  "pickup": function (game) {
    game.heldObject = this;
    this.held = true;
  },
  /* ball to ball collisions */
  "roll": function (game, other) {
    // check if these have collided already
    if (other.id in this.collidedWith) {
      return;
    }
    // other object must be a ball for this collision but not a cloud
    if ((!isBall(other)) || (other.type === "cloud")) {
      return;
    }
    
    /* POSITION adjust */
    // reposition balls so they aren't overlapping
    // get center points, adjusted to be in terms of game height
    var ghratio = game.width/game.height;
    var x1 = this.pos[0]*ghratio + this.rad;
    var y1 = this.pos[1] + this.rad;
    var x2 = other.pos[0]*ghratio + other.rad;
    var y2 = other.pos[1] + other.rad;
    var dx = x2-x1;
    var dy = y2-y1;

    // get distance between points, and distance to make up for
    // (curDist + distDiff = this.rad + other.rad)
    var curDist = distPoints(game, this.pos, other.pos);
    var distDiff = (this.rad + other.rad) - curDist;
    if (distDiff < .003) distDiff = 0;
    // get angle line makes between balls' centers
    var distAngle = niceAtan(dy, dx);
    // get total amounts to move each ball
    var xDiff = distDiff*Math.cos(distAngle);
    var yDiff = Math.abs(distDiff*Math.sin(distAngle));

    // add differences so that fastest ball moves back the most
    // and if one is zero, just move the other one back
    if (other.vel[0] == 0) {
      x1 += ((x1<x2) ? -xDiff : xDiff);
    } else if (this.vel[0] == 0) {
      x2 += ((x1<x2)? xDiff : -xDiff);
    } else {
      var velratio = Math.abs(this.vel[0])/
        (Math.abs(this.vel[0]) + Math.abs(other.vel[0]));
      x1 += ((x1<x2) ? -xDiff*velratio : xDiff*velratio);
      x2 += ((x1<x2) ? xDiff*(1-velratio) : -xDiff*(1-velratio));
    }
    if (other.vel[1] == 0) {
      y1 += ((y1>y2) ? yDiff : -yDiff);
    } else if (this.vel[1] == 0) {
      y2 += ((y1>y2)? -yDiff : yDiff);
    } else {
      var velratio = Math.abs(this.vel[1])/
        (Math.abs(other.vel[1])+Math.abs(this.vel[1]));
      y1 += ((y1>y2) ? yDiff*velratio : -yDiff*velratio);
      y2 += ((y1>y2) ? -yDiff*(1-velratio) : yDiff*(1-velratio));
    }

    // actually update positions
    this.pos = [(x1-this.rad)/ghratio,(y1-this.rad)];
    other.pos = [(x2-other.rad)/ghratio,(y2-other.rad)];
    
    // adjust the position based on the angle between the balls
    // not implemented, looks fine

    // set .collidedWith for future reference
    this.collidedWith[other.id] = true;
    other.collidedWith[this.id] = true;

    /* VELOCITY adjust */
    // do elastic physics equation between the balls
    // for now, give each of them the reverse velocities
    if (!movingApart(game, this, other)) {
      var oVel = other.vel;
      var decPercent = 0.7;
      other.vel = [this.vel[0]*decPercent, this.vel[1]*decPercent];
      this.vel = [oVel[0]*decPercent, oVel[1]*decPercent];
    }
  },

  /* block to ball collisions */
  "blockCollide": function(game, other) {
    // check if these have collided already
    if (other.id in this.collidedWith)
      return;
    // block to block collisions have no effect
    if (isBlock(other))
      return;

    // get center of block
    var ghratio = game.width/game.height;
    var r1 = this.rad;
    var x1 = this.pos[0]*ghratio + r1;
    var y1 = this.pos[1] + r1;
    // get center of ball
    var r2 = other.rad;
    var x2 = other.pos[0]*ghratio + r2;
    var y2 = other.pos[1] + r2;
    // differences between centers
    var dx = x2-x1;
    var dy = y2-y1;
    // get x&y locations for box edges
    var rightEdge = x1 + r1;
    var bottomEdge = y1 + r1;
    var leftEdge = x1 - r1;
    var topEdge = y1 - r1;

    // get collision string from util function
    var collisionStr = getBlockBallOverlap(x1,y1,r1,x2,y2,r2);

    // based on collision type, move ball flush with the square's edge
    var rightDist = this.rad + other.rad;
    var cdx; var cdy; var cAngle; var pi = Math.PI;
    // move right
    if (collisionStr === "right")
      x2 = x1 + rightDist;
    // move down
    else if (collisionStr === "bottom")
      y2 = y1 + rightDist;
    // move left
    else if (collisionStr === "left")
      x2 = x1 - rightDist;
    // move up
    else if (collisionStr === "top")
      y2 = y1 - rightDist;
    else {
      // CORNER CASES
      if (collisionStr === "topright") {
        cdx = x2 - rightEdge; cdy = topEdge - y2;
        cAngle = niceAtan(cdy, cdx);
        x2 = rightEdge + Math.cos(cAngle)*r2;
        y2 = topEdge - Math.sin(cAngle)*r2;
      } else if (collisionStr === "bottomright") {
        cdx = x2 - rightEdge; cdy = y2 - bottomEdge;
        cAngle = niceAtan(cdy, cdx);
        x2 = rightEdge + Math.cos(cAngle)*r2;
        y2 = bottomEdge + Math.sin(cAngle)*r2;
      } else if (collisionStr === "bottomleft") {
        cdx = leftEdge - x2; cdy = y2 - bottomEdge;
        cAngle = niceAtan(cdy, cdx);
        x2 = leftEdge - Math.cos(cAngle)*r2;
        y2 = bottomEdge + Math.sin(cAngle)*r2;
      } else { // "topleft"
        cdx = leftEdge - x2; cdy = topEdge - y2;
        cAngle = niceAtan(cdy, cdx);
        x2 = leftEdge - Math.cos(cAngle)*r2;
        y2 = topEdge - Math.sin(cAngle)*r2;
      }
    }

    // apply move (only ball moves, not block)
    other.pos = [(x2-other.rad)/ghratio,(y2-other.rad)];    

    // update velocity
    if ((collisionStr.indexOf("top") !== -1) ||
       (collisionStr.indexOf("bottom") !== -1)) {
      other.vel[1] = 0;
    }
    else if ((collisionStr.indexOf("left") !== -1) ||
        (collisionStr.indexOf("right") !== -1)) {
      other.vel[0] = 0;
    }

    // update collideWith for future reference
    this.collidedWith[other.id] = true;
    this.collidedWith[this.id] = true;
  }
};

// loads Image objects into the global window.typeProperties datastore
GameElement.preloadImages = function(onLoadFn, onProgressFn){
    var imgDataList = [];
    
    for(var type in window.typeProperties) {
        var typeData = window.typeProperties[type];
        var imgObj = typeData["image"];
        assert(imgObj instanceof Image, "invalid image for type "+type);
        
        // save image reference into list, don't start load yet
        imgDataList.push({
            "src": typeData["imgSrc"],
            "obj": imgObj
        });
    }
    
    // set the sources of all the given images (relies on aliasing to 
    // also update the images in the datastore)
    
    var loadedImageCount = 0;
    for(var i = 0; i < imgDataList.length; i++){
        var img = imgDataList[i]["obj"];
        
        img.onload = function(){
            loadedImageCount++;
            if(onProgressFn){
                onProgressFn(loadedImageCount, imgDataList.length);
            }
            // only call callback function when _everything_ is loaded
            if(loadedImageCount >= imgDataList.length){
                onLoadFn();
            }
        }
        
        // start the load
        img.src = imgDataList[i]["src"];
    }
}
