import { useNavigate } from '@remix-run/react';
import type { InputRef} from 'antd';
import { message } from 'antd';
import { Button, Card, Input, Select, Space } from 'antd';
import { useContext, useRef, useState } from 'react';
import { ClientOnly } from 'remix-utils';
import IssueLabel from '~/components/IssueLabel';
import type { MarkdownEditorRef } from '~/components/MarkdownEditor/index.client';
import MarkdownEditor from '~/components/MarkdownEditor/index.client';
import { ScriptContext } from '~/context-manager';
import { SubmitIssue } from '~/services/scripts/issues/api';

export default function Create() {
  const script = useContext(ScriptContext);
  const editor = useRef<MarkdownEditorRef>();
  const title = useRef<InputRef>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onSubmit = async () => {
    setLoading(true);
    const resp = await SubmitIssue(script.script!.id, {
      title: title.current!.input!.value,
      content: editor.current!.editor!.getMarkdown(),
      labels: labels,
    });
    setLoading(false);
    if (resp.code === 0) {
      editor.current?.setMarkdown('');
      message.success('提交成功');
      navigate({
        pathname:
          '/script-show-page/' +
          script.script!.id +
          '/issue/' +
          resp.data.id +
          '/comment',
      });
    } else {
      message.error(resp.msg);
    }
  };
  return (
    <Card>
      <div className="flex flex-row gap-3">
        <div className="flex flex-col basis-3/4 gap-2">
          <Input
            placeholder="使用标题简单概括你要描述的内容,然后在下方填写详细的信息.右侧可以选择反馈的类型."
            ref={title}
          />
          <ClientOnly fallback={<div></div>}>
            {() => <MarkdownEditor id="create-issue" ref={editor} />}
          </ClientOnly>
          <Space className="justify-end">
            <Button type="primary" onClick={onSubmit}>
              提交反馈
            </Button>
          </Space>
        </div>
        <div className="flex flex-col basis-1/4">
          <Space direction="vertical">
            <span className="text-lg font-bold">标签</span>
            <Select
              mode="multiple"
              showArrow
              tagRender={({ value, closable, onClose }) => {
                const onPreventMouseDown = (event: any) => {
                  event.preventDefault();
                  event.stopPropagation();
                };
                return (
                  <IssueLabel
                    label={value}
                    className="anticon-middle"
                    onMouseDown={onPreventMouseDown}
                    closable={closable}
                    onClose={onClose}
                    style={{ marginRight: 3 }}
                  />
                );
              }}
              style={{ width: '100%' }}
              options={[
                { value: 'feature' },
                { value: 'question' },
                { value: 'bug' },
              ]}
              loading={loading}
              onChange={(value) => setLabels(value)}
            />
          </Space>
        </div>
      </div>
    </Card>
  );
}
