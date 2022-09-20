"use strict";

importScripts('xblocker.helpers.js');

function setPageActionIcon(tabId, disabled) {
// console.log('setPageActionIcon', tabId);
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
// console.log('tabs.onUpdated', tabId);
	const disabledOnTabs = await xb.getDisabledOnTabs();
	setPageActionIcon(tabId, disabledOnTabs.includes(tabId));
});

// Listen for page action click
chrome.action.onClicked.addListener(async function(tab) {
	const disabledOnTabs = await xb.getDisabledOnTabs();

	const i = disabledOnTabs.indexOf(tab.id);
	if (i >= 0) {
		disabledOnTabs.splice(i, 1);
	}
	else {
		disabledOnTabs.push(tab.id);
	}

	const disabled = i == -1;
	setPageActionIcon(tab.id, disabled);

	xb.setDisabledOnTabs(disabledOnTabs);

	if (disabled) {
		console.log('IGNORING TAB:', tab.id, disabledOnTabs)
		xb.loadRules();
		chrome.tabs.reload(tab.id);
	}
	else {
		console.log('STOP IGNORING TAB:', tab.id, disabledOnTabs)
		xb.loadRules();
	}
});

console.log('sw top level');

chrome.runtime.onStartup.addListener(function() {
	console.log('sw onStartup');
	init();
});

chrome.runtime.onInstalled.addListener(function() {
	console.log('sw onInstalled');
	init();
});
