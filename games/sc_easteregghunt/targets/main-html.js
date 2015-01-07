Main.Game = function (game) {

    this.game = game;
    this.playing;
    sp = this;
    var lives;
    this.endgroup;
    this.bulletTime = 0;
   liveCount = Number($xml.find("lives").attr("count"));
};

Main.Game.prototype = {

    preload: function () {

        // this.game.load.spritesheet('balls', '../assets/sprites/balls.png', 17, 17);

    },

    create: function () {


        this.addBG();


        $heronode = $xml.find("hero");
        this.addObjects();
        this.addEnemies();
        player = this.game.add.sprite(Number($heronode.attr("x")), Number($heronode.attr("y")), $heronode.attr("name"));
        player.alpha =   $heronode.attr("alpha");
        $heronode.attr("moveX") == "0" ? player.x =  $heronode.attr("x") : player.x = game.input.x;
        $heronode.attr("moveY") == "0" ? player.y =  $heronode.attr("y") : player.y = game.input.y;
        // console.log('hero ', $heronode.children().eq(0).text())
        for (var i = 0; i < $heronode.find("anim").length; i++) {
            var animarray = $heronode.find("anim").eq(i).text().split(",");
            for(var j =0; j < animarray.length; j++)animarray[j] = Number(animarray[j]);
           // console.log('anim', $heronode.children().eq(i).text().split(","));
            player.animations.add($heronode.find("anim").eq(i).attr("name"),  animarray, Number($heronode.find("anim").eq(i).attr("fps")), ($heronode.find("anim").eq(i).attr("loop") === "true"));
            player.backwards = $heronode.find("anim").eq(0).attr("backwards") === "true";
            player.fail = $heronode.find("anim").eq(i).attr("name") === "fail";
            if(player.fail) player.events.onAnimationComplete.add(this.onFailEnd, this);


        }
        player.failed = false;
        player.projectile = $heronode.find("projectile").attr("mode")==="on";
        bullets = game.add.group();
        if(player.projectile == true){

            for (var i = 0; i < 10; i++)
            {

            var b = bullets.create(0, 0, $heronode.find("projectile").attr("name"));
            b.name = 'bullet' + i;
            b.exists = false;
            b.visible = false;
            b.anchor.setTo( $heronode.find("projectile").attr("anchorX"),$heronode.find("projectile").attr("anchorY"));
            b.events.onOutOfBounds.add(this.killObj, this);
            if ($heronode.find("projectile").find("anim").eq(0).attr("sound"))b.sound = game.add.audio($heronode.find("projectile").find("anim").eq(0).attr("name"));
            }
            for (var i = 0; i < $heronode.find("projectile").find("anim").length; i++) {
                var animarray = $heronode.find("projectile").find("anim").eq(i).text().split(",");
                for(var j =0; j < animarray.length; j++)animarray[j] = Number(animarray[j]);
                 console.log('anim', $heronode.find("projectile").find("anim").eq(i).attr("sound"));
                player.animations.add($heronode.find("projectile").find("anim").eq(i).attr("name"),  animarray, Number($heronode.find("projectile").find("anim").eq(i).attr("fps")), ($heronode.find("projectile").find("anim").eq(i).attr("loop") === "true"));
                player.backwards = $heronode.find("projectile").find("anim").eq(0).attr("backwards") === "true";
                player.fail = $heronode.find("projectile").find("anim").eq(i).attr("name") === "fail";
                if(player.fail) player.events.onAnimationComplete.add(this.onFailEnd, this);
               if ($heronode.find("projectile").find("anim").eq(i).attr("sound"))b.sound = game.add.audio($heronode.find("projectile").find("anim").eq(i).attr("name"));



            }







                console.log('anim', b.sound);
           /* var animarray = $heronode.find("projectile").text().split(",");
            for(var j =0; j < animarray.length; j++)animarray[j] = Number(animarray[j]);
            var $bulletanim = $heronode.find("projectile").find("anim").eq(0);
            b.animations.add($heronode.find("projectile").find("anim").eq(0).attr("name"), animarray, Number($heronode.find("projectile").find("anim").eq(0).attr("fps")), $heronode.find("projectile").find("anim").eq(0).attr("loop")==="true");*/
            //game.input.onDown.add(this.fireBullet, this);

        }
        player.body.setSize(Number($heronode.attr("hitWidth")),Number($heronode.attr("hitHeight")),Number($heronode.attr("hitX")),Number($heronode.attr("hitY")) );
        player.anchor.setTo($heronode.attr("anchorX"),$heronode.attr("anchorY"));


        //console.log('hitwidth',  Number($heronode.attr("hitWidth")));
       // player.body.immovable = true;
       // player.body.customSeparateX = true;
       // player.body.customSeparateY = true;

        // player.body.bounce.setTo(.5,.5);

        //player.body.collideWorldBounds = true;

        if($xml.find('bg').attr("foreground") =="top"){
            topbg1.bringToTop();
            topbg2.bringToTop();
        }
        this.addFG();

        $lives =  $xml.find("lives");
        lives = game.add.group();
        for( var i=0; i < liveCount; i++ ){
            var live = this.game.add.sprite(Number($lives.attr("x")), Number($lives.attr("y")), 'lives');
            live.x = Number($lives.attr("x"))-(i*live.width);
            lives.add(live);
        }
     //  console.log('lives',lives.getAt(4) );
        var $font = $heronode.find("score");
        var style = { font: $font.attr("fontSize")+"px " +  $font.attr("fontName"), fill: $font.attr("color"), align:  $font.attr("align") };
        var text= score+'';
        this.scoretxt = game.add.text(game.width-10,  10, text, style);
        this.scoretxt.anchor.setTo(1,0);
        gamesnd = game.add.audio($xml.find("gamesound").attr("name"));
        gamesnd.stared = false;
        if(gamesnd){
           gamesnd.play("", 0,1,true);
           //gamesnd.mute = MUTED;
        }

        this.mutebtn = this.game.add.sprite($mute.attr("x"), $mute.attr("y"), $mute.attr("name"))  ;
        this.mutebtn.inputEnabled = true;
        this.mutebtn.input.useHandCursor = true;
        this.mutebtn.events.onInputDown.add(this.onMute, this);
        if(MUTED)this.mutebtn.frame = 1;
        game.sound.mute = MUTED;
        this.playing = true;
        //this.submitScore();

       // this.game.input.onDown.add(this.quitToMenu, this);

    },

    quitToMenu: function () {

        //console.log('lets quit! back to the main menu');

         this.game.state.start('mainmenu');

    },

    addBG: function () {
        var posx, posy, origx, origy, w, h;
        var lcount=levelCount;
      levelCount < Number($xml.find('bg').children().length) ? lcount= levelCount : lcount = $xml.find('bg').children().length -1;
        var $level = $xml.find('bg').find('level').eq(lcount);

        for (var i = 0; i < $level.children().length; i++) {


            var $bg = $level.children().eq(i);
           // console.log('pposy ', $bg.attr("name"));
            origx = Number($bg.attr("x"));
            origy = Number($bg.attr("y"));
            if ($main_node.attr("orientation") == "vertical") {
                posx = origx;
                posy = -Number($bg.attr("height"));
               // console.log('pposy ',posy);

            } else {
                posx = Number($bg.attr("width"));
                posy = origy;

            }
            switch (i) {
                case 0:
                    bottombgs = game.add.group();
                    bottombg1 = game.add.tileSprite(origx, origy, Number($bg.attr("width")), Number($bg.attr("height")), $bg.attr("name"));
                   // bottombg1 = game.add.sprite(origx, origy, $bg.prop("tagName"));
                   // bottombg2 = game.add.sprite(posx, posy, $bg.prop("tagName"));
                    bottombgs.add(bottombg1);
                    //console.log('bottombg', bottombg1.width);
                   // bottombgs.add(bottombg2);
                    break;

                case 1:
                    topbgs = game.add.group();
                    topbg1 = game.add.tileSprite(origx, origy, Number($bg.attr("width")), Number($bg.attr("height")), $bg.attr("name"));
                    topbgs.add(topbg1);
                  /*  topbgs = game.add.group();
                    topbg1 = game.add.sprite(origx, origy, $bg.prop("tagName"));
                    topbg2 = game.add.sprite(posx, posy, $bg.prop("tagName"));
                    topbgs.add(topbg1);
                    topbgs.add(topbg2);*/
                    break;

                case 2:
                    borders = game.add.group();
                   border1 = game.add.tileSprite(origx, origy, Number($bg.attr("width")), Number($bg.attr("height")), $bg.attr("name"));
                   borders.add(border1);
                   /* borders = game.add.group();
                    border1 = game.add.sprite(origx, origy, $bg.prop("tagName"));
                    border2 = game.add.sprite(posx, posy, $bg.prop("tagName"));
                    borders.add(border1);
                    borders.add(border2);*/
                    break;
            }
        }
    },

    addFG: function () {
        var lcount=levelCount;
        levelCount < Number($xml.find('fg').find('level').length) ? lcount= levelCount : lcount = $xml.find('fg').find('level').length-1 ;
        var $level = $xml.find('fg').children().eq(lcount);

        for (var i = 0; i < $level.children().length; i++) {


            var $bg = $level.children().eq(i);
            // console.log('pposy ', $bg.attr("name"), i);
            origx = Number($bg.attr("x"));
            origy = Number($bg.attr("y"));
            if ($main_node.attr("orientation") == "vertical") {
                posx = origx;
                posy = -Number($bg.attr("height"));
                // console.log('pposy ',posy);

            } else {
                posx = Number($bg.attr("width"));
                posy = origy;

            }
            switch (i) {
                case 0:
                    fgs = game.add.group();
                    //console.log('all ', origx, origy, Number($bg.attr("width")), Number($bg.attr("height")), $bg.attr("name"));

                    fg1 =  game.add.tileSprite(origx, origy, Number($bg.attr("width")), Number($bg.attr("height")), $bg.attr("name"));
                    fgs.add(fg1);
                   /* fg1 = game.add.sprite(origx, origy, $bg.prop("tagName"));
                    fg2 = game.add.sprite(posx, posy, $bg.prop("tagName"));
                    fgs.add(fg1);
                    fgs.add(fg2);*/
                    break;


            }
        }
    },


    addObjects: function () {
        var $objects = $xml.find("objects");
        objects = game.add.group();
        var lcount = levelCount;
        levelCount < Number($objects.children().length) ? lcount= levelCount : lcount = Number($objects.children().length)-1;
        var $objlevel = $objects.children().eq(lcount);
        for (var i = 0; i < $objlevel.children().length; i++) {
            var $obj = $objlevel.children().eq(i);
           //console.log('objx ', Number($obj.attr("x")).length, i);
            this.addObj($obj, Number($obj.attr("width")), Number($obj.attr("height")), $obj.attr("x"), $obj.attr("y"), $obj.attr("name"), Number($obj.attr("count")));
        }
    },

    addObj: function (node, w, h, x, y, name, count) {
        var $obj = node;
        var lcount = levelCount;
        levelCount < Number($main_node.find('bg').children().length) ? lcount= levelCount : lcount = Number($main_node.find('bg').children().length)-1;
        $bglevel = $main_node.find('bg').children().eq(lcount);
        var fr = 0;
        //console.log('count', $obj.attr("name"));
        for (var i = 0; i < count; i++) {
            var posx, posy;
            x.length < 1 ? posx = Math.random() * (Number($bglevel.attr("maxH")) - Number($bglevel.attr("minH"))) + Number($bglevel.attr("minH")) : posx = Number(x) + (i * Number($obj.attr("spacing")) * 100);
            y.length < 1 ? posy = Math.random() * (Number($bglevel.attr("maxV")) - Number($bglevel.attr("minV"))) + Number($bglevel.attr("minV")) : posy = Number(y) - (i * Number($obj.attr("spacing")) * 100);
            // jellyfish.create(x * 1000, y * 200, 'jellyfish');
            // jellyfish.create(x * 1000, y * 200, 'jellyfish');
            var obj = game.add.sprite(posx, posy, name);

            obj.body.setSize(Number($obj.attr("hitWidth")), Number($obj.attr("hitHeight")), Number($obj.attr("hitX")), Number($obj.attr("hitY")));
            obj.anchor.setTo($obj.attr("anchorX"),$obj.attr("anchorY"));
            obj.hit = false;
            obj.origY = posy-obj.height;
            obj.origX = posx+obj.width;
            obj.points = Number($obj.attr("points"));
            obj.pointsFrame = Number($obj.attr("pointsFrame"));
            obj.id=i;
            obj.name = name+i;
            obj.immortal= ($obj.attr("immortal") == "true");
            obj.randomFrameCount = Number($obj.attr("randomFrameCount"));
            if($obj.attr("randomAngle") == "true")obj.angle = game.rnd.integerInRange(-30, 30);
            obj.body.immovable = $obj.attr("immovable") === "true";
            obj.events.onOutOfBounds.add( this.destroyObj, this );

            objects.add(obj);
               var $anim = $obj.find("anim");
            for (var j = 0; j < $anim.length; j++) {
              //  console.log('name', $obj.children().eq(j).attr("name"));
                var animarray = $anim.eq(j).text().split(",");
                for(var k =0; k < animarray.length; k++)animarray[k] = Number(animarray[k]);
                obj.animations.add($anim.eq(j).attr("name"), animarray, Number($anim.eq(j).attr("fps")), ($anim.eq(j).attr("loop") === "true"));
                if ($anim.eq(j).attr("sound"))obj.sound = game.add.audio($anim.eq(j).attr("sname"));

                // obj.sound = game.add
                //game.load.audio('boden', ['examples/assets/audio/bodenstaendig_2000_in_rock_4bit.mp3', 'examples/assets/audio/bodenstaendig_2000_in_rock_4bit.ogg']);
            }
            if($obj.attr("randomFrameCount") === "0") obj.animations.play($anim.eq(0).attr("name"));
            //if($obj.attr("randomFrameCount") != "0")obj.frame = Math.floor(Math.random()*Number($obj.attr("randomFrameCount")));
            if($obj.attr("randomFrameCount") != "0"){
                if(fr < Number($obj.attr("randomFrameCount"))){

                    obj.frame = fr;
                    //fr++;
                    if(fr ==  Number($obj.attr("randomFrameCount")))fr = 0;
                   // console.log('not', fr);

                }
            }

            if($obj.attr("randomSpeed") == "true")  x.length < 1 ? obj.body.velocity.y = game.rnd.realInRange(Number($obj.attr("minSpeed"))*100, Number($obj.attr("maxSpeed")) * 100) : obj.body.velocity.x = -( game.rnd.realInRange(Number($obj.attr("minSpeed"))*100, Number($obj.attr("maxSpeed")) * 100));
            else  x.length < 1 ? obj.body.velocity.y = (Number($obj.attr("maxSpeed")) * 100) : obj.body.velocity.x = -(Number($obj.attr("maxSpeed")) * 100);
            obj.events.onAnimationComplete.add(this.onAnimEnd, this);
            // console.log(obj.name.substr(0,12),'velocity.y', obj.body.velocity.y);
        }

    },
    addEnemies: function () {
        var $objects = $xml.find("enemies");
        enemies = game.add.group();
        var lcount = levelCount;
        levelCount < Number($objects.children().length) ? lcount= levelCount : lcount = Number($objects.children().length)-1;
        var $objlevel = $objects.children().eq(lcount);
        for (var i = 0; i < $objlevel.children().length; i++) {
            var $obj = $objlevel.children().eq(i);
            // console.log('obj ', $obj.attr("x"), i);
            this.addEnm($obj, Number($obj.attr("width")), Number($obj.attr("height")), $obj.attr("x"), $obj.attr("y"), $obj.attr("name"), Number($obj.attr("count")));
        }
    },

    addEnm: function (node, w, h, x, y, name, count) {
        var $obj = node;
        var lcount = levelCount;
        levelCount < Number($main_node.find('bg').children().length) ? lcount= levelCount : lcount = Number($main_node.find('bg').children().length)-1;
        $bglevel = $main_node.find('bg').children().eq(lcount);
        var fr = 0;
        //console.log('count', $obj.attr("name"));
        for (var i = 0; i < count; i++) {
            var posx, posy;
            x.length < 1 ? posx = Math.random() * (Number($bglevel.attr("maxH")) - Number($bglevel.attr("minH"))) + Number($bglevel.attr("minH")) : posx = Number(x) + (i * Number($obj.attr("spacing")) * 100);
            y.length < 1 ? posy = Math.random() * (Number($bglevel.attr("maxV")) - Number($bglevel.attr("minV"))) + Number($bglevel.attr("minV")) : posy = Number(y) - (i * Number($obj.attr("spacing")) * 100);
            // jellyfish.create(x * 1000, y * 200, 'jellyfish');
            // jellyfish.create(x * 1000, y * 200, 'jellyfish');
            var obj = game.add.sprite(posx, posy, name);

           // obj.bodyWidth = Number($obj.attr("hitWidth"));
           // obj.bodyHeight = Number($obj.attr("hitHeight"));
           // obj.body.offset.x = Number($obj.attr("hitX"));
           // obj.body.offset.y = Number($obj.attr("hitY"));
            obj.body.setSize(Number($obj.attr("hitWidth")), Number($obj.attr("hitHeight")), Number($obj.attr("hitX")), Number($obj.attr("hitY")));
            obj.anchor.setTo($obj.attr("anchorX"),$obj.attr("anchorY"));

            obj.origY = posy-obj.height;
            obj.origX = posx+obj.width;
            obj.points = Number($obj.attr("points"));
            obj.shootPoints = Number($obj.attr("shootPoints"));
            obj.pointsFrame = Number($obj.attr("pointsFrame"));
            obj.hit = false;
            obj.name = name+i;
            obj.shootPointsFrame = Number($obj.attr("shootPointsFrame"));
            obj.randomFrameCount = Number($obj.attr("randomFrameCount"));
            obj.immortal= ($obj.attr("immortal") == "true");
            if($obj.attr("randomAngle") == "true"){
                var rndAngle = game.rnd.integerInRange(-30, 30);
                obj.angle = rndAngle;
                 //obj.body.rotation = 120;
            }

           // obj.body.immovable = true;

            obj.id=i;

            obj.body.immovable = $obj.attr("immovable") === "true";
            obj.events.onOutOfBounds.add( this.destroyObj, this );
            enemies.add(obj);
            var $anim = $obj.find("anim");
            for (var j = 0; j < $anim.length; j++) {
                //  console.log('name', $anim.eq(j).attr("name"));
                var animarray = $anim.eq(j).text().split(",");
                for(var k =0; k < animarray.length; k++)animarray[k] = Number(animarray[k]);
                obj.animations.add($anim.eq(j).attr("name"), animarray,  Number($anim.eq(j).attr("fps")), ($anim.eq(j).attr("loop") === "true"));
                if ($anim.eq(j).attr("sound"))obj.sound = game.add.audio($anim.eq(j).attr("sname"));

                // obj.sound = game.add
                //game.load.audio('boden', ['examples/assets/audio/bodenstaendig_2000_in_rock_4bit.mp3', 'examples/assets/audio/bodenstaendig_2000_in_rock_4bit.ogg']);
            }
            if($obj.attr("randomFrameCount") === "0") obj.animations.play($anim.eq(0).attr("name"));
            if($obj.attr("randomFrameCount") != "0"){
                if(fr < Number($obj.attr("randomFrameCount"))){

                    obj.frame = fr;
                    fr++;
                    if(fr ==  Number($obj.attr("randomFrameCount")))fr = 0;
                   // console.log('not', fr);

                }
            }
           // if($obj.attr("randomFrameCount") != "0")obj.frame = Math.floor(Math.random()*Number($obj.attr("randomFrameCount")));

            if($obj.attr("randomSpeed") == "true")  x.length < 1 ? obj.body.velocity.y = game.rnd.realInRange(Number($obj.attr("minSpeed"))*100, Number($obj.attr("maxSpeed")) * 100) : obj.body.velocity.x = -( game.rnd.realInRange(Number($obj.attr("minSpeed"))*100, Number($obj.attr("maxSpeed")) * 100));
             else  x.length < 1 ? obj.body.velocity.y = (Number($obj.attr("maxSpeed")) * 100) : obj.body.velocity.x = -(Number($obj.attr("maxSpeed")) * 100);
            if($xml.find("particles").attr("mode")=== "off")obj.events.onAnimationComplete.add(this.onAnimEnd, this);
            // console.log($anim.eq(i).attr("name"))
        }

    },

    addParticles: function (enm) {
        var $objects = $xml.find("particles");
        particles  = game.add.group();
        var lcount = levelCount;
        levelCount < Number($objects.children().length) ? lcount= levelCount : lcount = Number($objects.children().length)-1;
        var $objlevel = $objects.children().eq(lcount);
        for (var i = 0; i < $objlevel.children().length; i++) {
            var $obj = $objlevel.children().eq(i);
            this.addPtc($obj, enm, Number($obj.attr("width")), Number($obj.attr("height")), Number($obj.attr("x")), Number($obj.attr("y")), $obj.attr("name"), Number($obj.attr("count")));


        }
    },

    addPtc: function (node, enm, w, h, x, y, name, count) {
        var $obj = node;
        var lcount = levelCount;
        levelCount < Number($main_node.find('bg').children().length) ? lcount= levelCount : lcount = Number($main_node.find('bg').children().length)-1;
        $bglevel = $main_node.find('bg').children().eq(lcount);
        //console.log('enmcount', enm.x);
        for (var i = 0; i < count; i++) {
            var posx, posy;
           posx = Math.random() *(-enm.width/2)+enm.x + enm.width/4;
            posy =  Math.random() *(-enm.height/2)+enm.y+enm.height/4;
            // jellyfish.create(x * 1000, y * 200, 'jellyfish');
            // jellyfish.create(x * 1000, y * 200, 'jellyfish');
            var obj = game.add.sprite(posx, posy, name);
            obj.hit = false;
            obj.origY = posy;
            obj.origX = posx;
            obj.anchor.setTo($obj.attr("anchorX"),$obj.attr("anchorY"));
            obj.id=i;
            obj.immortal= ($obj.attr("immortal") == "true");
            obj.events.onOutOfBounds.add( this.destroyObj, this );
            obj.angle = game.rnd.integerInRange(-60, 60);
            particles.add(obj);
            var $anim = $obj.find("anim");
            for (var j = 0; j < $anim.length; j++) {
                //  console.log('name', $anim.eq(j).attr("name"));
                var animarray = $anim.eq(j).text().split(",");
                for(var k =0; k < animarray.length; k++)animarray[k] = Number(animarray[k]);
                obj.animations.add($anim.eq(j).attr("name"), animarray,  Number($anim.eq(j).attr("fps")), ($anim.eq(j).attr("loop") === "true"));
                if ($anim.eq(j).attr("sound"))obj.sound = game.add.audio($anim.eq(j).attr("name"));

                // obj.sound = game.add
                //game.load.audio('boden', ['examples/assets/audio/bodenstaendig_2000_in_rock_4bit.mp3', 'examples/assets/audio/bodenstaendig_2000_in_rock_4bit.ogg']);
            }
            TweenMax.delayedCall(.5, this.killObj, [obj]);
            obj.animations.play($anim.eq(0).attr("name"));
            this.game.add.tween(obj).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None).start();
            //console.log('enmcount', enm.velocity.x);
            obj.body.velocity.x = enm.body.velocity.x;
            obj.body.velocity.y = enm.body.velocity.y;
            obj.events.onAnimationComplete.add(this.onAnimEnd, this);
            // console.log($anim.eq(i).attr("name"))
        }
       // game.stage.scale.forceLandscape = true;

    },

    addEndScreen : function(){
        var $end = $xml.find("end");
        endgroup = game.add.group();
        var gameoverbg = this.game.add.sprite(Number($end.find("gameover").attr("x")), Number($end.find("gameover").attr("y")),$end.find("gameover").attr("name"));
        var againbutton = game.add.button(Number($end.find("tryagain").attr("x")), Number($end.find("tryagain").attr("y")), $end.find("tryagain").attr("name"), this.tryAgain, this, 0, 0, 1);


        var style = { font: $end.find("font").attr("fontSize")+"px " +  $end.find("font").attr("fontName"), fill:$end.find("font").attr("color"), align:  $end.find("font").attr("align")};
        var endtxt = game.add.text(game.world.centerX,  150, "You scored " + score +" points", style);
        endtxt.anchor.setTo(0.5, 0.5);
        endgroup.add(gameoverbg);
        endgroup.add(againbutton);
        endgroup.add(endtxt);
        if($end.find("submitscore").attr("mode")==="on"){
            var submitscore = game.add.button(Number($end.find("submitscore").attr("x")), Number($end.find("submitscore").attr("y")), $end.find("submitscore").attr("name"), this.submitScore, this, 0, 0, 1);
            endgroup.add(submitscore);
        }


        if($end.find("gameover").attr("sound"))gameoversnd = game.add.audio($end.find("gameover").attr("soundname"));
        if($end.find("competition").attr("mode")==="on" && Number($end.find("competition").attr("minScore")) <= score ){
            var compbutton = game.add.button(Number($end.find("competition").find("button").attr("x")), Number($end.find("competition").find("button").attr("y")), $end.find("competition").find("button").attr("name"), this.gotoLink, this, 0, 0, 1);
            compbutton.link = $end.find("competition").attr("url");
            endgroup.add(compbutton);
            //console.log('comp added');
        }
        TweenMax.from(endgroup,.3, {y:-gameoverbg.height});
        if(gameoversnd)gameoversnd.play();
        //console.log("endsnd", gameoversnd)

    },

    tryAgain : function(){
        liveCount = Number($xml.find("lives").attr("count"));
        score = 0;
        levelCount = 0;
        this.game.state.start('game');
    },

    submitScore : function(obj){
        obj.inputEnabled = false;
        var $end = $xml.find("end");
       $("body").append('<div id="formdiv"><form name="input" id="form" action="" method="get">Initials: <input type="text" maxlength="3" name="inititals" size="3" id="initials"><input id="submitbtn" type="image" src="img/sprites/submit.png" value=""></form></div>');
        //console.log("width", $("#form").width());

        $("#submitbtn").css({ "position":"relative", "top":"-6px", "width":"203px", "height":"80px", "border":"none", "color":"transparent", "float":"right" } );
        $("#initials").css({"font-size":"40px", "border":"solid 2px #fff", "color":"#fff", "backgroundColor":"rgba(0,0,0,0)"});
        $("#form").css({"backgroundColor":"rgba(0,0,0,.9)", "padding":"10px", "fontSize":"40px", "color":"#fff",  "fontFamily":$end.find("font").attr("fontName")});
        $("#formdiv").css({"position": "absolute", top:(this.game.stage.offset.y+(this.game.height/2) - 38)+'px', left:(this.game.stage.offset.x+(this.game.width/2) - 240)+'px'});

        $("form").on("submit", function (e) {
            sp.initials = $("#initials").val();
                e.preventDefault();
            $.ajax({
                type: "POST",
                url: "save.php",
                data: {initials:sp.initials, score:score},
                beforeSend: function() {

                },
                success: function(data) {
                   if(data == "result=true"){
                       $("#formdiv").remove();
                       sp.getHighScores();

                   }
                }

            })
        });
    },

    gotoLink : function(obj){
        window.open(obj.link)
    },

    getHighScores:function(e){
        var $end = $xml.find("end");
        var $hs = $end.find("highscore");
        var u;
        $.ajax({
            type: "POST",
            dataType:"xml",
            url: "scores.php",
            data:{initials:sp.initials},
            success: function(xml) {
                var $hxml = $(xml);
                if(endgroup)endgroup.destroy();
                endgroup = game.add.group();
                var hsbg = game.add.sprite(Number($hs.attr("x")), Number($hs.attr("y")),$hs.attr("name"));
                var againbutton = game.add.button(Number($hs.find("tryagain").attr("x")), Number($hs.find("tryagain").attr("y")), $hs.find("tryagain").attr("name"), sp.tryAgain, sp, 0, 0, 1);
                endgroup.add(hsbg);
                endgroup.add(againbutton);
                for( var i=0; i < $hxml.find("entry").length; i++ ){
                    var hcolor=$hs.find("font").attr("color");
                    if( $hxml.find("entry").eq(i).attr("activeuser") === "1"){
                        u=i
                        hcolor="#FFCC00";
                    }
                    var style = { font: $hs.find("font").attr("fontSize")+"px " +  $hs.find("font").attr("fontName"), fill:hcolor, align:"center"};
                    var ranktxt = game.add.text(Number($hs.attr("tableX")),  Number($hs.attr("tableY"))+(i*Number($hs.attr("spacingY"))),  $hxml.find("entry").eq(i).attr("rank"), style);
                    var nametxt = game.add.text(Number($hs.attr("tableX"))+Number($hs.attr("spacingX")),  Number($hs.attr("tableY"))+(i*Number($hs.attr("spacingY"))),  $hxml.find("entry").eq(i).attr("initials"), style);
                    var scoretxt = game.add.text(Number($hs.attr("tableX"))+(Number($hs.attr("spacingX")*2)),  Number($hs.attr("tableY"))+(i*Number($hs.attr("spacingY"))),  $hxml.find("entry").eq(i).attr("score"), style);
                        ranktxt.anchor.setTo(.5,.5);
                        nametxt.anchor.setTo(.5,.5);
                        scoretxt.anchor.setTo(.5,.5);

                    endgroup.add(ranktxt);
                    endgroup.add(nametxt);
                    endgroup.add(scoretxt);
                }
               /* hcolor="#FFCC00";
                var style = { font: $hs.find("font").attr("fontSize")+"px " +  $hs.find("font").attr("fontName"), fill:hcolor, align:"center"};
                var ranktxt = game.add.text(Number($hs.attr("tableX")),  Number($hs.attr("tableY"))+(($hxml.find("entry").length+1)*Number($hs.attr("spacingY"))),  $hxml.find("entry").eq(u).attr("rank"), style);
                var nametxt = game.add.text(Number($hs.attr("tableX"))+Number($hs.attr("spacingX")),  Number($hs.attr("tableY"))+(($hxml.find("entry").length+1)*Number($hs.attr("spacingY"))),  $hxml.find("entry").eq(u).attr("initials"), style);
                var scoretxt = game.add.text(Number($hs.attr("tableX"))+(Number($hs.attr("spacingX")*2)),  Number($hs.attr("tableY"))+(($hxml.find("entry").length+1)*Number($hs.attr("spacingY"))),  $hxml.find("entry").eq(u).attr("score"), style);
                ranktxt.anchor.setTo(.5,.5);
                nametxt.anchor.setTo(.5,.5);
                scoretxt.anchor.setTo(.5,.5);

                endgroup.add(ranktxt);
                endgroup.add(nametxt);
                endgroup.add(scoretxt);*/


                console.log('xml',  $hxml.find("entry").eq(0).attr("score"));
            }
        });
    },


    update: function () {

        if(this.playing){
           /* objects.forEach(function(obj){
                if(game.physics.overlap(player, obj))sp.onHit(player, obj);
               // obj.body.width= obj.bodyWidth;
                //obj.body.height = obj.bodyHeight;
            })*/
                 game.physics.overlap(player, objects, this.onHit, null, this);
            /*enemies.forEach(function(obj){
                if(game.physics.overlap(player, obj))sp.enemyHit(player, obj);

            })*/
            game.physics.overlap(player, enemies, this.enemyHit, null, this);

            if(player.projectile == true){
                game.physics.collide(bullets, enemies, this.bulletEnemyHit, null, this);
               // game.physics.collide(bullets, objects, this.bulletOnHit, null, this);
                if (game.input.activePointer.isDown)
                {
                    sp.fireBullet();

                }

            }


                /*if (game.input.y > 0)*/ this.move();

            if(objects.countLiving()== 0){
                levelCount++;
                this.playing = false;
                this.game.state.start('game');
                var $font = $xml.find("levelfont");
                var style = { font: $font.attr("fontSize")+"px " +  $font.attr("fontName"), fill: $font.attr("color"), align:  $font.attr("align") };

                var text= "LEVEL " + (levelCount+1);
                var leveltxt = game.add.text(game.world.centerX,  game.world.centerY, text, style);
                leveltxt.anchor.setTo(0.5, 0.5);

                 leveltxt.scale.x = leveltxt.scale.y=0;
                var tweensc = this.tweens.create(leveltxt.scale);
               tweensc.to({ x: 1, y:1 }, 700, Phaser.Easing.Linear.None)
                    .to({ x:0, y: 0 }, 400, Phaser.Easing.Linear.None);
                tweensc.start();

            }


             this.moveBG();

            if(menusnd.isPlaying)menusnd.stop();

        }else{
//           // console.log('player', player.body.velocity.x, player.body.velocity.y);
        }

    },
    moveBG: function () {
        var lcount = levelCount;
        levelCount < Number($xml.find('bg').children().length) ? lcount= levelCount : lcount =  Number($xml.find('bg').children().length)-1;
        var $level = $xml.find('bg').find('level').eq(lcount);
        for (var i = 0; i < $level.children().length; i++) {
            var posx, posy, w, h;
            var $bg = $level.children().eq(i);
            if ($main_node.attr("orientation") == "vertical") {
                posx = 0;
                posy = Number($bg.attr("scrollSpeed"));
                // console.log('posy ',posy);

            } else {
                posx = Number($bg.attr("scrollSpeed"));
                posy = 0;

            }

            switch (i) {
                case 0:
                    bottombg1.tilePosition.x -= posx;
                    bottombg1.tilePosition.y += posy;
                    break;

                case 1:
                    topbg1.tilePosition.x -= posx;
                    topbg1.tilePosition.y += posy;
                    break;

                case 2:
                    border1.tilePosition.x -= posx;
                    border1.tilePosition.y += posy;
                    break;

            }

          /*  switch (i) {
                case 0:
                    bottombgs.forEach(function (bg) {
                        bg.x -= posx;
                        bg.y += posy;
                    });

                    if (bottombg1.x <= -bottombg1.width) {
                        bottombg1.x = bottombg1.width;
                    } else if (bottombg2.x <= -bottombg2.width) {
                        bottombg2.x = bottombg2.width;
                    }

                    if (bottombg1.y >= bottombg1.height) {
                        bottombg1.y = -bottombg1.height;
                    } else if (bottombg2.y >= bottombg2.height) {
                        bottombg2.y = -bottombg2.height;
                    }
                    break;

                case 1:
                    topbgs.forEach(function (bg) {
                        bg.x -= posx;
                        bg.y += posy;
                    });

                    if (topbg1.x <= -topbg1.width) {
                        topbg1.x = topbg1.width;
                    } else if (topbg2.x <= -topbg2.width) {
                        topbg2.x = topbg2.width;
                    }

                    if (topbg1.y >= topbg1.height) {
                        topbg1.y = -topbg1.height;
                    } else if (topbg2.y >= topbg2.height) {
                        topbg2.y = -topbg2.height;
                    }

                    break;

                case 2:
                    borders.forEach(function (bg) {
                        bg.x -= posx;
                        bg.y += posy;
                    });

                    if (border1.x <= -border1.width) {
                        border1.x = border1.width;
                    } else if (border2.x <= -border2.width) {
                        border2.x = border2.width;
                    }

                    if (border1.y >= border1.height) {
                        border1.y = -border1.height;
                    } else if (border2.y >= border2.height) {
                        border2.y = -border2.height;
                    }

                    break;
            }*/
        }
        var lcount=levelCount;
        levelCount < Number($xml.find('fg').find('level').length) ? lcount= levelCount : lcount = $xml.find('fg').find('level').length-1 ;

        var $flevel = $xml.find('fg').find('level').eq(lcount);
        for (var i = 0; i < $flevel.children().length; i++) {
            var posx, posy, w, h;
            var $fg = $flevel.children().eq(i);
            if ($main_node.attr("orientation") == "vertical") {
                posx = 0;
                posy = Number($fg.attr("scrollSpeed"));
                // console.log('posy ',posy);

            } else {
                posx = Number($fg.attr("scrollSpeed"));
                posy = 0;

            }
            switch (i) {
                case 0:
                    fg1.tilePosition.x -= posx;
                    fg1.tilePosition.y += posy;
                    break;



            }
            /*switch (i) {
                case 0:
                    fgs.forEach(function (fg) {
                        fg.x -= posx;
                        fg.y += posy;

                        if (fg1.x <= -fg1.width) {
                            fg1.x = fg1.width;
                        } else if (fg2.x <= -fg2.width) {
                            fg2.x = fg2.width;
                        }

                        if (fg1.y >= fg1.height) {
                            fg1.y = -fg1.height;
                        } else if (fg2.y >= fg2.height) {
                            fg2.y = -fg2.height;
                        }
                    });
                    break;
            }*/
        }
    },
    move: function () {
        // for( var i in evt)*
        var posX;// = game.input.x;
        var posY;// = game.input.y;

        $heronode.attr("moveX") == "0" ? posX =  $heronode.attr("x") : posX = game.input.x;
        $heronode.attr("moveY") == "0" ? posY =  $heronode.attr("y") : posY = game.input.y;

        //console.log('posX', posX, posY);
        var bounce = game.add.tween(player);
        var bounceY = game.add.tween(player);
        bounce.to({
            x: posX
        }, 200);
        bounceY.to({
            y: posY
        }, 200);
       //$heronode.attr("moveX") == "1" ? player.body.velocity.x = posX :player.body.velocity.x=0 ;
      //  $heronode.attr("moveY") == "1" ? player.body.velocity.y = posY :player.body.velocity.y=0;
        // bounce.onComplete.add(startBounceTween, this);


        //if(posY > 320 && posY < 720 - (player.height*2))
        var lcount = levelCount;
        levelCount < Number($xml.find('bg').children().length) ? lcount= levelCount : lcount = 0;
        $bglevel = $xml.find('bg').children().eq(lcount);

      /*  if ($heronode.attr("moveX") == "1") {
            if (game.input.x > Number($bglevel.attr("minH")) && game.input.x < Number($bglevel.attr("maxH")))bounce.start();
            //else player.x =posX;
        } else player.x = game.input.x;
        if ($heronode.attr("moveY") == "1") {
            if (game.input.y > Number($bglevel.attr("minV")) && posY < Number($bglevel.attr("maxV")))bounceY.start();
            //else player.x =posX;
        } else player.y = posY;*/
        $heronode.attr("moveX") == "1" ? bounce.start() : player.x = posX;
        $heronode.attr("moveY") == "1" ? bounceY.start() : player.y = posY;




        if(player.backwards == true ){
            if(!player.failed)posX >= player.x  ? player.animations.play("move") : player.animations.play("move-reverse");
            else posX >= player.x  ? player.animations.play("fail") : player.animations.play("fail-reverse");
        }
        else{
            if(!player.failed)player.animations.play("move");
            else player.animations.play("fail");
        }
       // console.log('this', this);

        //  for( var i in evt.touches[0])
        // console.log(i + ' : ' + evt.touches[0][i]);
    },
    onHit: function (player, obj) {
        var $points =$xml.find("pointsFrame");
        if (!obj.hit) {
            if (obj.sound){
                obj.sound.play();

            }
            obj.animations.play('end');
            player.failed = false;
            if($points.attr("mode") === "on"){
                if(obj.pointsFrame > -1){
                    var points = game.add.sprite(obj.x, obj.y, $points.attr("name"));
                    points.frame = obj.pointsFrame;
                    points.anchor.setTo(0.5, 0.5);
                    TweenMax.to(points,.3,{y:points.y-30, onComplete:this.killObj, onCompleteParams:[points]});
                }
            }
            score = score+obj.points;
            if(score<0)score = 0;
            this.scoretxt.setText(score);

            //console.log('score',this.scoretxt.text)
            player.body.velocity.x=0;
            player.body.velocity.y=0;
            if($heronode.attr("moveX") == "0") player.x = Number($heronode.attr("x"));
            if($heronode.attr("moveY") == "0") player.y = Number($heronode.attr("y"));

//            /obj.exists = false;
          //  this.killObj(obj);

           // obj.kill();
            obj.hit = true;

            // obj.kill();
        }
    },
    bulletOnHit: function (bullet, obj) {
        var $points =$xml.find("points");
        if (!obj.hit) {
            if (obj.sound){
                obj.sound.play();

            }
            obj.animations.play('end');
            //console.log("hit");
            bullet.kill();

            if($points.attr("mode") === "on"){
                if(obj.pointsFrame > -1){
                    var points = game.add.sprite(obj.x, obj.y, $points.attr("name"));
                    points.frame = obj.pointsFrame;
                    points.anchor.setTo(0.5, 0.5);
                    TweenMax.to(points,.3,{y:points.y-30, onComplete:this.killObj, onCompleteParams:[points]});
                }
            }
            score = score+obj.points;
            if(score<0)score = 0;
            this.scoretxt.setText(score);

            obj.hit = true;

            // obj.kill();
        }
    },

    bulletEnemyHit: function (bullet, obj) {
        var $points =$xml.find("pointsFrame");
        if (!obj.hit) {
            console.log('bulletsnd', bullet);
            if (bullet.sound){

                bullet.sound.play();

            }
            if($xml.find("particles").attr("mode")=== "on")this.addParticles(obj);
            if(obj.randomFrameCount == 0)obj.animations.play('end');
           bullet.kill();
            if($points.attr("mode") === "on"){
                if(obj.shootPointsFrame > -1){
                    var points = game.add.sprite(obj.x, obj.y, $points.attr("name"));
                    points.frame = obj.shootPointsFrame;
                    points.anchor.setTo(0.5, 0.5);
                    TweenMax.to(points,.3,{y:points.y-30, onComplete:this.killObj, onCompleteParams:[points]});
                }
            }
            score = score+obj.shootPoints;
            if(score<0)score = 0;
            this.scoretxt.setText(score);

            obj.hit = true;

            // obj.kill();
        }
    },

    enemyHit: function (player, obj) {
        var $points =$xml.find("pointsFrame");

        if (!obj.hit){
            if (obj.sound){
               obj.sound.play();
            }
            //sndmgr.mute = true;
            if($xml.find("particles").attr("mode")=== "on")this.addParticles(obj);
            if(obj.randomFrameCount == 0) obj.animations.play('end');
            player.failed = true;

            if($points.attr("mode") === "on"){
                if(obj.pointsFrame > -1){
                    var points = game.add.sprite(obj.x, obj.y, $points.attr("name"));
                    points.frame = obj.pointsFrame;
                    points.anchor.setTo(0.5, 0.5);
                    TweenMax.to(points,.3,{y:points.y-50, onComplete:this.killObj, onCompleteParams:[points]});
                }
            }
            this.game.add.tween(obj).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None).start();
            liveCount--;
            score = score+obj.points;
            if(score<0)score = 0;
            this.scoretxt.setText(score);
            player.body.velocity.x=0;
            player.body.velocity.y=0;
            if(liveCount > 0){
                var live = lives.getAt(liveCount);
                live.kill();
            }else{
                gamesnd.stop();
               // console.log('playername', player);
                player.body.velocity.x = 0;
                player.body.velocity.y = 0;
                this.playing = false;
                var live = lives.getAt(liveCount);
                live.kill();


                objects.forEach(function(obj){
                    obj.body.velocity.x=0;
                    obj.body.velocity.y=0;
                });
                enemies.forEach(function(obj){
                    obj.body.velocity.x=0;
                    obj.body.velocity.y=0;
                })



                this.addEndScreen();
            }
        }
       // particles.x = obj.x;
       // particles.y = obj.y;
      //  obj.body.velocity.x = 0;

       // obj.body.velocity.y = 0;
        obj.hit = true;

        if($xml.find("particles").attr("mode")=== "on")TweenMax.delayedCall(.5, this.killObj, [obj]);

    },

    fireBullet:function(){
        if (game.time.now > this.bulletTime)
       // {

            var bullet = bullets.getFirstExists(false);
            //console.log("time",game.time.now, "bulletTime",bullet );
            if (bullet)
            {
                bullet.reset(Number(player.x), Number(player.y) );
                bullet.body.velocity.x=Number($heronode.find("projectile").attr("speedX"));
                bullet.body.velocity.y=Number($heronode.find("projectile").attr("speedY"));
               //bullet.x=player.x;
                //bullet.y = 400;

                bullet.animations.play($heronode.find("projectile").find("anim").eq(0).attr("name"));
               // console.log("fire",player.y, bullet.name);
                this.bulletTime = game.time.now + Number($heronode.find("projectile").attr("fireRate"));
            }
       // }

    },

    killObj: function (obj) {
       // console.log("killobj", obj.name);
        obj.kill();
        //console.log("living", objects.countLiving());
       // console.log("killobj", obj.exists, objects.countLiving() );
        //obj.exists = true;
       // console.log("aliveobj", objects._container.children[0], objects.countLiving() );
        /*obj.y=obj.origY
        obj.x = obj.origX;

       // obj.body.velocity.y = 0;
        obj.animations.play("move");
        obj.hit = false;*/

    },

    onFailEnd: function(player, anim){
        // console.log("animend", obj);
        switch(anim.name){
            case "fail":
                //console.log("animend");
                player.failed = false;
                break;
        }
        //console.log("livingdrop", objects.countLiving());

    },

    onAnimEnd: function(obj, anim){
      // console.log("animend", obj);
        switch(anim.name){
            case "end":
                //console.log("animend");
               if(!obj.immortal) obj.kill();
              break;
        }
        //console.log("livingdrop", objects.countLiving());

    },

    destroyObj: function(obj){
        //console.log("livingdrop", mainH);
        if(obj.y > mainH) obj.kill();
        if(obj.x < 0) obj.kill();
        //console.log("livingdrop", objects.countLiving());

    },
    onMute:function(obj){
        if(!MUTED){
            obj.frame = 1;
            this.game.sound.mute = true;
            MUTED = true;
        }else{
            this.game.sound.mute = false;
            obj.frame = 0;
            MUTED = false;
        }

    },
    render: function(){

        if($main_node.attr('debug')==="true"){
            game.debug.renderSpriteBody(player);
            objects.forEach(function(obj){
                game.debug.renderSpriteBody(obj);
            })
            enemies.forEach(function(obj){
                game.debug.renderSpriteBody(obj);
            })
        }


    }






}