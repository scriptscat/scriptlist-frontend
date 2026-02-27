'use client';

import React, { useState } from 'react';
import { Button, Form, Input, message, Result } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { authService } from '@/lib/api/services/auth';
import { Link } from '@/i18n/routing';
import { APIError } from '@/types/api';

export default function ResetPasswordClient() {
  const t = useTranslations('auth.reset_password');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Result
          status="warning"
          title={t('invalid_link')}
          subTitle={t('invalid_link_description')}
          extra={
            <Link href="/login">
              <Button type="primary">{t('go_login')}</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Result
          status="success"
          title={t('success_title')}
          subTitle={t('success_description')}
          extra={
            <Link href="/login">
              <Button type="primary">{t('go_login')}</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleSubmit = async (values: { password: string }) => {
    setLoading(true);
    try {
      await authService.resetPassword({
        token,
        password: values.password,
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('reset_failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[rgb(var(--bg-elevated))] rounded-2xl border border-[rgb(var(--border-secondary))] p-8 shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              {t('title')}
            </h1>
          </div>

          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="password"
              rules={[
                { required: true, message: t('password_required') },
                { min: 6, message: t('password_min_length') },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('password_placeholder')}
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: t('confirm_password_required') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(t('confirm_password_mismatch')),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('confirm_password_placeholder')}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                {t('submit_button')}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
