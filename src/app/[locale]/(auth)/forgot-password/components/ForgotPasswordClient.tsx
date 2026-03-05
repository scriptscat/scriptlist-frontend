'use client';

import React, { useRef, useState } from 'react';
import { Alert, Button, Form, Input, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { authService } from '@/lib/api/services/auth';
import { Link } from '@/i18n/routing';
import { APIError } from '@/types/api';
import { useGlobalConfig } from '@/contexts/GlobalConfigContext';

export default function ForgotPasswordClient() {
  const t = useTranslations('auth.forgot_password');
  const { turnstile_site_key: turnstileSiteKey } = useGlobalConfig();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [turnstileToken, setTurnstileToken] = useState('');

  const handleSubmit = async (values: { email: string }) => {
    if (turnstileSiteKey && !turnstileToken) {
      message.error(t('captcha_required'));
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword({
        email: values.email,
        turnstile_token: turnstileToken,
      });
      setSent(true);
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('send_failed'));
      }
      turnstileRef.current?.reset();
      setTurnstileToken('');
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
        <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
          {t('description')}
        </p>
      </div>

      <div className="bg-[rgb(var(--bg-elevated))]/80 backdrop-blur-xl rounded-2xl border border-[rgb(var(--border-secondary))]/60 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {sent ? (
          <Alert
            type="success"
            message={t('sent_title')}
            description={t('sent_description')}
            showIcon
            className="!rounded-xl"
          />
        ) : (
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: t('email_required') },
                { type: 'email', message: t('email_invalid') },
              ]}
            >
              <Input
                prefix={
                  <MailOutlined className="text-[rgb(var(--text-tertiary))]" />
                }
                placeholder={t('email_placeholder')}
                className="!rounded-xl"
              />
            </Form.Item>
            {turnstileSiteKey && (
              <div className="mb-4">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={turnstileSiteKey}
                  onSuccess={setTurnstileToken}
                />
              </div>
            )}
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
        )}

        <div className="text-center mt-5">
          <Link
            href="/login"
            className="text-xs text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--primary-500))] transition-colors"
          >
            {t('back_to_login')}
          </Link>
        </div>
      </div>
    </div>
  );
}
