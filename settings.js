function tryParseJSON (jsonString) {
    try {
        var o = JSON.parse(jsonString);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns null, and typeof null === "object", 
        // so we must check for that, too. Thankfully, null is falsey, so this suffices:
        if (o && typeof o === "object") {
            return o;
        }
    }
    catch (e) { }

    return false;
};

chrome.storage.local.get( ['tabs'], function( result ) {
	$( 'textarea.json' ).val( JSON.stringify( result.tabs ) );
} );

$( '.update-json' ).click( function() {
	var json = $( 'textarea.json' ).val();
	if ( tryParseJSON( json ) ) {
		var tabs = tryParseJSON( json );
		chrome.storage.local.set( { tabs: tabs } );
	}
	window.location.href( 'options.html' );
} );
