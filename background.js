importScripts('assets/js/storage.js');

const {
	NOTE_INDEX_KEY,
	NOTES_SAVE_MESSAGE,
	storageGet,
	storageSet,
	storageRemove,
	isNoteStorageKey,
} = globalThis.NotedStorage;

let pendingNoteItems = null;
let saveInProgress = false;

async function writeNoteItems(noteItems) {
	const currentNoteKeys = new Set(Object.keys(noteItems).filter(isNoteStorageKey));
	const items = await storageGet(null);
	const staleNoteKeys = Object.keys(items)
		.filter(key => isNoteStorageKey(key) && !currentNoteKeys.has(key));

	await storageSet(noteItems);
	await storageRemove(staleNoteKeys);
}

async function drainPendingNoteItems() {
	if (saveInProgress) return;
	saveInProgress = true;

	try {
		while (pendingNoteItems) {
			const noteItems = pendingNoteItems;
			pendingNoteItems = null;
			await writeNoteItems(noteItems);
		}
	} catch (error) {
		console.error('Failed to save notes:', error);
	} finally {
		saveInProgress = false;
		if (pendingNoteItems) drainPendingNoteItems();
	}
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (!message || message.type !== NOTES_SAVE_MESSAGE || !message.noteItems || !message.noteItems[NOTE_INDEX_KEY]) {
		return false;
	}

	pendingNoteItems = message.noteItems;
	drainPendingNoteItems()
		.then(() => sendResponse({ ok: true }))
		.catch(error => sendResponse({ ok: false, message: error.message }));
	return true;
});
