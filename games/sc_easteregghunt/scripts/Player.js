//	The first parameter to your function should always be 'game' which is an instance of the Game object.
Player = function (game, x, y) {

	//	Store the reference and then use it through-out your code
  //his.game = game;
	Phaser.Sprite.call(this, game, x, y, 'player1');



};

Player.prototype = Phaser.Utils.extend(true, Phaser.Sprite.prototype, PIXI.Sprite.prototype);
Player.prototype.constructor = Player;

  

  Player.prototype.update = function(){
   // console.log('updating', player);
    this.move();
  }

	Player.prototype.move = function() {
   // for( var i in evt)
     //  console.log(i + ' : ' + evt[i]);
      var posX = this.game.input.x;
      var posY = this.game.input.y;
     /* switch(evt.type){
        case 'touchmove':
        posX = evt.touches[0].screenX;
         posY = evt.touches[0].screenY;
        break;

        case 'mousemove':
         posX = evt.screenX;
         posY = evt.screenY;
        break;
      }*/
       // sprite.y = evt.y*.01;
           // console.log(evt.x)   ;
       /*  var bounce = game.add.tween(sprite);
        var bounceY = game.add.tween(sprite);
        bounce.to({
            x:evt.x
        }, 500);
        bounceY.to({
            y:evt.y
        }, 500);
       // bounce.onComplete.add(startBounceTween, this);

        bounce.start();
       if(evt.y > 320 && evt.y < 720 - (sprite.height*2))
        bounceY.start();            */
       // console.log(game.camera.scroll.y);
       
          var bounce = this.game.add.tween(player);
        var bounceY = this.game.add.tween(player);
        bounce.to({
            x:posX
        }, 200);
        bounceY.to({
            y:posY
        }, 200);
       // bounce.onComplete.add(startBounceTween, this);

        bounce.start();
       if(posY > 320 && posY < 720 - (player.height*2))
        bounceY.start();            
      
      //  for( var i in evt.touches[0])
		  // console.log(i + ' : ' + evt.touches[0][i]);

}
