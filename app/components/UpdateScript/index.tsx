import {
  Button,
  Checkbox,
  Input,
  message,
  Radio,
  Space,
  Switch,
  Tooltip,
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { useRef, useState } from 'react';
import { ClientOnly } from 'remix-utils';
import type { CreateScriptParams } from '~/services/scripts/api';
import type { Script } from '~/services/scripts/types';
import { useDark } from '~/utils/utils';
import CodeEditor from '../CodeEditor';
import type { MarkdownEditorRef } from '../MarkdownEditor/index.client';
import MarkdownEditor from '../MarkdownEditor/index.client';
import { useTranslation } from 'react-i18next';

const UpdateScript: React.FC<{
  script?: Script;
  onSubmit: (params: CreateScriptParams) => Promise<boolean>;
}> = ({ script, onSubmit }) => {
  const codeEditor = useRef<{ editor: monaco.editor.ICodeEditor }>(null);
  const dark = useDark();
  const markdown = useRef<MarkdownEditorRef>(null);
  const [changelog, setChangelog] = useState('');
  const [unwell, setUnwell] = useState(script?.unwell || 2);
  const [isPublic, setPublic] = useState(script?.public || 1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState(script?.script.version || '1.0.0');
  const [definition] = useState('');
  const [loading, setLoading] = useState(false);
  const [scriptType, setScriptType] = useState<1 | 2 | 3>(1);
  const [isPreRelease, setPreRelease] = useState<0 | 1 | 2>(0);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-start gap-1">
      <span>
        {t('submission_rules')}
        <a href="https://bbs.tampermonkey.net.cn/thread-3036-1-1.html">
          {t('script_review_rules')}
        </a>
        {t('view')}
      </span>
      <h3 className="text-lg">{t('code')}</h3>
      <div className="h-96 w-full">
        <CodeEditor
          id="view-code"
          code={script?.script.code}
          ref={codeEditor}
        />
      </div>
      <span>
        {t('or_upload_local_code')}
        <input
          type="file"
          accept="text/javascript,application/javascript"
          onChange={(e) => {
            if (!e.target) {
              return;
            }
            let files = e.target.files;
            if (files && files.length > 0) {
              let file = files[0];
              let reader = new FileReader();
              reader.readAsText(file);
              reader.onloadend = () => {
                let result = reader.result;
                codeEditor.current?.editor.setValue(result as string);
                e.target.value = '';
              };
            }
          }}
        ></input>
      </span>
      <h3 className="text-lg">{t('additional_information')}</h3>
      <span>{t('detailed_description_or_instructions')}</span>
      <ClientOnly fallback={<div></div>}>
        {() => (
          <MarkdownEditor
            id={script ? 'update-script' : 'create-script'}
            comment={script ? 'script' : 'create-script'}
            linkId={script ? script.id : -1}
            isCreate={!script}
            initialValue={script?.content}
            ref={markdown}
          />
        )}
      </ClientOnly>
      <h3 className="text-lg">{t('changelog')}</h3>
      <TextArea
        placeholder={t('current_script_update_content_support_markdown')}
        prefixCls={dark ? 'dark-input' : 'light-input'}
        className="!bg-transparent"
        onChange={(value) => setChangelog(value.target.value)}
      ></TextArea>
      {script == undefined && (
        <>
          <h3 className="text-lg">{t('script_type')}</h3>
          <Radio.Group
            onChange={(value) => setScriptType(value.target.value)}
            value={scriptType}
          >
            <Space direction="vertical">
              <Radio value={1}>{t('user_script_describe')}</Radio>
              <Radio value={3}>{t('script_library')}</Radio>
              <Radio value={2}>
                {t('subscription_script')}{' '}
                <a
                  href="https://docs.scriptcat.org/docs/dev/subscribe/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('subscription')}
                </a>
              </Radio>
            </Space>
          </Radio.Group>
        </>
      )}
      {scriptType == 3 && (
        <>
          <h3 className="text-lg">{t('update_script_library_description')}</h3>
          <Input
            placeholder={t('update_script_library_name')}
            value={name}
            onChange={(value) => setName(value.target.value)}
          />
          <TextArea
            prefixCls={dark ? 'dark-input' : 'light-input'}
            placeholder={t('library_description')}
            value={description}
            onChange={(value) => setDescription(value.target.value)}
          />
          <Input
            prefixCls={dark ? 'dark-input' : 'light-input'}
            placeholder={t('library_version')}
            value={version}
            onChange={(value) => setVersion(value.target.value)}
          />
        </>
      )}
      {script?.type == 3 && (
        <>
          <h3 className="text-lg">{t('library_version')}</h3>
          <Input
            prefixCls={dark ? 'dark-input' : 'light-input'}
            placeholder={t('library_version')}
            value={version}
            onChange={(value) => setVersion(value.target.value)}
          />
        </>
      )}
      {script !== undefined && (
        <>
          <h3 className="text-lg">{t('version_settings')}</h3>
          <Tooltip title={t('set_as_prerelease_version_tooltip')}>
            <Checkbox
              indeterminate={isPreRelease === 0 && script.type === 1}
              value={isPreRelease === 1 ? true : false}
              onChange={(val) => {
                setPreRelease(val.target.checked ? 1 : 2);
              }}
            >
              {script.type === 1
                ? t('set_as_prerelease_version')
                : t('mark_as_prerelease_version')}
            </Checkbox>
          </Tooltip>
          <h3 className="text-lg">{t('more_settings')}</h3>
          <span>
            {t('more_settings_moved_to')}
            <a href="./manage">{t('script_management')}</a>
            {t('page')}
          </span>
        </>
      )}
      {script === undefined && (
        <>
          <h3 className="text-lg">{t('script_access_permission')}</h3>
          <Switch
            checkedChildren={t('public')}
            unCheckedChildren={t('private')}
            checked={isPublic === 1 ? true : false}
            onChange={(value) => setPublic(value ? 1 : 2)}
          />
          <h3 className="text-lg">{t('inappropriate_content')}</h3>
          <Checkbox
            checked={unwell === 1 ? true : false}
            onChange={(val) => setUnwell(val.target.checked ? 1 : 2)}
          >
            {t('inappropriate_content_warning')}
          </Checkbox>
        </>
      )}
      <Button
        type="primary"
        loading={loading}
        onClick={async () => {
          let code = codeEditor.current?.editor.getValue();
          if (!code) {
            return message.error(t('code_cannot_be_empty'));
          }
          const content = markdown.current?.editor?.getMarkdown();
          if (!content) {
            return message.error(t('content_cannot_be_empty'));
          }
          setLoading(true);
          try {
            if (
              await onSubmit({
                name: name,
                description: description,
                definition: definition,
                version: version,
                type: scriptType,
                code: code,
                content: content,
                unwell: unwell,
                public: isPublic,
                changelog: changelog,
                is_pre_release: isPreRelease,
              })
            ) {
              markdown.current?.setMarkdown('');
            }
          } catch (e) {}
          setLoading(false);
        }}
      >
        {t('publish_script')}
      </Button>
    </div>
  );
};

export default UpdateScript;
