
Main.Preloader = function (game) {

    this.game = game;
    this.preloadBar;
    this.txt;

};

Main.Preloader.prototype = {

    preload: function () {

        //console.log("main1", $main_node);
       // this.game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL; //resize your window to see the stage resize too


        ////// Load Menu

                var $menu = $xml.find('menu');

                this.game.load.image($menu.find("title").attr("name"), $menu.find("title").attr("url"));
                 this.game.load.spritesheet($menu.find("playbutton").attr("name"), $menu.find("playbutton").attr("url"), Number($menu.find("playbutton").attr("width")), Number($menu.find("playbutton").attr("height")));
                var $sprites = $menu.find("sprite");
                for(var i=0; i < $sprites.length; i++){
                    var $sprite = $sprites.eq(i);
                   // console.log($sprite.attr("url"));
                    this.game.load.spritesheet($sprite.attr("name"), $sprite.attr("url"), Number($sprite.attr("width")), Number($sprite.attr("height")));
                }


                    if($menu.attr("sound"))  this.game.load.audio($menu.attr("name"),$menu.attr("sound").split("|") );
       // console.log('menusnd',$menu.attr("sound").split("|")[0]) ;
        if($menu.find("playbutton").find("anim").attr("sound"))  this.game.load.audio($menu.find("playbutton").find("anim").attr("name"),$menu.find("playbutton").find("anim").attr("sound").split("|") );


        ////// Load Instruction

        var $info = $xml.find('instruction');

        this.game.load.image($info.attr("name"), $info.attr("url"));

       // console.log("info",$info.attr("url") );




        ///Load Background
        for(var i=0; i < $xml.find('bg').find('level').length; i++){
            var $level = $xml.find('bg').find('level').eq(i);
            for(var j=0; j < $level.children().length; j++){
              //  console.log("url", $level.children().eq(j).attr("url"));
               this.game.load.image($level.children().eq(j).attr("name"), $level.children().eq(j).attr("url"));
            }
        }
        /////////////////////////////////////////

        ///Load Foreground
        for(var i=0; i < $xml.find('fg').find('level').length; i++){
            var $level = $xml.find('fg').find('level').eq(i);
            for(var j=0; j < $level.children().length; j++){
                //  console.log("url", $level.children().eq(j).attr("url"));
                this.game.load.image($level.children().eq(j).attr("name"), $level.children().eq(j).attr("url"));
            }
        }
        /////////////////////////////////////////



        ///Load Objects//////////////////////////////
        var $objects =$xml.find("objects");
        objects = this.game.add.group();
        for(var i=0; i < $objects.children().length; i++ ){

            var $level = $objects.children().eq(i);
            for(var j=0; j <$level.children().length; j++ ){
                var $obj = $level.children().eq(j);
               // console.log('snd', $obj.attr("name"));
                for(var k=0; k < $obj.children().length; k++){

                    if( $obj.children().eq(k).attr("sound")){
                       // console.log('snd', $obj.children().eq(k).attr("name"));
                        this.game.load.audio($obj.children().eq(k).attr("sname"),$obj.children().eq(k).attr("sound").split("|") );

                    }
                }
                this.game.load.spritesheet($obj.attr("name"), $obj.attr("url"), Number($obj.attr("width")), Number($obj.attr("height")));
            }
            // console.log( 'obj ', $obj.attr("name"));
            // addObj($obj, Number($obj.attr("width")),Number($obj.attr("height")), Number($obj.attr("x")),Number($obj.attr("y")),$obj.attr("name"), Number($obj.attr("count")));

        }
        //////////////////////////////////////////////////


        ///Load Enemies//////////////////////////////
        var $enemies =$xml.find("enemies");
       // console.log("enemies", $enemies.length);
        for(var i=0; i < $enemies.children().length; i++ ){

            var $level = $enemies.children().eq(i);
            for(var j=0; j <$level.children().length; j++ ){
                var $enm = $level.children().eq(j);
                // console.log('snd', $obj.attr("name"));
                for(var k=0; k < $obj.children().length; k++){

                    if( $enm.children().eq(k).attr("sound")){
                        //  console.log('snd', $obj.children().eq(k).attr("sound"));
                        this.game.load.audio($enm.children().eq(k).attr("sname"),$enm.children().eq(k).attr("sound").split("|") );

                    }
                }
                this.game.load.spritesheet($enm.attr("name"), $enm.attr("url"), Number($enm.attr("width")), Number($enm.attr("height")));
            }
            // console.log( 'obj ', $obj.attr("name"));
            // addObj($obj, Number($obj.attr("width")),Number($obj.attr("height")), Number($obj.attr("x")),Number($obj.attr("y")),$obj.attr("name"), Number($obj.attr("count")));

        }
        /////////////////////////////////////////////////



        ///// Load Hero
        this.game.load.spritesheet($xml.find("hero").attr("name"), $xml.find("hero").attr("url"), Number($xml.find("hero").attr("width")), Number($xml.find("hero").attr("height")));
        if($xml.find("lives").length > 0)this.game.load.image( 'lives', $xml.find("lives").attr("url"));
        /* this.game.load.image('sky', 'img/sprites/Sky.png');
         this.game.load.image('backg', 'img/sprites/Background.png');
         this.game.load.image('floor', 'img/sprites/Floor.png');*/
        $heronode = $xml.find("hero");
        if($heronode.find("projectile").attr("mode")==="on"){
            this.game.load.spritesheet($heronode.find("projectile").attr("name"), $heronode.find("projectile").attr("url"), Number( $heronode.find("projectile").attr("width")), Number( $heronode.find("projectile").attr("height")));
            if($heronode.find("projectile").find('anim').attr("sound"))  this.game.load.audio($heronode.find("projectile").find('anim').attr("name"),$heronode.find("projectile").find("anim").attr("sound").split("|") );
           // console.log('bulletsound',$heronode.find("projectile").find("anim").attr("sound") );
        }

        var $particles =$xml.find("particles");

        for(var i=0; i < $particles.children().length; i++ ){

            var $level = $particles.children().eq(i);
            for(var j=0; j <$level.children().length; j++ ){
                var $obj = $level.children().eq(j);
                // console.log('snd', $obj.attr("name"));

                this.game.load.spritesheet($obj.attr("name"), $obj.attr("url"), Number($obj.attr("width")), Number($obj.attr("height")));
            }
            // console.log( 'obj ', $obj.attr("name"));
            // addObj($obj, Number($obj.attr("width")),Number($obj.attr("height")), Number($obj.attr("x")),Number($obj.attr("y")),$obj.attr("name"), Number($obj.attr("count")));

        }

        var $points =$xml.find("pointsFrame");
        this.game.load.spritesheet($points.attr("name"),$points.attr("url"),Number($points.attr("width")),Number($points.attr("height")));

        ///Load End Screen

        var $end = $xml.find("end");
        this.game.load.image($end.find("gameover").attr("name"),$end.find("gameover").attr("url"));
        this.game.load.spritesheet($end.find("tryagain").attr("name"), $end.find("tryagain").attr("url"), Number($end.find("tryagain").attr("width")), Number($end.find("tryagain").attr("height")));
        this.game.load.spritesheet($end.find("submitscore").attr("name"), $end.find("submitscore").attr("url"), Number($end.find("submitscore").attr("width")), Number($end.find("submitscore").attr("height")));
        this.game.load.audio($xml.find("gamesound").attr("name"),$xml.find("gamesound").attr("sound").split("|") );
        this.game.load.image($end.find("highscore").attr("name"),$end.find("highscore").attr("url"));
       // console.log($end.find("gameover").attr("url"));

        this.game.load.audio($end.find("gameover").attr("soundname"),$end.find("gameover").attr("sound").split("|") );

        if($end.find("competition").attr("mode")==="on"){
            this.game.load.spritesheet($end.find("competition").find("button").attr("name"), $end.find("competition").find("button").attr("url"), Number($end.find("competition").find("button").attr("width")), Number($end.find("competition").find("button").attr("height")));
        }
        //console.log('endsnd', $end.attr("sound").split("|"));
        var $mute = $xml.find("mutebutton");
         this.game.load.spritesheet($mute.attr("name"), $mute.attr("url"),Number($mute.attr("width")), Number($mute.attr("height")))  ;
        //console.log('snds',$xml.find("gamesound").attr("sound") );
        this.game.stage.scale.pageAlignHorizontally = true;


        //this.game.input.onDown.add(this.startGame, this);

        //var bgtitle = game.add.sprite(0, 0,$menu.find("title").attr("name"));

        var $preload = $xml.find("preloader");
        var $font = $preload.find("font");
        game.add.sprite($preload.attr("x"),$preload.attr("y"),$preload.attr("name"));

        var style = { font: $font.attr("fontSize")+"px " +  $font.attr("fontName"), fill: $font.attr("color"), align:  $font.attr("align") };
        var text=game.load.progress+"%";
        this.txt = game.add.text(game.world.centerX, game.world.centerY, text, style);
        this.txt.anchor.setTo(0.5, 0.5);


        // this.preloadBar = this.add.sprite(356, 370, 'bubble');

        //this.load.setPreloadSprite(this.preloadBar);

        // this.game.stage.scale.pageAlignVeritcally = true;
       // this.game.stage.scale.refresh();
        //console.log("almost");
    },

    loadUpdate: function(){
        this.txt.setText(game.load.progress+"%");

    },

    create: function () {
       // var $preloader = $xml.find("preloader");
        //console.log('Preloade finished, lets go to the main menu automatically');
       // var preloadbg = game.add.sprite($preloader.attr("x"), $preloader.attr("y"), $preloader.attr("name"));

        this.game.state.start('mainmenu');



    }

}