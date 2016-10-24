String.prototype.contains = function(it) {
	return this.indexOf(it) != -1;
}

function saveTab( arrayOfTabs ) {
	chrome.storage.local.get( ['tabs'], function( result ) {
		var tab_len = arrayOfTabs.length;
		var tabs = result['tabs'] ? result['tabs'] : {};
		var isi = {};
		var list = [];
		var latest_n = 0;
		var latest_tab = '';

		for ( var x in tabs ) {
			var tab = tabs[x];
			if ( tab.position > latest_n ) {
				latest_n = tab.position;
				latest_tab = tab.hash;
			}
		}

		chrome.runtime.openOptionsPage();

		for ( var i = 1; i <= tab_len; i++ ) {
			var activeTab = arrayOfTabs[i-1];

			if ( activeTab.url == 'chrome://newtab/' ) continue;
			if ( activeTab.url.contains( 'chrome-extension://' ) ) {
				if ( tab_len > 1 ) chrome.tabs.remove( activeTab.id );
				else chrome.runtime.openOptionsPage();
				continue;
			}

			var simpan = {
				'fav': activeTab.favIconUrl,
				'title': activeTab.title,
				'url': activeTab.url
			};

			list.push( simpan );

			if ( i == tab_len ) {
				if ( latest_tab && tab_len == 0 ) {
					tabs[latest_tab].list.push( simpan );

				} else {
					var hash = Math.random().toString( 36 ).slice( 2 );
					isi['hash'] = hash;
					isi['time'] = Date.now();
					isi['list'] = list;
					isi['position'] = latest_n+1;
					tabs[hash] = isi;
				}

				chrome.storage.local.set( { tabs: tabs }, function() {
					chrome.runtime.openOptionsPage();
					chrome.tabs.remove( activeTab.id );
				} );

			} else chrome.tabs.remove( activeTab.id );
		}
	} );
}


chrome.browserAction.onClicked.addListener( function() {
	chrome.tabs.query(
		{ currentWindow: true, pinned: false },
		function( arrayOfTabs ) {
			saveTab( arrayOfTabs );
		}
	);
} );


chrome.runtime.onInstalled.addListener( function() {
	chrome.contextMenus.create( {
		"id": "thistab",
		"title": "Save only this tab",
		"contexts": ["page"]
	} );

	chrome.contextMenus.create( {
		"id": "alltabs",
		"title": "Save all tabs",
		"contexts": ["page"]
	} );

	chrome.contextMenus.create( {
		"id": "excepttab",
		"title": "Save all except this tab",
		"contexts": ["page"]
	} );

} );


chrome.contextMenus.onClicked.addListener( function( info, tab ) {
	if ( info.menuItemId === "thistab" ) {
		chrome.tabs.query(
			{ active: true, currentWindow: true },
			function( arrayOfTabs ) {
				saveTab( arrayOfTabs );
			}
		);

	} else if ( info.menuItemId === "alltabs" ) {
		chrome.tabs.query(
			{ currentWindow: true, pinned: false },
			function( arrayOfTabs ) {
				saveTab( arrayOfTabs );
			}
		);

	} else if ( info.menuItemId === "excepttab" ) {
		chrome.tabs.query(
			{ active: false, currentWindow: true },
			function( arrayOfTabs ) {
				saveTab( arrayOfTabs );
			}
		);

	}

} );
