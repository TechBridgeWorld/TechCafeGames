/** a representation of a single action on the editor queue, must
 * be initialized with callback functions with the ability to take some input
 * and modify it in a reversible way
 *
 * the undoFn should be an exact undo of the doFn
 * for now, all actions should be nondestructive
**/
function EditorAction(doFn, undoFn){
    this.doFn = doFn;
    this.undoFn = undoFn;
    this.name = "generic action";
}

EditorAction.prototype.doAction = function(){
    assert(this.doFn instanceof Function);
    return this.doFn.apply(this, arguments);
}

EditorAction.prototype.undoAction = function(){
    assert(this.undoFn instanceof Function);
    return this.undoFn.apply(this, arguments);
}


/** subclass for the action of placing a single new element on the editcanvas**/
function PlaceNewElemAction(newEditorElem){
    this.newElem = newEditorElem;
    this.name = "place new element action";
}

PlaceNewElemAction.prototype = new EditorAction();
PlaceNewElemAction.constructor = PlaceNewElemAction;

PlaceNewElemAction.prototype.doFn = function(editorElems){
    // make nondestructive copy
    var updatedElems = editorElems.slice(0);
    updatedElems.push(this.newElem);
    return updatedElems;
}

PlaceNewElemAction.prototype.undoFn = function(editorElems){
    assert(editorElems.length > 0);

    // make nondestructive copy
    var updatedElems = editorElems.slice(0);
    updatedElems.pop();
    return updatedElems;
}

/** subclass for the action of moving an already-placed element 
    on the editcanvas **/
function MoveElemAction(movedElem, movedElemIndex, 
                        movedElemOriginalX, movedElemOriginalY,
                        newElemX, newElemY)
{
    this.movedElem = movedElem;
    this.movedElemIndex = movedElemIndex;
    this.movedElemOriginalX = movedElemOriginalX;
    this.movedElemOriginalY = movedElemOriginalY;
    
    this.newElemX = newElemX;
    this.newElemY = newElemY;
}
MoveElemAction.prototype = new EditorAction();
MoveElemAction.constructor = MoveElemAction;

MoveElemAction.prototype.doFn = function(editorElements){
    assert(editorElements[this.movedElemIndex] === this.movedElem,
           "element to move is out of sync");
    
    this.movedElem.elemX = this.newElemX;
    this.movedElem.elemY = this.newElemY;
    
    var newElements = editorElements.slice(0);
    newElements.splice(this.movedElemIndex, 1);
    newElements.push(this.movedElem);
    return newElements;
}

MoveElemAction.prototype.undoFn = function(editorElements){
    var newElements = editorElements.slice(0);
    
    this.movedElem.elemX = this.movedElemOriginalX;
    this.movedElem.elemY = this.movedElemOriginalY;
    
    newElements.pop();
    newElements.splice(this.movedElemIndex, 0, this.movedElem);
    
    return newElements;
}

/** when an element is removed from the canvas **/
function DeleteElemAction(deletedCanvasElem, deletionIndex){
    this.deletedElem = deletedCanvasElem;
    this.deletionIndex = deletionIndex;
}
DeleteElemAction.prototype = new EditorAction();
DeleteElemAction.constructor = DeleteElemAction;

DeleteElemAction.prototype.doFn = function(editorElements){
    var newElements = editorElements.slice(0);
    
    newElements.splice(this.deletionIndex, 1);
    return newElements;
}

DeleteElemAction.prototype.undoFn = function(editorElements){
    var newElements = editorElements.slice(0);
    
    newElements.splice(this.deletionIndex, 0, this.deletedElem);
    return newElements;
}
