var GasMeter = function(feedbackDelay,numTotalQuestions) {
	this.feedbackDelay = feedbackDelay;
    this.gasLevel=100;
    this.numTotalQuestions = numTotalQuestions;
}

// update gas meter
GasMeter.prototype.updateBar = function (invincibleFlag){
    var $innerMeter = $("#innerMeter");
    var barStart = $("#gasIcon").width()/2-5;
    if(this.gasLevel>0 && !invincibleFlag) this.gasLevel-=.1;
    
    if(this.gasLevel > 100) this.gasLevel=100;
    var barWidth = (this.gasLevel/100)*(.93*($("#gasBar").width()-barStart));
    
    // change color when gas is low, add warning sound when super low
    if (this.gasLevel<50){
        $innerMeter.removeClass("normal");
        $innerMeter.addClass("warning");
    }
    else{
        $innerMeter.removeClass("warning");
        $innerMeter.addClass("normal");
    }
    if (this.gasLevel > 0 && this.gasLevel<25){
        $innerMeter.removeClass("normal");
        $innerMeter.removeClass("warning");
        $innerMeter.addClass("danger");
        if (soundOn){
            if(alertSfx != undefined && alertSfx.playState == 0)
                loopSound(alertSfx);
        }
    }
    
    else if(this.gasLevel <= 0) { 
        alertSfx.stop(); 
        return true;
    }
    
    else{
        $innerMeter.removeClass("danger");
        if (soundOn){
            if(alertSfx != undefined && alertSfx.playState == 1)
               alertSfx.stop();
        }
    }

    // keep gas meter inside of bar image
    barHeight = $("#gasBar").height()*(3/5);
    barTop = $("#gasBar").height()*(1/5)+15;
    
    $innerMeter.css("left", 25+barStart + "px");
    $innerMeter.css("width", barWidth);
    $innerMeter.css("height", barHeight);
    $innerMeter.css("top", barTop);
};

// increase gas meter when answer correctly
GasMeter.prototype.meterUp = function(){
    
    var animateInt = window.setInterval(function(){
        this.gasLevel++;
        this.updateBar(false);
    }.bind(this),this.feedbackDelay/30);
    
    window.setTimeout(function(){window.clearInterval(animateInt)},this.feedbackDelay/3);
    
    var progressIncrease=($('#progressBar').width()/this.numTotalQuestions)/10;

    var animateProgress=window.setInterval(function(){
        $('#progressBarInner').css("width","+="+progressIncrease);
    }.bind(this),this.feedbackDelay/30);
    
    window.setTimeout(function(){window.clearInterval(animateProgress);},this.feedbackDelay/3);
}