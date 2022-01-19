if ( !document.IncludedFiles ) document.IncludedFiles = [];
document.IncludedFiles['https://www.sraa.co.nz/process/x_lv/1%2e4/mv_display/ajax.js'] = 1;
//Included: logic/javascript/ajax.js
// remote scripting library
// (c) copyright 2005 modernmethod, inc
// (c) copyright 2006 Zeald.com
var rs_debug_mode = 0;
var rs_obj = false;
var rs_callback = false;
var rs_is_activex = false;
AJAX_LOADING = '<img style="vertical-align:middle; margin: 5px;" src="/interchange-5/en_US/throbber.gif" class="throbber"><em>Loading</em>';
function rs_debug(text) {
	if (rs_debug_mode)
		alert("RSD: " + text)
}

function rs_result_wrapper(x, callback) {
	if (x.readyState != 4) { return; }
	var status;
	var data;
    var error;
	status = x.responseText.charAt(0);
	data = x.responseText.substring(2);
	if (status == "-") {
        alert("Error: " + callback_n);
        error = 1;
    }
    else if (status != "+") data = x.responseText;
	if (!error)   {
		try {
			callback(data);
		}
	    catch(e) {
	    }
	}
	if (typeof(GoogleTools) != 'undefined' ) {
		window.setTimeout(function() {
   			GoogleTools.fixLinks();
		},300);
	}
}

function rs_init_object(method, url, args, url_args, a, callback) {
	rs_debug("rs_init_object() called..")
	var i, x, n;
	if ( a.length == 1 && a[0].constructor.toString().indexOf('Array') != -1 ) {
		a = a[0];
	}
	for (i = 0; i < a.length; i++) { args += "&rsargs=" + escape(a[i]); }
   // count args; build URL
   url = url.replace( /[\\+]/g, '%2B'); // fix the unescaped plus signs
   args = args.replace( /[\\+]/g, '%2B'); // fix the unescaped plus signs
   url_args = url_args.replace( /[\\+]/g, '%2B'); // fix the unescaped plus signs
	if ( method != 'POST' ) {
		var joiner = ( url.indexOf( '?') == -1 ) ? '?' : '&';
			url += joiner + args;
			args = null;
		}
		if ( url_args ) {
			var joiner = (url.indexOf( '?') == -1 ) ? '?' : '&';
			url += joiner + url_args;
			url_args = null;
		}
	if ( x ) rs_is_activex = true;
	if(!x && typeof XMLHttpRequest != "undefined") 	x = new XMLHttpRequest();
	if(!x) {
		try {
			x = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				x = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (oc) {
				x = null;
			}
		}
	}
	if (!x) {
        x = new ifXMLHttpRequest();
    }
    if (!x) {
		rs_debug("Could not create connection object.");
    }
	x.open( method, url, ( !rs_is_activex || method != 'POST' ) );
	if ( method == 'POST' ) x.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
	x.onreadystatechange = function() {
		       rs_result_wrapper(x, callback);
	}
	x.send( args );
	return x;
}

/*
coded by Kae - http://verens.com/
use this code as you wish, but retain this notice

largely rewritten by Brent Kelly (http://www.zeald.com) - 15 June, 2006

*/

var kXHR_instances=0;
var kXHR_objs=[];
function ifXMLHttpRequest() {

    var i=0;
    var url='';
    var responseText='';

    this.onreadystatechange = function() {

        return false;

    }

    this.open = function( method, url ) {

		// id number of this request
		this.i=++kXHR_instances;

		if ( method.toUpperCase() != 'POST' ) method = 'GET';

		// if there are arguements, split the arguements off
		var parts;
		var args = '';
		if ( url.indexOf( '?' ) != -1 ) {

			var parts = url.split( '?' );
			url = parts[0];
			args = parts[1];

		}

		// lets try and determine a url for mv_display - default to about:blank but this throws IE security warning
		// assumes a standard ZES url https://secure.zeald.com/zeald/process or /zeald/process or http://www.zeald.com/process
		var frame_url = 'about:blank';
		if ( url.indexOf( 'process' ) != -1 ) frame_url = url + '?mv_display=ajax_blank';
		var matches = url.match( /(https?:\/\/[^\/]*\/([^\/]*\/)?)/ );
		if ( !matches ) matches = url.match( /(\/?[^\/]*\/)/ );
		if ( matches && matches[0] ) frame_url = matches[0] + 'blank.html';

		// create an invisible iframe loading the blank page (stop IE security warning)
		this.div = document.createElement( 'div' );
		this.div.innerHTML = '<iframe style="width:0px;height:0px;" name="kXHR_iframe_' + this.i + '" type="text/plain" src="' + frame_url + '"></iframe>';
		document.body.appendChild( this.div );

		// store a reference to the iframe for future use
		this.iframe = document.getElementById( 'kXHR_iframe_' + this.i );

		// now create a form that is ready to submit to the iframe
		this.form = document.createElement( 'form' );
		this.form.target = 'kXHR_iframe_' + this.i;
		this.form.action = url;
		this.form.method = method;

		// store any arguements as hidden inputs on the form
		if ( args ) this.appendFormElements( args );

		// append the form to the document body
		document.body.appendChild( this.form );

    }

	this.appendFormElements = function( argstr ) {

		// split the args string into each var=val combination
		var args = argstr.split( '&' );

		// loop through and create an input for each arg
		for ( var i=0; i < args.length; i++ ) {

			var parts = args[i].split( '=' );

			var input = document.createElement( 'input' );
			input.name = unescape( parts[0] );
			input.type = 'hidden';
			input.value = unescape( parts[1] );

			this.form.appendChild( input );

		}

	}

	// blank function to prevent errors being thrown on post
	this.setRequestHeader = function () { }

    this.send = function( postdata ) {

		if ( postdata ) this.appendFormElements( postdata );

		this.form.submit();

        kXHR_objs[this.i]=this;
        setTimeout( 'ifXMLHttpRequest_checkState(' + this.i + ')', 500 );

    }

    return true;

}
function ifXMLHttpRequest_checkState( inst ) {

	var obj = kXHR_objs[inst];

    var frame = window.frames['kXHR_iframe_'+inst];

	// if the frame has finished loading
	if ( ( obj.iframe.readyState && obj.iframe.readyState == 'complete' ) || ( obj.iframe.contentDocument && obj.iframe.contentDocument.body ) ) {

		var responseText;

		// try & find the document content in the frame
		try {

			responseText = window.frames['kXHR_iframe_'+inst].document.body.childNodes[0].data;

		} catch (e) {

			responseText = obj.iframe.contentDocument.body.innerHTML;

		}

		// update the various state fields and call onreadystatechange
		obj.responseText = responseText;
		obj.readyState = 4;
		obj.status = 200;
		obj.onreadystatechange();

		// remove the html elements that were created
		obj.iframe.parentNode.removeChild( obj.iframe );
		obj.div.parentNode.removeChild( obj.div );
		obj.form.parentNode.removeChild( obj.form );

	// otherwise check again in half a second
	} else {

		setTimeout( 'ifXMLHttpRequest_checkState(' + inst + ')', 500 );

	}

}
