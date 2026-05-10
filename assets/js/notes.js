// elements
let optionsButton = document.getElementById('options-button'),
	addButton = document.getElementById('add-button'),
	addTaskButton = document.getElementById('add-task-button'),
	newButton = document.getElementById('new-button'),
	newTaskButton = document.getElementById('new-task-button'),
	backButton = document.getElementById('back-button'),
	listButton = document.getElementById('list-button'),
	infoButton = document.getElementById('info-button'),
	deleteButton = document.getElementById('delete-button'),
	switchButton = document.getElementById('switch-button'),
	resizeButton = document.getElementById('resize-button'),
	deleteDialog = document.getElementById('delete-dialog'),
	deleteDialogTitle = document.getElementById('delete-dialog-title'),
	deleteDialogMessage = document.getElementById('delete-dialog-message'),
	deleteDialogCancel = document.getElementById('delete-dialog-cancel'),
	deleteDialogConfirm = document.getElementById('delete-dialog-confirm'),
	resizeDialog = document.getElementById('resize-dialog'),
	resizeDialogWidth = document.getElementById('resize-dialog-width'),
	resizeDialogHeight = document.getElementById('resize-dialog-height'),
	resizeDialogCancel = document.getElementById('resize-dialog-cancel'),
	resizeDialogConfirm = document.getElementById('resize-dialog-confirm'),
	renameDialog = document.getElementById('rename-dialog'),
	renameDialogTitle = document.getElementById('rename-dialog-title'),
	renameDialogInput = document.getElementById('rename-dialog-input'),
	renameDialogCancel = document.getElementById('rename-dialog-cancel'),
	renameDialogSave = document.getElementById('rename-dialog-save'),
	okButton = document.getElementById('ok-button'),
	themesList = document.getElementById('themes-list'),
	promptEntries = document.querySelectorAll('#prompt .entry'),
	titleInput = document.getElementById('title'),
	iconContainer = document.getElementById('note-icon-container'),
	iconButton = document.getElementById('note-icon-button'),
	emojisContainer = document.getElementById('emojis'),
	emojiDialogTitle = document.getElementById('emoji-dialog-title'),
	emojiDialogCancel = document.getElementById('emoji-dialog-cancel'),
	emojiDialogRemove = document.getElementById('emoji-dialog-remove'),
	optionsContainer = document.getElementById('options-container'),
	listContainer = document.getElementById('list-container'),
	editorContainer = document.getElementById('editor'),
	appHeader = document.querySelector('header'),
	appFooter = document.querySelector('footer'),
	infoContainer = document.getElementById('info'),
	promptContainer = document.getElementById('prompt'),
	createdInfo = document.getElementById('created'),
	modifiedInfo = document.getElementById('modified'),
	notesList = document.getElementById('notes'),
	noteMenu = document.getElementById('note-menu'),
	noteMenuRename = document.getElementById('note-menu-rename'),
	noteMenuChangeIcon = document.getElementById('note-menu-change-icon'),
	noteMenuStar = document.getElementById('note-menu-star'),
	noteMenuDelete = document.getElementById('note-menu-delete'),
	exportButton = document.getElementById('export-button'),
	importButton = document.getElementById('import-button'),
	fileInput = document.getElementById('file-input'),
	speechButton = document.getElementById('speech-button'),
	findButton = document.getElementById('find-button'),
	findContainer = document.getElementById('find-container'),
	findInput = document.getElementById('find-input'),
	findCount = document.getElementById('find-count'),
	findPrev = document.getElementById('find-prev'),
	findNext = document.getElementById('find-next'),
	findClose = document.getElementById('find-close'),
	optionsCloseButton = document.getElementById('options-close-button'),
	notesFilterButton = document.getElementById('notes-filter-button'),
	notesSortButton = document.getElementById('notes-sort-button'),
	notesSearchButton = document.getElementById('notes-search-button'),
	notesSearchInput = document.getElementById('notes-search'),
	searchDivider = document.getElementById('search-divider'),
	storageStatus = document.getElementById('storage-status'),
	fileToolbar = document.getElementById('file'),
	filesToolbar = document.getElementById('files'),
	themeActions = document.getElementById('theme-actions'),
	applyThemeAllButton = document.getElementById('apply-theme-all-button'),
	makeDefaultThemeButton = document.getElementById('make-default-theme-button'),
	themeActionFeedback = document.getElementById('theme-action-feedback'),
	fontFaceSelect = document.getElementById('font-face-select'),
	fontSizeSelect = document.getElementById('font-size-select'),
	fontActions = document.getElementById('font-actions'),
	applyFontAllButton = document.getElementById('apply-font-all-button'),
	makeDefaultFontButton = document.getElementById('make-default-font-button'),
	fontActionFeedback = document.getElementById('font-action-feedback'),
	favoriteButton = document.getElementById('favorite-button'),
	noteModeButton = document.getElementById('note-mode-button'),
	taskModeButton = document.getElementById('task-mode-button');

// note themes
const themes = ['#222', '#461425', '#3b2708', '#093f22', '#1a2b68', '#3d1a52', '#f9f9f9', '#efcece', '#f0ebc6', '#c5e6c7', '#a6ceec', '#e9d6f6'];
const darkThemes = [0, 1, 2, 3, 4, 5];
themes.forEach((theme, index) => {
	let li = document.createElement('li');
	li.style.backgroundColor = theme;
	li.className = darkThemes.indexOf(index) > -1 ? 'dark' : '';
	li.setAttribute('data-theme', index);
	li.addEventListener('click', selectTheme)
	themesList.appendChild(li);
});

// variables
let currentIndex = 0;
let searchResults = [];
let searchVal = '';
let storageQueue = Promise.resolve();
let backgroundNotesSaveAvailable = true;
let exitSyncQueued = false;
let storageActivityCount = 0;
let storageStatusHideTimer = null;

const {
	NOTE_KEY_PREFIX,
	NOTE_INDEX_KEY,
	NOTES_SAVE_MESSAGE,
	STORAGE_AREA_SYNC,
	storageGet,
	storageSet,
	storageRemove,
	getNoteStorageKey,
	isNoteStorageKey,
} = globalThis.NotedStorage;
const STORAGE_MIGRATION_KEY = 'storage_migration_v2_local';
const LIST_SORT_MODES = ['custom', 'recent', 'title'];
const LIST_SORT_LABELS = {
	custom: {
		label: 'Custom',
		hint: 'Drag & Drop',
	},
	recent: 'Recent',
	title: 'Title',
};
const LIST_FILTER_MODES = ['all', 'notes', 'tasks', 'starred'];
const LIST_FILTER_LABELS = {
	all: 'All',
	notes: 'Notes',
	tasks: 'Tasks',
	starred: 'Starred',
};
const DEFAULT_FONT_FACE = 'system';
const DEFAULT_FONT_SIZE = 13;
const VIEW_MODE_POPUP = 'popup';
const VIEW_MODE_PANEL = 'panel';
const SIDE_PANEL_PATH = 'panel.html';
const LEGACY_TASK_MODE = 'check' + 'list';
const NOTE_FONT_SIZES = Array.from({ length: 13 }, (_, index) => index + 8);
const NOTE_FONT_FACES = {
	system: '',
	sans: 'Arial, Helvetica, sans-serif',
	serif: 'Georgia, "Times New Roman", serif',
	slab: 'Rockwell, "Roboto Slab", "Courier New", serif',
	monospace: 'Monaco, "Courier New", monospace',
	script: '"Brush Script MT", "Segoe Script", cursive',
	handwritten: '"Comic Sans MS", "Bradley Hand", cursive',
};

// editor setup
let states = {
	loading: true,
	options: false,
	list: false,
	prompt: false,
	find: false,
	speech: false,
	icon: false,
	emojis: false,
	listSearch: false,
	listSortMode: 'recent',
	listFilterMode: 'all',
	customOrder: [],
	defaultTheme: null,
	defaultFontFace: null,
	defaultFontSize: null,
	viewMode: VIEW_MODE_POPUP,
	selectedTheme: null,
	selectedFont: false,
	size: [400, 300],
	minSize: [400, 225],
	maxSize: [800, 500],
	noteIndex: 0,
	deleteId: null,
	renameId: null,
	iconId: null,
	listMenuId: null,
	dragId: null,
	suppressNoteSelect: false,
};

let newNote = {
	id: 1,
	title: '',
	icon: '',
	content: [],
	created: +new Date(),
	modified: null,
	opened: null,
	theme: 0,
	fontFace: DEFAULT_FONT_FACE,
	fontSize: DEFAULT_FONT_SIZE,
	mode: 'note',
	favorite: false,
};

let notes = [];
let speechRecognition = null;
let speechTarget = null;
let speechStarting = false;
let actionFeedbackTimers = new WeakMap();

const Parchment = Quill.import('parchment');
const SizeStyle = Quill.import('attributors/style/size');
SizeStyle.whitelist = NOTE_FONT_SIZES.map(size => size + 'px');
Quill.register(SizeStyle, true);
const CheckedAttributor = new Parchment.Attributor('checked', 'data-checked', {
	scope: Parchment.Scope.BLOCK,
});
Quill.register(CheckedAttributor, true);

const editor = new Quill('#editor', {
	modules: {
		syntax: true,
		toolbar: '#toolbar',
		history: {
			delay: 2000,
			userOnly: true,
		},
	},
	theme: 'snow',
	placeholder: 'Start writing...',
});

hljs.configure({
	languages: ['bash', 'c', 'cpp', 'csharp', 'css', 'go', 'graphql', 'java', 'javascript', 'json', 'kotlin', 'xml', 'markdown', 'objectivec', 'php', 'python', 'r', 'ruby', 'rust', 'sql', 'swift', 'typescript', 'yaml']
});

const emojiPicker = new EmojiSearcher('emojis', (selectedEmoji) => {
	selectIcon(selectedEmoji);
	closeIconDialog();
}, () => {
	closeIconDialog();
});

// functions
function currentNote() {
	return notes[states.noteIndex] || null;
}

function isValidTheme(theme) {
	if (theme === null || theme === '') return false;
	return Number.isInteger(+theme) && themes[+theme] !== undefined;
}

function isValidFontFace(fontFace) {
	return Object.prototype.hasOwnProperty.call(NOTE_FONT_FACES, fontFace);
}

function normalizeFontSize(fontSize) {
	const size = +fontSize;
	return NOTE_FONT_SIZES.includes(size) ? size : DEFAULT_FONT_SIZE;
}

function normalizeTimestamp(value, fallback = null) {
	if (!value) return fallback;
	const timestamp = +new Date(value);
	return Number.isFinite(timestamp) ? timestamp : fallback;
}

function normalizeNoteMode(mode) {
	return mode === 'task' || mode === LEGACY_TASK_MODE ? 'task' : 'note';
}

function isDefaultFont(fontFace, fontSize) {
	return isValidFontFace(states.defaultFontFace) &&
		states.defaultFontFace === fontFace &&
		normalizeFontSize(states.defaultFontSize) === normalizeFontSize(fontSize);
}

function showActionFeedback(feedbackElement) {
	if (!feedbackElement) return;
	clearTimeout(actionFeedbackTimers.get(feedbackElement));
	feedbackElement.classList.add('visible');
	actionFeedbackTimers.set(feedbackElement, setTimeout(() => {
		feedbackElement.classList.remove('visible');
		actionFeedbackTimers.delete(feedbackElement);
	}, 2000));
}

function normalizeNote(note) {
	if (typeof note !== 'object' || note === null) note = {};
	const id = +note.id;
	note.id = Number.isFinite(id) ? id : Date.now();
	note.title = typeof note.title === 'string' ? note.title : '';
	note.icon = typeof note.icon === 'string' ? note.icon : '';
	note.content = Array.isArray(note.content) ? note.content : [];
	note.created = normalizeTimestamp(note.created, Date.now());
	note.modified = normalizeTimestamp(note.modified);
	note.opened = normalizeTimestamp(note.opened);
	note.theme = isValidTheme(note.theme) ? +note.theme : 0;
	note.fontFace = isValidFontFace(note.fontFace) ? note.fontFace : DEFAULT_FONT_FACE;
	note.fontSize = normalizeFontSize(note.fontSize);
	note.mode = normalizeNoteMode(note.mode);
	note.favorite = note.favorite === true;
	return note;
}

function getNextNoteId(usedIds = new Set(notes.map(note => +note.id).filter(Number.isFinite))) {
	let id = Date.now();
	usedIds.forEach(existingId => {
		if (existingId >= id) id = existingId + 1;
	});
	while (usedIds.has(id)) id++;
	return id;
}

function ensureConsistentNotes() {
	const usedIds = new Set();
	notes = notes.map(note => {
		const normalizedNote = normalizeNote(note);
		if (usedIds.has(normalizedNote.id)) {
			normalizedNote.id = getNextNoteId(usedIds);
		}
		usedIds.add(normalizedNote.id);
		return normalizedNote;
	});
}

function getPersistedOptions() {
	return {
		size: states.size,
		viewMode: states.viewMode,
		listOrderMode: states.listSortMode,
		listSortMode: states.listSortMode,
		listFilterMode: states.listFilterMode,
		customOrder: states.customOrder,
		defaultTheme: states.defaultTheme,
		defaultFontFace: states.defaultFontFace,
		defaultFontSize: states.defaultFontSize,
	};
}

function applyPersistedOptions(options) {
	if (isEmpty(options)) return;
	if (Array.isArray(options.size) && options.size.length === 2) states.size = options.size;
	if (options.viewMode === VIEW_MODE_PANEL || options.viewMode === VIEW_MODE_POPUP) states.viewMode = options.viewMode;
	if (LIST_SORT_MODES.includes(options.listSortMode)) {
		states.listSortMode = options.listSortMode;
	} else if (LIST_SORT_MODES.includes(options.listOrderMode)) {
		states.listSortMode = options.listOrderMode;
	}
	if (LIST_FILTER_MODES.includes(options.listFilterMode)) states.listFilterMode = options.listFilterMode;
	if (Array.isArray(options.customOrder)) states.customOrder = options.customOrder.map(id => +id).filter(Number.isFinite);
	states.defaultTheme = isValidTheme(options.defaultTheme) ? +options.defaultTheme : null;
	states.defaultFontFace = isValidFontFace(options.defaultFontFace) ? options.defaultFontFace : null;
	states.defaultFontSize = isValidFontFace(options.defaultFontFace) ? normalizeFontSize(options.defaultFontSize) : null;
}

function getNoteTitle(note) {
	if (note.title.length > 0) return note.title;
	return normalizeNoteMode(note.mode) === 'task' ? 'Untitled Task' : 'Untitled Note';
}

function getNoteText(note) {
	return note.content
		.map(op => typeof op.insert === 'string' ? op.insert : ' ')
		.join('');
}

function getRecentTime(note) {
	return note.opened || note.modified || note.created || 0;
}

function getNoteSignature(note) {
	return JSON.stringify({
		title: note.title,
		icon: note.icon,
		content: note.content,
		created: note.created,
		theme: note.theme,
		fontFace: note.fontFace,
		fontSize: note.fontSize,
		mode: note.mode,
	});
}

function getRecentNotes() {
	return notes.slice().sort((a, b) => getRecentTime(b) - getRecentTime(a));
}

function compareNotesByTitle(a, b) {
	const titleComparison = getNoteTitle(a).localeCompare(getNoteTitle(b), undefined, { sensitivity: 'base' });
	if (titleComparison !== 0) return titleComparison;
	return getRecentTime(b) - getRecentTime(a);
}

function countOccurrences(text, query) {
	let count = 0;
	let position = 0;
	while (query && (position = text.indexOf(query, position)) > -1) {
		count++;
		position += query.length;
	}
	return count;
}

function getSearchScore(note, query) {
	const title = getNoteTitle(note).toLowerCase();
	const content = getNoteText(note).toLowerCase();
	const titleMatches = countOccurrences(title, query);
	const contentMatches = countOccurrences(content, query);
	let score = 0;

	if (titleMatches) score += 80 + (titleMatches * 20);
	if (title.startsWith(query)) score += 60;
	if (contentMatches) score += 20 + (contentMatches * 5);

	return score;
}

function getListSearchQuery() {
	return notesSearchInput.value.trim().toLowerCase();
}

function ensureCustomOrder() {
	const noteIds = notes.map(note => note.id);
	const previousOrder = states.customOrder.slice();
	const orderedExisting = states.customOrder.filter(id => noteIds.includes(id));
	const missingIds = getRecentNotes()
		.map(note => note.id)
		.filter(id => !orderedExisting.includes(id));

	states.customOrder = missingIds.concat(orderedExisting);

	return previousOrder.length !== states.customOrder.length ||
		previousOrder.some((id, index) => id !== states.customOrder[index]);
}

function rememberCustomOrderFirst(id) {
	states.customOrder = [id].concat(states.customOrder.filter(existingId => existingId !== id));
}

function removeFromCustomOrder(id) {
	states.customOrder = states.customOrder.filter(existingId => existingId !== id);
}

function getFilteredNotes() {
	if (states.listFilterMode === 'notes') return notes.filter(note => normalizeNoteMode(note.mode) === 'note');
	if (states.listFilterMode === 'tasks') return notes.filter(note => normalizeNoteMode(note.mode) === 'task');
	if (states.listFilterMode === 'starred') return notes.filter(note => note.favorite);
	return notes;
}

function getOrderedNotes() {
	const query = getListSearchQuery();
	const filteredNotes = getFilteredNotes();
	if (query) {
		return filteredNotes
			.map(note => ({ note, score: getSearchScore(note, query) }))
			.filter(result => result.score > 0)
			.sort((a, b) => {
				if (b.score !== a.score) return b.score - a.score;
				return getRecentTime(b.note) - getRecentTime(a.note);
			})
			.map(result => result.note);
	}

	if (states.listSortMode === 'custom') {
		ensureCustomOrder();
		const positions = new Map(states.customOrder.map((id, index) => [id, index]));
		return filteredNotes.slice().sort((a, b) => positions.get(a.id) - positions.get(b.id));
	}

	if (states.listSortMode === 'title') {
		return filteredNotes.slice().sort(compareNotesByTitle);
	}

	return filteredNotes.slice().sort((a, b) => getRecentTime(b) - getRecentTime(a));
}

function canDragNotes() {
	return states.listSortMode === 'custom' && getListSearchQuery() === '';
}

function resizeBody(newSize) {
	states.size = normalizePopupSize(newSize);
	applyBodySize();
}

function isSidePanelView() {
	return window.location.pathname.split('/').pop() === SIDE_PANEL_PATH;
}

function applyBodySize() {
	if (isSidePanelView()) {
		document.body.style.width = '';
		document.body.style.height = '';
		return;
	}

	document.body.style.width = states.size[0] + 'px';
	document.body.style.height = states.size[1] + 'px';
}

function updateViewModeControls() {
	const isPanelMode = isSidePanelView();
	resizeButton.classList.toggle('display-none', isPanelMode);
	switchButton.className = isPanelMode ? 'labeled icon-popup' : 'labeled icon-panel';
	switchButton.textContent = isPanelMode ? 'Popup View' : 'Panel View';
	applyBodySize();
}

function scrollPanelToTopLeft() {
	if (!isSidePanelView()) return;
	requestAnimationFrame(() => {
		window.scrollTo(0, 0);
		if (document.scrollingElement) {
			document.scrollingElement.scrollLeft = 0;
			document.scrollingElement.scrollTop = 0;
		}
		document.documentElement.scrollLeft = 0;
		document.documentElement.scrollTop = 0;
		document.body.scrollLeft = 0;
		document.body.scrollTop = 0;
	});
}

function callChromeApi(callback) {
	try {
		const result = callback();
		if (result && typeof result.catch === 'function') result.catch(error => console.warn(error));
	} catch (error) {
		console.warn(error);
	}
}

function applyExtensionViewMode() {
	if (!window.chrome || !chrome.runtime || !chrome.runtime.id) return;

	if (chrome.action && chrome.action.setPopup) {
		callChromeApi(() => chrome.action.setPopup({
			popup: states.viewMode === VIEW_MODE_PANEL ? '' : 'index.html',
		}));
	}

	if (chrome.sidePanel) {
		if (chrome.sidePanel.setOptions) {
			callChromeApi(() => chrome.sidePanel.setOptions({
				path: SIDE_PANEL_PATH,
				enabled: true,
			}));
		}
		if (chrome.sidePanel.setPanelBehavior) {
			callChromeApi(() => chrome.sidePanel.setPanelBehavior({
				openPanelOnActionClick: states.viewMode === VIEW_MODE_PANEL,
			}));
		}
	}
}

function openSidePanel() {
	if (!window.chrome || !chrome.sidePanel || !chrome.sidePanel.open) return false;
	if (!chrome.windows || typeof chrome.windows.WINDOW_ID_CURRENT === 'undefined') return false;

	callChromeApi(() => chrome.sidePanel.open({
		windowId: chrome.windows.WINDOW_ID_CURRENT,
	}));
	return true;
}

async function switchViewMode() {
	const nextMode = isSidePanelView() ? VIEW_MODE_POPUP : VIEW_MODE_PANEL;
	states.viewMode = nextMode;
	updateViewModeControls();
	applyExtensionViewMode();
	await syncOptions();

	if (nextMode === VIEW_MODE_PANEL) {
		if (openSidePanel()) setTimeout(() => window.close(), 100);
	} else {
		setTimeout(() => window.close(), 100);
	}
}

function normalizePopupSize(size) {
	const width = clampNumber(size[0], states.minSize[0], states.maxSize[0]);
	const height = clampNumber(size[1], states.minSize[1], states.maxSize[1]);
	return [width, height];
}

function clampNumber(value, min, max) {
	const number = parseInt(value, 10);
	if (!Number.isFinite(number)) return min;
	return Math.min(Math.max(number, min), max);
}

function openResizeDialog() {
	resizeDialogWidth.min = states.minSize[0];
	resizeDialogWidth.max = states.maxSize[0];
	resizeDialogHeight.min = states.minSize[1];
	resizeDialogHeight.max = states.maxSize[1];
	states.size = normalizePopupSize(states.size);
	resizeDialogWidth.value = states.size[0];
	resizeDialogHeight.value = states.size[1];
	resizeDialog.className = '';
	setTimeout(() => {
		resizeDialogWidth.focus();
		resizeDialogWidth.select();
	}, 0);
}

function closeResizeDialog() {
	resizeDialog.className = 'hidden';
}

function confirmResizeDialog() {
	resizeBody([resizeDialogWidth.value, resizeDialogHeight.value]);
	resizeDialogWidth.value = states.size[0];
	resizeDialogHeight.value = states.size[1];
	syncOptions();
}

function exportNotes() {
	const date = new Date().toISOString();
	const jsonString = JSON.stringify(notes);
	const blob = new Blob([jsonString], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `Noted-Export-${date}.txt`;
	link.click();
}

function importNotes() {
	if (fileInput.files.length < 1) return;
	const file = fileInput.files[0];
	const reader = new FileReader();
	reader.onload = function () {
		try {
			let contents = JSON.parse(reader.result);
			let keys = ['content', 'created', 'id', 'theme', 'title'];
			if (Array.isArray(contents)) {
				contents.forEach(function (object) {
					keys.forEach(function (key) {
						if (!object.hasOwnProperty(key)) {
							throw new Error('object is missing key: ' + key);
						}
					});
				});
				let baseTime = Date.now();
				notes = contents.map((note, index) => {
					note.id = baseTime + index;
					return normalizeNote(note);
				});
				ensureConsistentNotes();
				ensureCustomOrder();
				syncOptions();
				syncNotes();
				populateList();
				loadNote(notes[notes.length - 1].id);
			} else {
				throw new Error('Input is not an array');
			}
		} catch (e) {
			togglePrompt({ 'target': { 'dataset': { 'prompt': 'prompt-import' } } });
		}
		fileInput.value = '';
	};
	reader.readAsText(file);
}

function togglePrompt(e) {
	states.prompt = !states.prompt;
	promptContainer.className = states.prompt ? '' : 'hidden';
	if (typeof e.target.dataset.prompt != 'undefined') {
		promptEntries.forEach((promptEntry) => {
			if (promptEntry.id == e.target.dataset.prompt) {
				promptEntry.className = 'entry visible'
			} else {
				promptEntry.className = 'entry'
			}
		})
	}
}

function toggleDelete(e) {
	e.stopPropagation();
	const button = e.currentTarget;
	const promptType = button.dataset.prompt;
	if (promptType === 'prompt-delete') {
		openDeleteDialog(getDeleteTargetId(button));
	}
}

function getDeleteTargetId(button) {
	const noteItem = button.closest('#notes li');
	if (noteItem) return +noteItem.dataset.id;
	if (button.dataset.id) return +button.dataset.id;
	const note = currentNote();
	return note ? note.id : null;
}

function getDeleteTarget(id) {
	return notes.find(note => note.id === id) || null;
}

function getNoteKind(note) {
	return normalizeNoteMode(note && note.mode) === 'task' ? 'task' : 'note';
}

function openDeleteDialog(id) {
	if (id == null) return;
	const note = getDeleteTarget(id);
	if (!note) return;
	const kind = getNoteKind(note);
	states.deleteId = id;
	states.listMenuId = null;
	if (deleteDialogTitle) deleteDialogTitle.textContent = `Delete ${kind}`;
	if (deleteDialogMessage) deleteDialogMessage.textContent = `Are you sure you want to delete this ${kind}?`;
	deleteDialog.className = '';
	populateList();
}

function closeDeleteDialog() {
	states.deleteId = null;
	deleteDialog.className = 'hidden';
}

function confirmDelete() {
	if (states.deleteId == null) return;
	deleteNote(states.deleteId);
	closeDeleteDialog();
	if (states.list) populateList();
}

function openRenameDialog(id) {
	if (id == null) return;
	const note = notes.find(item => item.id === id);
	if (!note) return;
	const kind = getNoteKind(note);
	states.renameId = id;
	states.listMenuId = null;
	if (renameDialogTitle) renameDialogTitle.textContent = `Rename ${kind}`;
	renameDialogInput.value = note.title || '';
	renameDialog.className = '';
	updateListMenu();
	setTimeout(() => {
		renameDialogInput.focus();
		renameDialogInput.select();
	}, 0);
}

function closeRenameDialog() {
	states.renameId = null;
	renameDialog.className = 'hidden';
}

function saveRenameDialog() {
	if (states.renameId == null) return;
	const note = notes.find(item => item.id === states.renameId);
	if (!note) return;
	const nextTitle = renameDialogInput.value;
	note.title = nextTitle;
	note.modified = +new Date();
	if (currentNote() && currentNote().id === note.id) {
		titleInput.value = nextTitle;
		setMeta();
	}
	closeRenameDialog();
	if (states.list) populateList();
	syncNotes();
}

function closeListMenu() {
	if (states.listMenuId == null) return;
	states.listMenuId = null;
	updateListMenu();
}

function toggleListMenu(id, button) {
	states.listMenuId = states.listMenuId === id ? null : id;
	updateListMenu(button);
}

function updateListMenu(button = null) {
	const id = states.listMenuId;
	document.querySelectorAll('#notes li.menu-open').forEach(item => item.classList.remove('menu-open'));
	document.querySelectorAll('.note-menu-control .icon-options[aria-expanded="true"]').forEach(item => {
		item.setAttribute('aria-expanded', 'false');
	});

	if (id == null) {
		noteMenu.classList.add('hidden');
		noteMenu.dataset.id = '';
		return;
	}

	const note = notes.find(item => item.id === id);
	const li = notesList.querySelector(`li[data-id="${id}"]`);
	const menuButton = button || notesList.querySelector(`.note-menu-control .icon-options[data-id="${id}"]`);
	if (!note || !li || !menuButton) {
		closeListMenu();
		return;
	}

	li.classList.add('menu-open');
	menuButton.setAttribute('aria-expanded', 'true');
	noteMenu.dataset.id = id;
	noteMenuStar.textContent = note.favorite ? 'Unstar' : 'Star';
	noteMenuStar.classList.toggle('active', note.favorite === true);
	noteMenu.classList.remove('hidden');

	const listRect = listContainer.getBoundingClientRect();
	const buttonRect = menuButton.getBoundingClientRect();
	const menuWidth = noteMenu.offsetWidth;
	const menuHeight = noteMenu.offsetHeight;
	const left = Math.max(8, Math.min(buttonRect.right - listRect.left - menuWidth, listRect.width - menuWidth - 8));
	const top = Math.max(8, Math.min(buttonRect.bottom - listRect.top - 2, listRect.height - menuHeight - 8));
	noteMenu.style.left = `${left}px`;
	noteMenu.style.top = `${top}px`;
}

function toggleOptions(toggled = true) {
	states.options = toggled ? !states.options : false;
	optionsContainer.className = states.options ? '' : 'hidden';
	optionsButton.setAttribute('aria-expanded', states.options);
	if (states.options) {
		setMeta();
		setTimeout(() => optionsCloseButton.focus(), 0);
	}
}

function toggleNotes(toggled = true) {
	states.list = toggled ? !states.list : false;
	listContainer.className = states.list ? '' : 'hidden';
	updateEditorShellVisibility();
	updateFileToolbarVisibility();
	if (states.list) populateList()
}

function updateEditorShellVisibility() {
	const listVisible = !listContainer.classList.contains('hidden');
	appHeader.classList.toggle('hidden', listVisible);
	appFooter.classList.toggle('hidden', listVisible);
	editorContainer.classList.toggle('hidden', listVisible);
}

function updateFileToolbarVisibility() {
	const listVisible = !listContainer.classList.contains('hidden');
	fileToolbar.classList.toggle('suppressed', states.find || listVisible);
}

function toggleInfo() {
	states.info = !states.info;
	infoContainer.className = states.info ? '' : 'hidden';
}

function titleKeyUp(event) {
	updateTitleValue(event.target.value);
}

function updateTitleValue(value) {
	if (states.loading) return;
	const note = currentNote();
	if (!note) return;
	note.title = value;
	note.modified = +new Date();
	setMeta();
	if (states.list) populateList();
	scheduleNotesSync();
}

function contentChanged(delta, oldDelta, source) {
	if (source != 'user') return;
	if (states.loading) return;
	const note = currentNote();
	if (!note) return;
	if (note.mode === 'task') {
		ensureTaskFormats();
		resetInsertedTaskLines(delta);
	}
	const content = editor.getContents()
	notes[states.noteIndex]['content'] = content.ops
	notes[states.noteIndex]['modified'] = +new Date()
	setMeta()
	scheduleNotesSync()
}

function selectTheme(e) {
	const theme = +e.target.getAttribute('data-theme')
	setTheme(theme)
	notes[states.noteIndex]['theme'] = theme
	states.selectedTheme = theme
	toggleThemeActions(true)
}

function setTheme(theme) {
	theme = isValidTheme(theme) ? +theme : 0;
	const themeColor = themes[theme];
	document.body.className = darkThemes.indexOf(theme) > -1 ? 'theme-dark' : '';
	document.body.style.setProperty('--note-bg', themeColor)
	document.documentElement.style.backgroundColor = themeColor
	document.querySelector('header').style.backgroundColor = themeColor
	document.querySelector('footer').style.backgroundColor = themeColor
	document.querySelector('.ql-editor').style.backgroundColor = themeColor
	document.querySelector('.ql-editor').style.setProperty('--note-bg', themeColor)
	updateThemeSelection(theme)
}

function updateThemeSelection(theme) {
	document.querySelectorAll('#themes-list li').forEach(item => {
		const itemTheme = +item.dataset.theme;
		item.classList.toggle('selected', itemTheme === theme);
		item.classList.toggle('default', states.defaultTheme !== null && itemTheme === states.defaultTheme);
	});
	updateDefaultThemeButton();
}

function toggleThemeActions(show) {
	const note = currentNote();
	states.selectedTheme = show && note ? note.theme : null;
	themeActions.className = show ? 'actions' : 'actions hidden';
	updateDefaultThemeButton();
}

function applyCurrentNoteSettingsToAll(assignSettings, feedbackElement) {
	const note = currentNote();
	if (!note) return;
	notes.forEach(item => {
		assignSettings(item, note);
	});
	showActionFeedback(feedbackElement);
	syncNotes();
	populateList();
}

function toggleDefaultSettings(isDefault, clearDefault, setDefault, updateControls, feedbackElement) {
	const note = currentNote();
	if (!note) return;

	if (isDefault(note)) {
		clearDefault();
	} else {
		setDefault(note);
	}

	updateControls(note);
	showActionFeedback(feedbackElement);
	syncOptions();
}

function applyThemeToAllNotes() {
	applyCurrentNoteSettingsToAll((item, note) => {
		item.theme = note.theme;
	}, themeActionFeedback);
}

function makeDefaultTheme() {
	toggleDefaultSettings(
		note => states.defaultTheme === note.theme,
		() => { states.defaultTheme = null; },
		note => { states.defaultTheme = note.theme; },
		note => updateThemeSelection(note.theme),
		themeActionFeedback
	);
}

function updateDefaultThemeButton() {
	const note = currentNote();
	makeDefaultThemeButton.textContent = note && states.defaultTheme === note.theme ? 'Reset default' : 'Make it default';
}

function setFont(fontFace, fontSize) {
	fontFace = isValidFontFace(fontFace) ? fontFace : DEFAULT_FONT_FACE;
	fontSize = normalizeFontSize(fontSize);
	editor.root.style.fontFamily = NOTE_FONT_FACES[fontFace];
	editor.root.style.fontSize = fontSize + 'px';
	updateFontControls(fontFace, fontSize);
}

function updateFontControls(fontFace, fontSize) {
	fontFaceSelect.value = isValidFontFace(fontFace) ? fontFace : DEFAULT_FONT_FACE;
	fontSizeSelect.value = String(normalizeFontSize(fontSize));
	updateDefaultFontButton();
}

function toggleFontActions(show) {
	fontActions.className = show ? 'actions' : 'actions hidden';
	states.selectedFont = show;
	updateDefaultFontButton();
}

function selectFont() {
	const note = currentNote();
	if (!note || states.loading) return;
	note.fontFace = isValidFontFace(fontFaceSelect.value) ? fontFaceSelect.value : DEFAULT_FONT_FACE;
	note.fontSize = normalizeFontSize(fontSizeSelect.value);
	setFont(note.fontFace, note.fontSize);
	toggleFontActions(true);
}

function applyFontToAllNotes() {
	applyCurrentNoteSettingsToAll((item, note) => {
		item.fontFace = note.fontFace;
		item.fontSize = note.fontSize;
	}, fontActionFeedback);
}

function makeDefaultFont() {
	toggleDefaultSettings(
		note => isDefaultFont(note.fontFace, note.fontSize),
		() => {
			states.defaultFontFace = null;
			states.defaultFontSize = null;
		},
		note => {
			states.defaultFontFace = note.fontFace;
			states.defaultFontSize = note.fontSize;
		},
		updateDefaultFontButton,
		fontActionFeedback
	);
}

function updateDefaultFontButton() {
	const note = currentNote();
	makeDefaultFontButton.textContent = note && isDefaultFont(note.fontFace, note.fontSize) ? 'Reset default' : 'Make it default';
}

function updateModeButtons(mode) {
	mode = normalizeNoteMode(mode);
	noteModeButton.classList.toggle('active', mode === 'note');
	taskModeButton.classList.toggle('active', mode === 'task');
}

function updateFavoriteButton() {
	const note = currentNote();
	const isFavorite = note && note.favorite === true;
	const label = isFavorite ? 'Unstar' : 'Star';
	favoriteButton.setAttribute('aria-label', label);
	favoriteButton.setAttribute('aria-pressed', isFavorite);
	favoriteButton.setAttribute('title', label);
	const tooltip = favoriteButton.querySelector('span');
	if (tooltip) tooltip.textContent = label;
	favoriteButton.classList.toggle('active', isFavorite);
}

function toggleFavorite() {
	const note = currentNote();
	if (!note || states.loading) return;
	toggleNoteStar(note.id);
}

function toggleNoteStar(id) {
	const note = notes.find(item => item.id === id);
	if (!note || states.loading) return;
	note.favorite = !note.favorite;
	if (currentNote() && currentNote().id === id) {
		updateFavoriteButton();
		setMeta();
	}
	if (states.list) populateList();
	syncNotes();
}

function setNoteMode(mode, save = true) {
	const note = currentNote();
	if (!note) return;
	note.mode = normalizeNoteMode(mode);
	document.getElementById('editor').classList.toggle('task-mode', note.mode === 'task');
	updateModeButtons(note.mode);

	if (note.mode === 'task') {
		ensureTaskFormats();
		note.content = editor.getContents().ops;
	}

	if (save && !states.loading) {
		note.modified = +new Date();
		setMeta();
		if (states.list) populateList();
		syncNotes();
	}
}

function switchNoteMode(e) {
	setNoteMode(e.currentTarget.dataset.mode);
}

function ensureTaskFormats() {
	let changed = false;
	editor.getLines(0, editor.getLength()).forEach(line => {
		const index = editor.getIndex(line);
		const formats = editor.getFormat(index, 1);
		if (typeof formats.checked === 'undefined') {
			editor.formatLine(index, 1, 'checked', 'false', 'silent');
			changed = true;
		}
	});
	return changed;
}

function deltaIncludesNewLine(delta) {
	return delta.ops.some(op => typeof op.insert === 'string' && op.insert.includes('\n'));
}

function resetInsertedTaskLines(delta) {
	if (!deltaIncludesNewLine(delta)) return;

	let index = 0;
	delta.ops.forEach(op => {
		if (op.retain) {
			index += op.retain;
			return;
		}

		if (typeof op.insert !== 'string') {
			if (op.insert) index += 1;
			return;
		}

		for (let offset = 0; offset < op.insert.length; offset += 1) {
			if (op.insert[offset] === '\n') {
				editor.formatLine(index + offset + 1, 1, 'checked', 'false', 'silent');
			}
		}
		index += op.insert.length;
	});
}

function toggleTaskItem(event) {
	const note = currentNote();
	if (!note || note.mode !== 'task') return;

	const lineNode = event.target.closest('.ql-editor p, .ql-editor li, .ql-editor blockquote, .ql-editor pre');
	if (!lineNode || !editor.root.contains(lineNode)) return;

	const lineRect = lineNode.getBoundingClientRect();
	if (event.clientX > lineRect.left + 28) return;

	const blot = Quill.find(lineNode);
	if (!blot) return;

	event.preventDefault();
	const index = editor.getIndex(blot);
	const checked = lineNode.getAttribute('data-checked') === 'true';
	editor.formatLine(index, 1, 'checked', checked ? 'false' : 'true', 'user');
}

function iconTargetNote() {
	if (states.iconId != null) {
		const note = notes.find(item => item.id === states.iconId);
		if (note) return note;
	}
	return currentNote();
}

function selectIcon(icon, remove = false) {
	const note = iconTargetNote();
	if (note && (remove || icon != false)) {
		if (currentNote() && currentNote().id === note.id) setIcon(icon)
		note.icon = icon
		note.modified = +new Date()
		if (currentNote() && currentNote().id === note.id) setMeta()
		if (states.list) populateList()
		syncNotes()
	}
}

function setIcon(icon) {
	iconContainer.className = icon ? 'has-icon' : ''
	iconButton.children[0].innerHTML = icon ? icon : '';
}

function setMeta() {
	const note = notes[states.noteIndex]
	if (!note) return;
	createdInfo.innerHTML = ago(note['created'])
	modifiedInfo.innerHTML = ago(note['modified'])
	optionsContainer.dataset.id = note.id
	deleteButton.textContent = `Delete ${getNoteKind(note)[0].toUpperCase()}${getNoteKind(note).slice(1)}`;
}

function deleteNote(id) {
	if (id == null) return;
	states.loading = true;
	const index = notes.findIndex(note => note.id === id);
	if (index !== -1) {
		notes.splice(index, 1);
		removeFromCustomOrder(id);
		if (notes.length === 0) {
			cloneEmptyNote();
		}
		loadLastNote();
		syncOptions();
		syncNotes();
	}
	states.loading = false;
}

function loadNote(id) {
	const index = notes.findIndex(item => item.id == id);
	if (index === -1) return;
	states.noteIndex = index
	let note = normalizeNote(notes[index])
	notes[index] = note
	titleInput.value = note.title
	editor.setContents(note.content)
	toggleFind(false)
	setIcon(note.icon)
	setTheme(note.theme)
	setFont(note.fontFace, note.fontSize)
	setNoteMode(note.mode, false)
	updateFavoriteButton()
	toggleThemeActions(false)
	toggleFontActions(false)
	setMeta()
	notes[index]['opened'] = +new Date()
	editor.focus()
	states.loading = false
}

function titleKeyDown(event) {
	if (event.key === 'Tab' || (event.key === 'Enter' && !event.isComposing)) {
		event.preventDefault();
		editor.focus()
	}
}

function openIconDialog(id = null) {
	const note = id == null ? currentNote() : notes.find(item => item.id === id);
	if (!note) return;
	states.iconId = note.id;
	states.emojis = true;
	states.listMenuId = null;
	emojisContainer.className = '';
	updateListMenu();
	const kind = getNoteKind(note);
	if (emojiDialogTitle) emojiDialogTitle.textContent = `${kind[0].toUpperCase()}${kind.slice(1)} icon`;
	emojiPicker.clear()
	emojiPicker.setSelectedEmoji(note.icon || '')
	emojiPicker.focus()
}

function closeIconDialog() {
	states.iconId = null;
	states.emojis = false;
	emojisContainer.className = 'hidden';
}

function toggleEmojis(toggled = true) {
	if (toggled === false || states.emojis) {
		closeIconDialog();
		return;
	}
	openIconDialog();
}

function removeEmojiDialogIcon() {
	selectIcon('', true);
	closeIconDialog();
}

function getLegacyNoteKeyIndex(key) {
	const index = +key.slice(NOTE_KEY_PREFIX.length);
	return Number.isFinite(index) ? index : Number.MAX_SAFE_INTEGER;
}

function getStoredNoteRecords(items) {
	const records = [];
	const indexedKeys = new Set();
	const hasNoteIndex = Array.isArray(items[NOTE_INDEX_KEY]);

	if (hasNoteIndex) {
		items[NOTE_INDEX_KEY]
			.map(id => +id)
			.filter(Number.isFinite)
			.forEach((id, index) => {
				const key = getNoteStorageKey(id);
				const item = items[key];
				indexedKeys.add(key);
				if (typeof item === 'object' && item !== null) {
					records.push({ key, item, index });
				}
			});
	}

	if (hasNoteIndex && records.length > 0) return records;

	Object.keys(items)
		.filter(isNoteStorageKey)
		.filter(key => !indexedKeys.has(key))
		.sort((a, b) => getLegacyNoteKeyIndex(a) - getLegacyNoteKeyIndex(b))
		.forEach((key, index) => {
			const item = items[key];
			if (typeof item === 'object' && item !== null) {
				records.push({ key, item, index: records.length + index });
			}
		});

	return records;
}

function getNormalizedStoredRecords(records) {
	const notesBySignature = new Map();
	const dedupedNotes = [];

	records.forEach(record => {
		const note = normalizeNote(record.item);
		const signature = getNoteSignature(note);
		const existingIndex = notesBySignature.get(signature);

		if (typeof existingIndex === 'number') {
			if (getRecentTime(note) > getRecentTime(dedupedNotes[existingIndex])) {
				dedupedNotes[existingIndex] = note;
			}
			console.warn('Duplicate note content found:', record.key);
			return;
		}

		notesBySignature.set(signature, dedupedNotes.length);
		dedupedNotes.push(note);
	});

	const existingIds = new Set();
	dedupedNotes.forEach(note => {
		if (existingIds.has(note.id)) {
			const duplicateId = note.id;
			note.id = getNextNoteId(existingIds);
			console.warn('Duplicate note id repaired:', duplicateId, '->', note.id);
		}
		existingIds.add(note.id);
	});

	return dedupedNotes;
}

function getNormalizedStoredNotes(items) {
	return getNormalizedStoredRecords(getStoredNoteRecords(items));
}

function getStorageNoteItemsFor(storedNotes) {
	const noteItems = {
		[NOTE_INDEX_KEY]: storedNotes.map(note => note.id),
	};
	storedNotes.forEach(note => {
		noteItems[getNoteStorageKey(note.id)] = normalizeNote(note);
	});
	return noteItems;
}

function getStorageNoteItems() {
	ensureConsistentNotes();
	return getStorageNoteItemsFor(notes);
}

function queueStorageOperation(operation) {
	const nextOperation = storageQueue.catch(() => { }).then(operation);
	storageQueue = nextOperation.catch(() => { });
	return nextOperation;
}

function showStorageStatus() {
	if (!storageStatus) return;
	storageActivityCount += 1;
	clearTimeout(storageStatusHideTimer);
	storageStatus.classList.add('visible');
}

function hideStorageStatus() {
	if (!storageStatus) return;
	storageActivityCount = Math.max(0, storageActivityCount - 1);
	if (storageActivityCount > 0) return;
	clearTimeout(storageStatusHideTimer);
	storageStatusHideTimer = setTimeout(() => {
		if (storageActivityCount === 0) storageStatus.classList.remove('visible');
	}, 350);
}

async function trackStorageActivity(operation) {
	showStorageStatus();
	try {
		return await operation();
	} finally {
		hideStorageStatus();
	}
}

function hasStoredNotes(items) {
	return getStoredNoteRecords(items).length > 0;
}

function hasStoredOptions(items) {
	return !isEmpty(items.options);
}

function hasMeaningfulStoredNotes(items) {
	return getStoredNoteRecords(items).some(record => {
		const note = normalizeNote({ ...record.item });
		return note.modified !== null ||
			note.title.length > 0 ||
			note.icon.length > 0 ||
			note.content.length > 0 ||
			note.favorite === true;
	});
}

function hasSyncStorageData(items) {
	return hasStoredNotes(items) || hasStoredOptions(items);
}

function getMigratableStorageItems(items) {
	const migratableItems = {};
	if (Array.isArray(items[NOTE_INDEX_KEY])) migratableItems[NOTE_INDEX_KEY] = items[NOTE_INDEX_KEY];
	if (hasStoredOptions(items)) migratableItems.options = items.options;
	Object.keys(items)
		.filter(isNoteStorageKey)
		.forEach(key => {
			migratableItems[key] = items[key];
		});
	return migratableItems;
}

function getMigratableStorageKeys(items) {
	return Object.keys(getMigratableStorageItems(items));
}

function getReconciledStorageItems(localItems, syncItems) {
	const localRecords = hasMeaningfulStoredNotes(localItems) ? getStoredNoteRecords(localItems) : [];
	const syncRecords = getStoredNoteRecords(syncItems);
	const mergedNotes = getNormalizedStoredRecords(localRecords.concat(syncRecords));
	const reconciledItems = {
		...localItems,
		...getStorageNoteItemsFor(mergedNotes),
		[STORAGE_MIGRATION_KEY]: true,
	};

	if (hasStoredOptions(localItems)) {
		reconciledItems.options = localItems.options;
	} else if (hasStoredOptions(syncItems)) {
		reconciledItems.options = syncItems.options;
	}

	return reconciledItems;
}

async function loadStorageItems() {
	const localItems = await storageGet(null);

	let syncItems = {};
	try {
		syncItems = await storageGet(null, STORAGE_AREA_SYNC);
	} catch (error) {
		console.warn('Failed to read legacy sync storage:', error);
	}

	if (hasSyncStorageData(syncItems)) {
		return trackStorageActivity(async () => {
			const migratedItems = getReconciledStorageItems(localItems, syncItems);
			await storageSet(migratedItems);
			try {
				await storageRemove(getMigratableStorageKeys(syncItems), STORAGE_AREA_SYNC);
			} catch (error) {
				console.warn('Failed to remove migrated sync storage:', error);
			}
			return migratedItems;
		});
	}

	if (localItems[STORAGE_MIGRATION_KEY] === true) return localItems;

	if (hasMeaningfulStoredNotes(localItems)) {
		return trackStorageActivity(async () => {
			await storageSet({ [STORAGE_MIGRATION_KEY]: true });
			return {
				...localItems,
				[STORAGE_MIGRATION_KEY]: true,
			};
		});
	}

	return localItems;
}

function syncNotes() {
	return queueStorageOperation(() => {
		return trackStorageActivity(() => storageGet(null)
			.then(items => {
				const noteItems = getStorageNoteItems();
				const currentNoteKeys = new Set(notes.map(note => getNoteStorageKey(note.id)));
				const staleNoteKeys = Object.keys(items)
					.filter(key => isNoteStorageKey(key) && !currentNoteKeys.has(key));
				return storageSet(noteItems)
					.then(() => storageRemove(staleNoteKeys));
			}));
	}).catch(error => {
		console.error('Failed to save notes:', error);
	});
}

function sendNotesToBackground() {
	if (!backgroundNotesSaveAvailable || !window.chrome || !chrome.runtime || !chrome.runtime.id || !chrome.runtime.sendMessage) {
		return false;
	}

	try {
		showStorageStatus();
		chrome.runtime.sendMessage({
			type: NOTES_SAVE_MESSAGE,
			noteItems: getStorageNoteItems(),
		}, () => {
			if (chrome.runtime.lastError) backgroundNotesSaveAvailable = false;
			hideStorageStatus();
		});
		return true;
	} catch (error) {
		backgroundNotesSaveAvailable = false;
		hideStorageStatus();
		return false;
	}
}

function scheduleNotesSync() {
	if (!sendNotesToBackground()) syncNotes();
}

function flushNotesSync() {
	sendNotesToBackground();
	return syncNotes();
}

function syncOnExit() {
	if (exitSyncQueued) return;
	exitSyncQueued = true;
	toggleFind(false, false);
	syncOptions();
	flushNotesSync();
	setTimeout(() => {
		exitSyncQueued = false;
	}, 1000);
}

function syncOptions() {
	return queueStorageOperation(() => {
		return trackStorageActivity(() => storageSet({ 'options': getPersistedOptions() }));
	}).catch(error => {
		console.error('Failed to save options:', error);
	});
}

function addNote(mode = 'note') {
	if (states.loading) return;
	mode = normalizeNoteMode(mode);

	states.loading = true;
	const emptyNote = notes.find(note => note.modified === null && normalizeNoteMode(note.mode) === mode);
	if (!emptyNote) {
		cloneEmptyNote(mode);
		loadLastNote();
	} else {
		loadNote(emptyNote.id);
	}

	toggleNotes(false);
	states.loading = false;
}

function addTask() {
	addNote('task');
}

function cloneEmptyNote(mode = 'note') {
	let noteClone = JSON.parse(JSON.stringify(newNote));
	const now = +new Date();
	noteClone['id'] = getNextNoteId();
	noteClone['created'] = now;
	noteClone['opened'] = now;
	noteClone['theme'] = isValidTheme(states.defaultTheme) ? states.defaultTheme : Math.floor(Math.random() * themes.length);
	noteClone['fontFace'] = isValidFontFace(states.defaultFontFace) ? states.defaultFontFace : DEFAULT_FONT_FACE;
	noteClone['fontSize'] = normalizeFontSize(states.defaultFontSize);
	noteClone['mode'] = normalizeNoteMode(mode);
	notes.push(noteClone);
	rememberCustomOrderFirst(noteClone.id);
}

function loadLastNote() {
	if (notes.length === 0) {
		addNote()
		return;
	}

	const note = getRecentNotes()[0];

	loadNote(+note.id);
}

function populateList() {
	const orderedNotes = getOrderedNotes();
	const draggable = canDragNotes();
	notesList.innerHTML = '';
	notesList.classList.toggle('custom-order', draggable);
	notesList.classList.toggle('searching', getListSearchQuery() !== '');
	updateListControls();

	if (orderedNotes.length === 0) {
		const emptyItem = document.createElement('li');
		emptyItem.className = 'empty';
		emptyItem.textContent = getEmptyListMessage();
		notesList.appendChild(emptyItem);
		updateListMenu();
		return;
	}

	orderedNotes.forEach((item) => {
		const id = item.id;
		const li = document.createElement('li');
		li.dataset.id = id;
		li.draggable = draggable;
		li.classList.toggle('menu-open', states.listMenuId === id);

		const title = document.createElement('div');
		title.className = 'title';
		if (item.icon) {
			const icon = document.createElement('b');
			icon.textContent = item.icon;
			title.appendChild(icon);
			title.appendChild(document.createTextNode(' '));
		}
		title.appendChild(document.createTextNode(getNoteTitle(item)));

		const info = document.createElement('div');
		info.className = 'info';
		const modified = document.createElement('span');
		modified.textContent = ago(item.modified);

		const menuControl = document.createElement('div');
		menuControl.className = 'note-menu-control';
		menuControl.addEventListener('click', event => {
			event.stopPropagation();
		});

		const menuButton = document.createElement('button');
		menuButton.className = 'icon-options';
		menuButton.type = 'button';
		menuButton.setAttribute('aria-label', 'Note actions');
		menuButton.setAttribute('aria-haspopup', 'menu');
		menuButton.setAttribute('aria-expanded', states.listMenuId === id);
		menuButton.dataset.id = id;
		menuButton.addEventListener('click', event => {
			event.stopPropagation();
			toggleListMenu(id, menuButton);
		});

		menuControl.appendChild(menuButton);
		info.appendChild(modified);
		info.appendChild(menuControl);
		li.appendChild(title);
		if (item.favorite) {
			const favoriteMarker = document.createElement('span');
			favoriteMarker.className = 'favorite-marker';
			favoriteMarker.setAttribute('aria-hidden', 'true');
			li.appendChild(favoriteMarker);
		}
		li.appendChild(info);

		if (draggable) {
			li.addEventListener('dragstart', noteDragStart);
			li.addEventListener('dragover', noteDragOver);
			li.addEventListener('dragleave', noteDragLeave);
			li.addEventListener('drop', noteDrop);
			li.addEventListener('dragend', noteDragEnd);
		}

		li.addEventListener('click', selectNote);
		notesList.appendChild(li);
	});
	updateListMenu();
}

function selectNote(e) {
	if (states.suppressNoteSelect) return;

	const li = e.currentTarget.closest('li');
	if (!li || li.classList.contains('empty')) return;
	const id = +li.dataset.id;
	if (!Number.isFinite(id)) return;
	states.loading = true;
	loadNote(id);
	toggleNotes(false);
}

function getEmptyListMessage() {
	if (getListSearchQuery() !== '') return 'No notes found';
	if (states.listFilterMode === 'tasks') return 'No tasks found';
	if (states.listFilterMode === 'notes') return 'No notes found';
	if (states.listFilterMode === 'starred') return 'No starred notes';
	return 'No notes found';
}

function updateListControls() {
	const filterLabel = LIST_FILTER_LABELS[states.listFilterMode] || LIST_FILTER_LABELS.all;
	const sortLabel = LIST_SORT_LABELS[states.listSortMode] || LIST_SORT_LABELS.recent;
	const sortText = typeof sortLabel === 'string' ? sortLabel : sortLabel.label;
	notesFilterButton.classList.remove('icon-filter-all', 'icon-filter-note', 'icon-filter-task', 'icon-filter-star');
	notesFilterButton.classList.add(states.listFilterMode === 'starred' ? 'icon-filter-star' : states.listFilterMode === 'tasks' ? 'icon-filter-task' : states.listFilterMode === 'notes' ? 'icon-filter-note' : 'icon-filter-all');
	notesFilterButton.setAttribute('aria-label', `Filter: ${filterLabel}`);
	notesFilterButton.querySelector('span').textContent = `Filter: ${filterLabel}`;
	notesFilterButton.classList.toggle('active', states.listFilterMode !== 'all');
	notesSortButton.classList.remove('icon-sort-custom', 'icon-sort-date', 'icon-sort-title');
	notesSortButton.classList.add(states.listSortMode === 'custom' ? 'icon-sort-custom' : states.listSortMode === 'title' ? 'icon-sort-title' : 'icon-sort-date');
	notesSortButton.setAttribute('aria-label', `Sort: ${sortText}${sortLabel.hint ? `, ${sortLabel.hint}` : ''}`);
	const notesSortTooltip = notesSortButton.querySelector('span');
	notesSortTooltip.textContent = `Sort: ${sortText}`;
	if (sortLabel.hint) {
		const sortHint = document.createElement('span');
		sortHint.textContent = sortLabel.hint;
		notesSortTooltip.appendChild(sortHint);
	}
	notesSortButton.classList.toggle('active', states.listSortMode !== 'recent');
}

function updateListSearchState(active = states.listSearch) {
	states.listSearch = active;
	filesToolbar.classList.toggle('search-active', states.listSearch);
	updateSearchDividerVisibility();
	notesSearchButton.setAttribute('aria-label', states.listSearch ? 'Close notes search' : 'Find notes');
	notesSearchButton.querySelector('span').textContent = states.listSearch ? 'Close Search' : 'Find Notes';
	if (states.listSearch) {
		setTimeout(() => notesSearchInput.focus(), 0);
		return;
	}
	if (notesSearchInput.value) {
		notesSearchInput.value = '';
		updateSearchDividerVisibility();
		populateList();
	}
}

function updateSearchDividerVisibility() {
	const hasSearchValue = states.listSearch && notesSearchInput.value.trim() !== '';
	searchDivider.classList.toggle('visible', hasSearchValue);
}

function toggleListSearch() {
	updateListSearchState(!states.listSearch);
}

function toggleListFilterMode() {
	const currentModeIndex = LIST_FILTER_MODES.indexOf(states.listFilterMode);
	states.listFilterMode = LIST_FILTER_MODES[(currentModeIndex + 1) % LIST_FILTER_MODES.length];
	populateList();
	syncOptions();
}

function toggleListSortMode() {
	const currentModeIndex = LIST_SORT_MODES.indexOf(states.listSortMode);
	states.listSortMode = LIST_SORT_MODES[(currentModeIndex + 1) % LIST_SORT_MODES.length];
	if (states.listSortMode === 'custom') ensureCustomOrder();
	populateList();
	syncOptions();
}

function noteSearchChanged() {
	updateSearchDividerVisibility();
	populateList();
}

function noteDragStart(event) {
	if (!canDragNotes()) {
		event.preventDefault();
		return;
	}
	states.dragId = +event.currentTarget.dataset.id;
	states.suppressNoteSelect = true;
	event.currentTarget.classList.add('dragging');
	event.dataTransfer.effectAllowed = 'move';
	event.dataTransfer.setData('text/plain', states.dragId);
}

function noteDragOver(event) {
	if (states.dragId == null) return;
	event.preventDefault();
	notesList.classList.remove('drop-target-end');
	event.currentTarget.classList.add('drop-target');
}

function notesListDragOver(event) {
	if (states.dragId == null || event.target !== notesList) return;
	event.preventDefault();
	notesList.classList.add('drop-target-end');
}

function noteDragLeave(event) {
	event.currentTarget.classList.remove('drop-target');
}

function notesListDragLeave(event) {
	if (event.target !== notesList) return;
	notesList.classList.remove('drop-target-end');
}

function noteDrop(event) {
	event.preventDefault();
	event.stopPropagation();
	const targetId = +event.currentTarget.dataset.id;
	reorderCustomNotes(states.dragId, targetId, event.clientY);
	noteDragEnd();
	populateList();
	syncOptions();
}

function notesListDrop(event) {
	if (states.dragId == null || event.target !== notesList) return;
	event.preventDefault();
	const lastItem = Array.from(notesList.querySelectorAll('li:not(.empty)')).pop();
	if (!lastItem) return;
	reorderCustomNotes(states.dragId, +lastItem.dataset.id, Number.POSITIVE_INFINITY);
	noteDragEnd();
	populateList();
	syncOptions();
}

function noteDragEnd() {
	document.querySelectorAll('#notes li').forEach(item => {
		item.classList.remove('dragging', 'drop-target');
	});
	notesList.classList.remove('drop-target-end');
	states.listMenuId = null;
	updateListMenu();
	states.dragId = null;
	setTimeout(() => {
		states.suppressNoteSelect = false;
	}, 150);
}

function reorderCustomNotes(dragId, targetId, clientY) {
	if (dragId == null || targetId == null || Number.isNaN(dragId) || Number.isNaN(targetId) || dragId === targetId) return;
	ensureCustomOrder();
	const order = states.customOrder.filter(id => id !== dragId);
	const targetIndex = order.indexOf(targetId);
	if (targetIndex === -1) return;

	const targetElement = notesList.querySelector(`[data-id="${targetId}"]`);
	const rect = targetElement.getBoundingClientRect();
	const insertAfter = clientY > rect.top + (rect.height / 2);
	order.splice(targetIndex + (insertAfter ? 1 : 0), 0, dragId);
	states.customOrder = order;
}

function init() {
	loadStorageItems().then(items => {
		applyPersistedOptions(items.options);
		updateViewModeControls();
		applyExtensionViewMode();
		notes = getNormalizedStoredNotes(items);
		ensureConsistentNotes();
		if (notes.length === 0) {
			cloneEmptyNote();
		}
		ensureCustomOrder();
		updateListControls();
		resizeBody(states.size);
		loadLastNote();
		scrollPanelToTopLeft();
		syncOptions();
		syncNotes();
	}).catch(error => {
		console.error('Failed to load notes:', error);
		cloneEmptyNote();
		updateViewModeControls();
		applyExtensionViewMode();
		resizeBody(states.size);
		loadLastNote();
		scrollPanelToTopLeft();
	});
}

// helpers
function isEmpty(obj) {
	return typeof obj != 'object' || obj === null || Object.keys(obj).length === 0;
}

function ago(time) {
	if (!time) return '-';
	let seconds = Math.floor((+new Date() - time) / 1000)
	let interval = Math.floor(seconds / 31536000)
	if (interval > 1) return suffix(interval, "year");
	interval = Math.floor(seconds / 2592000);
	if (interval > 1) return suffix(interval, "month");
	interval = Math.floor(seconds / 86400);
	if (interval >= 1) return suffix(interval, "day");
	interval = Math.floor(seconds / 3600);
	if (interval >= 1) return suffix(interval, "hour");
	if (seconds <= 10) return 'just now';
	if (seconds <= 60) return 'a few seconds ago';
	interval = Math.floor(seconds / 60);
	if (interval >= 1) return suffix(interval, "minute");
	return suffix(Math.floor(seconds), "second");
}

function suffix(value, fix) {
	return value + ' ' + fix + (value > 1 ? 's' : '') + ' ago'
}

// speech to text
function getSpeechRecognitionConstructor() {
	return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function createMicrophonePermissionIframe() {
	const iframe = document.createElement('iframe');
	iframe.id = 'microphone-permission-frame';
	iframe.allow = 'microphone';
	iframe.src = chrome.runtime.getURL('permission/index.html');
	iframe.style.position = 'fixed';
	iframe.style.width = '1px';
	iframe.style.height = '1px';
	iframe.style.opacity = '0';
	iframe.style.pointerEvents = 'none';
	iframe.style.border = '0';
	iframe.style.left = '-1000px';
	iframe.style.top = '-1000px';
	return iframe;
}

async function requestMicrophonePermissionInIframe() {
	return new Promise((resolve, reject) => {
		const iframe = createMicrophonePermissionIframe();
		const timeout = window.setTimeout(() => {
			cleanup();
			reject(new Error('Microphone permission request timed out.'));
		}, 30000);

		function cleanup() {
			window.clearTimeout(timeout);
			window.removeEventListener('message', handleMessage);
			if (iframe.parentElement) iframe.remove();
		}

		function handleMessage(event) {
			if (event.origin !== window.location.origin) return;
			if (!event.data || event.data.source !== 'noted-microphone-permission') return;
			cleanup();
			if (event.data.ok) {
				resolve();
			} else {
				const error = new Error(event.data.message || 'Microphone permission was denied.');
				error.name = event.data.name || 'PermissionError';
				reject(error);
			}
		}

		window.addEventListener('message', handleMessage);
		document.body.appendChild(iframe);
	});
}

async function getMicrophonePermissionState() {
	if (!navigator.permissions || !navigator.permissions.query) return null;
	try {
		const permission = await navigator.permissions.query({ name: 'microphone' });
		return permission.state;
	} catch (error) {
		return null;
	}
}

function openMicrophonePermissionWindow() {
	const url = chrome.runtime.getURL('permission/index.html');
	if (chrome.windows && chrome.windows.create) {
		chrome.windows.create({
			url,
			type: 'popup',
			width: 800,
			height: 500,
		});
		return;
	}
	window.open(url, '_blank', 'width=800,height=500');
}

async function ensureMicrophonePermission() {
	if (window.chrome && chrome.runtime && chrome.runtime.getURL) {
		const permissionState = await getMicrophonePermissionState();
		if (permissionState !== 'granted') {
			openMicrophonePermissionWindow();
			const error = new Error('Allow microphone access in the permission window, then click Dictate again.');
			error.name = 'NotAllowedError';
			throw error;
		}

		await requestMicrophonePermissionInIframe();
		return;
	}

	if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
	const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
	stream.getTracks().forEach(track => track.stop());
}

function getSpeechTarget() {
	if (document.activeElement === titleInput) {
		return {
			type: 'title',
			start: titleInput.selectionStart || 0,
			end: titleInput.selectionEnd || titleInput.selectionStart || 0,
		};
	}

	if (editor.hasFocus()) {
		const range = editor.getSelection();
		return {
			type: 'editor',
			range: range || { index: editor.getLength() - 1, length: 0 },
		};
	}

	editor.focus();
	return {
		type: 'editor',
		range: editor.getSelection(true) || { index: editor.getLength() - 1, length: 0 },
	};
}

function prepareTranscript(text) {
	const transcript = text.trim();
	if (!transcript) return '';
	return transcript + ' ';
}

function insertSpeechInTitle(text) {
	const start = speechTarget && Number.isInteger(speechTarget.start) ? speechTarget.start : titleInput.value.length;
	const end = speechTarget && Number.isInteger(speechTarget.end) ? speechTarget.end : start;
	const nextValue = titleInput.value.slice(0, start) + text + titleInput.value.slice(end);
	const nextPosition = start + text.length;

	titleInput.value = nextValue;
	titleInput.focus({ preventScroll: true });
	titleInput.setSelectionRange(nextPosition, nextPosition);
	speechTarget = { type: 'title', start: nextPosition, end: nextPosition };
	updateTitleValue(nextValue);
}

function insertSpeechInEditor(text) {
	const fallbackIndex = Math.max(0, editor.getLength() - 1);
	const range = speechTarget && speechTarget.range ? speechTarget.range : { index: fallbackIndex, length: 0 };
	const index = Math.min(range.index, fallbackIndex);
	const length = Math.max(0, Math.min(range.length || 0, editor.getLength() - index - 1));

	editor.focus({ preventScroll: true });
	if (length > 0) editor.deleteText(index, length, 'user');
	editor.insertText(index, text, 'user');
	const nextIndex = index + text.length;
	editor.setSelection(nextIndex, 0, 'silent');
	speechTarget = { type: 'editor', range: { index: nextIndex, length: 0 } };
}

function insertSpeechTranscript(transcript) {
	const text = prepareTranscript(transcript);
	if (!text) return;
	if (!speechTarget) speechTarget = getSpeechTarget();

	if (speechTarget.type === 'title') {
		insertSpeechInTitle(text);
	} else {
		insertSpeechInEditor(text);
	}
}

function updateSpeechButton(active) {
	states.speech = active;
	speechButton.classList.toggle('active', active);
	speechButton.setAttribute('aria-pressed', active ? 'true' : 'false');
	speechButton.setAttribute('aria-label', active ? 'Stop dictation' : 'Dictate');
	speechButton.title = active ? 'Stop dictation' : 'Dictate';
	updateFileToolbarVisibility();
}

function stopSpeechRecognition() {
	if (speechRecognition) speechRecognition.stop();
	speechStarting = false;
	updateSpeechButton(false);
	speechTarget = null;
}

async function startSpeechRecognition() {
	if (speechStarting) return;
	const SpeechRecognition = getSpeechRecognitionConstructor();
	if (!SpeechRecognition) {
		speechButton.disabled = true;
		speechButton.title = 'Dictation is not supported in this browser';
		return;
	}

	speechStarting = true;
	speechButton.disabled = true;

	try {
		await ensureMicrophonePermission();
		speechTarget = getSpeechTarget();
		speechRecognition = new SpeechRecognition();
		speechRecognition.continuous = true;
		speechRecognition.interimResults = false;
		speechRecognition.lang = navigator.language || 'en-US';
		speechRecognition.onresult = (event) => {
			for (let i = event.resultIndex; i < event.results.length; i++) {
				if (event.results[i].isFinal) insertSpeechTranscript(event.results[i][0].transcript);
			}
		};
		speechRecognition.onerror = () => {
			updateSpeechButton(false);
			speechTarget = null;
		};
		speechRecognition.onend = () => {
			updateSpeechButton(false);
			speechTarget = null;
		};
		speechRecognition.start();
		updateSpeechButton(true);
	} catch (error) {
		updateSpeechButton(false);
		if (error && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')) {
			speechButton.title = 'Allow microphone access to use dictation';
		}
		speechTarget = null;
	} finally {
		speechStarting = false;
		speechButton.disabled = false;
	}
}

function toggleSpeech() {
	if (states.speech || speechStarting) {
		stopSpeechRecognition();
	} else {
		startSpeechRecognition();
	}
}

// find
function toggleFind(toggled = true, focusEditor = true) {
	const wasOpen = states.find;
	states.find = toggled ? !states.find : false;
	if (states.find) {
		findContainer.style.display = 'flex';
		findInput.focus();
	} else {
		findContainer.style.display = 'none';
		findContainer.setAttribute('data-matches', 0);
		findInput.value = '';
		if (focusEditor && wasOpen) editor.focus();
	}
	updateFileToolbarVisibility();
	resetHighlights();
}

function findText(value) {
	searchVal = value.toLowerCase();
	if (!searchVal) {
		resetHighlights();
		findCount.textContent = '';
		return;
	}
	performSearch();
}

function performSearch() {
	const text = editor.getText().toLowerCase();
	searchResults = [];
	currentIndex = -1;
	let startIndex = 0, matchIndex;
	while ((matchIndex = text.indexOf(searchVal, startIndex)) > -1) {
		searchResults.push(matchIndex);
		startIndex = matchIndex + searchVal.length;
	}
	highlightSearchResults();
	navigate(1);
}

function resetHighlights() {
	const delta = editor.getContents();
	delta.ops.forEach(op => {
		if (op.attributes && op.attributes['background'] && ['yellow', 'orange'].includes(op.attributes['background'])) {
			delete op.attributes['background'];
		}
	});
	editor.setContents(delta);
}

function highlightSearchResults() {
	resetHighlights();
	findContainer.setAttribute('data-matches', searchResults.length);
	searchResults.forEach(index => {
		editor.formatText(index, searchVal.length, { 'background': 'yellow' });
	});
	updateMatchCount();
}

function navigate(direction) {
	if (!searchResults.length) return;
	highlightSearchResults();

	currentIndex = (currentIndex + direction + searchResults.length) % searchResults.length;
	const currentMatchIndex = searchResults[currentIndex];
	editor.formatText(currentMatchIndex, searchVal.length, { 'background': 'orange' });
	updateMatchCount();

	// Scroll to the current highlighted match
	editor.setSelection(currentMatchIndex, searchVal.length, 'silent');
	editor.focus();
	findInput.focus();
}

function updateMatchCount() {
	const countText = searchResults.length ? `${currentIndex + 1}/${searchResults.length}` : '';
	findCount.textContent = countText;
}

// listeners
addButton.addEventListener('click', () => { addNote(); });
addTaskButton.addEventListener('click', addTask);
newButton.addEventListener('click', () => { addNote(); });
newTaskButton.addEventListener('click', addTask);
optionsButton.setAttribute('aria-haspopup', 'dialog');
optionsButton.setAttribute('aria-expanded', 'false');
optionsButton.addEventListener('click', toggleOptions);
optionsCloseButton.addEventListener('click', () => toggleOptions(false));
optionsContainer.addEventListener('click', (event) => {
	if (event.target === optionsContainer) toggleOptions(false);
});
backButton.addEventListener('click', toggleNotes);
listButton.addEventListener('click', toggleNotes);
infoButton.addEventListener('click', toggleInfo);
infoContainer.addEventListener('click', (event) => {
	if (event.target === infoContainer) toggleInfo();
});
deleteButton.addEventListener('click', toggleDelete);
switchButton.addEventListener('click', switchViewMode);
resizeButton.addEventListener('click', openResizeDialog);
deleteDialogCancel.addEventListener('click', closeDeleteDialog);
deleteDialogConfirm.addEventListener('click', confirmDelete);
deleteDialog.addEventListener('click', (event) => {
	if (event.target === deleteDialog) closeDeleteDialog();
});
resizeDialogCancel.addEventListener('click', closeResizeDialog);
resizeDialogConfirm.addEventListener('click', confirmResizeDialog);
resizeDialog.addEventListener('click', (event) => {
	if (event.target === resizeDialog) closeResizeDialog();
});
resizeDialog.addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		event.preventDefault();
		confirmResizeDialog();
	}
});
renameDialogCancel.addEventListener('click', closeRenameDialog);
renameDialogSave.addEventListener('click', saveRenameDialog);
renameDialog.addEventListener('click', (event) => {
	if (event.target === renameDialog) closeRenameDialog();
});
renameDialogInput.addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		event.preventDefault();
		saveRenameDialog();
	}
});
emojiDialogCancel.addEventListener('click', closeIconDialog);
emojiDialogRemove.addEventListener('click', removeEmojiDialogIcon);
emojisContainer.addEventListener('click', (event) => {
	if (event.target === emojisContainer) closeIconDialog();
});
noteMenu.addEventListener('click', event => {
	event.stopPropagation();
});
noteMenuRename.addEventListener('click', event => {
	event.stopPropagation();
	const id = +noteMenu.dataset.id;
	openRenameDialog(id);
});
noteMenuChangeIcon.addEventListener('click', event => {
	event.stopPropagation();
	const id = +noteMenu.dataset.id;
	openIconDialog(id);
});
noteMenuStar.addEventListener('click', event => {
	event.stopPropagation();
	const id = +noteMenu.dataset.id;
	states.listMenuId = null;
	toggleNoteStar(id);
});
noteMenuDelete.addEventListener('click', event => {
	event.stopPropagation();
	const id = +noteMenu.dataset.id;
	openDeleteDialog(id);
});
okButton.addEventListener('click', togglePrompt);
notesFilterButton.addEventListener('click', toggleListFilterMode);
notesSortButton.addEventListener('click', toggleListSortMode);
notesSearchButton.addEventListener('click', toggleListSearch);
notesSearchInput.addEventListener('input', noteSearchChanged);
notesSearchInput.addEventListener('keydown', event => {
	if (event.key === 'Escape') {
		event.preventDefault();
		updateListSearchState(false);
	}
});
notesList.addEventListener('dragover', notesListDragOver);
notesList.addEventListener('dragleave', notesListDragLeave);
notesList.addEventListener('drop', notesListDrop);
notesList.addEventListener('scroll', closeListMenu);
applyThemeAllButton.addEventListener('click', applyThemeToAllNotes);
makeDefaultThemeButton.addEventListener('click', makeDefaultTheme);
fontFaceSelect.addEventListener('change', selectFont);
fontSizeSelect.addEventListener('change', selectFont);
applyFontAllButton.addEventListener('click', applyFontToAllNotes);
makeDefaultFontButton.addEventListener('click', makeDefaultFont);
favoriteButton.addEventListener('click', toggleFavorite);
noteModeButton.addEventListener('click', switchNoteMode);
taskModeButton.addEventListener('click', switchNoteMode);
titleInput.addEventListener('keyup', titleKeyUp);
titleInput.addEventListener('keydown', titleKeyDown);
titleInput.addEventListener('focus', (event) => {
	event.target.parentElement.className = 'focus'
});
titleInput.addEventListener('blur', (event) => {
	event.target.parentElement.className = ''
});
iconButton.addEventListener('click', () => toggleEmojis());
editor.on('text-change', contentChanged);
editor.root.addEventListener('click', toggleTaskItem);
exportButton.addEventListener('click', exportNotes);
importButton.addEventListener('click', () => { fileInput.click(); });
fileInput.addEventListener('change', importNotes);
speechButton.addEventListener('pointerdown', (event) => {
	event.preventDefault();
});
speechButton.addEventListener('click', toggleSpeech);
findButton.addEventListener('click', toggleFind);
findInput.addEventListener('input', (event) => { findText(event.target.value); });
findInput.addEventListener('keydown', (event) => {
	if (event.key === "Enter") {
		event.preventDefault();
		navigate(1);
	} else if (event.key === "ArrowDown") {
		event.preventDefault();
		navigate(1);
	} else if (event.key === "ArrowUp") {
		event.preventDefault();
		navigate(-1);
	} else if (event.key === "Escape") {
		event.preventDefault();
		toggleFind();
	}
});
findNext.addEventListener('click', () => { navigate(1); });
findPrev.addEventListener('click', () => { navigate(-1); });
findClose.addEventListener('click', () => { toggleFind(false); });
document.addEventListener('click', (event) => {
	if (!optionsContainer.contains(event.target) && !optionsButton.contains(event.target)) toggleOptions(false);
	if (!event.target.closest('.note-menu-control')) closeListMenu();
});
document.addEventListener('keydown', (event) => {
	if (event.ctrlKey && event.key === 'f') {
		event.preventDefault();
		toggleFind();
	} else if (event.key === 'Escape') {
		closeListMenu();
		if (!deleteDialog.classList.contains('hidden')) closeDeleteDialog();
		if (!resizeDialog.classList.contains('hidden')) closeResizeDialog();
		if (!renameDialog.classList.contains('hidden')) closeRenameDialog();
		if (!emojisContainer.classList.contains('hidden')) closeIconDialog();
		if (!optionsContainer.classList.contains('hidden')) toggleOptions(false);
	}
});

// init app
init();

// save on exit
window.addEventListener('blur', syncOnExit);

document.addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'hidden') syncOnExit();
});
