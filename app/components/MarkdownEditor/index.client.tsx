import React, { useEffect, useImperativeHandle } from 'react';
import Editor from '@toast-ui/editor';
import { useState } from 'react';
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import Prism from 'prismjs';
import { message, Spin } from 'antd';
import { UploadImage } from '~/services/utils/api';
import { useContext } from 'react';
import { UserContext } from '~/context-manager';

export type MarkdownEditorRef =
  | { editor: Editor | undefined; setMarkdown: (markdown: string) => void }
  | undefined;
const MarkdownEditor: React.ForwardRefRenderFunction<
  MarkdownEditorRef,
  { id: string; initialValue?: string; isCreate?: boolean }
> = ({ id, initialValue, isCreate }, ref) => {
  const user = useContext(UserContext);
  const [editor, setEditor] = useState<Editor | undefined>();
  const [prompt, setPrompt] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  useImperativeHandle(
    ref,
    () => {
      return {
        editor,
        setMarkdown: (markdown) => {
          if (editor) {
            editor.setMarkdown(markdown);
            localStorage['autosave_' + id] = markdown;
          }
        },
      };
    },
    [editor, id]
  );

  useEffect(() => {
    if (!editor) {
      setEditor((editor) => {
        if (!editor) {
          const dark =
            document.querySelector('section')!.className.indexOf('dark') == -1
              ? false
              : true;
          if (!initialValue && localStorage['autosave_' + id]) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            initialValue = localStorage['autosave_' + id];
          }
          return new Editor({
            el: document.querySelector('#markdown-editor-' + id)!,
            previewStyle: 'tab',
            height: '400px',
            placeholder: '输入回复反馈内容（友善的反馈是交流的起点）',
            hooks: {
              addImageBlobHook: async (blob, callback) => {
                setImageLoading(true);
                const resp = await UploadImage(blob, 'script');
                setImageLoading(false);
                if (resp.code === 0) {
                  callback(
                    user.env?.APP_API_URL + '/resource/image/' + resp.data.id,
                    (blob as File).name
                  );
                } else {
                  message.error('图片上传失败');
                }
                return false;
              },
            },
            plugins: [[codeSyntaxHighlight, { highlighter: Prism }]],
            autofocus: false,
            theme: dark ? 'dark' : 'default',
            initialValue: initialValue,
          });
        }

        return editor;
      });
    }
    const interval = setInterval(() => {
      setEditor((editor) => {
        if (editor && editor.getMarkdown()) {
          localStorage['autosave_' + id] = editor.getMarkdown();
          setPrompt(new Date().toLocaleTimeString() + ' 已自动保存');
        }
        return editor;
      });
    }, 10000);
    return () => {
      editor && editor.destroy();
      clearInterval(interval);
    };
  }, []);
  return (
    <>
      <div className="flex flex-col">
        <div id={'markdown-editor-' + id} className="w-full"></div>
        {prompt && <span className="text-gray-400">{prompt}</span>}
        {imageLoading && (
          <Spin
            tip="图片上传中..."
            className="!relative top-[-250px] !h-0"
          ></Spin>
        )}
      </div>
    </>
  );
};

export default React.forwardRef(MarkdownEditor);
