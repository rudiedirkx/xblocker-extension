"use strict";

importScripts('xblocker.helpers.js');

function setPageActionIcon(tabId, disabled) {
	var icon = disabled ? '128x128-disabled' : '128x128';
	chrome.action.setIcon({
		tabId: tabId,
		path: chrome.runtime.getURL('images/' + icon + '.png'),
	});
}

function init() {
	xb.loadRules().then(rules => console.log('rules', rules));

	// Enable feedback?
	chrome.declarativeNetRequest.setExtensionActionOptions({
		displayActionCountAsBadgeText: true,
	});
}

// Persist action icon
chrome.tabs.onUpdated.addListener(async function(tabId) {
	const currentRules = await chrome.declarativeNetRequest.getSessionRules();
	const disabled = currentRules.find(rule => rule.id == tabId);
	setPageActionIcon(tabId, disabled != null);
});

// Listen for page action click
chrome.action.onClicked.addListener(async function(tab) {
	const currentRules = await chrome.declarativeNetRequest.getSessionRules();
	const disabled = currentRules.find(rule => rule.id == tab.id);

	// Wasn't disabled, so disable by adding rule
	if (!disabled) {
		const addRule = {
			id: tab.id,
			priority: 3,
			action: {
				type: 'allowAllRequests',
			},
			condition: {
				resourceTypes: ["main_frame", "sub_frame"],
				tabIds: [tab.id],
			},
		};
		chrome.declarativeNetRequest.updateSessionRules({addRules: [addRule]});

		console.log('IGNORING TAB:', tab.id)
		setPageActionIcon(tab.id, true);
		chrome.tabs.reload(tab.id);
	}
	// Was disabled, so enable by removing rule
	else {
		chrome.declarativeNetRequest.updateSessionRules({removeRuleIds: [disabled.id]});

		console.log('STOP IGNORING TAB:', tab.id)
		setPageActionIcon(tab.id, false);
	}
});

console.log('sw top level');

// chrome.runtime.onStartup.addListener(function() {
// 	console.log('sw onStartup');
// 	init();
// });

chrome.runtime.onInstalled.addListener(function() {
	console.log('sw onInstalled');
	init();
});
