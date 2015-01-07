Main = {};

Main.Boot = function (game) {

};

Main.Boot.prototype = {

    preload: function () {
        var $preload = $xml.find("preloader");
        //        Here we load the assets required for our preloader (in this case a background and a loading bar)
        this.load.image($preload.attr("name"), $preload.attr("url"));

    },

    create: function () {

        //        Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
        this.game.input.maxPointers = 1;

        //        Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        //this.game.stage.disableVisibilityChange = true;
        var $canvas = $(game.canvas);
        this.game.stage.scale.width = $canvas.width()*Number($main_node.attr("scale"));
        this.game.stage.scale.height = $canvas.height()*Number($main_node.attr("scale"));

        if (this.game.device.desktop)
        {
            //        If you have any desktop specific settings, they can go in here
            //this.game.stage.scale.pageAlignHorizontally = true;
            //game.stage.scale.forceLandscape = true;
        }
        else
        {
            //game.stage.scale.forceLandscape = true;
            //        Same goes for mobile settings.
            //        In this case we're saying "scale the game, no lower than 480x260 and no higher than 1024x768"
            //this.game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;

            /*this.game.stage.scale.minWidth = Number($main_node.attr("height"))/2;
            this.game.stage.scale.minHeight = Number($main_node.attr("width"))/2;*/
            this.game.stage.scale.maxWidth = Number($main_node.attr("width"));
            this.game.stage.scale.maxHeight = Number($main_node.attr("height"));
           /* this.game.stage.scale.forceLandscape = true;
            this.game.stage.scale.incorrectOrientation = true;*/
            //this.game.stage.scale.pageAlignHorizontally = true;
           // this.game.stage.scale.setScreenSize(true);
        }
        this.game.stage.scale.refresh();

        //        By this point the preloader assets have loaded to the cache, we've set the game settings
        //        So now let's start the real preloader going


        this.game.state.start('preloader');

    }

};
