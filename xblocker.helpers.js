xb = {
	load: function(callback) {
		chrome.storage.local.get('patterns', function(items) {
			var patterns = items.patterns || [];
			if ( patterns.length == 0 ) {
				patterns = xb.defaults();
			}
			callback(patterns);
		});
	},

	strToRegex: function(str) {
		return new RegExp(str, 'i');
	},

	save: function(patterns, callback) {
		chrome.storage.local.set({patterns: patterns}, function() {
			callback();
		});
	},

	propagate: function(callback) {
		chrome.runtime.sendMessage({RELOAD: true}, function(response) {
			callback && callback();
		});

	},

	defaults: function() {
		return [
			'\\Wfacebook\\.com\\W',
			'\\Wfacebook\\.net\\W',
			'\\Wfbcdn\\.net\\W',
			'\\Wplatform\\.twitter\\.com\\W',
			'\\Wgoogletagservices\\.com\\W',
			'\\Wgoogleadservices\\.com\\W',
		];
	}
};
