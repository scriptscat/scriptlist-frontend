'use client';

import React, { useState } from 'react';
import { Button, Form, message, Result } from 'antd';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { authService } from '@/lib/api/services/auth';
import { Link } from '@/i18n/routing';
import { APIError } from '@/types/api';
import PasswordFormItems from '@/components/PasswordFormItems';

export default function ResetPasswordClient() {
  const t = useTranslations('auth.reset_password');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="w-full max-w-[420px] mx-auto">
        <div className="bg-[rgb(var(--bg-elevated))]/80 backdrop-blur-xl rounded-2xl border border-[rgb(var(--border-secondary))]/60 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <Result
            status="warning"
            title={t('invalid_link')}
            subTitle={t('invalid_link_description')}
            extra={
              <Link href="/login">
                <Button type="primary" className="!rounded-xl">
                  {t('go_login')}
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-[420px] mx-auto">
        <div className="bg-[rgb(var(--bg-elevated))]/80 backdrop-blur-xl rounded-2xl border border-[rgb(var(--border-secondary))]/60 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <Result
            status="success"
            title={t('success_title')}
            subTitle={t('success_description')}
            extra={
              <Link href="/login">
                <Button type="primary" className="!rounded-xl">
                  {t('go_login')}
                </Button>
              </Link>
            }
          />
        </div>
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
    <div className="w-full max-w-[420px] mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))] tracking-tight">
          {t('title')}
        </h1>
      </div>

      <div className="bg-[rgb(var(--bg-elevated))]/80 backdrop-blur-xl rounded-2xl border border-[rgb(var(--border-secondary))]/60 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <PasswordFormItems
            t={(key: string) => t(key)}
            passwordField="password"
            confirmField="confirmPassword"
            passwordLabel=""
            confirmLabel=""
            passwordPlaceholderKey="password_placeholder"
            confirmPlaceholderKey="confirm_password_placeholder"
            passwordRequiredKey="password_required"
            confirmRequiredKey="confirm_password_required"
            mismatchKey="confirm_password_mismatch"
            inputClassName="!rounded-xl"
          />
          <Form.Item className="!mb-0">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="!rounded-xl !h-11 !font-medium"
            >
              {t('submit_button')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
