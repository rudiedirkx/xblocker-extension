
// Init patterns from local storage
console.time('Back-end init');
var regexes;
function loadPatterns() {
	xb.load(function(patterns) {
		regexes = patterns.map(xb.strToRegex);

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

	if ( !regexes ) return;

	for (var i=0, L=regexes.length; i<L; i++) {
		var regex = regexes[i];
		if (regex.test(details.url)) {
			console.log('BLOCKING', details.url);

			chrome.pageAction.show(details.tabId);

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
