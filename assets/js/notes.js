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
	options: false,
	list: false,
	prompt: false,
	size: [400, 300],
	note: 0,
};

let notes = [
	{
		id: 0,
		title: '',
		content: '',
		opened: +new Date(),
		created: +new Date(),
		modified: null,
		theme: 0,
	},
];

var editor = new Quill('#editor', {
	modules: {
		toolbar: '#toolbar',
		history: {
			delay: 2000,
			userOnly: true,
		},
	},
	theme: 'snow',
	placeholder: 'Start writing...',
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
}

function toggleNotes() {
	states.list = !states.list;
	listContainer.className = states.list ? '' : 'hidden';
}

function toggleInfo(e) {
	console.log(e);
	states.info = !states.info;
	infoContainer.className = states.info ? '' : 'hidden';
}

function setTheme(e) {
	let theme = e.target.className;
}

function deleteNote() {
	console.log('delete note');
}

function loadNotes() {
	const note = notes.reduce((earliest, current) => {
		return new Date(current.opened) < new Date(earliest.opened)
			? current
			: earliest;
	});

}

// helpers

function isEmpty(obj) {
	return typeof obj != 'object' || Object.keys(obj).length === 0;
}

function ago(time) {
    let seconds = Math.floor((+new Date() - time)/1000)
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

function suffix(value, fix){
    return value + ' ' + fix + (value > 1 ? 's': '') + ' ago'
}

// listeners

optionsButton.addEventListener('click', toggleOptions);
listButton.addEventListener('click', toggleNotes);
infoButton.addEventListener('click', toggleInfo);
infoContainer.addEventListener('click', toggleInfo);
deleteButton.addEventListener('click', togglePrompt);
cancelButton.addEventListener('click', togglePrompt);
confirmButton.addEventListener('click', togglePrompt);
setThemeButtons.forEach((setThemeButton) => {
	setThemeButton.addEventListener('click', setTheme);
});

// init app

function init() {
	chrome.storage.sync.get('notes', (data_notes) => {
		if (!isEmpty(data_notes.notes)) {
			notes = data_notes.notes;
		}
		loadNotes();
	});

	resizeBody(states.size);
}

init();
