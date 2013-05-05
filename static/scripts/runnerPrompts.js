/*
 * runnerPrompts.js - adds animations and prompts within minigame runner
 */

/*
 * promptKeys - fill center screen with image of keys. activated at beginning
 *              of level and whenever user uses mouse.
 */
function promptOverlay (runner, name, ms, callback) {
  /* pause game and don't remember whether it started paused */
  runner.paused = true;

  /* display key overlay, then ease it out */
  var overlay = $("<div>").addClass(name + "-overlay");
  $("#playing-area").append(overlay);
  overlay.fadeOut(ms, function () {
    runner.paused = false;
    if (callback !== undefined) callback();
  });
}

/* highlight the ball/answer pair corresponding to the given number */
function highlightAnswer (runner, num, delay, callback) {
  var type = "answer" + num;
  var ball = getElemByType(runner, type);
  var ans = $("#" + type);

  ball.highlighted = true;
  ans.addClass("highlight");
  
  setTimeout(function () {
    ball.highlighted = false;
    ans.removeClass("highlight");
    if (callback !== undefined) callback();
  }, delay); 
}

/* highlight one ball/answer pair and call highlightAnswers for the next */
function highlightAnswers (runner, num, delay, callback) {

  if (num > 4) {
    /* num is greater than number of answer objects, so we're done */
    callback();
  } else {
    highlightAnswer(runner, num, delay, function () {
      highlightAnswers(runner, num + 1, delay, callback);
    });
  }
}

/*
 * runnerLoadAnimation - flash answer/ball pairs in series to reinforce
 *                       association
 */
function runnerLoadAnimation (runner) {
  var gravOverlay = (runner.hasGravity) ? "grav" : "grav-off";

  runner.paused = true;
  promptOverlay(runner, runner.mode, 1000, function () {
    promptOverlay(runner, gravOverlay, 1000, function () {
      // I like to unpause after the control scheme
      runner.paused = false;
      highlightAnswers(runner, 1, 500, function () {
      });
    });
  });
}

