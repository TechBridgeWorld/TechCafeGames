
/* 
 * typeProperties.js - dictionary mapping type names to objects which map 
 *                     properties to values and GameElement method names to
 *                     methods defined in elementMixins
 */
window.typeProperties = {
  "player": {
    /* player will never collide with objects -- they'll collide with it */
    "collideElemSeq": [elementMixins.roll],
    "move": elementMixins.playerMove,
    "clicked": undefined, /* this should never happen */
    "feelsGravity": true,
    "imgSrc": "/images/elements/stickFigure.png",
    "image": new Image(),
    "essential": true
  },
  "origin": {
    "collideElemSeq": [elementMixins.nothing],
    "move": elementMixins.nothing,
    "clicked": elementMixins.nothing,
    "feelsGravity": false,
    "imgSrc": "/images/elements/origin.png",
    "image": new Image(),
    "essential": true
  },
  "fire": {
    "collideElemSeq": [elementMixins.destroy, elementMixins.blockCollide],
    "move": elementMixins.nothing,
    "clicked": elementMixins.nothing,
    "feelsGravity": false,
    "imgSrc": "/images/elements/fireBlock.png",
    "image": new Image()
  },
  "ball": {
    "collideElemSeq": [elementMixins.roll],
    "move": elementMixins.physicsMove,
    "clicked": elementMixins.pickup,
    "feelsGravity": true,
    "imgSrc": "/images/elements/ball.png",
    "image": new Image()
  },
  "cloud": {
    "collideElemSeq": [elementMixins.disappear],
    "move": elementMixins.physicsMove,
    "clicked": elementMixins.disappear,
    "feelsGravity": false,
    "imgSrc": "/images/elements/Cloud.png",
    "image": new Image()
  },
  "answer1": {
    "collideElemSeq": [elementMixins.wrong, elementMixins.roll],
    "move": elementMixins.physicsMove,
    "clicked": elementMixins.pickup,
    "feelsGravity": true,
    "imgSrc": "/images/elements/ballRed.png",
    "image": new Image(),
    "essential": true,
    "answered": false
  },
  "answer2": {
    "collideElemSeq": [elementMixins.wrong, elementMixins.roll],
    "move": elementMixins.physicsMove,
    "clicked": elementMixins.pickup,
    "feelsGravity": true,
    "imgSrc": "/images/elements/ballYellow.png",
    "image": new Image(),
    "essential": true,
    "answered": false
  },
  "answer3": {
    "collideElemSeq": [elementMixins.wrong, elementMixins.roll],
    "move": elementMixins.physicsMove,
    "clicked": elementMixins.pickup,
    "feelsGravity": true,
    "imgSrc": "/images/elements/ballGreen.png",
    "image": new Image(),
    "essential": true,
    "answered": false
  },
  "answer4": {
    "collideElemSeq": [elementMixins.wrong, elementMixins.roll],
    "move": elementMixins.physicsMove,
    "clicked": elementMixins.pickup,
    "feelsGravity": true,
    "imgSrc": "/images/elements/ballBlue.png",
    "image": new Image(),
    "essential": true,
    "answered": false
  },
  "stone": {
    "collideElemSeq": [elementMixins.blockCollide],
    "move": elementMixins.nothing,
    "clicked": elementMixins.nothing,
    "feelsGravity": false,
    "imgSrc": "/images/elements/stone.png",
    "image": new Image()
  }
};
