class EmojiSearcher {
	constructor(targetId, onSelectCallback, onCloseCallback) {
		this.emojis = [];
		this.targetId = targetId;
		this.onSelectCallback = onSelectCallback;
		this.onCloseCallback = onCloseCallback;
		this.init();
	}
	async init() {
		const response = await fetch('./assets/js/emoji-list.json');
		this.emojis = await response.json();
		
		const container = document.getElementById(this.targetId);
		if (!container.querySelector(`#emoji-search-${this.targetId}`) || !container.querySelector(`#emojis-list-${this.targetId}`)) {
			container.innerHTML = `
				<input type="text" id="emoji-search-${this.targetId}" placeholder="Search Icons..." />
				<ul id="emojis-list-${this.targetId}"></ul>
			`;
		}

		this.searchInput = container.querySelector(`#emoji-search-${this.targetId}`);
		this.emojisList = container.querySelector(`#emojis-list-${this.targetId}`);

		this.bindEvents();
		this.populateEmojiList();
	}

	clear() {
		this.searchInput.value = '';
		this.populateEmojiList();
	}

	setSelectedEmoji(selectedEmoji) {
		this.selectedEmoji = selectedEmoji || '';
		this.updateSelectedEmoji();
	}

	focus() {
		this.searchInput.focus();
	}

	blur() {
		this.searchInput.blur();
	}

	bindEvents() {
		this.searchInput.addEventListener('input', () => this.filterEmojis());
		this.searchInput.addEventListener('keydown', (event) => {
			if (event.key === "Escape") {
				this.onCloseCallback();
			}
		});
	}

	populateEmojiList(filteredEmojis = this.emojis) {
		this.emojisList.innerHTML = '';
		filteredEmojis.forEach(emoji => {
			const li = document.createElement('li');
			li.textContent = emoji.emoji;
			if (emoji.emoji === this.selectedEmoji) li.className = 'selected';
			li.addEventListener('click', () => {
				this.setSelectedEmoji(emoji.emoji);
				if (this.onSelectCallback) {
					this.onSelectCallback(emoji.emoji);
				}
			});
			this.emojisList.appendChild(li);
		});
	}

	filterEmojis() {
		const searchValue = this.searchInput.value.toLowerCase();
		const filteredEmojis = this.emojis.filter(emoji => 
			emoji.keywords.some(keyword => keyword.includes(searchValue))
		);
		this.populateEmojiList(filteredEmojis);
	}

	updateSelectedEmoji() {
		this.emojisList.querySelectorAll('li').forEach(li => {
			li.classList.toggle('selected', li.textContent === this.selectedEmoji);
		});
	}
}
