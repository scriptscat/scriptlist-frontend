import React, { useEffect, useImperativeHandle } from 'react';
import Editor from '@toast-ui/editor';
import { useState } from 'react';
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import Prism from 'prismjs';
import { message, Spin } from 'antd';
import { UploadImage } from '~/services/utils/api';
import { useContext } from 'react';
import { UserContext } from '~/context-manager';
import { useTranslation } from 'react-i18next';

export type MarkdownEditorRef =
  | { editor: Editor | undefined; setMarkdown: (markdown: string) => void }
  | undefined;

const MarkdownEditor: React.ForwardRefRenderFunction<
  MarkdownEditorRef,
  {
    id: string;
    comment: string;
    linkId: number;
    initialValue?: string;
    isCreate?: boolean;
  }
> = ({ id, comment, linkId, initialValue, isCreate }, ref) => {
  const user = useContext(UserContext);
  const [editor, setEditor] = useState<Editor | undefined>();
  const [prompt, setPrompt] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const { t } = useTranslation();

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
            placeholder: t('input_feedback_content'),
            hooks: {
              addImageBlobHook: async (blob, callback) => {
                setImageLoading(true);
                const resp = await UploadImage(blob, comment, linkId);
                setImageLoading(false);
                if (resp.code === 0) {
                  callback(
                    user.env?.APP_API_URL + '/resource/image/' + resp.data.id,
                    (blob as File).name
                  );
                } else {
                  message.error(t('image_upload_failed'));
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
          setPrompt(new Date().toLocaleTimeString() + ' ' + t('autosaved'));
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
            tip={t('uploading_image')}
            className="!relative top-[-250px] !h-0"
          ></Spin>
        )}
      </div>
    </>
  );
};

export default React.forwardRef(MarkdownEditor);
