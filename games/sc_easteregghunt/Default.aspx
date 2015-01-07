<%@ Page Language="C#" MasterPageFile="~/Master.master" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="shows__showTemplate_games_gamename_Default" %>
<%@ Register src="~/global/controls/showSchedule.ascx" tagname="ShowSchedule" tagprefix="uc1" %>
<%@ Register src="~/global/controls/RelatedGames.ascx" tagname="RelatedGames" tagprefix="uc1" %>
<%@ Register src="~/shows/controls/showNav.ascx" tagname="showNav" tagprefix="uc1" %>


<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">

    <script type="text/C#" runat="server">        
    string show = "Sanjay and Craig";
    string game = "Easter Egg Hunt";
    string width = "872";
    string height = "600";
    string genre = "Skill"; // must match xml exactly        
    </script>
    <script type="text/javascript">
    var show = "<%=show %>";
    var genre = "<%=genre %>";
    </script>    
   

    <title>Nick | Play <%=show %>: <%=game %> | Game | Nickelodeon</title>
    <meta name="keywords" content="Sanjay and Craig, Easter, Game, Free, Nickleodeon, Fun, Play, Online, Games, Nick, Nick UK, Nickelodeon UK" />
    <meta name="description" content="Play Easter Egg Hunt, only on Nick.co.uk" />    
    <link rel="stylesheet" type="text/css" href="/shows/css/new-template.css" />
    <link rel="stylesheet" type="text/css" href="../../css/custom.css" />
    <script type="text/javascript" src="/shows/js/showNav.js"></script>
    <script type="text/javascript" src="/global/js/related-games.js"></script>
     
  	<script src="../js/TweenMax.min.js"></script>
    <script src="../js/phaser.min.js"></script>
    <script src="../js/boot.js"></script>
    <script src="../js/preloader.js"></script>
    <script src="../js/menu.js"></script>
    <script src="../js/instruction.js"></script>
    <script src="../js/game.js"></script>
    <script src="../js/phaser-viewer.js" type="text/javascript"></script>
    
     
 <style type="text/css">
	@font-face {
				font-family: 'archivo_blackregular';
		src: url('img/fonts/archivoblack-regular-webfont.eot');
		src: url('img/fonts/archivoblack-regular-webfont.eot?#iefix') format('embedded-opentype'),
			 url('img/fonts/archivoblack-regular-webfont.woff') format('woff'),
			 url('img/fonts/archivoblack-regular-webfont.ttf') format('truetype'),
			 url('img/fonts/archivoblack-regular-webfont.svg#archivo_blackregular') format('svg');
		font-weight: normal;
		font-style: normal;
			}
       canvas {
		   padding:0px; 
		   display:inline !important; 
		   margin:auto;}
	   #container{
		   width:960;
		   height:960;
		   display:block;
		   overflow:visible !important;
	   }

   </style>
	<script type="text/javascript">

    
	var game;
	var player,topbgs,topbg1,topbg2,top,fgs,fg1, fg2, borders,bottombg1,bottombg2,borders,score = 0,endgroup,sndmgr,MUTED=false,
            border1,border2,jellyfish, snails,music, $main_node, $heronode, objects,mainW,mainH,levelCount= 0, bullets,menusnd,gamesnd,gameoversnd;
    var $xml;
    (function () {

        $.ajax({
            type: "GET",
            dataType:"xml",
            url: "xml/haunted.xml",
            success: function(xml) {

                //var xmlDoc = $.parseXML(xml);
                 $xml = $(xml);
               // console.log('xml',$xml.find(":first-child").attr("width"));
                $main_node = $xml.find(":first-child");

                //console.log('bg',$main_node.find('bg').children().eq(0) );
                mainW = Number($main_node.attr("width"));
                mainH = Number($main_node.attr("height"));
                game = new Phaser.Game( Number($main_node.attr("width")), Number($main_node.attr("height")), Phaser.CANVAS, "container");

                game.state.add('boot', Main.Boot);
                game.state.add('preloader', Main.Preloader);
                game.state.add('mainmenu', Main.MainMenu);
                game.state.add('game', Main.Game);
                game.state.start('boot');



            }
        })

    		
		})();


	</script>
 

</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="H1" Runat="Server">
     Play <%=show %>: <%=game %>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="ContentLeft" Runat="Server">
    <div id="show">
        <div id="show-header">
                

        </div>
        <uc1:showNav ID="showNav1" runat="server" />
        <span class="title"><%=game %></span>
        <div id="container">
        </div>
        
        
        
    </div>
    
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="smallGMP" Runat="Server"></asp:Content>

<asp:Content ID="Content6" ContentPlaceHolderID="overlayAd" Runat="Server"></asp:Content>