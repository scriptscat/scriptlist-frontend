'use client';

import { useRef, useState } from 'react';
import { Button, Card, Radio, Space, Typography, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import type { MarkdownEditorRef } from '@/components/MarkdownEditor';
import dynamic from 'next/dynamic';

const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), {
  ssr: false,
  loading: () => <div style={{ height: '300px' }} />,
});
import { useScript } from '../../components/ScriptContext';
import { scriptReportService } from '@/lib/api/services/scripts/report';
import { useUser } from '@/contexts/UserContext';

const REPORT_REASONS = [
  'malware',
  'privacy',
  'copyright',
  'spam',
  'other',
] as const;

export default function CreateReportClient() {
  const { script } = useScript();
  const { user, login } = useUser();
  const editorRef = useRef<MarkdownEditorRef>(null);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const t = useTranslations('script.report');
  const router = useRouter();

  if (!user) {
    return (
      <Card>
        <div className="text-center py-12 px-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserOutlined className="text-2xl text-blue-600" />
          </div>
          <Typography.Title level={4} className="!mb-2">
            {t('login_to_report_title')}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="max-w-sm mx-auto">
            {t('login_to_report_description')}
          </Typography.Paragraph>
          <Button type="primary" size="large" className="px-8" onClick={login}>
            {t('login_to_report_button')}
          </Button>
        </div>
      </Card>
    );
  }

  const onSubmit = async () => {
    if (!reason) {
      message.error(t('reason_required'));
      return;
    }

    const content = editorRef.current?.getValue()?.trim();
    if (!content) {
      message.error(t('content_required'));
      return;
    }

    setLoading(true);
    try {
      const resp = await scriptReportService.createReport(script.id, {
        reason,
        content,
      });

      editorRef.current?.setValue('');
      setReason('');

      message.success(t('submit_success'));
      router.push(`/script-show-page/${script.id}/report/${resp.id}`);
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
          <MarkdownEditor
            ref={editorRef}
            height="400px"
            placeholder={t('content_placeholder')}
            comment="create-report"
            linkId={script.id}
          />
          <Space className="justify-end">
            <Button type="primary" onClick={onSubmit} loading={loading}>
              {t('submit_button')}
            </Button>
          </Space>
        </div>
        <div className="flex flex-col basis-1/4">
          <Space direction="vertical" className="w-full">
            <span className="text-lg font-bold">{t('reason')}</span>
            <Radio.Group
              onChange={(e) => setReason(e.target.value)}
              value={reason}
              className="flex flex-col gap-2"
            >
              {REPORT_REASONS.map((r) => (
                <Radio key={r} value={r}>
                  {t(`reasons.${r}`)}
                </Radio>
              ))}
            </Radio.Group>
          </Space>
        </div>
      </div>
    </Card>
  );
}
