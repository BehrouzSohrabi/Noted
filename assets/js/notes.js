// elements

let optionsButton = document.getElementById('options-button'),
	addButton = document.getElementById('add-button'),
	listButton = document.getElementById('list-button'),
	infoButton = document.getElementById('info-button'),
	deleteButton = document.getElementById('delete-button'),
	confirmButton = document.getElementById('confirm'),
	cancelButton = document.getElementById('cancel'),
	setThemeButtons = document.querySelectorAll('#themes-list li'),
	titleInput = document.getElementById('title'),
	optionsContainer = document.getElementById('options-container'),
	listContainer = document.getElementById('list-container'),
	infoContainer = document.getElementById('info'),
	promptContainer = document.getElementById('prompt'),
	createdInfo = document.getElementById('created'),
	modifiedInfo = document.getElementById('modified'),
	notesList = document.getElementById('notes');

let states = {
	loading: true,
	options: false,
	list: false,
	prompt: false,
	size: [400, 300],
	noteIndex: 0
};

let newNote = {
	id: 1,
	title: '',
	content: [],
	created: +new Date(),
	modified: null,
	opened: null,
	theme: 'color-0',
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

function togglePrompt(e) {
	states.prompt = !states.prompt;
	promptContainer.className = states.prompt ? '' : 'hidden';
	if (e.target.id == 'confirm') {
		deleteNote();
		toggleOptions();
	}
}

function toggleOptions() {
	states.options = !states.options;
	optionsContainer.className = states.options ? '' : 'hidden';
	if (states.options) setMeta()
}

function toggleNotes() {
	states.list = !states.list;
	listContainer.className = states.list ? '' : 'hidden';
	if (states.list) populateList()
}

function toggleInfo(e) {
	console.log(e);
	states.info = !states.info;
	infoContainer.className = states.info ? '' : 'hidden';
}

function titleChanged(e) {
	if (states.loading) return;
	const title = e.target.value
	// update note
	notes[states.noteIndex]['title'] = title
	// update modified
	notes[states.noteIndex]['modified'] = +new Date()
	setMeta()
	// sync with storage
	sync()
}

function contentChanged(a, b, source) {
	if (source != 'user') return;
	if (states.loading) return;
	const content = editor.getContents()
	// update note
	notes[states.noteIndex]['content'] = content.ops
	// update modified
	notes[states.noteIndex]['modified'] = +new Date()
	setMeta()
	// sync with storage
	sync()
}

function selectTheme(e) {
	const theme = e.target.className
	// set theme to body
	setTheme(theme)
	// update note
	notes[states.noteIndex]['theme'] = theme
	// sync with storage
	sync()
}

function setTheme(theme) {
	document.body.className = 'theme-' + theme
}

function setMeta() {
	const note = notes[states.noteIndex]
	createdInfo.innerHTML = ago(note['created'])
	modifiedInfo.innerHTML = ago(note['modified'])
}

function deleteNote() {
	states.loading = true
	console.log(states)
	// remove from notes array
	notes.splice(states.noteIndex, 1);
	// check if there is any notes left
	if (notes.length === 0) {
		cloneEmptyNote()
	}
	// open last note
	loadLastNote()
}

function loadNote(id) {
	console.log('find index of id', id)
	const index = notes.findIndex(item => item.id == id);
	states.noteIndex = index
	console.log('update states', index, states.noteIndex)
	// display the note's title, contents, theme, and meta
	let note = notes[index]
	titleInput.value = note.title
	editor.setContents(note.content)
	setTheme(note.theme)
	setMeta()
	// update note
	notes[index]['opened'] = +new Date()
	// focus on editor
	editor.focus()
	// sync with storage
	sync()
	states.loading = false
}

function sync() {
	chrome.storage.sync.set({'notes': notes})
}

function addNote() {
	states.loading = true
	const emptyIndex = notes.findIndex(item => item.modified == null);
	if (emptyIndex == -1) {
		// add to notes array
		cloneEmptyNote(nextId())
		// load the last one
		loadLastNote()
	}else{
		loadNote(+notes[emptyIndex]['id']);
	}
}

function cloneEmptyNote(id){
	let noteClone = JSON.parse(JSON.stringify(newNote));
	noteClone['created'] = +new Date()
	noteClone['opened'] = +new Date()
	if (typeof id != 'undefined') {
		noteClone['id'] = id
	}
	notes.push(noteClone)
}

function loadLastNote(){
	// find the last opened note and load it
	const note = notes.reduce((earliest, current) => {
		return new Date(current.opened) > new Date(earliest.opened)
			? current
			: earliest;
	});
	loadNote(+note.id);
}

function nextId() {
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
		list = `<li class="${theme}" id="${id}"><span>${title}</span></li>` + list
	});
    notesList.innerHTML = list;
	// update listener
	document.querySelectorAll('#notes li').forEach((noteButton) => {
		noteButton.addEventListener('click', selectNote);
	});
}

function selectNote(e) {
	states.loading = true
	loadNote(+e.target.id)
}

function init() {
	chrome.storage.sync.get('notes', (data_notes) => {
		// populate notes array from storage if anything was saved before
		if (!isEmpty(data_notes.notes)) {
			notes = data_notes.notes;
		}else{
			cloneEmptyNote()
		}
		loadLastNote()
	});
	resizeBody(states.size);
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
optionsButton.addEventListener('click', toggleOptions);
listButton.addEventListener('click', toggleNotes);
notesList.addEventListener('click', toggleNotes);
infoButton.addEventListener('click', toggleInfo);
infoContainer.addEventListener('click', toggleInfo);
deleteButton.addEventListener('click', togglePrompt);
cancelButton.addEventListener('click', togglePrompt);
confirmButton.addEventListener('click', togglePrompt);
setThemeButtons.forEach((setThemeButton) => {
	setThemeButton.addEventListener('click', selectTheme);
});
titleInput.addEventListener('keyup', titleChanged);
editor.on('text-change', contentChanged);

// init app

init();