'use client';

import { useState } from 'react';
import { Form, Input, Modal, Typography, message } from 'antd';
import { useTranslations } from 'next-intl';
import { scriptService } from '@/lib/api/services/scripts/scripts';
import { APIError } from '@/types/api';
import ProcessedScriptsList from '@/components/UserProfile/ProcessedScriptsList';

const { Text } = Typography;

interface DeleteScriptModalProps {
  open: boolean;
  scriptId: number;
  scriptName: string;
  authorId: number;
  authorName: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function DeleteScriptModal({
  open,
  scriptId,
  scriptName,
  authorId,
  authorName,
  onCancel,
  onSuccess,
}: DeleteScriptModalProps) {
  const t = useTranslations('admin.scripts');
  const tProfile = useTranslations('user.profile');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await scriptService.deleteScript(scriptId, values.reason || undefined);
      message.success(t('delete_success'));
      form.resetFields();
      onSuccess();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={t('delete_confirm')}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okButtonProps={{ danger: true }}
      width={720}
      destroyOnHidden
    >
      <div className="mb-3">
        <Text strong>{scriptName}</Text>
        <Text type="secondary" className="ml-2">
          {`@${authorName} (#${authorId})`}
        </Text>
      </div>
      <Form form={form} layout="vertical">
        <Form.Item name="reason" label={t('delete_reason')}>
          <Input.TextArea
            rows={3}
            maxLength={1024}
            showCount
            placeholder={t('delete_reason_placeholder')}
          />
        </Form.Item>
      </Form>
      <div className="mb-2">
        <Text type="secondary">{tProfile('previously_processed_scripts')}</Text>
      </div>
      <ProcessedScriptsList userId={authorId} shouldFetch={open} pageSize={5} />
    </Modal>
  );
}
