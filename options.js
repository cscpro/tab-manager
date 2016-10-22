chrome.storage.sync.get( 'nightmode', function ( res ) {
	if ( res['nightmode'] == true ) {
		$( 'body' ).addClass( 'nightly' );
		$( 'input[name="nightly"]' ).prop( 'checked', true );
	}
} );

$( 'input[name="nightly"]' ).on( 'change', function() {
	var val = $( this ).is( ':checked' );
	$( 'body' ).toggleClass( 'nightly' );
	chrome.storage.sync.set( { 'nightmode': val } );
} );
