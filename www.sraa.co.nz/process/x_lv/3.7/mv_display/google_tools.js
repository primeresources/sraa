if ( !document.IncludedFiles ) document.IncludedFiles = [];
document.IncludedFiles['https://www.sraa.co.nz/process/x_lv/3%2e7/mv_display/google_tools.js'] = 1;
//Included: logic/javascript/google_tools.js
function GoogleTools() {
}

GoogleTools.prototype = {
    //Legacy functions:
	observeEvent: function ( element, name, observer ) {
        Event.observe(element, name, observer);
	},
   preventDefault: function (e) {
    Event.stop(e);
   },

	// determine if this url is a) for this site and b) the secure or insecure
	// -1 = not from this site
	// 0 = insecure url
	// 1 = secure url
	secureDomain: 'https://www.sraa.co.nz',
	insecureDomain: 'sraa.co.nz',
	outgoingUrlTypes: new RegExp( '^(mailto:|ftp[\.:])', 'i' ),
	isUrlSecure: function ( url ) {
		if ( url.search( this.outgoingUrlTypes ) != -1 ) return -1;
		if ( url.indexOf( this.secureDomain ) != -1 ) return 1;
		if ( url.indexOf( this.insecureDomain ) != -1 ) return 0;
		return -1;
	},

	// tracks outbound links in Google Analytics as /outbound/<link>
	// by applying an onclick to each link
	trackOutboundLink: function ( link ) {
		var href = link.href + '';
		href = href.replace( 'http://', '' );
		href = '/outgoing/' + href;
        if (this.legacy_js) {
          $(link).observe('click', function() { urchinTracker( href ); } );
        }
	else if (this.analytics_js){
		$(link).observe( 'click', function(e) {
		    ga('send', 'event', 'Outbound Links', href);
		} );
	}
        else {
		$(link).observe( 'click', function(e) {
_gaq.push(['_trackEvent', 'Outbound Links', href]);

} );

        }
	},

	// any links going from the secure to insecure servers need to run through google's linking function
	allLinks: '',
	fixLinks: function() {
	    if (this.analytics_js){ return; }
		var links = document.getElementsByTagName( 'a' );
        var self = this;
		// we first need to determine if we're on the secure or insecure server
		var loc = window.location.href + '';
		var secure = this.isUrlSecure( loc );

		// loop through all links & any that are pointing to the opposite server, 
		// run through googles link updater
		for ( var i = 0; i < links.length; i++ ) {
		    if (links[i].target) continue; //Ignore links with a target (otherwise clicking them gives a javascript error)
			if (links[i].getAttribute('data-googletools')) continue;
			links[i].setAttribute('data-googletools',1 );
			var href = links[i].href + '';
			tmpSecure = this.isUrlSecure( href );
			if ( tmpSecure == secure ) continue;
			if ( tmpSecure == -1 ) {
				this.trackOutboundLink( links[i] );
			} else {
				if (this.legacy_js) {
					links[i].href = "javascript: __utmLinker( '" + links[i].href + "' );";				
                }
				else {
					var link = links[i];				  
					$(link).observe( 'click', function(e) {
_gaq.push(['_link', this.href]);
Event.stop(e);
} );
    
				}
				this.allLinks += links[i].href + '\n';
			}
		}

		// loop through all forms & place onsubmits to any that are pointing to
		// the oppoisite server
		var forms = document.getElementsByTagName( 'form' );
		for ( var i = 0; i < forms.length; i++ ) {
		    if (forms[i].target) continue; //Ignore forms with a target (otherwise clicking them gives a javascript error)
	                if (forms[i].getAttribute('data-googletools')) continue;
	                forms[i].setAttribute('data-googletools',1 );
			var action = forms[i].action;
			tmpSecure = this.isUrlSecure( action );
			if ( tmpSecure == -1 || tmpSecure == secure ) continue;
			// add an onsubmit to the secure-changing form
            if (this.legacy_js) {
				 $(forms[i]).observe( 'submit', function(e) {
							 if (this.method.toLowerCase()  == 'get') {
							    __utmLinkPost( this, true );
							 } else {
							  __utmLinkPost( this );
							 }

} );
			}
			else { 
				 $(forms[i]).observe( 'submit', function(e) { 
							 if (this.method.toLowerCase()  == 'get') {
							   _gaq.push(['_linkByPost', this, true]);
							 } else {
							  _gaq.push(['_linkByPost', this]);
							 }
							 } );				
			}
		}

	},
	crossDomainCookie: function() {
		//This is deprecated: googles cookies are too clever to be so easily copied between domains as this was intended to do.  Instead the above code better handles cross-domain forms
							 
	},
	setTrans: function() {
            if (this.legacy_js) {
						__utmSetTrans(); 
			}

	    else if (this.analytics_js){
		var t = document['_z_transaction_details'];

		ga('require', 'ecommerce', 'ecommerce.js');
		ga('ecommerce:addTransaction', {
		    'id': t.order_number.value,                     // Transaction ID. Required
		    'affiliation': '',   // Affiliation or store name
		    'revenue': t.total_cost.value,               // Grand Total
		    'shipping': t.shipping.value,                  // Shipping
		    'tax': t.salestax.value                     // Tax
		});

		var i=1;
		while( i ) {
		    if ( (typeof t['item_sku_'+i] == 'undefined') ) break;
		    ga('ecommerce:addItem', {
			'id': t.order_number.value,                     // Transaction ID. Required
			'name': t['item_description_'+i].value,                // Product name. Required
			'sku': t['item_sku_'+i].value,                    // SKU/code
			'category': t['item_options_'+i] ? t['item_options_'+i].value : '',       // Category or variation
			'price': t['item_price_'+i].value,                 // Unit price
			'quantity': t['item_quantity_'+i].value                   // Quantity
		    });
		    i++;
		}
		ga('ecommerce:send');
	    }
			else {
				//Get the transaction details from the hidden form in the page
				var t = document['_z_transaction_details'];
				_gaq.push(['_addTrans',
						   t.order_number.value,           // order ID - required
						   '',  // affiliation or store name
						   t.total_cost.value,          // total - required
						   t.salestax.value,           // tax
						   t.shipping.value,              // shipping
						   t.b_city.value,       // city
						   t.b_state.value,     // state or province
						   t.b_country.value,             // country
						  ]);
				var i=1;
				while( i ) {
					if ( (typeof t['item_sku_'+i] == 'undefined') ) break;
					_gaq.push(['_addItem',
							   t.order_number.value,             // order ID - required
							   t['item_sku_'+i].value,           // SKU/code - required
							   t['item_description_'+i].value,   // product name
							   t['item_options_'+i] ? t['item_options_'+i].value : '',       // category or variation 
							   t['item_price_'+i].value,         // unit price - required
							   t['item_quantity_'+i].value       // quantity - required
							  ]);
					i++;
				}
				_gaq.push(['_trackTrans']);						
			}
	}				 
};
window.GoogleTools = new GoogleTools;
$(document).observe('dom:loaded', function() { GoogleTools.fixLinks(); } );
