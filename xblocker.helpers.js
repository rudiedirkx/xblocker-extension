"use strict";

const xb = {
	async load(callback) {
		const items = await chrome.storage.sync.get('patterns');
		var patterns = items.patterns || [];
		return patterns.length == 0 ? xb.defaults() : patterns;
	},

	async loadRules() {
		const [patterns, currentRules] = await Promise.all([xb.load(), chrome.declarativeNetRequest.getDynamicRules()]);

		const removeRuleIds = currentRules.map(rule => rule.id);
		const addRules = xb.convertPatternsToRules(patterns);
		await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds, addRules});

		return addRules;
	},

	async testURL(url) {
		const outcome = await chrome.declarativeNetRequest.testMatchOutcome({
			type: 'sub_frame',
			url,
		});
		if (outcome.matchedRules.length) {
			const id = outcome.matchedRules[0].ruleId;
			const [pattern, rule] = await Promise.all([xb.getPattern(id), xb.getRule(id)]);
			return {
				id,
				line: id,
				pattern,
				action: rule.action.type,
			};
		}
		return null;
	},

	async getPattern(id) {
		const patterns = await xb.load();
		return patterns[id - 1];
	},

	async getRule(id) {
		const rules = await chrome.declarativeNetRequest.getDynamicRules();
		return rules.find(rule => rule.id == id);
	},

	convertPatternsToRules(patterns) {
		const rules = [];
		for ( let i = 0; i < patterns.length; i++ ) {
			const p = patterns[i];
			if (p.trim().length && p[0] != '#') {
				rules.push(xb.convertPatternToRule(p, i + 1));
			}
		}
		return rules;
	},

	convertPatternToRule(pattern, id) {
		var type = 'block';
		var filterType = 'urlFilter';

		if (pattern.indexOf('allow:') == 0) {
			pattern = pattern.substr(6).trim();
			type = 'allow';
		}

		if (pattern.indexOf('domain:') == 0) {
			pattern = '||' + pattern.substr(7).trim();
		}

		if (pattern.includes('`')) {
			filterType = 'regexFilter';
			pattern = pattern.replace(/`/g, '\\b');
		}

		if (pattern.indexOf('regex:') == 0) {
			pattern = pattern.substr(6).trim();
			filterType = 'regexFilter';
		}

		return {
			id,
			priority: 1,
			action: {
				type,
			},
			condition: {
				[filterType]: pattern,
				excludedResourceTypes: ['main_frame']
			},
		};
	},

	save(patterns, callback) {
		chrome.storage.sync.set({patterns: patterns}, function() {
			callback();
		});
	},

	defaults() {
		return [
			'# allow: domain: example.com',
			'# allow: regex: \\bfoo\\wbar\\b',
			'',
			'facebook.com',
			'facebook.net',
			'fbcdn.net',
			'platform.twitter.com',
			'googletagservices.com',
			'googleadservices.com',
		];
	}
};
