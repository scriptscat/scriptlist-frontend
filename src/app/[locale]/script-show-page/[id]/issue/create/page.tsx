'use client';

import { useRef, useState } from 'react';
import { Button, Card, Input, Select, Space, message } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import MarkdownEditor, { MarkdownEditorRef } from '@/components/MarkdownEditor';
import { useScript } from '../../components/ScriptContext';
import { scriptIssueService } from '@/lib/api/services/scripts/issue';

// Issue标签组件
interface IssueLabelProps {
  label: string;
  className?: string;
  onMouseDown?: (event: any) => void;
  closable?: boolean;
  onClose?: () => void;
  style?: React.CSSProperties;
}

const IssueLabel: React.FC<IssueLabelProps> = ({
  label,
  className,
  onMouseDown,
  closable,
  onClose,
  style,
}) => {
  const getLabelConfig = (label: string) => {
    switch (label.toLowerCase()) {
      case 'bug':
        return { color: 'red' };
      case 'question':
        return { color: 'blue' };
      case 'feature':
      case 'enhancement':
        return { color: 'green' };
      default:
        return { color: 'default' };
    }
  };

  const config = getLabelConfig(label);

  return (
    <span
      className={className}
      onMouseDown={onMouseDown}
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        backgroundColor:
          config.color === 'red'
            ? '#fff2f0'
            : config.color === 'blue'
              ? '#f0f5ff'
              : config.color === 'green'
                ? '#f6ffed'
                : '#f5f5f5',
        color:
          config.color === 'red'
            ? '#a8071a'
            : config.color === 'blue'
              ? '#0958d9'
              : config.color === 'green'
                ? '#389e0d'
                : '#666',
        border: `1px solid ${
          config.color === 'red'
            ? '#ffccc7'
            : config.color === 'blue'
              ? '#adc6ff'
              : config.color === 'green'
                ? '#b7eb8f'
                : '#d9d9d9'
        }`,
        marginRight: '3px',
        ...style,
      }}
    >
      {label}
      {closable && (
        <span
          onClick={onClose}
          style={{
            marginLeft: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          ×
        </span>
      )}
    </span>
  );
};

export default function Create() {
  const { script } = useScript();
  const editorRef = useRef<MarkdownEditorRef>(null);
  const titleRef = useRef<any>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useTranslations();
  const router = useRouter();

  const onSubmit = async () => {
    const title = titleRef.current?.input?.value?.trim();
    const content = editorRef.current?.getValue()?.trim();

    if (!title) {
      message.error('请输入标题');
      return;
    }

    if (!content) {
      message.error('请输入内容');
      return;
    }

    setLoading(true);
    try {
      const resp = await scriptIssueService.createIssue(script.id, {
        title,
        content,
        labels: labels,
      });

      editorRef.current?.setValue('');
      if (titleRef.current?.input) {
        titleRef.current.input.value = '';
      }
      setLabels([]);

      message.success('提交成功');
      router.push(`/script-show-page/${script.id}/issue/${resp.id}`);
    } catch (error: any) {
      message.error(error.message || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-row gap-3">
        <div className="flex flex-col basis-3/4 gap-2">
          <Input placeholder="请简要描述您要反馈的问题" ref={titleRef} />
          <MarkdownEditor
            ref={editorRef}
            height="400px"
            placeholder="请详细描述问题，包括复现步骤、期望结果等..."
            comment="create-issue"
            linkId={script.id}
          />
          <Space className="justify-end">
            <Button type="primary" onClick={onSubmit} loading={loading}>
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
                { label: '功能请求', value: 'feature' },
                { label: '问题', value: 'question' },
                { label: 'Bug', value: 'bug' },
              ]}
              loading={loading}
              onChange={(value) => setLabels(value)}
              value={labels}
            />
          </Space>
        </div>
      </div>
    </Card>
  );
}
