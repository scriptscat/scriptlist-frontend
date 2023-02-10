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
  const [enablePreRelease, setEnablePreRelease] = useState<1 | 2>(1);
  const [isPreRelease, setPreRelease] = useState<0 | 1 | 2>(0);

  return (
    <div className="flex flex-col items-start gap-1">
      <span>
        提交的代码应该严格遵守本站脚本发布的相关规定，否则将会按照规则进行处理。相关规定可前往
        <a href="https://bbs.tampermonkey.net.cn/thread-3036-1-1.html">
          脚本站审查规则
        </a>
        查看
      </span>
      <h3 className="text-lg">代码</h3>
      <div className="h-96 w-full">
        <CodeEditor
          id="view-code"
          code={script?.script.code}
          ref={codeEditor}
        />
      </div>
      <span>
        或本地上传代码:
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
      <h3 className="text-lg">附加信息</h3>
      <span>更详细的描述，或者操作说明等</span>
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
      <h3 className="text-lg">更新日志</h3>
      <TextArea
        placeholder="当前脚本更新的内容(支持markdown)"
        prefixCls={dark ? 'dark-input' : 'light-input'}
        className="!bg-transparent"
        onChange={(value) => setChangelog(value.target.value)}
      ></TextArea>
      {script == undefined && (
        <>
          <h3 className="text-lg">脚本类型</h3>
          <Radio.Group
            onChange={(value) => setScriptType(value.target.value)}
            value={scriptType}
          >
            <Space direction="vertical">
              <Radio value={1}>
                用户脚本,平常意义上的油猴脚本,包括脚本猫的后台脚本、定时脚本
              </Radio>
              <Radio value={3}>
                脚本调用库,脚本@require所使用的库,只允许被其他脚本进行引用,不允许被用户安装
              </Radio>
              <Radio value={2}>
                订阅脚本,脚本猫特有支持的类型,仅会在安装时弹出安装界面由用户确认订阅,后续的更新采用静默更新的方式
                <a
                  href="https://docs.scriptcat.org/dev/subscribe.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  订阅模式
                </a>
              </Radio>
            </Space>
          </Radio.Group>
        </>
      )}
      {scriptType == 3 && (
        <>
          <h3 className="text-lg">库描述信息</h3>
          <Input
            placeholder="库名称,类似脚本的@name"
            value={name}
            onChange={(value) => setName(value.target.value)}
          />
          <TextArea
            prefixCls={dark ? 'dark-input' : 'light-input'}
            placeholder="库描述信息,类似脚本的@description"
            value={description}
            onChange={(value) => setDescription(value.target.value)}
          />
          <Input
            prefixCls={dark ? 'dark-input' : 'light-input'}
            placeholder="库版本,类似脚本的@version"
            value={version}
            onChange={(value) => setVersion(value.target.value)}
          />
          {/* <h3 className="text-lg">库的定义文件(.d.ts)</h3>
          <TextArea
            prefixCls={dark ? 'dark-input' : 'light-input'}
            placeholder="库描述信息,类似脚本的@description"
            value={definition}
            onChange={(value) => setDefinition(value.target.value)}
          /> */}
        </>
      )}
      {script?.type == 3 && (
        <>
          <h3 className="text-lg">库版本</h3>
          <Input
            prefixCls={dark ? 'dark-input' : 'light-input'}
            placeholder="库版本,类似脚本的@version"
            value={version}
            onChange={(value) => setVersion(value.target.value)}
          />
        </>
      )}
      <h3 className="text-lg">版本设置</h3>
      {script === undefined && (
        <>
          <h3 className="text-lg">开启预发布</h3>
          <span>
            开启预发布开关时, 当版本符合
            <a
              href="https://bbs.tampermonkey.net.cn/thread-3384-1-1.html"
              target="_blank"
              rel="noreferrer"
            >
              语义化版本
            </a>
            {'<pre-release>'}
            时更新脚本将会自动标记为预发布版本,并且会在脚本首页提供预发布版本的安装按钮.
          </span>
          <Switch
            checkedChildren="开启"
            unCheckedChildren="关闭"
            checked={enablePreRelease === 1 ? true : false}
            onChange={(value) => {
              setEnablePreRelease(value ? 1 : 2);
            }}
          />
        </>
      )}
      <Tooltip title="设置为预发布版本,正式版本不会更新至此版本,可在脚本管理页开启脚本预发布安装链接">
        <Checkbox
          indeterminate={isPreRelease === 0}
          value={isPreRelease === 1 ? true : false}
          onChange={(val) => {
            setPreRelease(val.target.checked ? 1 : 2);
          }}
        >
          设置为预发布版本
        </Checkbox>
      </Tooltip>
      {script !== undefined && (
        <>
          <h3 className="text-lg">更多设置</h3>
          <span>
            更多设置已经迁移至<a href="./manage">脚本管理</a>中
          </span>
        </>
      )}
      {script === undefined && (
        <>
          <h3 className="text-lg">脚本访问权限</h3>
          <Switch
            checkedChildren="公开"
            unCheckedChildren="私有"
            checked={isPublic === 1 ? true : false}
            onChange={(value) => setPublic(value ? 1 : 2)}
          />
          <h3 className="text-lg">不适内容</h3>
          <Checkbox
            checked={unwell === 1 ? true : false}
            onChange={(val) => setUnwell(val.target.checked ? 1 : 2)}
          >
            该网站可能存在令人不适内容，包括但不限于红蓝闪光频繁闪烁、对视觉、精神有侵害的内容。
          </Checkbox>
        </>
      )}
      <Button
        type="primary"
        loading={loading}
        onClick={async () => {
          let code = codeEditor.current?.editor.getValue();
          if (!code) {
            return message.error('代码不能为空');
          }
          const content = markdown.current?.editor?.getMarkdown();
          if (!content) {
            return message.error('内容不能为空');
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
                enable_pre_release: enablePreRelease,
                is_pre_release: isPreRelease,
              })
            ) {
              markdown.current?.setMarkdown('');
            }
          } catch (e) {
            console.error(e);
          }
          setLoading(false);
        }}
      >
        发布脚本
      </Button>
    </div>
  );
};

export default UpdateScript;
