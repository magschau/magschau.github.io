// global variable
var $teamID,
	$messageObj,
	$teamObj,
	$basePath = 'localize/',
	$defaultLanguage = "en/",
	$contentBasePath = $basePath + $defaultLanguage + "content/",
	$defaultContent = "default/",
	$randmonKey = $.now();
	$.browser = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
	
Date.prototype.formated = function() {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
	var dd  = this.getDate().toString();
	return yyyy + '-' +(mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
};

d = new Date();
$formatedDate = d.formated() + '/';	


// get request "lang"
var $mainURL = document.URL,
	$splitURL = $mainURL.split("?"),
	$requestURL,
	$ipVersion = $defaultLanguage;

if($splitURL[1])
{
	$requestURL = $splitURL[1];
	
	var $splitLang = $requestURL.split("=");
	if($splitLang[0] == 'lang'){
		
		$ipVersion = $splitLang[1] + '/';
	}
}

$.getJSON( $basePath + $ipVersion + 'misc/message.json?v='+$randmonKey, function( $_messageObj ) {
	
	$messageObj = $_messageObj;
})
.done(function(){

	setupBtn();
	$.getJSON( $contentBasePath + $formatedDate + 'team_content.json?v='+$randmonKey, function( $_teamObj ) {
		$teamObj = $_teamObj;
	})
	.done(function(){ // day tasks
		$contentBasePath = $contentBasePath + $formatedDate ;
		
		mainProccess();
	})
	.fail(function(){ // default tasks
		$.getJSON( $contentBasePath + $defaultContent + 'team_content.json?v='+$randmonKey, function( $_teamObj ) {
			$teamObj = $_teamObj;
		})
		.done(function(){
			$contentBasePath = $contentBasePath + $defaultContent ;
			
			mainProccess();
			
		})
		.fail(function(){
			refresh();
		});
	});
	
})
.fail(function(){
	//your path not found.
});

function mainProccess()
{
	loadAssets = $('<div></div>')
	.attr('id', 'loadAssets')
	.css({
		display: "none",
	})
	.appendTo('body');
	
	$.each($teamObj,function($index, $value)
	{
		var $imageAppend = '';
			$imageAppend += '<img src="' +$contentBasePath + 'images/characters/'+ $value.char_image + '" alt="Image not found" onError="brokenImageChar(this);" />';
			$imageAppend += '<img src="' +$contentBasePath + 'images/tasks/'+ $value.task_image + '" alt="Image not found" onError="brokenImageTask(this);" />';
		$($imageAppend)
		.appendTo(loadAssets);
	})
	
	$('<img src="includes/images/assets/broken-image-char.png" />')
		.appendTo(loadAssets);
		
	$('<img src="includes/images/assets/broken-image-task.png" />')
		.appendTo(loadAssets);
		
	$('<div></div>')
	.attr('class','slime-drop')
	.appendTo(loadAssets);
	
	$('<div></div>')
	.attr('class','slime-big-drop')
	.appendTo(loadAssets);
	
	$('<div></div>')
	.attr('class','box-icon-up')
	.appendTo(loadAssets);

	// home content
	$("#title-app").html($messageObj.content.slime_sub_title);
	$("#about-app").html($messageObj.content.about_desc);
	$("#home-box-title").html($messageObj.content.home_title);
	
	// next event
	$('#next-event-desc').html($messageObj.content.next_challenge_content);
	
	// preloader
	$('body')
	.jpreLoader({
		splashID: "#jSplash",
		loaderVPos: '80%',
		splashVPos: '10%'
		//autoClose: false,
		
	}, function() {	
		//callback function
		
	});
	
	
	$(".btn-team").click(function(){
		$teamID = $(this).data("id");
		$teamActiveObj = $teamObj[$teamID];
		
		// popup box
		var $modalContent = '';
			$modalContent += 	'<div id="popup-team-image" class="col-lg-3 col-md-3 col-sm-3 col-xs-4">';
			$modalContent +=	'	<img src="includes/images/team_icons/' + $teamActiveObj.team_image + '" />';
			$modalContent +=	'</div>';
			$modalContent +=	'<div id="popup-team-message" class="col-lg-9 col-md-9 col-sm-9 col-xs-8">' + $messageObj.content.popup_message + '?</div>';
		
		$(".modal-content-popup").html($modalContent);
		
		$(".team-color").html($teamActiveObj.name);
		
		// $(".container").bind('touchmove', function(e) {
			// e.preventDefault();
		// });
		// $('.modal').on('touchstart', function(event) {
			// event.preventDefault();

		// });
			
			
			if($.browser){
				$('body').css({'overflow':'hidden'});
				$('body').css('position','fixed');
			}
			
			// document.getElementById('home-box-title').scrollIntoView();
	});
	$("#modal-back")
		.click(function()
		{
			
			if($.browser){
				$('body').css({'overflow':'auto'});
				$('body').css('position','auto');
			}
			
		})
	
	$("#modal-approve")
		.click(function()
		{
			if($.browser){
				$('body').css({'overflow':'auto'});
				$('body').css('position','auto');
			}
			
			var $modal = $('#modal-popup');
			$modal.modal('hide'); //start hiding
			
			setTimeout(function(){
				$("#home-container").fadeOut(1000);
			},200);
			setTimeout(function(){
				// character content
				$('#char-name').html( $teamActiveObj.char_name );
				$('#char-team').html( $teamActiveObj.name );
				$('#char-message').html( '"' + $teamActiveObj.char_message + '"' );
				$('#char-image').html('<img src="' + $contentBasePath + 'images/characters/' + $teamActiveObj.char_image + '" alt="Image not found" onError="brokenImageChar(this);" />');
				
				// tasks content
				$("#task-header #team-box-title").html( $teamActiveObj.task_header_title );
				$("#task-image").html( '<img src="' + $contentBasePath + 'images/tasks/' + $teamActiveObj.task_image + '" alt="Image not found" onError="brokenImageTask(this);" />' );
				$("#task-desc").html( $teamActiveObj.task_desc );
				
				
				
				
				$("#team-container").fadeIn(1000);
			},1200);
			
		});
	
	$("#task-start")
		.click(function()
		{
			var $_this = $(this);
			
			$('#modal-alert').modal('show');
			$('.modal-content-alert').html($messageObj.alert.ready);
			setTimeout(function(){
				$('.modal-content-alert').html($messageObj.alert.set);
			},1000);
			setTimeout(function(){
				$('.modal-content-alert').html($messageObj.alert.go);
			},2000);
			setTimeout(function(){
				var $modal = $('#modal-alert');
				$modal.modal('hide'); //start hiding
				$_this.hide();
				if($teamActiveObj.task_time == 0){
					cheerUp();
				}else{
					taskCountdownTimer($teamActiveObj.task_time);
				}
			},3000);
			
		});	
	
	
	
	$("#task-done")
		.click(function()
		{
			
			$("#task-header #team-box-title").html( $messageObj.content.measure_slime_title );
			$('#task-content').slideUp(1000);
			setTimeout(function(){
				$('#reward-desc').hide();
				$('#reward-button').hide();	
				$('#task-proccess').hide();
				$('#reward-proccess').show();
				
				$('#task-content').slideDown(1000);
				slimeDrop();
			},3000);
			
			setTimeout(function(){
				$('.slime-drop').fadeOut(1500);
				$('.slime-big-drop').fadeOut(1000);
				
				
				$('#reward-desc').html($messageObj.slime_points[Math.floor(Math.random() * ($messageObj.slime_points.length - 1))]);
				$(".team-color").html($teamActiveObj.name);
				
			},5000);
			setTimeout(function(){
				$("#task-header #team-box-title").html( $messageObj.content.reward_title );
				$('#reward-desc').fadeIn(1000);
				$('#reward-button').fadeIn(1000);
			},6000);
			/*
					
					*/
		});
	
	
	$("#reward-claim")
		.click(function(){
			
			$('#task-content').slideUp(1000);
			setTimeout(function(){
				$('#reward-proccess').hide();
				$('#next-event-proccess').show();
				nextEvent();
				
				$('#task-content').slideDown(1000);
				$("#task-header #team-box-title").html( $messageObj.content.next_challenge_title );
			},3000);
		});
	
	$("#start-over-button").click(function(){
		refresh();
	});
}

//button animation
$('.btn-slime')
	.mouseenter(function(){
		$(this).css({'color':'#ceedbc'});
	})
	.mouseout(function(){
		$(this).css({'color':'#fff'});
	})
	.mousedown(function(){
		$(this).css({'font-size':'28px','padding-top':'3px'});
	})
	.mouseup(function(){
		$(this).css({'font-size':'32px','padding-top':'0px'});
	});

var $teamColor;	
$('.btn-team')
	.mouseover(function(){
		
		// switch($(this).data('id')){
			// case 1: 
					// $teamColor = 'red';
					// break;
			// case 2: 
					// $teamColor = 'yellow';
					// break;
			// case 3: 
					// $teamColor = 'purple';
					// break;
			// case 4: 
					// $teamColor = 'blue';
					// break;
			// default:break;
					
		// }
		$(this).css({'margin-top':'-15px'});
		// $(this).attr("src","includes/images/team_icons/team-"+$teamColor+"-cover.png");
	})
	.mouseout(function(){
		$(this).css({'margin-top':'0px'});
		// $(this).attr("src","includes/images/team_icons/team-"+$teamColor+".png");
	});
//button animation	






function taskCountdownTimer($coundown)
{	
	
	$("#task-countdown-timer").show();
	$("#task-countdown-timer").countdown({
		until: $coundown,
		compact: true,
		onExpiry: callDone
	});
}

function nextEvent()
{
	var _tomDate = new Date();
	_tomDate.setDate( _tomDate.getDate() + 1);
	_tomDate.setHours(0,0,0,0);
	
	$( '#day-countdown-timer' ).countdown({
										until: _tomDate,
										compact: true,
										onExpiry: refresh
									});
	
}

$(function(){
    //Recalculate iframe's height when content height changes.
    var $body = $('body');
    $body.bind('DOMSubtreeModified', function(){
        //Timeout hack to avoid too much recursion.
        var to = setTimeout(function(){
            clearTimeout(to);
            $('.slimecup-site-app', parent.window.document).height($body.outerHeight(true));
        }, 50);    
    });
});


function refresh()
{
	location.reload();
}

function callDone()
{
	$("#task-countdown-timer").hide();
	$("#task-done").fadeIn(200);
}

function cheerUp()
{
	var _setTime = 5;
	var _setSpeed = 3;
	
	var _totalStay = 0;
	var $_this = $('.task-animate-go');
	
	$_this.show();
	
	for(var i=0; i < (_setTime*_setSpeed); i++){
		
			$_this.animate({
				'font-size':'32px'
			}, Math.floor(500/_setSpeed) );
			
			$_this.animate({
					'font-size':'45px', 'line-height':'45px'
				}, Math.floor(1000/_setSpeed) ,function(){
					
			});
		_totalStay += Math.floor(1500/_setSpeed);
	}
	
	setTimeout(function() {
		$_this.fadeOut(200);
		setTimeout(function() {
			$('#task-done').fadeIn(200);
		},500);
	}, _totalStay);
	
}

function setupBtn()
{
	$messageObj
	$(".btn-refresh").html($messageObj.btn.refresh);
	$(".btn-done").html($messageObj.btn.done);
	$(".btn-done-v2").html($messageObj.btn.done_v2);
	$(".btn-go").html($messageObj.btn.go);
	$(".btn-back").html($messageObj.btn.back);
	$(".task-animate-go").html($messageObj.alert.go);
	
}

function slimeDrop()
{
	var myLeft = 0;
	var myTop = 0;
	var delayTime = 1000;
	var pickWidth = [0,5,10,15,20,25,30,35,40,45,50,55,60];
	var pickHeight = [0,5,10,15,20,25,30,35,40];
	var testing = [];
	var coordination;

	// and the formula is:

	for(var i = 0; i < 50; i++){
		delayTime += 15;
		setTimeout( function(){
		
			myLeft = pickWidth[Math.floor(Math.random() * pickWidth.length)];
			myTop = pickHeight[Math.floor(Math.random() * pickHeight.length)];
			coordination = myLeft+','+myTop;
			

			if(testing.indexOf(coordination) == -1){
				
				
				testing.push(coordination);
				
				$('<div></div>')
				.attr('class','slime-drop')
				.css({
						'left' : myLeft+'%',
						'top' : myTop+'%'
				})
				.appendTo('#reward-proccess');
				
			}
			
			}, delayTime);
		
	}
	
	/*
	setTimeout(function(){
		$('<div></div>')
			.attr('class','slime-big-drop')
			.appendTo('#reward-proccess');
	}, delayTime+400);
*/
}	

function brokenImageChar(image)
{
				image.onerror = "";
				image.src = "includes/images/assets/broken-image-char.png";
				// set width/height
				// image.style.width = "94%";
				// image.style.height = "94%";
				// image.style.margin = "3%";
				// or add class name
				image.className = "img-error";
				return true;
}

function brokenImageTask(image)
{
				image.onerror = "";
				image.src = "includes/images/assets/broken-image-task.png";
				// set width/height
				// image.style.width = "94%";
				// image.style.height = "94%";
				// image.style.margin = "3%";
				// or add class name
				image.className = "img-error";
				return true;
}

