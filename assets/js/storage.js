(function (global) {
	const NOTE_KEY_PREFIX = 'note_';
	const NOTE_INDEX_KEY = 'notes_index';
	const NOTES_SAVE_MESSAGE = 'noted:save-notes';
	const STORAGE_AREA_LOCAL = 'local';
	const STORAGE_AREA_SYNC = 'sync';

	function getChromeStorageArea(areaName = STORAGE_AREA_LOCAL) {
		return chrome.storage[areaName] || chrome.storage.local;
	}

	function storageGet(keys, areaName = STORAGE_AREA_LOCAL) {
		return new Promise((resolve, reject) => {
			getChromeStorageArea(areaName).get(keys, items => {
				const error = chrome.runtime.lastError;
				if (error) {
					reject(error);
				} else {
					resolve(items || {});
				}
			});
		});
	}

	function storageSet(items, areaName = STORAGE_AREA_LOCAL) {
		return new Promise((resolve, reject) => {
			getChromeStorageArea(areaName).set(items, () => {
				const error = chrome.runtime.lastError;
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	}

	function storageRemove(keys, areaName = STORAGE_AREA_LOCAL) {
		if (keys.length === 0) return Promise.resolve();
		return new Promise((resolve, reject) => {
			getChromeStorageArea(areaName).remove(keys, () => {
				const error = chrome.runtime.lastError;
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	}

	function getNoteStorageKey(id) {
		return NOTE_KEY_PREFIX + id;
	}

	function isNoteStorageKey(key) {
		return key.startsWith(NOTE_KEY_PREFIX);
	}

	global.NotedStorage = {
		NOTE_KEY_PREFIX,
		NOTE_INDEX_KEY,
		NOTES_SAVE_MESSAGE,
		STORAGE_AREA_LOCAL,
		STORAGE_AREA_SYNC,
		getChromeStorageArea,
		storageGet,
		storageSet,
		storageRemove,
		getNoteStorageKey,
		isNoteStorageKey,
	};
})(globalThis);
