Main.Instruction = function (game) {

    //	Our main menu
    this.game = game;

};

Main.Instruction.prototype = {

    create: function () {
        var $info = $xml.find('instruction');
        var $menu = $xml.find('menu');
        //this.game.input.onDown.add(this.startGame, this);
        var bgtitle = game.add.sprite(0, 0,$menu.find("title").attr("name"));


        var $sprites = $menu.find("sprite");
        for(var i=0; i < $sprites.length; i++){
            var $sprite = $sprites.eq(i);
            // console.log($sprite.attr("url"));
            var obj = game.add.sprite(Number($sprite.attr("x")), $sprite.attr("y"),$sprite.attr("name"));
            obj.anchor.setTo(.5,.5);
           var  $anim = $sprite.find("anim");
            for(var j=0; j < $anim.length; j++){
                var animarray = $anim.eq(j).text().split(",");
                for(var k =0; k < animarray.length; k++)animarray[k] = Number(animarray[k]);
                //console.log(j);
                obj.animations.add($anim.eq(j).attr("name"), animarray, 12, ($anim.eq(j).attr("loop") === "true"));

            }
            obj.animations.play($anim.eq(0).attr("name"));
        }

        var info = game.add.sprite(Number($info.attr("x")), -50+Number($info.attr("y")),$info.attr("name"));
        TweenMax.from(info,.5, {y:-info.height, ease:Back.easeOut});

        game.input.onDown.add(this.startGame, this);


    },

    startGame: function () {

        // console.log('lets play');
        // playbutton.frame=1;
        menusnd.stop();
        this.game.state.start('game');

    }



}
