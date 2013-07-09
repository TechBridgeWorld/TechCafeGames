/*
 * serialization.js - contains functions/objects for moving information
 *                    between views and for storing it in the database
 */


/*
 * MinigameData - constructor. serialize the state of an editor manager into
 *                an object that can be passed to the runner.
 */
function MinigameData (editor) {
  /* determine game mode */
  var clickSelected = $("button.click-icon").hasClass("selected");
  this.mode = (clickSelected) ? "tap" : "directional";

  // determine if gravity is on/off
  var gravitySelected = $("button.gravity-icon").hasClass("selected");
  this.hasGravity = gravitySelected;

  /* gather data about all GameElements that game will contain */
  this.elementData = [];
  for (var i = 0; i < editor.editorElements.length; i++) {
    var canvasElem = editor.editorElements[i];
    var elemDatum = new ElementDatum(canvasElem, editor, this.mode);
    this.elementData.push(elemDatum);
  }
}

/*
 * ElemDatum - constructor. takes information from a CanvasElement object.
 *             takes dimensions from the EditorManager object
 */
function ElementDatum (canvasElem, editor, mode) {
  var coords = [canvasElem.elemX, canvasElem.elemY];
  var cell = getCell(coords, editor.canvas.width, editor.canvas.height,
                             editor.grid.numRows, editor.grid.numCols);
  this.path = [cell];
  var type = canvasElem.libraryEntry.elementType;
  if (type === "origin" && mode === "directional") {
    this.type = "player";
  } else {
    this.type = type;
  }
}
  
/*
 * MinigameRunner.parseMinigameData - load a document from the minigames
 *                                    collection into the MinigameRunner
 */
function parseMinigameData (runner, data) {
    /* set game mode, gravity, origin */
    assert(data.mode === "directional" || data.mode === "tap",
           "Invalid mode in MinigameData object.");
    runner.mode = data.mode;
    if (runner.mobile) {
      var displayVal = (runner.mode === "tap") ? "none" : "block";
      $("#mobile-overlay-wrapper").css("display", displayVal);
    }
    // buggity bug where "false" is true...
    runner.hasGravity = (data.hasGravity && (data.hasGravity !== "false"));

    /* create game elements */
    for (var i = 0; i < data.elementData.length; i++) {
      var elementDatum = data.elementData[i];
      var element = new GameElement(elementDatum, runner, i);
      if (elementDatum.type === "player" && data.mode === "directional") {
        /* in directional mode, keep a special reference to the player */
        runner.player = element;
      }
      runner.gameElements.push(element);
    }
}
