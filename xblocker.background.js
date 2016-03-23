
// Ignore blocking per tab
var disabledOnTabs = {};
function setPageActionIcon(tabId, disabled) {
	var icon = disabled ? '128x128-disabled' : '128x128';
	chrome.pageAction.setIcon({
		tabId: tabId,
		path: chrome.runtime.getURL('images/' + icon + '.png'),
	});
}

// Init patterns from local storage
console.time('Back-end init');
var regexes;
function loadPatterns() {
	xb.load(function(patterns) {
		regexes = patterns.reduce(xb.strToPattern, []);

		console.timeEnd('Back-end init');
		console.log('patterns', regexes);
	});
}
loadPatterns();



// Set up request filter
var filter = {
	// Check all URLs dynamically.
	urls: ["<all_urls>"],
	// Block everything but 'main_frame'.
	types: ["sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"],
};
var extraInfoSpec = ['blocking'];
chrome.webRequest.onBeforeRequest.addListener(function(details) {

	// Ignore this tab
	if (disabledOnTabs[details.tabId]) {
		setPageActionIcon(details.tabId, true);
		chrome.pageAction.show(details.tabId);
		return;
	}

	if ( !regexes ) return console.error('PATTERNS NOT LOADED!');

	var result = xb.testURL(regexes, details.url);
	if ( result ) {
		if ( !result.allow ) {
			// Or implicitly block
			console.log('BLOCKING', details.url);

			if (details.tabId) {
				chrome.pageAction.show(details.tabId);
			}

			return {
				cancel: true
			};
		}
	}

}, filter, extraInfoSpec);



// Listen for config changes from options page
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	// Options page saved tokens
	if ( msg && msg.RELOAD ) {
		loadPatterns();
		console.log('Incoming RELOAD event handled from options page');

		sendResponse();
	}
});



// Listen for page action click
chrome.pageAction.onClicked.addListener(function(tab) {
	disabledOnTabs[tab.id] = !disabledOnTabs[tab.id];
	setPageActionIcon(tab.id, disabledOnTabs[tab.id]);

	if (disabledOnTabs[tab.id]) {
		chrome.tabs.reload(tab.id);
		console.log('IGNORING TAB:', tab.id)
	}
	else {
		console.log('STOP IGNORING TAB:', tab.id)
	}
});
