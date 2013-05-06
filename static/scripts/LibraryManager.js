function coordsInElement(elem, absX, absY){
    var $elem = $(elem);
    var offsets = $elem.offset();
    var absLeftBound = offsets.left;
    var absTopBound = offsets.top;
    var absRightBound = absLeftBound + $elem.width();
    var absBottomBound = absTopBound + $elem.height();
    
    return (absLeftBound <= absX && absX <= absRightBound &&
            absTopBound <= absY && absY <= absBottomBound)
}

// returns the coordinates of something relative to the given element
function absToRelativeCoords(absX, absY, elem){
    // make sure to use jquery's offset function, which accounts for scrolling
    // in order to give the "true" offset on the page
    var absOffsets = $(elem).offset();
    return {
        x: absX - absOffsets.left,
        y: absY - absOffsets.top
    };
}

/** represents a single library sidebar entry;
 * tracks its DOM element and also sets up handlers for drag and dropping
 *
 * extraLoadCallback is called when the image is completely loaded and 
 * takes the LibraryPresetItem

 * extraOnDropCallback is called when the image is dropped on the target canvas
 * and takes the dropped LibraryPresetItem, the drop target canvas, and the drop
 * coordinates, relative to the canvas
**/
function LibraryPresetItem(dropTargetCanvas, elementTypeName, drawWidth, drawHeight,
                           extraOnLoadCallback, extraOnDragCallback, 
                           extraOnDropCallback)
{
    assert(elementTypeName in window.typeProperties);
    this.elementType = elementTypeName;
    this._drawWidth = drawWidth;
    this._drawHeight = drawHeight;
    this.presetProperties = window.typeProperties[elementTypeName];
    
    this._dropTargetCanvas = dropTargetCanvas;
    this.$domElem = $(this.presetProperties.image).clone().addClass('loading-img').addClass('preset-elem');
    if(this.essential === true){
        this.$domElem.hide();
    }
    
    this.$dragHelperGhost = null;
    this.grabRelativeX = null;
    this.grabRelativeY = null;
    
    this.extraOnLoadCallback = extraOnLoadCallback;
    this.extraOnDragCallback = extraOnDragCallback;
    this.extraOnDropCallback = extraOnDropCallback;
    
    this._loadStarted = false;
}

LibraryPresetItem.prototype.__defineGetter__("essential", function(){
    return this.presetProperties.essential === true;
})

LibraryPresetItem.prototype.__defineGetter__("imgSrc", function(){
    return this.presetProperties.imgSrc;
});

// utility function to grab a raw image DOM element from this library element
LibraryPresetItem.prototype.__defineGetter__("imgElem", function(){
    return this.$domElem[0];
})

LibraryPresetItem.prototype.__defineGetter__("drawWidth", function(){
    if(this._drawWidth !== undefined){
        return this._drawWidth;
    }
    else{
        return this.$domElem.width();
    }
});

LibraryPresetItem.prototype.__defineGetter__("drawHeight", function(){
    if(this._drawHeight !== undefined){
        return this._drawHeight;
    }
    else{
        return this.$domElem.height();
    }
});

LibraryPresetItem.prototype.startLoad = function(){
    if(this._loadStarted){
        return;
    }
    
    this._loadStarted = true;
    var currImgElem = this.imgElem;
    currImgElem.onload = function(){
        this._loadedCallback(this.extraOnLoadCallback);
    }.bind(this);
    currImgElem.src = this.imgSrc;
}

// calls inputCallback with the loaded LibraryPresetItem object instance
LibraryPresetItem.prototype._loadedCallback = function(inputCallback){
    var $domElem = this.$domElem;
    $domElem.removeClass('loading-img').addClass('usable');
    $domElem.on('dragstart', this._dragStartCallback.bind(this));
    $domElem.on('drag', this._dragMoveCallback.bind(this));
    $domElem.on('dragend', this._dragEndCallback.bind(this));
    
    $domElem.on('touchstart', this._touchStartCallback.bind(this));
    $domElem.on('touchmove', this._touchMoveCallback.bind(this));
    $domElem.on('touchend', this._touchEndCallback.bind(this));
    
    if (inputCallback){
        inputCallback(this);
    }
}

// handler for when the library element is touched
LibraryPresetItem.prototype._touchStartCallback = function(ev){
    ev.preventDefault();
    var img = this.imgElem;
    var touches = ev.originalEvent.targetTouches;
    if(touches.length !== 1){
        return;
    }
    var touchAbsX = touches[0].pageX;
    var touchAbsY = touches[0].pageY;
    var relativeImgCoords = absToRelativeCoords(touchAbsX, touchAbsY, img);
    
    this.grabRelativeX = relativeImgCoords.x;
    this.grabRelativeY = relativeImgCoords.y;
    
    // create a copy of the image to visualize dragging
    this.$dragHelperGhost = this.$domElem.clone(false).css({
        opacity: 0.7,
        position: 'absolute',
        left: touchAbsX - this.grabRelativeX,
        top: touchAbsY - this.grabRelativeY,
        width: this.$domElem.width(),
        height: this.$domElem.height(),
        'z-index': 100
    });
    $('html').append(this.$dragHelperGhost);
}

// handler for when a touch originating at the library element is moved
LibraryPresetItem.prototype._touchMoveCallback = function(ev){
    ev.preventDefault();
    var touches = ev.originalEvent.targetTouches;
    if(touches.length !== 1){
        return;
    }
    assert(this.$dragHelperGhost !== null);
    assert(this.grabRelativeX !== null);
    assert(this.grabRelativeY !== null);
    var touchAbsX = touches[0].pageX;
    var touchAbsY = touches[0].pageY;
    this.$dragHelperGhost.css({
        left: touchAbsX - this.grabRelativeX,
        top: touchAbsY - this.grabRelativeY
    });
    
    if(this.extraOnDragCallback){
        var canvasOffsets = $(this._dropTargetCanvas).offset();
        var canvasEvX = touchAbsX - canvasOffsets.left;
        var canvasEvY = touchAbsY - canvasOffsets.top;
        this.extraOnDragCallback(this, canvasEvX, canvasEvY);
    }
}

// handler for when a touch originating at the library element is ended
LibraryPresetItem.prototype._touchEndCallback = function(ev){
    var touches = ev.originalEvent.targetTouches;
    var removedTouches = ev.originalEvent.changedTouches;
    if(touches.length !== 0){
        return;
    }
    assert(this.$dragHelperGhost !== null);
    var removedTouch = removedTouches[0];
    var touchAbsX = removedTouch.pageX;
    var touchAbsY = removedTouch.pageY;
    this._dropItem(touchAbsX, touchAbsY);
}

// handler for when the library element is dragged
LibraryPresetItem.prototype._dragStartCallback = function(ev){
    var img = this.imgElem;
    var relativeImgCoords = absToRelativeCoords(ev.originalEvent.pageX, 
                                                ev.originalEvent.pageY, img);
    this.grabRelativeX = relativeImgCoords.x;
    this.grabRelativeY = relativeImgCoords.y;
}

LibraryPresetItem.prototype._dragMoveCallback = function(ev){
    if(this.extraOnDragCallback){
        var absEvX = ev.originalEvent.pageX;
        var absEvY = ev.originalEvent.pageY;
        var canvasOffsets = $(this._dropTargetCanvas).offset();
        var canvasEvX = absEvX - canvasOffsets.left;
        var canvasEvY = absEvY - canvasOffsets.top; 
        this.extraOnDragCallback(this, canvasEvX, canvasEvY);
    }
}

// handler for when a drag originating at the library element is ended
LibraryPresetItem.prototype._dragEndCallback = function(ev){
    var dropAbsX = ev.originalEvent.pageX;
    var dropAbsY = ev.originalEvent.pageY;
    this._dropItem(dropAbsX, dropAbsY);
}

// called when the item is to be dropped
// dropAbsX and dropAbsY are the absolute coordinates of the literal coordinate
// of the dragend/touchend event, relative to the document
LibraryPresetItem.prototype._dropItem = function(dropAbsX, dropAbsY){
    assert(this.grabRelativeX !== null);
    assert(this.grabRelativeY !== null);
    if(coordsInElement(this._dropTargetCanvas, dropAbsX, dropAbsY)){
        // get coordinates, relative to the canvas
        var canvasOffsets = $(this._dropTargetCanvas).offset();
        var canvasDropX = dropAbsX - canvasOffsets.left;
        var canvasDropY = dropAbsY - canvasOffsets.top; 
                   
        if(this.extraOnDropCallback){
            this.extraOnDropCallback(this, this._dropTargetCanvas,
                                     canvasDropX, canvasDropY);
        }
        else{
            console.log('no drop callback defined');
        }
    }
    
    // clean up dragging helper-attributes
    if(this.$dragHelperGhost){
        this.$dragHelperGhost.remove();
    }
    this.$dragHelperGhost = null;
    this.grabRelativeX = null;
    this.grabRelativeY = null;
}

/**
 * LibraryManager is responsible for handling the sidebar of library presets
 * from which we can spawn new GameElements for editing
 * 
 * dropHandlerCallback is called whenever the target canvas receives a dropped
 * LibraryPresetItem
 * and takes the dropped LibraryPresetItem, the drop target canvas, and the drop
 * coordinates, relative to the canvas
**/
function LibraryManager(canvas, dragHandlerCallback, dropHandlerCallback){
    this.$library = $("#presets-library");
    this.$library.empty();
    this.canvas = canvas;
    
    this.presets = {};
    this._dropHandlerCallback = dropHandlerCallback;
    this._dragHandlerCallback = dragHandlerCallback;
    
    this.canvas.addEventListener('dragover', function(ev){
        ev.preventDefault();
    }.bind(this));
}

// initialize a new item from an image source and add it to the library sidebar,
// with proper event handling
LibraryManager.prototype.addPresetItem = function(elementType, elemWidth, elemHeight, onLoadFn){
    var newItem = new LibraryPresetItem(this.canvas, elementType, elemWidth, elemHeight,
        function(loadedItem){
            if(onLoadFn instanceof Function){
              onLoadFn(loadedItem);
            }
        }.bind(this),
        // on dragging the element, call the callback function with the preset
        // item and the canvas-relative coordinates of the mouse
        function(draggedPreset, dragEvCanvasX, dragEvCanvasX){
            this._dragHandlerCallback.apply(this, arguments);
        }.bind(this),
        // on dropping the item, call the given drop handler function
        // wrapper function just to remind us what the parameters are
        function(droppedItem, canvas, canvasDropX, canvasDropY){
            this._dropHandlerCallback.apply(this, arguments);
        }.bind(this));
    
    
    /* add to the library so that order isnt dependent on load order
       and ONLY ADD if NOT a DEFAULT element! */
    this.$library.append(newItem.$domElem);
    this.presets[elementType] = newItem;
    
    // finally, actually start the load
    newItem.startLoad();
}
