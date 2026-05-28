'use client';

import { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Button,
  message,
  Space,
} from 'antd';
import { useTranslations } from 'next-intl';
import dayjs, { type Dayjs } from 'dayjs';
import { adminService } from '@/lib/api/services/admin';
import { APIError } from '@/types/api';

interface ScoreMultiplierModalProps {
  open: boolean;
  scriptId: number;
  scriptName: string;
  initialMultiplier: number;
  initialExpireAt: number; // unix 秒，0 = 未设置
  onClose: () => void;
  onSaved: () => void;
}

interface FormValues {
  multiplier: number;
  expireAt: Dayjs;
}

export default function ScoreMultiplierModal({
  open,
  scriptId,
  scriptName,
  initialMultiplier,
  initialExpireAt,
  onClose,
  onSaved,
}: ScoreMultiplierModalProps) {
  const t = useTranslations('admin.scoreMultiplier');
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        multiplier: initialMultiplier > 0 ? initialMultiplier : 1.0,
        expireAt:
          initialExpireAt > 0
            ? dayjs.unix(initialExpireAt)
            : dayjs().add(7, 'day'),
      });
    }
  }, [open, initialMultiplier, initialExpireAt, form]);

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await adminService.setScriptScoreMultiplier(
        scriptId,
        values.multiplier,
        values.expireAt.unix(),
      );
      message.success(t('saved'));
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else if ((err as { errorFields?: unknown[] })?.errorFields) {
        // antd Form 校验失败，不弹错误 message（Form 已经标红）
      } else {
        message.error(t('save_failed'));
      }
    } finally {
      setSaving(false);
    }
  };

  const onClear = async () => {
    setClearing(true);
    try {
      await adminService.clearScriptScoreMultiplier(scriptId);
      message.success(t('cleared'));
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('clear_failed'));
      }
    } finally {
      setClearing(false);
    }
  };

  return (
    <Modal
      open={open}
      title={t('title', { name: scriptName })}
      onCancel={onClose}
      footer={
        <Space>
          <Button danger onClick={onClear} loading={clearing}>
            {t('clear')}
          </Button>
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button type="primary" onClick={onSubmit} loading={saving}>
            {t('save')}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={t('multiplier_label')}
          name="multiplier"
          rules={[
            { required: true, message: t('multiplier_required') },
            { type: 'number', min: 0, max: 10, message: t('multiplier_range') },
          ]}
          extra={t('multiplier_hint')}
        >
          <InputNumber min={0} max={10} step={0.1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label={t('expire_at_label')}
          name="expireAt"
          rules={[
            { required: true, message: t('expire_at_required') },
            {
              validator: (_, value: Dayjs | undefined) => {
                if (value && value.isAfter(dayjs())) return Promise.resolve();
                return Promise.reject(new Error(t('expire_at_future')));
              },
            },
          ]}
        >
          <DatePicker
            showTime
            style={{ width: '100%' }}
            disabledDate={(d) =>
              Boolean(d && d.isBefore(dayjs().startOf('day')))
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
