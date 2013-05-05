function Grid(canvas, numRows, numCols){
    this.canvas = canvas;
    this.numRows = numRows;
    this.numCols = numCols;
}

Grid.prototype.__defineGetter__("cellWidth", function(){
    return this.canvas.width / this.numCols;
});

Grid.prototype.__defineGetter__("cellHeight", function(){
    return this.canvas.height / this.numRows;
});

Grid.prototype.xyToCellCoords = function(canvasX, canvasY){    
    return {"row": Math.floor(canvasY / this.cellHeight),
            "col": Math.floor(canvasX / this.cellWidth)};
};

Grid.prototype.cellCoordsToXy = function(cellRow, cellCol){
    return {
        "x": cellCol * this.cellWidth,
        "y": cellRow * this.cellHeight
    };
};

// using whatever ctx styles are set before a call to this function, draw the
// outline of a cell region
Grid.prototype.drawCellBoundaries = function(ctx, cellRow, cellCol, 
                                                  endCellRow, endCellCol)
{
    if(endCellRow === undefined){
        endCellRow = cellRow;
    }
    if(endCellCol === undefined){
        endCellCol = cellCol;
    }
    var cellWidth = this.cellWidth;
    var cellHeight = this.cellHeight;
    
    var areaLeft = cellWidth * cellCol;
    var areaTop = cellHeight * cellRow;
    var areaRight = cellWidth * (endCellCol+1);
    var areaBot = cellHeight * (endCellRow+1);
    
    ctx.strokeRect(areaLeft, areaTop, areaRight - areaLeft, areaBot - areaTop);
}

Grid.prototype.drawBaseGrid = function(ctx){
    ctx.save();
    ctx.strokeStyle = "#bbbbbb";
    
    ctx.lineWidth = 1;
    for(var row=0; row < this.numRows; row++){
        for(var col=0; col < this.numCols; col++){
            this.drawCellBoundaries(ctx, row, col);
        }
    }
    ctx.restore();
};

// draws a red boundary around the cells that would wrap the 
// current canvas element
Grid.prototype.highlightWrappingGridCells = function(ctx, elemLeft, elemTop, 
                                                     elemWidth, elemHeight,
                                                     highlightSingle)
{  
    // if no size specified, only highlight a single cell
    if(elemWidth === undefined){
        elemWidth = 1;
    }
    if(elemHeight === undefined){
        elemHeight = 1;
    }
    
    var cellWidth = this.cellWidth
    var cellHeight = this.cellHeight; 

    var startCell = this.xyToCellCoords(elemLeft, elemTop); 
    var startXy = this.cellCoordsToXy(startCell.row, startCell.col);
    if(highlightSingle){
        var endCell = startCell;
    }
    else{
        var endCell = this.xyToCellCoords(Math.floor(startXy.x + elemWidth), 
                                          Math.floor(startXy.y + elemHeight));
    }                                     
                                     
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    this.drawCellBoundaries(ctx, startCell.row, startCell.col,
                             endCell.row, endCell.col);
    ctx.restore();                             
}

Grid.prototype.xySnapToGrid = function(canvasX, canvasY){
    var snapCellCoords = this.xyToCellCoords(canvasX, canvasY);
    var snapXy = this.cellCoordsToXy(snapCellCoords.row, snapCellCoords.col);
    return snapXy;
}
