'use client';

import { useState } from 'react';
import { Form, Input, message, Modal, Radio } from 'antd';
import { useTranslations } from 'next-intl';
import { similarityService } from '@/lib/api/services/similarity';
import { APIError } from '@/types/api';

interface Props {
  reviewID: number | null;
  open: boolean;
  onClose: () => void;
  onResolved: () => void;
}

export default function ResolveReviewModal({
  reviewID,
  open,
  onClose,
  onResolved,
}: Props) {
  const t = useTranslations('admin.similarity');
  const [form] = Form.useForm<{ status: 1 | 2; note: string }>();
  const [submitting, setSubmitting] = useState(false);

  const handleOK = async () => {
    if (reviewID == null) return;
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      await similarityService.resolveIntegrityReview(
        reviewID,
        values.status,
        values.note ?? '',
      );
      message.success(t('msg_review_resolved'));
      onResolved();
      onClose();
    } catch (err) {
      if (err instanceof APIError) message.error(err.msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={t('modal_resolve_title')}
      open={open}
      onCancel={onClose}
      onOk={handleOK}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: 1, note: '' }}
      >
        <Form.Item
          name="status"
          label={t('label_decision')}
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Radio value={1}>{t('decision_ok')}</Radio>
            <Radio value={2}>{t('decision_violated')}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="note" label={t('label_note')} rules={[{ max: 255 }]}>
          <Input.TextArea rows={3} maxLength={255} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
