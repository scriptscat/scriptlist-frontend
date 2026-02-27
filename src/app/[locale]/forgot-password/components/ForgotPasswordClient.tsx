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

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function ForgotPasswordClient() {
  const t = useTranslations('auth.forgot_password');
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
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[rgb(var(--bg-elevated))] rounded-2xl border border-[rgb(var(--border-secondary))] p-8 shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              {t('title')}
            </h1>
            <p className="mt-2 text-[rgb(var(--text-secondary))]">
              {t('description')}
            </p>
          </div>

          {sent ? (
            <Alert
              type="success"
              message={t('sent_title')}
              description={t('sent_description')}
              showIcon
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
                  prefix={<MailOutlined />}
                  placeholder={t('email_placeholder')}
                />
              </Form.Item>
              <Form.Item>
                {turnstileSiteKey && (
                  <div className="mb-4">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={turnstileSiteKey}
                      onSuccess={setTurnstileToken}
                    />
                  </div>
                )}
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                >
                  {t('submit_button')}
                </Button>
              </Form.Item>
            </Form>
          )}

          <div className="text-center mt-4">
            <Link
              href="/login"
              className="text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
            >
              {t('back_to_login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
