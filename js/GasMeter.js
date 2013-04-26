function GasMeter(feedbackDelay, alertSfx, soundOn) {
	this.feedbackDelay = feedbackDelay;
    this.barFrac=100;
    this.soundOn = soundOn;
	
	var init = function(){
		$("#innerMeter").removeClass("warning");
		$("#innerMeter").removeClass("danger"); 
        $("#innerMeter").addClass("normal");	
	}
	
	init();
	
	// update gas meter
    this.updateBar = function (invincibleFlag){
		var soundOn = this.soundOn;
		var $innerMeter = $("#innerMeter");
        var barStart = $("#gasIcon").width()/2-5;
        if(this.barFrac>0 && !invincibleFlag) this.barFrac-=.1;
        
        if(this.barFrac > 100) this.barFrac=100;
        var barWidth = (this.barFrac/100)*(.93*($("#gasBar").width()-barStart));
        
        // change color when gas is low, add warning sound when super low
        if (this.barFrac<50){
            $innerMeter.removeClass("normal");
            $innerMeter.addClass("warning");
        }
        else{
            $innerMeter.removeClass("warning");
            $innerMeter.addClass("normal");
        }
        if (this.barFrac > 0 && this.barFrac<25){
            $innerMeter.removeClass("normal");
            $innerMeter.removeClass("warning");
            $innerMeter.addClass("danger");
            if (soundOn){
				if(alertSfx != undefined && alertSfx.playState == 0)
                    loopSound(alertSfx);
            }
        }
        
        else if(this.barFrac <= 0) { 
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
    }
	
	// increase gas meter when answer correctly
    function meterUp(){
        var animateInt = window.setInterval(function(){this.barFrac+=2; this.updateBar();},this.feedbackDelay/30);
        window.setTimeout(function(){window.clearInterval(animateInt)},this.feedbackDelay/3);
    }
}
