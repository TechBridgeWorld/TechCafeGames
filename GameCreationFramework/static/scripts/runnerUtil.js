// is it a ball?
function isBall(elem) {
  return  ((elem.type === "ball") || (elem.type === "player") ||
          (elem.type.indexOf("answer") !== -1) ||
          (elem.type === "cloud") || (elem.type === "origin"));
}

// is it a block?
function isBlock(elem) {
  return ((elem.type === "stone") || (elem.type === "fire"));
}

/* 
 * getDecimal - translate pixel-coordinates to coordinates as decimal
 *              multiples of width and height
 */
function getDecimal (pixels, game) {
  var x = pixels[0] / game.cols;
  var y = pixels[1] / game.rows;

  return [x, y];
}

/* addPoints - add two points (2-element lists) together */
function addPoints (p1, p2) {
  return [p1[0] + p2[0], p1[1] + p2[1]];
}

/* multPoint - multiply a point (2-element list) by a constant */
function multPoint (c, p) {
  return [c * p[0], c * p[1]];
}

/* 
 * distPoints - determine the distance between two points, adjusted to be in
 * in terms of the units of game height, not width
 */
function distPoints (game, p1, p2) {
  var xDiff = p1[0] - p2[0];
  var yDiff = p1[1] - p2[1];
  var adjXDiff = xDiff * game.width / game.height;
  return Math.sqrt(Math.pow(adjXDiff, 2) + Math.pow(yDiff, 2));
}

/* getPixels - translate fractions of width, height to pixels */
function getPixels (pos, game) {
  var xFrac = pos[0];
  var yFrac = pos[1];
  var x = xFrac * game.width;
  var y = yFrac * game.height;

  return [x, y];
}

/* getCell - translate pixel x and y into cell row and col */
function getCell (p, width, height, rows, cols) {
  // +1 is for weird pixel boundaries
  var x = p[0] + 1;
  var y = p[1] + 1;
  var row = Math.floor(cols * x / width);
  var col = Math.floor(rows * y / height);

  return [row, col];
}

// returns the string of which type of overlap a ball has with a block
// block is centered at (x1,y1) with side length 2*r1
// ball is centered at (x2, y2) with radius r2
// ASSUMES x and y points are scaled to be equally spaced domains
function getBlockBallOverlap(x1, y1, r1, x2, y2, r2) { 
  // differences between centers
  var dx = x2-x1;
  var dy = y2-y1;
  // get angle line makes between balls' centers
  var pi = Math.PI;
  var distAngle = niceAtan(dy, dx);
  // adjust arctangent if ball is in 3rd or 4th quadrant
  // relative to the square as the origin in a 2D plane
  if (dx < 0) distAngle += pi;

  // now check if it's in the square collision zone
  var minDist = r1 + r2;
  // check outer square boundary that is (minDist x minDist) big
  if ((Math.abs(dx) > minDist) || (Math.abs(dy) > minDist))
    return "no collision";

  // EDGE CASES: ball is within a border of r2 from the box

  // get x&y locations for box edges
  var rightEdge = x1 + r1;
  var bottomEdge = y1 + r1;
  var leftEdge = x1 - r1;
  var topEdge = y1 - r1;

  // construct string of where ball is in relation to box
  var locationStr = "";
  // ball is to right of box
  if ((-pi/4 < distAngle) && (distAngle < pi/4)) {
    if (y2 < topEdge) locationStr = "topright";
    else if (y2 > bottomEdge) locationStr = "bottomright";
    else return "right";
  }
  // ball is below box
  else if ((pi/4 <= distAngle) && (distAngle <= 3*pi/4)) {
    if (x2 > rightEdge) locationStr = "bottomright";
    else if (x2 < leftEdge) locationStr = "bottomleft";
    else return "bottom"
  }
  // ball is left of box
  else if ((3*pi/4 < distAngle) && (distAngle < 5*pi/4)) {
    if (y2 > bottomEdge) locationStr = "bottomleft";
    else if (y2 < topEdge) locationStr = "topleft";
    else return "left";
  }
  // ball is above box
  else {
    if (x2 < leftEdge) locationStr = "topleft";
    else if (x2 > rightEdge) locationStr = "topright";
    else return "top";
  }

  // CORNER CASES: ball may be within a circular edge from a box corner

  var cdx; var cdy;
  if (locationStr === "topright") {
    cdx = x2 - rightEdge; cdy = y2 - topEdge;
  } else if (locationStr === "bottomright") {
    cdx = x2 - rightEdge; cdy = y2 - bottomEdge;
  } else if (locationStr === "bottomleft") {
    cdx = x2 - leftEdge; cdy = y2 - bottomEdge;
  } else {
    cdx = x2 - leftEdge; cdy = y2 - topEdge;
  }
  // if the ball is greater than a radius away from a corner,
  // it's not touching the box
  var distFrmCrner = Math.sqrt(Math.pow(cdx, 2) + Math.pow(cdy, 2));
  if (distFrmCrner > r2)
    return "no collision";
  else
    return locationStr;
}

/*
 * touching - determine whether two objects with pos and rad properties
 *            are touching.
 */
function touching (game, obj1, obj2) {
  var ghratio = game.width/game.height;

  // BALL & MOUSE
  if (obj1.type === "mouse" && isBall(obj2)) {
    var toCenter2 = [obj2.rad / ghratio, obj2.rad];
    var center2 = addPoints(obj2.pos, toCenter2);
    var dist = distPoints(game, obj1.pos, center2);
    return dist < obj2.rad;
  }

  // BALL & BALL collision check
  if (isBall(obj1) && isBall(obj2)) {
    var dist = distPoints(game, obj1.pos, obj2.pos);
    var oldDist = distPoints(game, obj1.pos, obj2.oldPos);
    var minSep = obj1.rad + obj2.rad;
    return (dist < minSep) || (oldDist < minSep);
  }
  // BALL & BLOCK collision check
  else if ((isBall(obj1) && isBlock(obj2)) ||
           (isBlock(obj1) && isBall(obj2))) {
    // get center of block
    var r1 = obj1.rad;
    var x1 = obj1.pos[0]*ghratio + r1;
    var y1 = obj1.pos[1] + r1;
    // get center of ball
    var r2 = obj2.rad;
    var x2 = obj2.pos[0]*ghratio + r2;
    var y2 = obj2.pos[1] + r2;
    // block has to be first parameters in getBlockBallOverlap
    if (isBlock(obj1)) 
      locationStr = getBlockBallOverlap(x1, y1, r1, x2, y2, r2);
    else
      locationStr = getBlockBallOverlap(x2, y2, r2, x1, y1, r1);
    return !(locationStr === "no collision");
  }
  // BLOCK & BLOCK never collide because blocks don't move
  else
    return false;
}

function floatEquals(num1, num2) {
  var threshold = .000001;
  return (Math.abs(num1 - num2) < threshold);
}

function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

function niceAtan(dy, dx) {
  var xthreshold = 0.00003;
  var angle;
  if (Math.abs(dx) < xthreshold) 
    angle = sign(dy)*(Math.PI/2);
  else 
    angle = (Math.atan(dy/dx));
  return angle;
}

function pageToOffset(runner, touches) {
  var offsets = runner.canvas.offset();
  var touch = {
    "offsetX": touches[0].pageX - offsets.left,
    "offsetY": touches[0].pageY - offsets.top,
  };
  return touch;
}

function movingApart(runner, obj1, obj2) {
  var currDist = distPoints(runner, obj1.pos, obj2.pos);
  var nextPos1 = addPoints(obj1.pos, obj1.vel);
  var nextPos2 = addPoints(obj2.pos, obj2.vel);
  var nextDist = distPoints(runner, nextPos1, nextPos2);

  return nextDist > currDist;
}

/* get a given object's radius in pixels */
function pixelRad(runner, obj) {
  return runner.height * obj.rad;
}

/* given a runner object and a type, return the element that has that type */
function getElemByType (runner, type) {
  for (var i = 0; i < runner.gameElements.length; i++) {
    var elem = runner.gameElements[i];
    if (elem.type === type) {
      return elem;
    }
  }

  /* no element found with specified type */
  return undefined;
}

// SHUFFLES an array!
// taken from: http://sedition.com/perl/javascript-fy.html
// uses the "fisherYates" algorithm
function shuffleArray( myArray ) {
  var i = myArray.length, j, tempi, tempj;
  if ( i === 0 ) return false;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     tempi = myArray[i];
     tempj = myArray[j];
     myArray[i] = tempj;
     myArray[j] = tempi;
   }
  return myArray;
}
