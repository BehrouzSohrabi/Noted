// elements
let optionsButton = document.getElementById('options-button'),
	addButton = document.getElementById('add-button'),
	newButton = document.getElementById('new-button'),
	backButton = document.getElementById('back-button'),
	listButton = document.getElementById('list-button'),
	infoButton = document.getElementById('info-button'),
	deleteButton = document.getElementById('delete-button'),
	confirmButton = document.getElementById('confirm'),
	cancelButtons = document.querySelectorAll('.cancel'),
	setThemeButtons = document.querySelectorAll('#themes-list li'),
	promptEntries = document.querySelectorAll('#prompt .entry'),
	titleInput = document.getElementById('title'),
	iconContainer = document.getElementById('note-icon-container'),
	iconButton = document.getElementById('note-icon-button'),
	iconRemoveButton = document.getElementById('note-icon-remove'),
	emojisContainer = document.getElementById('emojis'),
	optionsContainer = document.getElementById('options-container'),
	listContainer = document.getElementById('list-container'),
	infoContainer = document.getElementById('info'),
	promptContainer = document.getElementById('prompt'),
	createdInfo = document.getElementById('created'),
	modifiedInfo = document.getElementById('modified'),
	notesList = document.getElementById('notes'),
	joystickTop = document.getElementById('joystick-top'),
	joystickRight = document.getElementById('joystick-right'),
	joystickBottom = document.getElementById('joystick-bottom'),
	joystickLeft = document.getElementById('joystick-left'),
	exportButton = document.getElementById('export-button'),
	importButton = document.getElementById('import-button'),
	fileInput = document.getElementById('file-input'),
	findButton = document.getElementById('find-button'),
	findContainer = document.getElementById('find-container'),
	findInput = document.getElementById('find-input'),
	findCount = document.getElementById('find-count'),
	findPrev = document.getElementById('find-prev'),
	findNext = document.getElementById('find-next');

// variables
let currentIndex = 0;
let searchResults = [];
let searchVal = '';

// editor setup
let states = {
	loading: true,
	options: false,
	list: false,
	prompt: false,
	find: false,
	icon: false,
	emojis: false,
	size: [400, 300],
	minSize: [400, 225],
	maxSize: [800, 500],
	noteIndex: 0
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
};

let notes = [];

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
});

// functions
function resizeBody(newSize) {
	states.size = newSize;
	document.body.style.width = states.size[0] + 'px';
	document.body.style.height = states.size[1] + 'px';
}

function joystickAction(e) {
	let newSize = states.size,
		minSize = states.minSize,
		maxSize = states.maxSize;
	if (e.target.id.endsWith('top') && newSize[1] > minSize[1]) {
		newSize[1] -= 50
	} else if (e.target.id.endsWith('right') && newSize[0] > minSize[0]) {
		newSize[0] -= 50
	} else if (e.target.id.endsWith('bottom') && newSize[1] < maxSize[1]) {
		newSize[1] += 50
	} else if (e.target.id.endsWith('left') && newSize[0] < maxSize[0]) {
		newSize[0] += 50
	}
	resizeBody(newSize)
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
			let keys = ['content', 'created', 'id', 'theme', 'title']
			if (Array.isArray(contents)) {
				contents.forEach(function (object) {
					keys.forEach(function (key) {
						if (!object.hasOwnProperty(key)) {
							throw new Error('object is missing key: ' + key);
						}
					});
				});
				notes = contents
				syncNotes()
				populateList()
				loadNote(+notes[notes.length - 1]['id'])
			} else {
				throw new Error('Input is not an array');
			}
		} catch (e) {
			togglePrompt({ 'target': { 'dataset': { 'prompt': 'prompt-import' } } })
		}
		fileInput.value = ''
	}
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
	} else if (e.target.id == 'confirm') {
		deleteNote();
		toggleOptions();
	}
}

function toggleOptions(toggled = true) {
	states.options = toggled ? !states.options : false;
	optionsContainer.className = states.options ? '' : 'hidden';
	if (states.options) setMeta()
}

function toggleNotes(toggled = true) {
	states.list = toggled ? !states.list : false;
	listContainer.className = states.list ? '' : 'hidden';
	if (states.list) populateList()
}

function toggleInfo() {
	states.info = !states.info;
	infoContainer.className = states.info ? '' : 'hidden';
}

function titleKeyUp(event) {
	if (states.loading) return;
	const title = event.target.value
	notes[states.noteIndex]['title'] = title
	notes[states.noteIndex]['modified'] = +new Date()
	setMeta()
}

function contentChanged(a, b, source) {
	if (source != 'user') return;
	if (states.loading) return;
	const content = editor.getContents()
	notes[states.noteIndex]['content'] = content.ops
	notes[states.noteIndex]['modified'] = +new Date()
	setMeta()
}

function selectTheme(e) {
	const theme = +e.target.getAttribute('data-theme')
	setTheme(theme)
	notes[states.noteIndex]['theme'] = theme
}

function setTheme(theme) {
	document.body.className = 'theme-color-' + theme
}

function selectIcon(icon, remove = false) {
	if (remove || icon != false) {
		setIcon(icon)
		notes[states.noteIndex]['icon'] = icon
	}
}

function setIcon(icon) {
	iconContainer.className = icon ? 'has-icon' : ''
	iconButton.children[0].innerHTML = icon ? icon : '';
}

function setMeta() {
	const note = notes[states.noteIndex]
	createdInfo.innerHTML = ago(note['created'])
	modifiedInfo.innerHTML = ago(note['modified'])
}

function deleteNote() {
	states.loading = true
	notes.splice(states.noteIndex, 1);
	if (notes.length === 0) {
		cloneEmptyNote()
	}
	loadLastNote()
}

function loadNote(id) {
	const index = notes.findIndex(item => item.id == id);
	states.noteIndex = index
	let note = notes[index]
	titleInput.value = note.title
	editor.setContents(note.content)
	toggleFind(false)
	setIcon(note.icon)
	setTheme(note.theme)
	setMeta()
	notes[index]['opened'] = +new Date()
	editor.focus()
	states.loading = false
}

function titleKeyDown(event) {
	if (event.key === 'Tab') {
		event.preventDefault();
		editor.focus()
	}
}

function toggleEmojis(toggled = true) {
	states.emojis = toggled ? !states.emojis : false;
	emojisContainer.className = states.emojis ? '' : 'hidden';
	iconRemoveButton.className = states.emojis ? 'icon-remove tooltip' : 'hidden'
	if (states.emojis) {
		emojiPicker.clear()
		emojiPicker.focus()
	}
}

function syncNotes() {
	for (let i = 0; i < notes.length; i++) {
		chrome.storage.sync.set({ ['note_' + i]: notes[i] });
	}
}

function syncOptions() {
	chrome.storage.sync.set({ 'options': states })
}

function addNote() {
	states.loading = true
	const emptyIndex = notes.findIndex(item => item.modified == null);
	if (emptyIndex === -1) {
		cloneEmptyNote(nextId())
		loadLastNote()
	} else {
		loadNote(+notes[emptyIndex]['id']);
	}
	toggleNotes(false)
}

function cloneEmptyNote(id) {
	let noteClone = JSON.parse(JSON.stringify(newNote));
	noteClone['created'] = +new Date()
	noteClone['opened'] = +new Date()
	noteClone['theme'] = Math.floor(Math.random() * 12)
	if (typeof id != 'undefined') {
		noteClone['id'] = id
	}
	notes.push(noteClone)
}

function loadLastNote() {
	if (notes.length === 0) {
		addNote()
		return;
	}

	const note = notes.reduce((earliest, current) => {
		return new Date(current.opened) > new Date(earliest.opened)
			? current
			: earliest;
	});

	loadNote(+note.id);
}

function nextId() {
	if (notes.length === 0) return 0;
	let lastNote = notes.reduce((highest, current) => {
		return current.id > highest.id ? current : highest;
	})
	return lastNote['id'] + 1
}

function populateList() {
	const sorted = notes.sort((a, b) => new Date(a.opened) - new Date(b.opened));
	let list = ''
	sorted.forEach((item) => {
		const id = item.id,
			theme = item.theme,
			title = item.title.length > 0 ? item.title : 'Untitled Note',
			icon = item.icon ? `<b>${item.icon}</b> ` : '';
		modified = ago(item['modified'])
		list = `<li id="${id}"><i class="color-${theme}"></i><span>${icon}${title}</span><a>${modified}</a></li>` + list
	});
	notesList.innerHTML = list;
	document.querySelectorAll('#notes li').forEach((noteButton) => {
		noteButton.addEventListener('click', selectNote);
	});
}

function selectNote(e) {
	states.loading = true
	loadNote(+e.target.id)
}

function init() {
	chrome.storage.sync.get(null, (items) => {
		let defaultSize = states.size
		for (let key in items) {
			let item = items[key]
			if (key.startsWith("note_")) {
				notes.push(item);
			} else if (key === "options") {
				if (!isEmpty(item)) {
					defaultSize = item.size;
				}
			}
		}
		resizeBody(defaultSize);
		loadLastNote();
	});
}

// helpers
function isEmpty(obj) {
	return typeof obj != 'object' || Object.keys(obj).length === 0;
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
	interval = Math.floor(seconds / 60);
	if (interval > 1) return suffix(interval, "minute");
	return suffix(Math.floor(seconds), "second");
}

function suffix(value, fix) {
	return value + ' ' + fix + (value > 1 ? 's' : '') + ' ago'
}

// find
function toggleFind(toggled = true) {
	states.find = toggled ? !states.find : false;
	if (states.find) {
		findContainer.style.display = 'flex';
		findInput.focus();
	} else {
		findContainer.style.display = 'none';
		findContainer.setAttribute('data-matches', 0);
		findInput.value = '';
		editor.focus();
	}
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
		if (op.attributes && op.attributes.background) {
			delete op.attributes.background;
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
addButton.addEventListener('click', addNote);
newButton.addEventListener('click', addNote);
optionsButton.addEventListener('click', toggleOptions);
backButton.addEventListener('click', toggleNotes);
listButton.addEventListener('click', toggleNotes);
notesList.addEventListener('click', toggleNotes);
infoButton.addEventListener('click', toggleInfo);
infoContainer.addEventListener('click', toggleInfo);
deleteButton.addEventListener('click', togglePrompt);
cancelButtons.forEach((cancelButton) => {
	cancelButton.addEventListener('click', togglePrompt);
});
confirmButton.addEventListener('click', togglePrompt);
setThemeButtons.forEach((setThemeButton) => {
	setThemeButton.addEventListener('click', selectTheme);
});
titleInput.addEventListener('keyup', titleKeyUp);
titleInput.addEventListener('keydown', titleKeyDown);
titleInput.addEventListener('focus', (event) => {
	event.target.parentElement.className = 'focus'
});
titleInput.addEventListener('blur', (event) => {
	event.target.parentElement.className = ''
});
iconButton.addEventListener('click', toggleEmojis);
iconRemoveButton.addEventListener('click', () => { selectIcon(false, true) });
editor.on('text-change', contentChanged);
joystickTop.addEventListener('click', joystickAction),
	joystickRight.addEventListener('click', joystickAction),
	joystickBottom.addEventListener('click', joystickAction),
	joystickLeft.addEventListener('click', joystickAction),
	exportButton.addEventListener('click', exportNotes),
	importButton.addEventListener('click', () => { fileInput.click(); });
fileInput.addEventListener('change', importNotes);
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
document.addEventListener('click', (event) => {
	if (!optionsContainer.contains(event.target) && !optionsButton.contains(event.target)) toggleOptions(false);
	if (!emojisContainer.contains(event.target) && !iconButton.contains(event.target)) toggleEmojis(false);
});
document.addEventListener('keydown', (event) => {
	if (event.ctrlKey && event.key === 'f') {
		event.preventDefault();
		toggleFind();
	}
});

// init app
init();

// save on exit
window.onblur = function () {
	toggleFind(false);
	syncOptions()
	syncNotes()
}