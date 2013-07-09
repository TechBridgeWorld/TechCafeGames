function InstructionPage(animationTime) {
	// show instructions screen from home screen
	this.instructionsDiv = $("#instructions");
	this.powers = $("#instructions-powers");
	this.howto = $("#instructions-howto");
	this.nav = $("#instructions-nav");
	
    this.show = function() {
        $("#start").slideUp(animationTime);
        this.instructionsDiv.show();
        this.powers.hide();
        this.howto.hide();
        this.howto.fadeIn(animationTime);
        this.nav.removeClass("page2");
        this.nav.addClass("page1");
        this.nav.show();
    }

    // switching to instruction page2
    this.page2 = function (){
        this.howto.fadeOut(animationTime);
        this.powers.fadeIn(animationTime);

        this.nav.removeClass("page1");
        this.nav.addClass("page2");
    }

    // switching to instruction page1
    this.page1 = function (){
        this.powers.fadeOut(animationTime);
        this.howto.fadeIn(animationTime);

        this.nav.removeClass("page2");
        this.nav.addClass("page1");
    }

    // hide instruction
    this.hide = function (){
        this.instructionsDiv.slideUp(animationTime);
    }
}
