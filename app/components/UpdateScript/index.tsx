import { Button, Checkbox, Switch } from 'antd';
import { useRef } from 'react';
import { ClientOnly } from 'remix-utils';
import CodeEditor from '../CodeEditor';
import MarkdownEditor from '../MarkdownEditor/index.client';

const UpdateScript: React.FC<{ code?: string; content?: string }> = ({
  code,
  content,
}) => {
  const codeEditor = useRef<{ editor: monaco.editor.ICodeEditor }>(null);

  return (
    <div className="flex flex-col items-start gap-1">
      <span>
        提交的代码应该准确并详细的描述其脚本功能，不得混淆、加密、尊重版权、并有限制的选择可信任，无危害的外部代码。
      </span>
      <h3 className="text-lg">代码</h3>
      <div className="h-96 w-full">
        <CodeEditor id="view-code" code={code || ''} ref={codeEditor} />
      </div>
      <span>或本地上传代码:</span>
      <h3 className="text-lg">附加信息</h3>
      <span>更详细的描述，或者操作说明等</span>
      <ClientOnly fallback={<div></div>}>
        {() => <MarkdownEditor id={'update-script'} content={content} />}
      </ClientOnly>
      <h3 className="text-lg">更新日志</h3>
      <span>当前脚本更新的内容(支持markdown)</span>
      <h3 className="text-lg">脚本访问权限</h3>
      <Switch checkedChildren="公开" unCheckedChildren="私有" defaultChecked />
      <h3 className="text-lg">不适内容</h3>
      <Checkbox>
        该网站可能存在令人不适内容，包括但不限于红蓝闪光频繁闪烁、对视觉、精神有侵害的内容。
      </Checkbox>
      <Button type="primary">发布脚本</Button>
    </div>
  );
};

export default UpdateScript;
