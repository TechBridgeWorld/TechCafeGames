function ActionStack(){
    this.actionStack = [];
    // the index of the current state (ie: the most recently executed action
    // should be at the given index, with -1 signifying a state with no changes
    // from editor initialization)
    this.currStateIndex = -1;
}

// adds an action to the stack, but does not call it
ActionStack.prototype.addAction = function(newAction){
    assert(newAction instanceof EditorAction, "tried to add invalid action");
    
    // we are starting a new sequence of moves, so remove all old redo actions, 
    // if any exist
    if(this.canRedo){
        this.actionStack.splice(this.currStateIndex + 1, 
                                    this.actionStack.length - 
                                    (1 + this.currStateIndex)
                                );
    }
    
    // then, add the new action (do not increment the state index because we 
    // haven't executed the action yet)
    this.actionStack.push(newAction);
}

ActionStack.prototype.goForward = function(){
    assert(this.canRedo === true, "cannot go any more forward in stack");
    
    var nextAction = this.actionStack[this.currStateIndex+1];
    this.currStateIndex++;
    
    return nextAction.doAction.apply(nextAction, arguments);
}

ActionStack.prototype.goBackward = function(){
    assert(this.canUndo === true, "cannot go any more backward in stack");
    
    var prevAction = this.actionStack[this.currStateIndex];
    this.currStateIndex--;
    
    return prevAction.undoAction.apply(prevAction, arguments);
}

ActionStack.prototype.__defineGetter__("canUndo", function(){
    return this.currStateIndex >= 0;
});

ActionStack.prototype.__defineGetter__("canRedo", function(){
    assert(this.currStateIndex <= this.actionStack.length-1, 
           "action stack index is out of sync")
    return this.currStateIndex !== this.actionStack.length-1;
});

ActionStack.prototype.__defineGetter__("numActions", function(){
    return this.actionStack.length;
});