class EmojiSearcher {
    constructor(targetId, onSelectCallback) {
        this.emojis = [];
        this.targetId = targetId;
        this.onSelectCallback = onSelectCallback;
        this.init();
    }
    async init() {
        const response = await fetch('./assets/js/emoji-list.json');
        this.emojis = await response.json();
        
        const container = document.getElementById(this.targetId);
        container.innerHTML = `
            <input type="text" id="emoji-search-${this.targetId}" placeholder="Search Icons..." />
            <ul id="emojis-list-${this.targetId}"></ul>
        `;

        this.searchInput = container.querySelector(`#emoji-search-${this.targetId}`);
        this.emojisList = container.querySelector(`#emojis-list-${this.targetId}`);

        this.bindEvents();
        this.populateEmojiList();
    }

    clear() {
        this.searchInput.value = '';
        this.populateEmojiList();
    }

    focus() {
        this.searchInput.focus();
    }

    blur() {
        this.searchInput.blur();
    }

    bindEvents() {
        this.searchInput.addEventListener('input', () => this.filterEmojis());
    }

    populateEmojiList(filteredEmojis = this.emojis) {
        this.emojisList.innerHTML = '';
        filteredEmojis.forEach(emoji => {
            const li = document.createElement('li');
            li.textContent = emoji.emoji;
            li.addEventListener('click', () => {
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
}