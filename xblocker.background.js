
var filter = {
	// Check all URLs dynamically.
	urls: ["<all_urls>"],
	// Block everything but 'main_frame'.
	types: ["sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"],
};
var extraInfoSpec = ['blocking'];

var regexes = [
	new RegExp('\\Wfacebook\\.com\\W', 'i'),
	new RegExp('\\Wfacebook\\.net\\W', 'i'),
	new RegExp('\\Wfbcdn\\.net\\W', 'i'),
	new RegExp('\\Wplatform\\.twitter\\.com\\W', 'i'),
	new RegExp('\\Wgoogletagservices\\.com\\W', 'i'),
	new RegExp('\\Wgoogleadservices\\.com\\W', 'i'),
	new RegExp('\\Wcdn\\.nlmani\\-kualaasan\\.savviihq\\.com\\/.+\\.js$', 'i'),
];

chrome.webRequest.onBeforeRequest.addListener(function(details) {

	for (var i=0; i<regexes.length; i++) {
		var regex = regexes[i];
		if (regex.test(details.url)) {
			console.log('BLOCKING', details.url);

			return {
				cancel: true
			};
		}
	}

}, filter, extraInfoSpec);
