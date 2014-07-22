/* JSEmbed
 * is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 * by Keith McCullough, Workinman Interactive, 2013
 * thanks to Nate Altschul, Oliver Marsh, SWFObject project
 * 
 */
var jsembed = function()
{
	// Constants
	var VERSION 				= "1.0";
	
	var API_NONE 			= "none";
	var API_HAXE_NME 		= "nme";
	var API_HAXE_FLAMBE 	= "flambe";
	var API_CONSTRUCT_2 	= "c2";
	var API_TRESENSA		= "tresensa"
	
	var UNDEF 					= "undefined";
    var OBJECT 					= "object";
    var ON_READY_STATE_CHANGE 	= "onReadystatechange";    
    
    // Scaling and Dimension support
    var widthIdeal 	= 960; // Default only, value set at runtime via jsembed.embed -- represents the "native" dimensions of the embeded JS app
    var heightIdeal = 560; // Default only, value set at runtime via jsembed.embed -- represents the "native" dimensions of the embeded JS app
    var scaleMax = 3; // The largest ratio we let the app scale to. 3 represents 300%.
    
    // DOM Elements
    var win = window;
    var doc = document;
    var nav = navigator;
    
    // Load/Embed Sequencing props
    var flagDomLoaded = false;        
    var flagEmbedCalled = false;
    var flagScalingScriptEmbeded = false;
    var flagPaused = false;
    var domLoadFunctions = [onReady];
    
    // Library loading support.
    var libsLoaded = 0;
    var libsToLoad = 0;
    var libList = [];
    var libs;
    
    // Stored props
	var appJs = "";
	var base = ""; // Default. Should be passed in as param.	
	var targetId;
	var api; // API used for this embed (see API_ contants above). Set as param in jsembed.embed().
	//var width; // Requested embed width in pixels via jsembed.embed() property. // OBSOLETE, now widthIdeal
	//var height; // Requested embed height in pixels via jsembed.embed() property. // OBSOLETE, now heightIdeal	
	var attributes; // Attributes will be available inside the app. They are also set as attributes on the embedtarget div.
	var parameters; // Parameters are for configuring JSEmbed at runtime.
	var flagIndexRoot; // Use the page index as the root for relative base path, instead of the domain root. Set as indexroot:"true"/"false" in jsembed params.
	var flagBaseCrossdomain = false; // Flag. Updated when base is defined. Becomes true if base domain doesn't match page domain.
	var _canvasWidth; // Actual runtime width of canvas in pixels. Updated constantly.
	var _canvasHeight; // Actual runtime height of canvas in pixels. Updated constantly.
	var _canvasScale; // Actual runtime scale of canvas, calculated by comparing real width/height to widthIdeal/heightIdeal. Updated constantly.
	
	// IE Console fix, for the inevitable situation when a .log is accidentally left in the code.
	if (!window.console) window.console = {};
	if (!window.console.log) window.console.log = function () { };
		
	// Start things by embedding the default meta tags.
	embedMetaTags();
	
	 /* Centralized function for browser feature detection
    - User agent string detection is only used when no good alternative is possible
    - Is executed directly for optimal performance
    - Based on SWFObject solution.
	*/      
	var ua = function() {
	    var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF,
	            u = nav.userAgent.toLowerCase(),
	            p = nav.platform.toLowerCase(),
	            windows = p ? /win/.test(p) : /win/.test(u),
	            mac = p ? /mac/.test(p) : /mac/.test(u),
	            webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
	            ie = !+"\v1", // feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
	            playerVersion = [0,0,0],
	            d = null;
	   
	    return { w3:w3cdom, wk:webkit, ie:ie, win:windows, mac:mac };
	}();

	var onDomLoad = function() {   
		
        if ((typeof doc.readyState != UNDEF && doc.readyState == "complete") || (typeof doc.readyState == UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))) { // function is fired after onload, e.g. when script is inserted dynamically 
                verifyDomLoad();
        }
        if (!flagDomLoaded) {        	
                if (typeof doc.addEventListener != UNDEF) {
                        doc.addEventListener("DOMContentLoaded", verifyDomLoad, false);
                }               
                if (ua.ie && ua.win) {
                        doc.attachEvent(ON_READY_STATE_CHANGE, function() {
                                if (doc.readyState == "complete") {
                                        doc.detachEvent(ON_READY_STATE_CHANGE, arguments.callee);
                                        verifyDomLoad();
                                }
                        });
                        if (win == top) { // if not inside an iframe
                                (function(){
                                        if (flagDomLoaded) { return; }
                                        try {
                                                doc.documentElement.doScroll("left");
                                        }
                                        catch(e) {
                                                setTimeout(arguments.callee, 0);
                                                return;
                                        }
                                        verifyDomLoad();
                                })();
                        }
                }
                if (ua.wk) {
                        (function(){
                                if (flagDomLoaded) { return; }
                                if (!/loaded|complete/.test(doc.readyState)) {
                                        setTimeout(arguments.callee, 0);
                                        return;
                                }
                                verifyDomLoad();
                        })();
                }
              
                addDomLoadListeners(verifyDomLoad, failDomLoad);
        }
	}();	
	
	/*
	Sets necessary CSS Settings to make games work on tablets, phones, etc.  
	 */
	function embedCSS() 
	{
		var tStyle = doc.body.style;
		tStyle.setProperty("-ms-touch-action", "none", null);
	}
	/*
	Adds meta tags needed to make games work on tablets, phones, etc.  
	 */
	function embedMetaTags() 
	{
		addMetaTag("apple-mobile-web-app-capable", "yes");
		addMetaTag("apple-mobile-web-app-status-bar-style", "black");
		addMetaTag("viewport", "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no");
		addMetaTag("HandheldFriendly", "true");
	}
	/*
	Adds script to make canvas scale dynamically  
	 */
	function embedScalingScript() 
	{
		if(parameters.autoscale=="false")
		{
			scaleSet(1);
			return;
		}
		if(flagScalingScriptEmbeded){return;}
		flagScalingScriptEmbeded = true;
		addEvent(window,'resize',onEventResize);
		scaleCalculate();
		setTimeout(scaleCalculate, 500); // Ugly hack to work around mobile safari's documentSize delay. [Keith] No longer needed?
	}
	/*
	Adds misc. support scripts to body.
	 */
	function embedSupportBodyScripts() 
	{
		// winParameters
		document.body.winParameters = function() { return {};}
		// Playnomics
		document.body._pnConfig = new Array();
		window._pnConfig = new Array();
		// prevent touchmove
		addEvent(document.body, 'touchmove', function(event){event.preventDefault();});
	}
	/*
	Helper method to embed a lib Js.
	set skipDuplicateLibs to skip this embed if the libJs is also present in the libs array. 
	This is useful if you want to hardcode libraries for a custom api but don't want them embedded twice on accident.
	 */
	function embedLib( libJs , skipDuplicateLibs , isReload, loadDelay, libsIgnoreBase) 
	{
		if(loadDelay>0)
		{
			libsToLoad++;
			setTimeout( function(){embedLib(libJs, skipDuplicateLibs, true, 0)}, loadDelay);
			return;
		}
		var duplicateFound = false;
		if(skipDuplicateLibs != false || isReload != false )
		{
			for(var l in libList)
			{
				if(libList[l].src == libJs)
				{
					duplicateFound = true;
					if(isReload)
					{						
						libList[l].retry++;
						if(libList[l].retry>3)
						{
							return;
						}
					} else {
						return;
					}
				}
			}
		}
		if(!duplicateFound)
		{
			if(!isReload){libsToLoad++;}
			libList[libList.length] = {src:libJs, retry:0};			
		}				
		
		var libscript = document.createElement("script");
		libscript.setAttribute('type', 'text/javascript');		
		libscript.src = libsIgnoreBase==true?libJs:fixUrl(libJs);		
		addEvent(libscript, "load", onEventLibLoaded);		
		addEvent(libscript, "error", onEventLibError);		
		doc.getElementsByTagName('head').item(0).appendChild(libscript);
	}
	
	/* Helper method to add a metatag easily */
	function addMetaTag( inName, inContent )
	{
		var tMetaTag = doc.createElement('meta');		
		tMetaTag.name = inName;
		tMetaTag.content = inContent;
		
		doc.getElementsByTagName('head').item(0).appendChild(tMetaTag);
	}
	/* Helper method to add an event listener to an element. */
	function addEvent (elem, type, eventHandle) {
		if (elem == null || elem == undefined) return;
		if ( elem.addEventListener ) {
			elem.addEventListener( type, eventHandle, false );
		} else if ( elem.attachEvent ) {
			elem.attachEvent( "on" + type, eventHandle );
		} else {
			elem["on"+type]=eventHandle;
		}
	}
	/* Helper method to remove an event listener to an element. */	
	function removeEvent (elem, type, eventHandle) {
		if (elem == null || elem == undefined) return;
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, eventHandle );
		} else if ( elem.detachEvent ) { 
			elem.detachEvent( "on" + type, eventHandle );
		} else {
			elem["on"+type]=null;
		}
	}
	
	/* Test if the DOM is loaded. */
	function verifyDomLoad() {
	        if (flagDomLoaded) { return; }
	        try { // test if we can really add/remove elements to/from the DOM; we don't want to fire it too early
	                var t = doc.getElementsByTagName("body")[0].appendChild(doc.createElement("span"));
	               
	                t.parentNode.removeChild(t);
	        }
	        catch (e) { return; }
	        flagDomLoaded = true;
	        var dl = domLoadFunctions.length;
	        for (var i = 0; i < dl; i++) {
	                domLoadFunctions[i]();
	        }
	}
	/* Test if the DOM load failed. */
	function failDomLoad() {
		//alert("jsEmbed Dom load failed!");
		//embedLib(event.target.src, false, true,0);
	}
	 
	/* Cross-browser onload
	        - Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
	        - Will fire an event as soon as a web page including all of its assets are loaded 
	        - Based on SWFObject
	 */
	function addDomLoadListeners(fnPass, fnFail) 
	{
	        if (typeof win.addEventListener != UNDEF) {
	                win.addEventListener("load", fnPass, false);
	                win.addEventListener("error", fnFail, false);
	        }
	        else if (typeof doc.addEventListener != UNDEF) {
	                doc.addEventListener("load", fnPass, false);
	                doc.addEventListener("error", fnFail, false);
	        }
	        else if (typeof win.attachEvent != UNDEF) {
	                addListener(win, "onload", fnPass);
	                addListener(win, "onerror", fnFail);
	        }
	        else if (typeof win.onload == "function") {
	                var fnOld = win.onload;
	                win.onload = function() {
	                        fnOld();
	                        fnPass();
	                };
	                var fnOldFail = win.onerror;
	                win.onerror = function() {
	                	fnOldFail();
	                	fnFail();
	                };
	        }
	        else {
	                win.onload = fn;
	        }
	}
	
	/* 
    Occurs when the DOM is loaded 
	 */
	function onReady() 
	{		
		// If we're still loading libs, don't progress!		
		if(libsLoaded<libsToLoad)
		{		
			return;
		}
			
		embedSupportBodyScripts();
		
		if(flagEmbedCalled)
		{
			embedCSS();		
			setTimeout( executeJsEmbed, 500);
		}	
	}

	/* 
    Execute the actual jsembed code. 
	 */
	function executeJsEmbed()
	{				
		var tar = doc.getElementById(targetId);

		// Create app script element
		var app = doc.createElement('script'); 
		// Set attributes included in embed
		// Attributes are set on the target <div> or <object>. You can get them from within your app by referencing it. [TODO] Better recommendations for getting it? It's rather difficult currently.
		app.setAttribute("async", "true");
		app.setAttribute('type', 'text/javascript');

		// Add all attributes to the tar object
		for (var pKey in attributes) 
		{
		  if (attributes.hasOwnProperty(pKey)) 
		  {
			  tar.setAttribute(pKey, attributes[pKey]);
		  }
		}		
		
		// Always Include the base		
		tar.setAttribute("base", base);
		
		if(embedCustomAPIMain(tar, app) == true)
		{
			if(appJs == "")
			{
				return;
			}	
			// Append the app
			addEvent(app, "load", onEventMainLoaded);
			addEvent(app, "error", onEventMainError);
			tar.appendChild(app);
		}
			
	}
	/* 
    Append base to a URL, if it's not absolute. 
	 */
	function fixUrl( inUrl ) 
	{
		if(inUrl.indexOf("http")<0)
		{
			return base+inUrl; // omarsh
		}
		return inUrl;
		
	}	
	/* 
    Get the domain from a URL 
	 */
	function getDomain( inUrl ) 
	{
		var s = inUrl.substr(0, 8), d;
		try{
		if(s.search('http://')<0 && s.search('https://')<0 && s.search('ftp://')<0){s="http://"+inUrl;}else{s=inUrl;}
		d = s.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/)[2];}
		catch(e){
		d = "" ;}
		return d ;		
	}
	/* 
    Helper method to return the api set via parameters. If null, assume API_NONE. 
	 */
	function getCustomAPI() 
	{
		if(parameters==null){return API_NONE;}
		if(api!=null)
		{
			if(api.toLowerCase() == "nme")
			{
				return API_HAXE_NME;
			} else if(api.toLowerCase() == "flambe")
			{
				return API_HAXE_FLAMBE;
			} else if(api.toLowerCase() == "c2" || api.toLowerCase() == "construct2")
			{
				return API_CONSTRUCT_2;
			} else if(api.toLowerCase() == "tresensa")
			{
				return API_TRESENSA;
			}
		}
		return API_NONE;
	}	
	/* 
    Set the scale of the document canvas. Used for dynamic stage resizing.
	 */
	function scaleSet (pScale)
	{
	    if ( pScale > scaleMax ) pScale = scaleMax;
	    
	    if(parameters.autoscale!="false")
	    {
		    var tFinalW = Math.round(widthIdeal*pScale*1000)/1000;
		    var tFinalH = Math.round(heightIdeal*pScale*1000)/1000;
		    
		    var d = doc.getElementById(targetId);
	    
		    d.style.width = tFinalW + "px";
		    d.style.height = tFinalH + "px";
		    //d.style.left = ((tWidth/2) - (tFinalW/2)) + "px";
		    d.style.left = ((getBrowserWidth()/2) - (tFinalW/2)) + "px";
	    }
	    //if(console.log){console.log("CanvasScale: " + pScale);}
	    win.canvasScale = pScale; // [TODO] Legacy. Should probably remove.
	    doc.canvasScale = pScale; // [TODO] Legacy. Should probably remove.
	    _canvasScale	= pScale;
	    _canvasWidth 	= getBrowserWidth();
	    _canvasHeight 	= getBrowserHeight();
	    
	}
	/* 
    Window Resize event listener callback. Used for dynamic stage resizing.
	 */
	function onEventResize (event)
	{
		scaleCalculate();
	}
	/* 
    Helper method to calculate the correct scale ratio. Used for dynamic stage resizing.
	 */
	function scaleCalculate()
	{
		 var tWidth = getBrowserWidth();
         var tHeight = getBrowserHeight();
         //if(console.log){console.log("Width: " + tWidth + " Height: " + tHeight);}
         var tScale = 1;
         if ( tWidth/widthIdeal < tHeight/heightIdeal ) tScale = tWidth/widthIdeal;
         else tScale = tHeight/heightIdeal;         
         scaleSet(tScale);
	}
	/*
	Get the client width.
	 */
    function getBrowserWidth()
    {
    	/*
    	return Math.max(
    	        Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
    	        Math.max(document.body.offsetWidth, document.documentElement.offsetWidth),
    	        Math.max(document.body.clientWidth, document.documentElement.clientWidth)
    	    );*/
        //var userAgent = window.navigator.userAgent;
        //if (userAgent.match(/iPhone/i)) { return window.screen.width; }
        if (window.innerWidth) { return window.innerWidth; }
        if (document.documentElement && document.documentElement.clientWidth != 0) { return document.documentElement.clientWidth; }
        if (document.body) { return document.body.clientWidth; }
        return 0;
    };
    /*
	Get the client height.
	 */
    function getBrowserHeight()
    {
    	/*
    	return Math.max(
    	        Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
    	        Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
    	        Math.max(document.body.clientHeight, document.documentElement.clientHeight)
    	    );*/
        //var userAgent = window.navigator.userAgent;
        //if (userAgent.match(/iPhone/i)) { return window.screen.height; }
        if (window.innerHeight) {  return window.innerHeight; }
        if (document.documentElement && document.documentElement.clientHeight != 0) { return document.documentElement.clientHeight; }
        if (document.body) { return document.body.clientHeight; }
        return 0;
    };
    /*
	Callback when one of the library js preloads. Library JS would be loading via embedLib, which will only usually run before the mainJS is embedded.   
	 */
	function onEventLibLoaded( event ) 
	{
		libsLoaded++;
		if(flagDomLoaded)
		{
			onReady();
		}
	}
	
	function onEventLibError( event ) 
	{
		//alert("jsEmbed onEventLibError " + event.target.src);
		
		//embedLib(event.target.src, false, true,0);
		//setTimeout( function (){embedLib(event.target.src, false, true,0);}, 500);
		embedLib(event.target.src, false, true, 500, true)
		
	}
	/*
	Callback when the main JS loads. Only exists to call embedCustomAPIPost();  
	 */
	function onEventMainLoaded( event ) 
	{
		//removeEvent(app, "load", onEventMainLoaded); // [TODO] app was var. How to remove? Do we even care to?
		embedCustomAPIPost();
	}
	/*
	Callback if the main JS load fails.   
	 */
	function onEventMainError( event ) 
	{
		executeJsEmbed();
	}
	 /*
	Toggle isPaused flag on window.
	 */
	function setPause( val ) 
	{
		flagPaused = val;
		win.isPaused = flagPause; // [TODO] Legacy. Probably should remove.
	}
	 /*
	An inform event from anywhere.
	 */
	function inform( inString )
	{
		// Inform
	}
	 /*
	  * Add text alert
	 */
	function addAlertDiv( inText , inTarget )
	{				
		if(inTarget=="" || inTarget==null)
		{			
			inTarget = targetId;
		}		
		var id = "alertoverlay";
		var tar = doc.getElementById(inTarget);//doc.getElementsByTagName("body")[0];//
		
		if(doc.getElementById(id))
		{
			//if(console.log){console.log("[jsEmbed](addDiv) already exists. Updating instead.");}
			div = doc.getElementById(id);
			div.innerHTML = "<font color=#FFFFFFF; size=6; align='center'>"+inText+"<font>";
			return;
		}

		var div = doc.createElement("div");
		div.setAttribute("id", id);
		div.innerHTML = "<font color=#FFFFFFF; size=6; align='center'>"+inText+"<font>";
		div.setAttribute("style", "position:absolute; index:99999; left:5%; top:40%; text-align:'center'; text-shadow:1px 1px 1px black; ");		
		tar.appendChild(div);
		
		//if(console.log){console.log("[jsEmbed](addDiv) Complete! ");}
	}
	
	function removeAlertDiv( inTarget )
	{
		if(inTarget=="" || inTarget==null)
		{			
			inTarget = targetId;
		}		
		var id = "alertoverlay";
		var targ = doc.getElementById(inTarget);//doc.getElementsByTagName("body")[0];//
		
		if(doc.getElementById(id))
		{
			div = doc.getElementById(id);
			targ.removeChild(div);
			//if(console.log){console.log("[jsEmbed](removeAlertDiv) Complete!");}			
			return;
		}
		//if(console.log){console.log("[jsEmbed](removeAlertDiv) Alert div doesn't exist.");}
		
	}

	/* 
    Public methods
	 */
	return {
		exists : function()
		{
			return true;
		},
		params : function()
		{
			return parameters;
		},		
		attr : function()
		{
			return attributes;
		},		
		baseUrl : function()
		{
			return base;
		},
		isBaseCrossdomain : function()
		{
			return flagBaseCrossdomain;
		},
		canvasWidth : function()
		{
			return _canvasWidth;
		},
		canvasHeight : function()
		{
			return _canvasHeight;
		},
		canvasScale : function()
		{
			return _canvasScale;
		},
		embed : function( pAppJs, pTarget, pWidth, pHeight, pParams, pAttributes ) 	
		{
			if(console.log){console.log("[jsEmbed] v" + VERSION);}
			// Store the params for later.
			appJs = pAppJs;
			targetId = pTarget;			
			//width = pWidth;
			//height = pHeight;
			attributes = pAttributes;
			parameters = pParams;
			flagEmbedCalled = true;
			// Get the API, if any
			api = "";
			// legacy support
			if(parameters.haxeapi!=null) 
			{
				api = parameters.haxeapi;
			} else if(parameters.api!=null)
			{
				api = parameters.api;
			}
			
			// Set the expected scale
			widthIdeal = pWidth;
			heightIdeal = pHeight;
			
			if(parameters.indexroot==null)
			{
				flagIndexRoot = false;
			} else {
				flagIndexRoot = parameters.indexroot=="true";
			}
			
			// Calculate the current real domain
			var realDomain = window.location.host;
			var baseDomain = "";

			// Calculate base		
			if(parameters.base==null) 
			{
				base = "";		
				baseDomain = realDomain;
			} else { 			
				base = parameters.base;
				if(base.indexOf("http")>=0)
				{
					// Nothing 
					baseDomain = getDomain(base);
				} else if(flagIndexRoot)
				{
					// Nothing
					baseDomain = realDomain;
				} else 
				{	
					// Append the real domain onto the relative base.					
					var http = (window.location.toString().indexOf("https://")<0?"http://":"https://");
					base = http + realDomain + ((realDomain.charAt(realDomain.length-1)=="/" || base.charAt(0)=="/")?"":"/") + base;
					baseDomain = realDomain;					
				} 
				
				if(base.length>0 && base.charAt(base.length-1)!="/")
				{
					base+="/";
				}	
				
			}
			if(console.log)
			{
				if(base=="")
				{
					//console.log("[JsEmbed] base : ''"); // don't bother printing the base if it's empty
				} else {
					console.log("[JsEmbed] base : " + base);
				}
			}
			
			// Determine if we're loading crossdomain						
			flagBaseCrossdomain = baseDomain!=realDomain;
			if(flagBaseCrossdomain)
			{
				if(console.log){console.log("[JsEmbed] Warning: Loading Crossdomain");}
			}	
			
			// Load any libs
			if(parameters.libs==null)
			{
				libs = [];
			} else {
				if( typeof parameters.libs === 'string' ) {
				    libs = [ parameters.libs ];
				} else {					
					libs = parameters.libs;
				}				
			}

			// Now have array of libs. Start loading them.
			var index = 0;
			for(var l in libs)
			{				
				embedLib(libs[l], true, false, index*250, parameters.libsIgnoreBase=="true"?true:false);
				index++;
			}
			
			embedCustomAPIPre();
			
			// Wait until the DOM is loaded, if it's not already.
			if(flagDomLoaded)
			{
				onReady();
			} else {
				//alert("[JSEmbed] DOM not loaded. Waiting...");
			}
						
		}
		,
		pause : function()
		{
			setPause(true);			
		}
		,
		unpause : function() 
		{
			setPause(false);
		}
		,
		isPaused : function()
		{
			return flagPaused;
		}
		,
		inform : function( inString )
		{
			inform( inString );
		}
		,
		informConstructed : function()
		{
			inform("constructed");
		}
		,
		informtInitialized : function()
		{
			inform("init");
		}
		,
		informReady : function()
		{
			inform("ready");
		}
		,
		setDimensions : function( inWidth, inHeight )
		{	        
	         var tScale = 1;
	         if ( inWidth/widthIdeal < inHeight/heightIdeal ) tScale = inWidth/widthIdeal;
	         else tScale = inHeight/heightIdeal;         
	         scaleSet(tScale);
		}
		,
		setScale : function( pScale )
		{        
	         scaleSet(pScale);
		}
		,	
		addMetaTag : function ( inName, inContent )
		{
			addMetaTag( inName, inContent );
		}
		, 
		addAlert : function ( inText, inTarget )
		{
			addAlertDiv(inText, inTarget);
		}
		, 
		removeAlert : function ( inTarget )
		{
			removeAlertDiv(inTarget);
		}
	};
	
	/* 
	 * PRE-EMBED STEP:
	 Add support for custom API Libs here. This runs BEFORE embed, during the DOM loading sequence. Good chance to embed libraries.
	 */
	function embedCustomAPIPre()
	{
		switch(getCustomAPI())
		{
			case API_HAXE_FLAMBE:
				embedLib(appJs, true, false, 0);//embedLib("flambe.js", true, false, 0); // Previously enforced flambe.js here. Now allows for relocating flambe.js if desired. Flambe.js still necessary.
				break;
			case API_CONSTRUCT_2:				
				break;
			case API_TRESENSA:						
			case API_HAXE_NME:
			case API_NONE:			
			default:
				break;
		}
	
	}
	/*
	 * EMBED STEP 
    Any custom code for embedding a custom API goes here. Tar is the target object of div. App is the new <script> that will contain the main JS Application as it's src.
    Return true to continue with appending app to tar after this method resolves.
    Return false to cancel appending. Useful if your API doesn't really want to append anything  and you're just using jsembed as a tool for embedding libraries.
    WARNING: IF you return false, embedCustomAPIPost will not fire because it relies on the app script object's load event. You'll have to write your own callback if you have post processes you need to run.  
	 */
	function embedCustomAPIMain(tar, app)
	{
		switch(getCustomAPI())
		{
			case API_HAXE_NME:
				tar.setAttribute("style", "background-color: #000000;	position: absolute; left: 50%;	" + (attributes.autoscale=="false"?"margin-left:-512px;":"padding:0;") +	"-webkit-user-select: none; -ms-touch-action:none;	overflow: hidden; width:"+widthIdeal+"px;	height:"+heightIdeal+"px; -webkit-tap-highlight-color: rgba(0,0,0,0); data-framerate:30;");
				targetId = "haxe:jeash";
				tar.setAttribute("id", "haxe:jeash");
				tar.setAttribute("name", "viewport");
				app.setAttribute("id", "haxe:jeash:script");
				embedScalingScript();
				// If the appJs path is absolute, make sure we account for that.
				app.src = fixUrl(appJs);
				return true;
			case API_HAXE_FLAMBE:
				tar.setAttribute("style", "background-color: #000000;padding:0;-webkit-user-select: none; -ms-touch-action:none;	overflow: hidden; width:"+widthIdeal+"px;	height:"+heightIdeal+"px; -webkit-tap-highlight-color: rgba(0,0,0,0); data-framerate:30;");
				embedScalingScript();
				win.flambe.embed([base+"targets/main-html.js"], targetId );			
				return false;
			case API_CONSTRUCT_2:				
				var canvas = document.createElement("canvas");
				canvas.setAttribute('id', 'c2canvas');
				canvas.setAttribute('width', widthIdeal);
				canvas.setAttribute('height', heightIdeal);
				//addEvent(canvas, "load", onEventConstruct2Loaded);
				doc.getElementsByTagName("body")[0].appendChild(canvas);
				
				app.src = fixUrl(appJs); // [TODO] Here I'm embedding the c2runtime.js (or whatever they renamed it to). This is untested, but I think it'll work..				
				return true;
			case API_TRESENSA:
                tar.setAttribute("style", "position:relative; width:"+widthIdeal+"px; height:"+heightIdeal+"px; overflow: hidden;");
                app.src = fixUrl(appJs);
                embedScalingScript();
				return true;
			default:
			case API_NONE:				
				app.src = fixUrl(appJs);
				return true;
		}		
		return true;
	}
	
	/*
	 * POST-EMBED STEP 
    Any custom code to run after the main JS has been embedded goes here.  
	 */
	function embedCustomAPIPost()
	{
		switch(getCustomAPI())
		{
			case API_CONSTRUCT_2:				
				// [TODO] Run script block here to create the runtime and add document listeners, etc. 
				/*
				if(parameters.init==null){return;}
				var c2init = document.createElement("script");				
				c2init.src=parameters.init;
				doc.getElementsByTagName("body")[0].appendChild(c2init);
				*/
				break;
			case API_TRESENSA:
                var tgeGame = new window[attributes.gameclass]();
                if(tgeGame.IsPlatformAcceptable()) {
                    tgeGame.Launch( {gameDiv:targetId, initialWidth:widthIdeal, initialHeight:heightIdeal} );
                }
				break;			
			case API_HAXE_NME:
			case API_HAXE_FLAMBE:
			case API_NONE:
			default:
				// Nothing.
				break;
		}
	}
}();
