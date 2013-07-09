// modified from: 
// https://developer.mozilla.org/en-US/docs/Canvas_tutorial/Drawing_shapes
// if clip is given, the caller is responsible for restoring the context
function roundedRect(ctx,x,y,width,height,radius, fillStyle, strokeStyle, clip){
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x,y+radius);
    ctx.lineTo(x,y+height-radius);
    ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
    ctx.lineTo(x+width-radius,y+height);
    ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
    ctx.lineTo(x+width,y+radius);
    ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
    ctx.lineTo(x+radius,y);
    ctx.quadraticCurveTo(x,y,x,y+radius);
    ctx.closePath();
    
    if(fillStyle !== undefined){
        ctx.fillStyle = fillStyle;
        ctx.fill();
    }
    if(strokeStyle !== undefined){
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
    }
    
    if(clip !== undefined){
        ctx.clip();
    }
    else{
        ctx.restore();
    }
}


function getResizedWidth(oldWidth, oldHeight, newHeight){
    return Math.floor(oldWidth / oldHeight * newHeight);
}

function getResizedHeight(oldWidth, oldHeight, newWidth){
    return Math.floor(oldHeight / oldWidth * newWidth);
}

function sizeToFit(inputWidth, inputHeight, maxWidth, maxHeight, upscale){
    if (upscale === undefined) upscale = false;
    
    var outputWidth = inputWidth;
    var outputHeight = inputHeight;
    
    // first, constrain
    if (outputWidth > maxWidth){
        var targetWidth = maxWidth;
        outputHeight = getResizedHeight(outputWidth, outputHeight, targetWidth);
        outputWidth = targetWidth;
    }
    if (outputHeight > maxHeight){
        var targetHeight = maxHeight;
        outputWidth = getResizedWidth(outputWidth, outputHeight, targetHeight);
        outputHeight = targetHeight;
    }
    
    // then, upscale as needed
    if(upscale){
        if(Math.max(outputWidth, outputHeight) === outputWidth){
            outputHeight = getResizedHeight(outputWidth, outputHeight, maxWidth);
            outputWidth = maxWidth;
        }
        else{
            outputWidth = getResizedWidth(outputWidth, outputHeight, maxHeight);
            outputHeight = maxHeight;
        }
    }
    
    return {w: outputWidth, h: outputHeight};
}

function randomImgSrc(square){
    var width = Math.floor(Math.random() * (200 - 30) + 30);
    var height = (square) ? width : Math.floor(Math.random() * (200 - 30) + 30);
    var site = (Math.random() < 0.5) ? "placekitten" : "placedog";
    return "http://www."+site+".com/"+width+"/"+height;
}

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
    var absOffsets = $(elem).offset();
    return {
        x: absX - absOffsets.left,
        y: absY - absOffsets.top
    };
}

function updateCanvasSizes($canvas, widthRatio, heightRatio){
    if($canvas === undefined){
        $canvas = $("canvas");
    }
    
    // update internal canvas viewport size to actual viewed size to prevent 
    // image stretching
    $canvas.each(function(i, canvas){
        var $canvas = $(canvas);
        
        var newWidth = $canvas.width();
        var newHeight = $canvas.height();
        
        if(widthRatio !== undefined && heightRatio !== undefined){
            newWidth = newHeight * (widthRatio / heightRatio);
        }
        
        
        if(canvas.width !== newWidth){
            $canvas.width(newWidth);
            canvas.width = newWidth;
        }
        if(canvas.height !== newHeight){
            $canvas.height(newHeight);
            canvas.height = newHeight;
        }
    });
}

function isMobile(){
    return navigator.userAgent.match(/Android|iPad|iPhone|iPod/i) != null;
}
