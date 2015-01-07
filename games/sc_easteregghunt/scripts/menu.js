Main.MainMenu = function (game) {

    //	Our main menu
    this.game = game;
     //this.menusnd;
    this.buttonsnd;
};

Main.MainMenu.prototype = {

    create: function () {
        var $menu = $xml.find('menu');
        //this.game.input.onDown.add(this.startGame, this);

        var bgtitle = game.add.sprite(0, 0,$menu.find("title").attr("name"));

        var $sprites = $menu.find("sprite");
        for(var i=0; i < $sprites.length; i++){
            var $sprite = $sprites.eq(i);
           // console.log($sprite.attr("url"));
            var obj = game.add.sprite(Number($sprite.attr("x")), $sprite.attr("y"),$sprite.attr("name"));
            obj.anchor.setTo(.5,.5);
            var $anim = $sprite.find("anim");
            for(var j=0; j < $anim.length; j++){
                var animarray = $anim.eq(j).text().split(",");
                for(var k =0; k < animarray.length; k++)animarray[k] = Number(animarray[k]);
                //console.log(j);
                obj.animations.add($anim.eq(j).attr("name"), animarray, Number($anim.eq(j).attr("fps")), ($anim.eq(j).attr("loop") === "true"));

            }
            obj.animations.play($anim.eq(0).attr("name"));
        }

       // var playbutton = game.add.sprite(Number($menu.find("playbutton").attr("x")), $menu.find("playbutton").attr("y"),$menu.find("playbutton").attr("name"));
        //var playbutton = game.add.button(Number($menu.find("playbutton").attr("x")), Number($menu.find("playbutton").attr("y")), $menu.find("playbutton").attr("name"), this.startGame, this, 0, 0, 1);
       menusnd = game.add.audio($menu.attr("name"));
        //gamesnd = game.add.audio($xml.find("gamesound").attr("name"));
        menusnd.play('',0,1,true);
        this.playbutton = game.add.sprite(Number($menu.find("playbutton").attr("x")), $menu.find("playbutton").attr("y"),$menu.find("playbutton").attr("name"));
        //this.buttonsnd= game.add.audio($menu.find("playbutton").attr("name"));
        this.playbutton.inputEnabled = true;
        this.playbutton.input.useHandCursor = true;
        this.playbutton.events.onInputDown.add(this.press, this);
        this.playbutton.events.onInputUp.add(this.onUp, this);

        var $btnanim = $menu.find("playbutton").find("anim");

            //  console.log('name', $obj.children().eq(j).attr("name"));
        var animarray = $btnanim.text().split(",");
        for(var k =0; k < animarray.length; k++)animarray[k] = Number(animarray[k]);
        this.playbutton.animations.add($btnanim.attr("name"), animarray, Number($btnanim.attr("fps")), ($btnanim.attr("loop") === "true"));
        this.playbutton.animations.add('reverse', animarray.reverse(), Number($btnanim.attr("fps")), ($btnanim.attr("loop") === "true"));
        this.playbutton.frame = 0;
            if($btnanim.attr("sound"))this.buttonsnd = game.add.audio($btnanim.attr("name"));
          $mute = $xml.find("mutebutton");
        this.mutebtn = this.game.add.sprite($mute.attr("x"), $mute.attr("y"), $mute.attr("name"))  ;
         this.mutebtn.inputEnabled = true;
        this.mutebtn.input.useHandCursor = true;
        this.mutebtn.events.onInputDown.add(this.onMute, this);
            // obj.sound = game.add
            //game.load.audio('boden', ['examples/assets/audio/bodenstaendig_2000_in_rock_4bit.mp3', 'examples/assets/audio/bodenstaendig_2000_in_rock_4bit.ogg']);


        //playbutton.input.onMouseDown.add(this.startGame, this);
        //console.log('lets play', Number($menu.find("playbutton").attr("x")));
       // this.game.state.start('game');

    },

    press: function(obj){
        var $menu = $xml.find('menu');
        var $btnanim = $menu.find("playbutton").find("anim");

        obj.events.onAnimationComplete.add(this.showInfo, this);
        obj.animations.play($btnanim.attr("name"))  ;
       if(this.buttonsnd)this.buttonsnd.play();
        //this.buttonsnd.mute = MUTED;
    },

    onUp: function(obj){
        obj.animations.play("reverse")  ;
    },

    onMute:function(obj){
          if(!MUTED){
              this.game.sound.mute = true;
              obj.frame = 1;
              MUTED = true;
          }else{
              this.game.sound.mute = false;
              obj.frame = 0;
              MUTED = false;
          }
    },

    showInfo: function (obj) {
         this.playbutton.visible = false;
        var $info = $xml.find('instruction');
        var $menu = $xml.find('menu');
        //this.game.input.onDown.add(this.startGame, this);





        var info = game.add.sprite(Number($info.attr("x")), -50+Number($info.attr("y")),$info.attr("name"));
        TweenMax.from(info,.5, {y:-info.height, ease:Back.easeOut});

        info.inputEnabled = true;
        info.input.useHandCursor = true;
        info.events.onInputDown.add(this.startGame, this);

    },

    startGame:function(){

        menusnd.stop();
        this.game.state.start('game');
    }



}