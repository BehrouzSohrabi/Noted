# Noted

## Minimalist Notebook

Noted is a private, offline-first Chrome extension for quick notes and lightweight tasks. Version 2 adds a richer file list, task mode, starred notes, dictation, per-note styling, popup resizing, and a Chrome side panel view.

[Extension Page](https://chrome.google.com/webstore/detail/noted-minimalist-notebook/icobokbldeilgpckffpkcgncecbnkehn?hl=en&authuser=0)

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/behrouz)

## Version 2 Highlights

- Popup and Chrome side panel modes with a persisted view preference.
- Rich text editing powered by Quill 2 with local Highlight.js syntax highlighting.
- Separate Note and Task modes. Task mode adds clickable completion controls to editor lines.
- Starred notes with editor-level and list-level star controls.
- Dictation through the browser speech recognition API, including microphone permission handling.
- In-note find with highlighted matches and previous/next navigation.
- Notes list with search, filters, sort modes, custom drag-and-drop ordering, and row actions.
- Per-note emoji icons, themes, font face, and base font size.
- Default theme and default font settings for new notes.
- Import and export of notes as JSON in `.txt` files.
- Local Chrome extension storage with an indexed per-note storage layout, migration from older sync storage, and stale-key cleanup.

## App Structure

- `manifest.json` declares Manifest V3, version `2.0`, the extension popup, side panel, storage permissions, and offline support.
- `index.html` is the extension action popup.
- `panel.html` is the Chrome side panel version of the same app.
- `assets/js/notes.js` contains the editor, storage, list, task, dictation, import/export, and view-mode behavior.
- `background.js` receives queued note-save messages and writes note records to `chrome.storage.local`.
- `permission/` contains the microphone permission helper page used by dictation.
- `assets/` contains local CSS, icons, emoji data, Quill, and Highlight.js assets.

## Using Noted

Open Noted from the Chrome extension action. The app restores the most recent note or task and saves edits automatically as you type and when the popup or panel loses focus.

Use the top toolbar to star the current item, dictate, find in the current note, create a new task, create a new note, open the files list, or open options.

Use Options to switch between Note and Task mode, change the note theme, change the font face or base size, apply the current theme or font to every note, set defaults for new notes, delete the current item, resize the popup, or switch between popup and side panel view.

Use Files to search, filter, sort, import, export, create notes/tasks, rename items, change icons, star items, delete items, or drag items into a custom order when Custom sort is active.

## Data And Privacy

Noted works offline and stores notes in Chrome local extension storage. Notes are saved as individual `note_{id}` records with a `notes_index` key for ordering. Options are stored under `options`.

When upgrading from the previous sync-storage build, Noted copies existing `notes_index`, `note_{id}`, and `options` records from `chrome.storage.sync` into `chrome.storage.local` the first time v2 local storage starts. After the local write succeeds, the migrated sync records are removed.

Export creates a local `Noted-Export-{ISO date}.txt` file containing JSON. Import accepts compatible `.txt` JSON exports and replaces the current notes collection with normalized imported notes.
