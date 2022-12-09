import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Paragraph from '@editorjs/paragraph';
import InlineCode from '@editorjs/inline-code';
import NestedList from '@editorjs/nested-list';
import FootnotesTune from '@editorjs/footnotes';
import TextVariantTune from '@editorjs/text-variant-tune';
import Checklist from '@editorjs/checklist';
import Delimiter from '@editorjs/delimiter';
import Underline from '@editorjs/underline';
import Header from '@editorjs/header';
import Marker from '@editorjs/marker';
import Table from '@editorjs/table';

class Code {
    render() {
      return document.createElement('textarea');
    }
    save(textarea) {
      return {
        text: textarea.value
      }
    }
  }

const Editor = (props) => {
	const editor = useRef();
	const [editorData, setEditorData] = useState('');

	// This will run only once
	useEffect(() => {
		if (!editor.current) {
			initEditor();
		}
		return () => {
			editor.current = null;
		};
	}, []);

	const initEditor = () => {
		const editor = new EditorJS({
			holder: 'notebook',
			data: editorData,
			onReady: () => {
				editor.current = editor;
			},
			onChange: async () => {
				// let content = await this.editorjs.saver.save();
				// Put your logic here to save this data to your DB
				// setEditorData(content);
			},
			autofocus: true,
			tools: {
				header: Header,
				underline: Underline,
				inlineCode: {
					class: InlineCode,
					shortcut: 'CMD+SHIFT+M',
				},
                Code: Code,
				checklist: {
					class: Checklist,
					inlineToolbar: true,
                    tunes: ['footnotes'],
				},
				list: {
					class: NestedList,
					inlineToolbar: true,
                    tunes: ['footnotes'],
				},
                footnotes: {
                    class: FootnotesTune,
                },
                textVariant: TextVariantTune,
				Marker: {
					class: Marker,
					shortcut: 'CMD+SHIFT+M',
				},
				paragraph: {
					class: Paragraph,
                    tunes: ['footnotes','textVariant'],
					inlineToolbar: true,
				},
				delimiter: Delimiter,
				table: {
					class: Table,
					inlineToolbar: true,
					config: {
						rows: 2,
						cols: 3,
					},
				},
			},
		});
	};

	return <div id="notebook"></div>;
};

export default Editor;
