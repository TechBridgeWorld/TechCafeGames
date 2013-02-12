function Obs(name, points, x, y) {
    this.name = name;
    this.points = points;
    this.x=x;
    this.y=y;
    this.eaten=false;
}

Obs.prototype.draw = function(ctx){
    var food = new Image();
    food.src = "img/race-assets/"+this.name+".jpg";
    ctx.drawImage(food, this.x, this.y);
}

Obs.prototype.update = function(playerX, playerY){
    this.y+=10;
    if(this.x > playerX-50 && this.x < playerX+50 && this.y+100 >= playerY) {
        this.eaten=true;
    }
}