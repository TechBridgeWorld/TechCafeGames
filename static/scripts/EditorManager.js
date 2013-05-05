/** object meant to handle the editing interface by managing edits and new 
 * GameElements
 * 
 **/

function EditorManager(initMinigameData,numCellRows,numCellCols,minigameId){
    this.canvas = $("#editor-canvas")[0];
    var ctx = this.canvas.getContext('2d');
    
    this.grid = new Grid(this.canvas, numCellRows, numCellCols);
    this.showGridBaselines = true;
    
    // initialize buttons and action stack (undo/redo capability)
    this.$undoButton = $("#editor-options").find("button.undo-icon");
    this.$redoButton = $("#editor-options").find("button.redo-icon");
    this.$gridButton = $("#editor-options").find("button.grid-icon");
    this.$saveButton = $("#editor-options").find("button.save-icon");
    this.actionStackManager = new ActionStack();
    
    if (minigameId !== undefined) {
        this.minigameId = minigameId;
    }
    else if(typeof(initMinigameData) === typeof({}) && 
       initMinigameData['_id'] !== undefined)
    {
        this.minigameId = initMinigameData['_id'];
        this.$saveButton.addClass("getGameCode");
    }
    else{
        this.minigameId = undefined;
    }

    // MAKE SURE THEY CAN'T SAVE OVER TUTORIAL LEVELS!
    var tutorialIds = {
    "51800d7eba85bf4174000008": 0, // the values are dummy
    "5180078fba85bf4174000001": 1, // all we need are the keys
    "51800bd9ba85bf4174000006": 2, // 
    "51800c81ba85bf4174000007": 3, // atop clouds
    "51800e3aba85bf4174000009": 4, // secret wall
    "518000f86c5caf3c73000005": 5, // block maze
    "51801579ba85bf417400000b": 6, // fire tunnel
    "5180174aba85bf417400000f": 7 // challenge
    };
    // by setting minigameId back to undefined, 
    // when they save, it will create a new game and not
    // overwrite the tutorial
    if (this.minigameId in tutorialIds)
        this.minigameId = undefined;

    console.log(this.minigameId);
    
    this.libraryManager = new LibraryManager(this.canvas, 
                            // callback function to draw highlighted grid cells when dragging from library
                             function(draggedPreset, mouseX, mouseY){
                                this.redrawAll(mouseX, mouseY);
                                this.grid.highlightWrappingGridCells(ctx, mouseX, mouseY, 
                                                                     draggedPreset.drawWidth,
                                                                     draggedPreset.drawHeight,
                                                                     true);
                             }.bind(this),
                             this._handleDroppedLibItem.bind(this)
                          );

    // add each library preset to the element library
    for(var typeName in window.typeProperties){
        this.addLibraryPreset(typeName);
    }

    // initialize the list of the CanvasElements using an input minigame
    this.editorElements = this._initCanvasElements(initMinigameData);
    
    // initialize toggle buttons
    if ((initMinigameData.hasGravity) && 
        (initMinigameData.hasGravity !== "false"))
        $("button.gravity-icon").addClass("selected");
    else
        $("button.gravity-icon").removeClass("selected");
        
    if (initMinigameData.mode === "directional") {
        $("button.keys-icon").addClass("selected");
        $("button.click-icon").removeClass("selected");
    } else {
        $("button.keys-icon").removeClass("selected");
        $("button.click-icon").addClass("selected");
    }

    // init helpers for dragging
    this._currentDraggedElem = null;
    this._currentDragIndex = null;
    this._currentDragStartTime = null;
    this._draggedElemOriginalX = null;
    this._draggedElemOriginalY = null;
    this._dragOffsetX = null;
    this._dragOffsetY = null;
    
    var $canvas = $(this.canvas);
    
    /** mouse move handler **/
    $canvas.on("mousemove", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        this._cursorMovementHandler.call(this, ev, ev.pageX, ev.pageY);
    }.bind(this));
    
    /** mouse click handler **/
    $canvas.on("mousedown", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        this._cursorDownHandler.call(this, ev, ev.pageX, ev.pageY);
    }.bind(this));
    
    /** mouse release handler **/
    $canvas.on("mouseup", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        
        this._cursorUpHandler.call(this, ev, ev.pageX, ev.pageY);
    }.bind(this));
    
    /* this is kind of tricky, so pay attention:
     * even though the mouseup and touchend handlers take care of the mouse 
     * release functionality already, a click event is fired immediately after
     * the mouseup/touchend events fire. So, in order for the event propagation
     * stopping in these mouseup/touchend events to also apply to any parent's 
     * click events (such as the body's popup-clearing), we have this
     * dummy handler that does nothing but capture the extra click event 
     * trigger and prevents it from going any higher, allowing the canvas
     * handlers to actually be able to do their own thing.
     * By doing this, we can do things like preventing the popups that are
     * created in cursor up handlers from immediately getting deleted by the
     * second extraneous click triggering. */
    $canvas.on("click", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
    }.bind(this));
    
    $canvas.on("touchstart", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var touches = ev.originalEvent.targetTouches;
        if(touches.length !== 1){
            return;
        }
        var pageX = touches[0].pageX;
        var pageY = touches[0].pageY;
        this._cursorDownHandler.call(this, ev, pageX, pageY);
    }.bind(this));
    
    $canvas.on("touchmove", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var touches = ev.originalEvent.targetTouches;
        if(touches.length !== 1){
            return;
        }
        var pageX = touches[0].pageX;
        var pageY = touches[0].pageY;
        this._cursorMovementHandler.call(this, ev, pageX, pageY);
    }.bind(this));
    
    $canvas.on("touchend", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var touches = ev.originalEvent.targetTouches;
        var removedTouches = ev.originalEvent.changedTouches;
        if(touches.length !== 0){
            return;
        }
        var pageX = removedTouches[0].pageX;
        var pageY = removedTouches[0].pageY;
        this._cursorUpHandler.call(this, ev, pageX, pageY);
    }.bind(this));
    
    /** undo button handler **/
    this.$undoButton.click(function(ev){
        if(this.actionStackManager.canUndo === false){
            //pass
        }
        else if(this._currentDraggedElem !== null){
            // reset position of currently dragged item without affecting action
            // stack (to catch the case where user mouse-ups off of the canvas
            // without dropping an item)
            this.resetCurrDragElem();
        }
        else{
            this.editorElements = this.actionStackManager
                                      .goBackward(this.editorElements);
            this.$saveButton.removeClass("getGameCode");
        }
        this.redrawAll();
    }.bind(this));
    
    
    /** redo button handler **/
    this.$redoButton.click(function(ev){
        if(this.actionStackManager.canRedo === false){
            //pass
        }
        else if(this._currentDraggedElem !== null){
            // reset position of currently dragged item without affecting action
            // stack (to catch the case where user mouse-ups off of the canvas
            // without dropping an item)
            this.resetCurrDragElem();
        }
        else{
            this.$saveButton.removeClass("getGameCode");
            this.editorElements = this.actionStackManager
                                      .goForward(this.editorElements);
        }
        
        this.redrawAll();
    }.bind(this));
    
    // toggle gridlines
    this.$gridButton.click(function(ev){
        this.showGridBaselines = !(this.showGridBaselines);
        if(this.showGridBaselines){
            this.$gridButton.addClass('selected');
        }
        else{
            this.$gridButton.removeClass('selected');
        }
        this.redrawAll();
    }.bind(this));
    this.$gridButton.addClass('selected');
    
    // button for saving
    this.$saveButton.click(function(ev){
        if (this.$saveButton.hasClass("getGameCode")) {
            var codeString = "YOUR GAME CODE:</br>" + 
                             getshortid(this.minigameId);
            promptMessage(codeString);
        }
        // no user logged in, prompt the login
        else if (curUsername === "default") {
            // the callback makes sure it actually saves
            promptLogin("LOG IN TO SAVE", function() {
                this.save(function(){
                    // you can get the game code only after saving
                    this.$saveButton.addClass("getGameCode");
                }.bind(this));
            }.bind(this));
            return;
        }
        // check that we've actually made changes
        else if(this.actionStackManager.numActions > 0){
            this.save(function(){
                // you can get the game code only after saving
                this.$saveButton.addClass("getGameCode");
            }.bind(this));
        }
    }.bind(this));
    
    // when clicking on anything besides the canvas, clear the popups 
    // (popup clearing on-canvas is taken care of by the cursor up handlers)
    this._bodyClickFn = function(ev){
        this.clearPopups();
    }.bind(this);
    $("body").click(this._bodyClickFn);
    $("body").on("touchstart", this._bodyClickFn);
   
    this.redrawAll();
}

// takes minigameData and initializes the canvas elements accordingly
EditorManager.prototype._initCanvasElements = function (minigameData) {
    var canvasElements = [];

    for (var i = 0; i < minigameData.elementData.length; i++) {
        var minigameElem = minigameData.elementData[i];
        var libPresetObj = this.libraryManager.presets[minigameElem.type];
        /*** X and Y are FLIPPED here..! ***/
        var y = minigameElem.path[0][0];
        var x = minigameElem.path[0][1];
        var c = this.grid.cellCoordsToXy(x,y);
        var newCanvasElem = new CanvasElement(libPresetObj, c.x, c.y);
        canvasElements.push(newCanvasElem);
    }

    return canvasElements;
};

// call this whenever the editor is exited in order to unbind information
EditorManager.prototype.destroy = function(){
    $("body").off("click", this._bodyClickFn);
    $(this.canvas).off();
    this.$undoButton.off();
    this.$redoButton.off();
    this.$gridButton.off();
    this.$saveButton.off();
    
    // remove events on the gravity button because Erik didn't do it in init.js
    $("button.gravity-icon").off();
};

EditorManager.prototype._cursorMovementHandler = function (ev, pageX, pageY){
    var mouseCoords = this.pageToCanvasCoords(pageX, pageY);
    var mouseX = mouseCoords.x;
    var mouseY = mouseCoords.y;
    
    if(this._currentDraggedElem !== null){
        this._currentDraggedElem.elemX = mouseX - this._dragOffsetX;
        this._currentDraggedElem.elemY = mouseY - this._dragOffsetY;
    }
    this.redrawAll(mouseX, mouseY);
}

EditorManager.prototype._cursorDownHandler = function (ev, pageX, pageY){
    var mouseCoords = this.pageToCanvasCoords(pageX, pageY);
    var mouseX = mouseCoords.x;
    var mouseY = mouseCoords.y;
    
    var selectedData = this.findSelectionData(mouseX, mouseY);
    
    if(this._currentDraggedElem === null && selectedData.length > 0){
        // only pick last element to drag
        var selection = selectedData[selectedData.length-1];
        
        this._currentDragIndex = selection.index;
        this._currentDraggedElem = selection.elem;
        
        this._currentDragStartTime = new Date();
        
        this._dragOffsetX = mouseX - this._currentDraggedElem.elemX;
        this._dragOffsetY = mouseY - this._currentDraggedElem.elemY;
        this._draggedElemOriginalX = this._currentDraggedElem.elemX;
        this._draggedElemOriginalY = this._currentDraggedElem.elemY;
    }
    
    this.redrawAll(mouseX, mouseY);
}

EditorManager.prototype.clearPopups = function(){
    $(".elem-options-popup").remove();
    this.redrawAll();
}

/** called when an element that is actually drawn inside the canvas has been
 * clicked **/
EditorManager.prototype._onCanvasElementSelect = function(clickPageX, clickPageY, 
                                                         canvasElem, elemIndex)
{
    this.clearPopups();
    
    var $newPopup = $("<div>").addClass("elem-options-popup");
    var $deleteButton = $("<button>").addClass("delete-tiny-icon light-button")
                                     .appendTo($newPopup);
    
    $("body").append($newPopup);
    
    $newPopup.offset({"left": clickPageX, "top": clickPageY});
    
    $newPopup.click(function(ev){
        ev.stopPropagation();
    });   
    
    $newPopup.on("touchstart", function(ev){
        ev.stopPropagation();
    });
    
    if(canvasElem.libraryEntry.essential === true){
        $deleteButton.addClass("unusable");
    }
    else{
        var deleteCanvasElemFn = function(ev){
            ev.stopPropagation();
            this.clearPopups();
            var newDeletionAction = new DeleteElemAction(canvasElem, elemIndex);
            this.actionStackManager.addAction(newDeletionAction);
            this.editorElements = this.actionStackManager
                                      .goForward(this.editorElements);
            this.$saveButton.removeClass("getGameCode");
            this.redrawAll();
        }.bind(this);
        
        $deleteButton.click(deleteCanvasElemFn);
        $deleteButton.on("touchstart", deleteCanvasElemFn);
    }
                              
    this.redrawAll();
}

EditorManager.prototype._cursorUpHandler = function(ev, pageX, pageY){
    this.clearPopups();
    
    var mouseCoords = this.pageToCanvasCoords(pageX, pageY);
    var mouseX = mouseCoords.x;
    var mouseY = mouseCoords.y;
    // move dropped item back to the end of the drawing stack and updates 
    // the action stack
    if(this._currentDraggedElem !== null){
        // determine if user actually meant to just click the element 
        // instead of dragging
        var minDragDelta = 5;
        var minTimeDelta = 500;
        var currElem = this._currentDraggedElem;
        var origX = this._draggedElemOriginalX;
        var origY = this._draggedElemOriginalY;
        var startTime = this._currentDragStartTime;
        var timeDelta = (new Date()) - startTime;
        
        // if did not move enough, reset elem and trigger click
        if(Math.abs(currElem.elemX - origX) < minDragDelta &&
           Math.abs(currElem.elemY - origY) < minDragDelta &&
           timeDelta < minTimeDelta)
        {
            currElem.elemX = origX;
            currElem.elemY = origY;
            this._onCanvasElementSelect(pageX, pageY, this._currentDraggedElem, 
                                        this._currentDragIndex);
                                        
            ev.stopImmediatePropagation();
        }
        // if this is the end of a drag-n-drop
        else{
            // snap element to grid
            var snappedXy = this.grid.xySnapToGrid(mouseX, mouseY);
            currElem.elemX = snappedXy.x;
            currElem.elemY = snappedXy.y;       
            
            var newMoveAction = new MoveElemAction(currElem,
                                                   this._currentDragIndex,
                                                   origX, origY,
                                                   currElem.elemX,
                                                   currElem.elemY);
            
            this.actionStackManager.addAction(newMoveAction);
            this.editorElements = this.actionStackManager
                                      .goForward(this.editorElements);
            this.$saveButton.removeClass("getGameCode");
        }
    }
    
    this.clearDragHelpers();
    this.redrawAll(mouseX, mouseY);
}

/** utility function to grab canvas-relative mouse coordinates from absolute
    page coordinates
**/
EditorManager.prototype.pageToCanvasCoords = function(pageX, pageY){
    var canvasOffsets = $(this.canvas).offset();
    var canvasX = pageX - canvasOffsets.left;
    var canvasY = pageY - canvasOffsets.top;
    return {"x": canvasX, "y": canvasY};
}

/** moves the currently dragged element back to its original position **/
EditorManager.prototype.resetCurrDragElem = function(){
    if (this._currentDraggedElem === null){
        console.log("no dragged element to reset");
        return;
    }
    
    var currDragElem = this._currentDraggedElem;
    currDragElem.elemX = this._draggedElemOriginalX;
    currDragElem.elemY = this._draggedElemOriginalY;
    
    this.clearDragHelpers();
}

// unsets all helper attributes used for drag management
EditorManager.prototype.clearDragHelpers = function(){
    this._currentDraggedElem = null;
    this._currentDragIndex = null;
    this._currentDragStartTime = null;
    this._dragOffsetX = null;
    this._dragOffsetY = null;
    this._draggedElemOriginalX = null;
    this._draggedElemOriginalY = null;
}

/** returns a list of all elements that have the given mouse coords in their
 * bounds in the form of 
 * {"elem": the actual element, 
 *  "index": the index of the element in the element list}
 **/
EditorManager.prototype.findSelectionData = function(mouseX, mouseY){
    var outputList = [];
    for(var i=0; i < this.editorElements.length; i++){
        var editorElem = this.editorElements[i];
        if(editorElem.coordsInElem(mouseX, mouseY)){
            outputList.push({'elem': editorElem,
                             'index': i});
        }
    }
    return outputList;
}

EditorManager.prototype.redrawAll = function(mouseX, mouseY){
    var $canvas = $(this.canvas);
    var ctx = this.canvas.getContext('2d');
    // unset everything on the canvas
    $canvas.removeClass("clickable").removeClass("movable");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // first draw the normal grid
    if(this.showGridBaselines){
        this.grid.drawBaseGrid(ctx);
    }
    
    // then draw the highlighted cell
    if(this._currentDraggedElem !== null && mouseX !== null && mouseY !== null){
        var currElem = this._currentDraggedElem;
        // highlight current cell mouse is over
        var elemLeft = mouseX,
            elemTop = mouseY,
            elemWidth = currElem.width,
            elemHeight = currElem.height;
        this.grid.highlightWrappingGridCells(ctx, elemLeft, elemTop,
                                             elemWidth, elemHeight, true);
    }
   
    // draw each image
    for(var i = 0; i < this.editorElements.length; i++){
        var canvasElem = this.editorElements[i];
        
        // defer drawing current dragged elem to end of iterations
        if(canvasElem === this._currentDraggedElem){
            continue;
        }
        // highlight elements when hovered 
        // (but only when not currently dragging)
        else if(mouseX !== undefined && mouseY !== undefined &&
                this._currentDraggedElem === null && 
                canvasElem.coordsInElem(mouseX, mouseY))
        {
            ctx.save();
            // give image a white background so that transparent image looks
            // like its glowing without other parts of canvas leaking through
            ctx.fillStyle = "white";
            ctx.fillRect(canvasElem.elemX, canvasElem.elemY, 
                         canvasElem.width, canvasElem.height);
            
            ctx.globalAlpha = 0.7;
            canvasElem.drawTo(ctx);
            ctx.restore();
            $canvas.addClass("clickable");
        }
        // draw unselected elements normally
        else{
            canvasElem.drawTo(ctx);
        }
    }
    
    // draw the currently dragged element last so that it appears at top of 
    // drawing stack
    if(this._currentDraggedElem !== null){
        $canvas.addClass("movable");
        ctx.save();
        // draw a shadow
        ctx.shadowColor = "#777";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        this._currentDraggedElem.drawTo(ctx);
        ctx.restore();
    }
    
    // update button display
    if(this.actionStackManager.canUndo === true){
        this.$undoButton.removeClass("unusable");
    }
    else{
        this.$undoButton.addClass("unusable");
    }
    
    if(this.actionStackManager.canRedo === true){
        this.$redoButton.removeClass("unusable");
    }
    else{
        this.$redoButton.addClass("unusable");
    }
    
    if(this.actionStackManager.numActions > 0){
        this.$saveButton.removeClass("unusable");
    }
    else{
        this.$saveButton.addClass("unusable");
    }
}

/* function called whenever a library preset is dropped from the sidebar onto
 * the canvas
 *
 * takes the dropped LibraryPresetItem, the drop target canvas, and the drop
 * coordinates, relative to the canvas
 *
 * current placeholder behavior: draws the library item on the canvas
 * TODO: create a GameElement from the LibraryPreset and add to EditorManager's
 *       storage
 */
EditorManager.prototype._handleDroppedLibItem = function(droppedItem, canvas, 
                                                         canvasDropX, canvasDropY)
{
    var ctx = canvas.getContext('2d');
    var snapXy = this.grid.xySnapToGrid(canvasDropX, canvasDropY);
    var canvasElem = new CanvasElement(droppedItem, snapXy.x, snapXy.y);
    
    // set up editor action of placing a new element on the canvas
    var newAction = new PlaceNewElemAction(canvasElem);
    
    this.actionStackManager.addAction(newAction);
    this.editorElements = this.actionStackManager.goForward(this.editorElements);
    this.$saveButton.removeClass("getGameCode");

    this.redrawAll();
}

// helper function to add a new LibraryPresetItem object
EditorManager.prototype.addLibraryPreset = function(elementType){
    this.libraryManager.addPresetItem(elementType, 
                                      Math.floor(this.grid.cellWidth), 
                                      Math.floor(this.grid.cellHeight),
                                      function(){
                                        this.redrawAll();
                                      }.bind(this));
}

EditorManager.prototype._removeSaveOverlays = function() {
    // remove created dom element from this.save()
    $(".large-loader-overlay").each(function () {
        $(this).remove();
    });
}

function postToMinigameLib (gameId) {
    // not for temporary users
    if ((curUsername === "") || (curUsername === "default"))
        return;
    $.ajax({
        url: "/addToUserLib",
        type: "post",
        data: {
            'username': curUsername,
            'gameid': gameId
        },
        success: function(data) {
            if (data !== "ok")
                console.log("Problems updating server's minigame library!");
        }
    })
}

EditorManager.prototype.save = function(onComplete){
    var gameData = new MinigameData(this);
    var gameId = this.minigameId;
    
    var $saveHider = $("<div>").addClass("large-loader-overlay");
    $("#playing-area").append($saveHider);
    
    $.ajax({
        url: "/saveGameData",
        type: "post",
        dataType: "json",
        data: {
            "gameData": gameData,
            "id": gameId
        },
        success: function(data){
            
            var newId = data.id;
            if(this.minigameId !== newId){
                this.minigameId = newId;
                var numGames = $(".minigame.stored").length % 26;
                var label = String.fromCharCode("A".charCodeAt(0) + numGames);
                // add this minigame to the minigame library on the home page
                addToMinigameLib(data.id.toString(), label);
                postToMinigameLib(newId);
            }
            // otherwise, just update the minimap
            else {addMinimap(newId);}

            // animate the loader disappearing
            setTimeout(function(){
                $saveHider.addClass("success");
                $saveHider.delay(250).fadeOut("slow", function(){
                    this._removeSaveOverlays();
                    if(onComplete instanceof Function){
                        onComplete(null, data);
                    }
                }.bind(this))
            }.bind(this), 250);
        }.bind(this),
        error: function(data, err){
            console.log("save error");
            
            // animate the loader disappearing
            setTimeout(function(){
                $saveHider.addClass("error");
                $saveHider.delay(250).fadeOut("slow", function(){
                    this._removeSaveOverlays();
                    if(onComplete instanceof Function){
                        onComplete(err, null);
                    }
                }.bind(this));
            }.bind(this), 250);
        }.bind(this)
    })
}


// **************** placeholder for GameElements *******************************
function CanvasElement(libraryEntry, elemX, elemY){
    this.libraryEntry = libraryEntry;
    this.elemX = elemX;
    this.elemY = elemY;
}

CanvasElement.prototype.__defineGetter__("width", function(){
    return this.libraryEntry.drawWidth;
});

CanvasElement.prototype.__defineGetter__("height", function(){
    return this.libraryEntry.drawHeight;
});

CanvasElement.prototype.drawTo = function(ctx, gameData){
    var img = this.libraryEntry.imgElem;
    var drawWidth = this.width;
    var drawHeight = this.height;
    var drawX = this.elemX;
    var drawY = this.elemY;
    
    var text = this.libraryEntry.elementType;
    
    ctx.save();
    try{
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }
    catch(err){
        console.log("drawing error", err, this.libraryEntry);
    }
    ctx.globalAlpha = 1;
    ctx.font = Math.floor(drawHeight/2) + "px Arial bold";
    ctx.fillStyle = "red";
    ctx.strokeStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "white";
    ctx.shadowBlur = 5;
    
    ctx.strokeText(text, drawX + (drawWidth/2), 
                       drawY + (drawHeight/2));
    ctx.fillText(text, drawX + (drawWidth/2), 
                       drawY + (drawHeight/2));
    ctx.restore();
}

CanvasElement.prototype.coordsInElem = function(canvasX, canvasY){
    var elemX = this.elemX;
    var elemY = this.elemY;
    var width = this.width;
    var height = this.height;
    
    return elemX <= canvasX && canvasX <= elemX + width &&
           elemY <= canvasY && canvasY <= elemY + height;
}
