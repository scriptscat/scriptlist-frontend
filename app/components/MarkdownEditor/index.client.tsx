import React, { useEffect } from 'react';
import Editor from '@toast-ui/editor';
import { useState } from 'react';
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import Prism from 'prismjs';

const MarkdownEditor: React.FC<{ id: string; content?: string }> = ({
  id,
  content,
}) => {
  const [editor, setEditor] = useState<Editor | undefined>();
  useEffect(() => {
    setEditor((editor) => {
      if (!editor) {
        const dark =
          document.querySelector('section')!.className.indexOf('dark') == -1
            ? false
            : true;
        return new Editor({
          el: document.querySelector('#markdown-editor-' + id)!,
          previewStyle: 'tab',
          height: '400px',
          placeholder: '输入回复反馈内容（友善的反馈是交流的起点）',
          hooks: {
            addImageBlobHook: async (blob, callback) => {
              // const uploadedImageURL = await this.uploadImage(blob);
              // callback(uploadedImageURL, 'alt text');
              return false;
            },
          },
          plugins: [[codeSyntaxHighlight, { highlighter: Prism }]],
          autofocus: false,
          theme: dark ? 'dark' : 'default',
        });
      }
      return editor;
    });
    return () => {
      editor && editor.destroy();
    };
  }, [editor, id]);
  useEffect(() => {
    if (editor) {
      editor.setMarkdown(content || '');
    }
  }, [content, editor]);
  return (
    <>
      <div id={'markdown-editor-' + id}></div>
    </>
  );
};

export default MarkdownEditor;
