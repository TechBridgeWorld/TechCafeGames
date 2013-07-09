/*
 * runnerPrompts.js - adds animations and prompts within minigame runner
 */

/*
 * promptKeys - fill center screen with image of keys. activated at beginning
 *              of level and whenever user uses mouse.
 */
function promptOverlay (runner, callback, fade) {
  /* pause game and don't remember whether it started paused */
  runner.paused = true;

  // controls overlay
  var overlayControls = $("<div>").addClass(runner.mode + "-overlay");
  // gravity overlay
  var gravOverlay = (runner.hasGravity) ? "grav" : "grav-off";
  var overlayGrav = $("<div>").addClass(gravOverlay + "-overlay");
  // overall overlay
  var promptOverlay = $("<div>").addClass("overlay").attr("id", "prompt");
  promptOverlay.append(overlayControls);
  promptOverlay.append(overlayGrav);
  $("#playing-area").append(promptOverlay);
  // move tap ball thingy
  if (runner.mode === "tap") {
    setTimeout(function(){overlayControls.addClass("startMove")},50);
  }
  var moveDelay = 2000;
  promptOverlay.click(function () {
    promptOverlay.remove();
    runner.paused = false;
    if (callback !== undefined) callback();
  });
  var fadeOutTime = 1000;
  if (fade === true) {
    promptOverlay.fadeOut(fadeOutTime, function () {
      promptOverlay.remove();
      runner.paused = false;
      if (callback !== undefined) callback();
    });
  }
  // otherwise, never display prompt longer than 2 seconds
  var longestDisplayTime = 1700;
  var shortFadeOutTime = 300;
  setTimeout(function() {
    promptOverlay.fadeOut(shortFadeOutTime, function () {
      promptOverlay.remove();
      runner.paused = false;
      if (callback !== undefined) callback();
    });
  }, longestDisplayTime);
}

function deleteAnyPromptOverlay() {
  console.log("removing");
  if ($("#prompt").length > 0) {
    $("#prompt").remove();
  }
  return;
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
  promptOverlay(runner, function () {
    // I like to unpause after the control scheme
    runner.paused = false;
    highlightAnswers(runner, 1, 500, function () {
    });
  });
}

