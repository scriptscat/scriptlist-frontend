'use client';

import { useState } from 'react';
import { Modal, Form, Input, Select, Checkbox, Space, message } from 'antd';
import { useTranslations } from 'next-intl';
import { adminService } from '@/lib/api/services/admin';

interface BanUserModalProps {
  visible: boolean;
  userId: number;
  username: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const { TextArea } = Input;

export default function BanUserModal({
  visible,
  userId,
  username,
  onCancel,
  onSuccess,
}: BanUserModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const t = useTranslations('user.profile');

  const durationOptions = [
    { label: t('ban_permanent'), value: 0 },
    { label: t('ban_1_day'), value: 86400 },
    { label: t('ban_3_days'), value: 259200 },
    { label: t('ban_7_days'), value: 604800 },
    { label: t('ban_30_days'), value: 2592000 },
    { label: t('ban_90_days'), value: 7776000 },
  ];

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const expireAt =
        values.duration > 0
          ? Math.floor(Date.now() / 1000) + values.duration
          : 0;

      await adminService.updateUserStatus(userId, 2, {
        reason: values.reason || '',
        expire_at: expireAt,
        clean_scores: values.clean_scores || false,
        clean_scripts: values.clean_scripts || false,
      });

      message.success(t('ban_success'));
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      if (error?.message) {
        message.error(error.message);
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
      title={`${t('ban_user')} - ${username}`}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          duration: 0,
          clean_scores: false,
          clean_scripts: false,
        }}
      >
        <Form.Item name="reason" label={t('ban_reason')}>
          <TextArea
            rows={3}
            placeholder={t('ban_reason_placeholder')}
            maxLength={512}
            showCount
          />
        </Form.Item>

        <Form.Item name="duration" label={t('ban_duration')}>
          <Select options={durationOptions} />
        </Form.Item>

        <Form.Item name="clean_options" label={t('ban_clean_options')}>
          <Space direction="vertical">
            <Form.Item name="clean_scores" valuePropName="checked" noStyle>
              <Checkbox>{t('ban_clean_scores')}</Checkbox>
            </Form.Item>
            <Form.Item name="clean_scripts" valuePropName="checked" noStyle>
              <Checkbox>{t('ban_clean_scripts')}</Checkbox>
            </Form.Item>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
