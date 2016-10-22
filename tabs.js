String.prototype.contains = function(it) {
	return this.indexOf(it) != -1;
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
}

function initTab( tab ) {
	var ntab = tab.length;
	$( '#content' ).empty();

	for ( var x in tab ) {
		var tabs = tab[x];
		var nlist = tabs.list.length;
		var time = new Date( tabs.time ).toLocaleString();

		$( '#content' ).append(
			'<div id="' + tabs.hash + '" class="tabs well" data-pos="' + tabs.position + '" data-time="' + tabs.time + '">' +
				'<div class="head-list">' +
					'<span class="h3 judul">' + ( tabs.title ? tabs.title + ' - ' : '' ) + '</span>' +
					'<span class="h3 ntab">' + nlist + ' tabs</span> ' +
					'<span class="small">' +
						'- Created at ' + time +
					'</span> ' +
					'<span class="small">' +
						'- <a href="" class="restore-all btn btn-info btn-xs">Restore all</a>' +
					'</span> ' +
					'<span class="small">' +
						'- <a href="" class="delete-all btn btn-warning btn-xs">Delete all</a>' +
					'</span> ' +
				'</div>' +
			'</div>'
		);

		if ( tabs.list ) for ( y=1; y<=nlist; y++ ) {
			var list = tabs.list[y-1];
			list.fav =
				list.fav && 
				( list.fav.contains( 'http://' ) || list.fav.contains( 'https://' ) )
				? list.fav : 'img/favicons.png'
			;

			$( '#' + tabs.hash ).append(
				'<div class="list" data-num="' + y + '">' +
					'<span class="glyphicon"></span>' +
					'<span class="fav"><img src="' + list.fav + '"></span> ' +
					'<a href="' + list.url + '">' + list.title + '</a>' +
				'</div>'
			);
		}

	}

	$( '#content .tabs' ).sort( function( a, b ) {
		return b.dataset.pos - a.dataset.pos;
	} ).appendTo( '#content' );

	var prev_index = '';
	$( '.tabs' ).sortable( {
		handle: '.fav',
		connectWith: '.tabs',
		items: '.list',
		start: function( event, ui ) {
			prev_index = $( this ).attr( 'id' );
		},
		update: function( event, ui ) {
			if (this === ui.item.parent()[0]) {
				var next_index = $( this ).attr( 'id' );
				if ( next_index == prev_index ) var hash = [next_index];
				else var hash = [prev_index, next_index]
				updateList( hash );
				refresh_num();
			}
		}
	} );

}

function updateList( hashs ) {
	chrome.storage.local.get( ['tabs'], function ( result ) {
		var tabs = result['tabs'];
		for ( var x = 1; x<=hashs.length; x++ ) {
			var hash = hashs[x-1];
			var isi = {};
			var list = [];

			isi['hash'] = hash;
			isi['time'] = parseInt( $( '#' + hash ).attr( 'data-time' ) );
			isi['position'] = parseInt( $( '#' + hash ).attr( 'data-pos' ) );

			$( '#' + hash + ' .list' ).each( function() {
				var fav = $( this ).children( '.fav' ).children( 'img' ).attr( 'src' );
				var title = $( this ).children( 'a' ).text();
				var url = $( this ).children( 'a' ).attr( 'href' );
				var simpan = {
					'fav': fav,
					'title': title,
					'url': url
				};

				list.push( simpan );
			} );

			isi['list'] = list;
			tabs[hash] = isi;
		}

		chrome.storage.local.set( { tabs: tabs } );
	} );
}

function refresh_num() {
	var x = 1;
	$( '.tabs' ).each( function() {
		var y = 1;
		var hash = $( this ).attr( 'id' );
		$( '#' + hash ).attr( 'data-num', x++ );
		$( '#' + hash + ' .list' ).each( function() {
			$( this ).attr( 'data-num', y++ );
		} );

		$( '#' + hash + ' .ntab' ).text( (y-1) + ' tabs' );
		if ( y==1 ) {
			$( '#' + hash ).remove();
			x--;
		}

	} );
}

function removeList( ini, url ) {
	url = typeof url !== 'undefined' ? url : false;
	var tabs_sel = ini.parent( '.list' );
	var hash = ini.parents( '.tabs' ).attr( 'id' );
	var list_num = tabs_sel.attr( 'data-num' ) - 1;
	var list_len = tabs_sel.parent( '.tabs' ).children( '.list' ).length;

	chrome.storage.local.get( ['tabs'], function ( result ) {
		var tabs = result['tabs'];
		if ( list_len == 1 ) delete tabs[hash];
		else tabs[hash].list.remove( list_num );

		tabs_sel.remove();
		refresh_num();
		chrome.storage.local.set( { tabs: tabs }, function() {
			if ( url ) chrome.tabs.create( { url: url, active: false } );
		} );
	} );
}


chrome.storage.local.get( ['tabs'], function ( result ) {
	initTab( result['tabs'] );
} );

$( '#content' ).on( 'click', '.list a', function() {
	var url = $( this ).attr( 'href' );
	removeList( $( this ), url );
	return false;
} );

$( '#content' ).on( 'click', '.list .glyphicon', function() {
	removeList( $( this ) );
} );

$( '#content' ).on( 'mouseenter', '.list', function() {
	$( this ).children( '.glyphicon' ).addClass( 'glyphicon-remove' );
} );

$( '#content' ).on( 'mouseleave', '.list', function() {
	$( this ).children( '.glyphicon' ).removeClass( 'glyphicon-remove' );
} );

$( '#content' ).on( 'click', '.restore-all', function() {
	var ini = $( this ).parents( '.tabs' );
	var hash = ini.attr( 'id' );

	chrome.storage.local.get( ['tabs'], function ( result ) {
		var tabs = result['tabs'];
		delete tabs[hash];

		$( '#' + hash + ' .list' ).each( function() {
			var url = $( this ).children( 'a' ).attr( 'href' );
			chrome.tabs.create( { url: url, active: false } );				
		} );

		chrome.storage.local.set( { tabs: tabs }, function() {
			ini.remove();
			refresh_num();
		} );

	} );

	return false;

} );

$( '#content' ).on( 'click', '.delete-all', function() {
	var yakin = confirm( "Are you sure to delete this tab list?" );
	if ( yakin ) {
		var ini = $( this ).parents( '.tabs' );
		var hash = ini.attr( 'id' );

		chrome.storage.local.get( ['tabs'], function ( result ) {
			var tabs = result['tabs'];
			delete tabs[hash];

			chrome.storage.local.set( { tabs: tabs }, function() {
				ini.remove();
				refresh_num();
				initTab( tabs );
			} );
		} );
	}

	return false;
} );

$( '#content' ).on( 'dblclick', '.h3', function() {
	var ini = $( this ).parent( 'div' ).children( '.judul' );
	var judul = ini.text().slice( 0, -3 );
	ini.html( '<input type="text" class="form-control input-sm" value="' + judul + '"> - ' );
	ini.children( 'input' ).focus();
} );

$( '#content' ).on( 'focusout', '.input-sm', function() {
	var isinya = $( this ).val();
	var ini = $( this ).parent( 'span' );
	var hash = ini.parents( '.tabs' ).attr( 'id' );


	chrome.storage.local.get( ['tabs'], function ( result ) {
		var tabs = result['tabs'];
		tabs[hash]['title'] = isinya;
		chrome.storage.local.set( { tabs: tabs } );
	} );

	if ( isinya ) ini.text( isinya + ' - ' );
	else ini.empty();
} );


$( window ).focus( function() {
	chrome.storage.local.get( function ( res ) {
		initTab( res.tabs );
	} );
} );
