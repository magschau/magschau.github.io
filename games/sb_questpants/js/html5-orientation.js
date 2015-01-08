var $ORIENTATION_NOTIFY_EL,
	ORIENTATION_ANIMATING = false,
	ORIENTATION_CREATED = false;

$(document).ready(function() {
	if ( ORIENTATION_CREATED == true ) {
		return;
	}

	$ORIENTATION_NOTIFY_EL = $("#rotate-notify");
	ORIENTATION_SUPPORTED = $ORIENTATION_NOTIFY_EL.data("supported");
	ORIENTATION_CREATED = true;

	$("<div />")
		.attr("id", "rotate-pause-icon")
		.hide()
		.bind("touchend", function(e) {
			if ( ORIENTATION_ANIMATING ) return;

			var x = e.originalEvent.changedTouches[0].pageX,
				y = e.originalEvent.changedTouches[0].pageY,
				ORIENTATION_ANIMATING = true;

			$("#rotate-text-warning").show().css({
				top: y,
				left: x,
				opacity: 1,
				fontSize: 4,
				rProp: 0
			})
			.stop().animate({
				fontSize: 36,
				opacity: 0.2,
				rProp: -90
			},
			{
				duration: 950,
				step: function(now, fx) {
					if ( fx.prop == "rProp" ) {
						$("#rotate-text-warning").css({
							'-webkit-transform': 'rotate(' + now + 'deg)',
							'-moz-transform': 'rotate(' + now + 'deg)',
							'-ms-transform': 'rotate(' + now + 'deg)',
							'-o-transform': 'rotate(' + now + 'deg)',
							'transform': 'rotate(' + now + 'deg)'
						});
					}
				},
				complete: function() { 
					$(this).hide();
					ORIENTATION_ANIMATING = false;
				}
			});
		})
		.appendTo($("body"));

	$("<div />")
		.attr("id", "rotate-game-overlay")
		.hide()
		.css("opacity", 0.75)
		.appendTo($("body"));

	$("<div />")
		.attr("id", "rotate-text-warning")
		.text("TURN!")
		.hide()
		.appendTo($("body"));

	var referrer = document.referrer.split("/")[2] || "",
		$gamesLink = $("#rotate-backlink"),
		linkPath = "/games";

	if ( getParam("version") != null ) {
		var appRef = getParam("referer"),
			goToScreen = appRef != null ? appRef.replace("hub", "") : "games",
			linkPath = "nickapp://launch?screen=" + goToScreen;
	} else if ( referrer == "m.nick.com" || referrer == "t.nick.com" ) {
		linkPath = "http://" + referrer + "/games";
	} else if ( referrer.indexOf("addictinggames.com") !== -1 ) {
		linkPath = "http://m.addictinggames.com";
	}

	$gamesLink.attr("href", linkPath);

	$(window).on("resize", ORIENTATION_CREATE);
	ORIENTATION_CREATE();
});

function ORIENTATION_CREATE() {
	var isLandscape = $(window).width() > $(window).height(),
		windowHeight = window.innerHeight ? window.innerHeight : $(window).height();

	if ( ORIENTATION_SUPPORTED == "landscape" && !isLandscape ) {
		var start = windowHeight / 3,
			height = windowHeight - start;

		$("#rotate-pause-icon").show().height(start);
		$("#rotate-game-overlay").show().height(start);
		$ORIENTATION_NOTIFY_EL.show().css({
			top: start,
			height: height
		});
	} else if ( ORIENTATION_SUPPORTED == "portrait" && isLandscape ) {
		$ORIENTATION_NOTIFY_EL.show().css({
			height: windowHeight
		});
		$("#rotate-content-wrapper").css({
			paddingTop: Math.round((windowHeight/2) - ($("#rotate-content-wrapper").height()/2))
		});
	} else {
		$("#rotate-text-warning").hide();
		$("#rotate-pause-icon").hide();
		$("#rotate-game-overlay").hide();
		$("#rotate-notify").hide();
	}
}

function getParam(n) {
	var half = location.search.split('&'+n+'=')[1];
	if (!half) half = location.search.split('?'+n+'=')[1];
	return half? decodeURIComponent(half.split('&')[0]):null;
}