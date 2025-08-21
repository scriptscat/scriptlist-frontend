'use client';

import { useRef, useState } from 'react';
import { Button, Card, Input, Select, Space, message } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import type { MarkdownEditorRef } from '@/components/MarkdownEditor';
import MarkdownEditor from '@/components/MarkdownEditor';
import { useScript } from '../../components/ScriptContext';
import { scriptIssueService } from '@/lib/api/services/scripts/issue';
import IssueLabel from '../components/IssueLabel';

export default function CreateIssueClient() {
  const { script } = useScript();
  const editorRef = useRef<MarkdownEditorRef>(null);
  const titleRef = useRef<any>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('script.issue.create');
  const tIssue = useTranslations('script.issue');
  const router = useRouter();

  const onSubmit = async () => {
    const title = titleRef.current?.input?.value?.trim();
    const content = editorRef.current?.getValue()?.trim();

    if (!title) {
      message.error(t('title_required'));
      return;
    }

    if (!content) {
      message.error(t('content_required'));
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

      message.success(t('submit_success'));
      router.push(`/script-show-page/${script.id}/issue/${resp.id}`);
    } catch (error: any) {
      message.error(error.message || t('submit_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-row gap-3">
        <div className="flex flex-col basis-3/4 gap-2">
          <Input placeholder={t('title_placeholder')} ref={titleRef} />
          <MarkdownEditor
            ref={editorRef}
            height="400px"
            placeholder={t('content_placeholder')}
            comment="create-issue"
            linkId={script.id}
          />
          <Space className="justify-end">
            <Button type="primary" onClick={onSubmit} loading={loading}>
              {t('submit_button')}
            </Button>
          </Space>
        </div>
        <div className="flex flex-col basis-1/4">
          <Space direction="vertical">
            <span className="text-lg font-bold">{tIssue('labels_title')}</span>
            <Select
              mode="multiple"
              suffixIcon
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
                    style={{ marginRight: 6 }}
                  />
                );
              }}
              style={{ width: '100%' }}
              options={[
                { label: tIssue('labels.feature'), value: 'feature' },
                { label: tIssue('labels.question'), value: 'question' },
                { label: tIssue('labels.bug'), value: 'bug' },
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
