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
	fileInput = document.getElementById('file-input');

// editor setup
let states = {
	loading: true,
	options: false,
	list: false,
	prompt: false,
	size: [400, 300],
	minSize: [375, 225],
	maxSize: [800, 500],
	noteIndex: 0
};

let newNote = {
	id: 1,
	title: '',
	content: [],
	created: +new Date(),
	modified: null,
	opened: null,
	theme: 0,
};

let notes = [];

let editor = new Quill('#editor', {
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
	console.log(e.target.id)
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
	console.log('toggleOptions')
	console.log(states.options, closed)
	states.options = toggled ? !states.options : false;
	optionsContainer.className = states.options ? '' : 'hidden';
	if (states.options) setMeta()
}

function toggleNotes() {
	states.list = !states.list;
	listContainer.className = states.list ? '' : 'hidden';
	if (states.list) populateList()
}

function toggleInfo(e) {
	states.info = !states.info;
	infoContainer.className = states.info ? '' : 'hidden';
}

function titleKeyUp(e) {
	if (states.loading) return;
	const title = e.target.value
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

function syncNotes() {
	console.log('notes')
	console.log(notes)
	for (let i = 0; i < notes.length; i++) {
		chrome.storage.sync.set({ ['note_' + i]: notes[i] });
	}
}

function syncOptions() {
	console.log('states')
	console.log(states)
	chrome.storage.sync.set({ 'options': states })
}

function addNote() {
	states.loading = true
	const emptyIndex = notes.findIndex(item => item.modified == null);
	console.log(emptyIndex)
	if (emptyIndex === -1) {
		console.log('nextId()')
		console.log(nextId())
		cloneEmptyNote(nextId())
		loadLastNote()
	} else {
		loadNote(+notes[emptyIndex]['id']);
	}
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
		console.log('notes')
		console.log(notes)
		addNote()
		return;
	}

	console.log(notes);
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
			title = item.title.length > 0 ? item.title : 'Untitled Note'
		modified = ago(item['modified'])
		list = `<li id="${id}"><i class="${theme}"></i><span>${title}</span><a>${modified}</a></li>` + list
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
editor.on('text-change', contentChanged);
joystickTop.addEventListener('click', joystickAction),
	joystickRight.addEventListener('click', joystickAction),
	joystickBottom.addEventListener('click', joystickAction),
	joystickLeft.addEventListener('click', joystickAction),
	exportButton.addEventListener('click', exportNotes),
	importButton.addEventListener('click', () => { fileInput.click(); });
fileInput.addEventListener('change', importNotes);
document.addEventListener('click', function (event) {
	if (!optionsContainer.contains(event.target) && !optionsButton.contains(event.target)) toggleOptions(false);
});

// init app
init();

// save on exit
window.onblur = function () {
	syncOptions()
	syncNotes()
}