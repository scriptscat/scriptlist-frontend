'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  message,
  Spin,
  Tabs,
} from 'antd';
import {
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { oidcService } from '@/lib/api/services/oidc';
import type { OIDCBindInfoResponse } from '@/lib/api/services/oidc';
import { authService } from '@/lib/api/services/auth';
import { APIError } from '@/types/api';

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function OIDCBindConfirmContent() {
  const t = useTranslations('auth.oidc_bind');
  const tLogin = useTranslations('login');
  const searchParams = useSearchParams();
  const bindToken = searchParams.get('bind_token') || '';

  const [bindInfo, setBindInfo] = useState<OIDCBindInfoResponse | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  // 验证码相关
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const registerTurnstileRef = useRef<TurnstileInstance>(null);
  const [registerToken, setRegisterToken] = useState('');

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // 加载绑定信息
  useEffect(() => {
    if (!bindToken) {
      setLoadError(true);
      setLoadingInfo(false);
      return;
    }
    oidcService
      .getBindInfo(bindToken)
      .then((resp) => {
        setBindInfo(resp);
      })
      .catch(() => {
        setLoadError(true);
      })
      .finally(() => {
        setLoadingInfo(false);
      });
  }, [bindToken]);

  // 登录并绑定
  const handleLoginBind = async (values: {
    account: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      await oidcService.bindConfirm({
        bind_token: bindToken,
        account: values.account,
        password: values.password,
      });
      message.success(t('bind_success'));
      window.location.href = '/';
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('bind_failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  // 发送验证码
  const handleSendCode = useCallback(async () => {
    try {
      await registerForm.validateFields(['email']);
    } catch {
      return;
    }
    if (turnstileSiteKey && !registerToken) {
      message.error(tLogin('captcha_required'));
      return;
    }
    const email = registerForm.getFieldValue('email') as string;
    setSendingCode(true);
    try {
      await authService.sendRegisterCode({
        email,
        turnstile_token: registerToken,
      });
      setCountdown(60);
      message.success(tLogin('code_sent'));
      registerTurnstileRef.current?.reset();
      setRegisterToken('');
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(tLogin('code_send_failed'));
      }
      registerTurnstileRef.current?.reset();
      setRegisterToken('');
    } finally {
      setSendingCode(false);
    }
  }, [registerForm, registerToken, tLogin]);

  // 注册并绑定
  const handleRegisterBind = async (values: {
    email: string;
    username: string;
    password: string;
    code: string;
  }) => {
    setLoading(true);
    try {
      await oidcService.registerAndBind({
        bind_token: bindToken,
        email: values.email,
        username: values.username,
        password: values.password,
        code: values.code,
      });
      message.success(t('bind_success'));
      window.location.href = '/';
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('register_failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingInfo) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Spin size="large">{t('loading')}</Spin>
      </div>
    );
  }

  if (loadError || !bindInfo) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="w-full max-w-md">
          <Alert type="error" description={t('invalid_token')} showIcon />
        </div>
      </div>
    );
  }

  const loginTab = (
    <Form
      form={loginForm}
      onFinish={handleLoginBind}
      layout="vertical"
      size="large"
    >
      <Form.Item
        name="account"
        rules={[{ required: true, message: t('account_required') }]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder={t('account_placeholder')}
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: t('password_required') }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={t('password_placeholder')}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          {t('bind_button')}
        </Button>
      </Form.Item>
    </Form>
  );

  const registerTab = (
    <Form
      form={registerForm}
      onFinish={handleRegisterBind}
      layout="vertical"
      size="large"
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: tLogin('email_required') },
          { type: 'email', message: tLogin('email_invalid') },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder={tLogin('email_placeholder')}
        />
      </Form.Item>
      {turnstileSiteKey && (
        <div className="mb-4">
          <Turnstile
            ref={registerTurnstileRef}
            siteKey={turnstileSiteKey}
            onSuccess={setRegisterToken}
          />
        </div>
      )}
      <Form.Item>
        <div className="flex gap-2">
          <Form.Item
            name="code"
            noStyle
            rules={[
              { required: true, message: tLogin('code_required') },
              { len: 6, message: tLogin('code_required') },
            ]}
          >
            <Input
              prefix={<SafetyOutlined />}
              placeholder={tLogin('code_placeholder')}
              maxLength={6}
            />
          </Form.Item>
          <Button
            onClick={handleSendCode}
            loading={sendingCode}
            disabled={countdown > 0}
            style={{ minWidth: 120 }}
          >
            {countdown > 0
              ? tLogin('resend_code_countdown', { seconds: countdown })
              : tLogin('send_code')}
          </Button>
        </div>
      </Form.Item>
      <Form.Item
        name="username"
        rules={[
          { required: true, message: tLogin('username_required') },
          { min: 2, message: tLogin('username_min_length') },
          { max: 32, message: tLogin('username_max_length') },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder={tLogin('username_placeholder')}
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          { required: true, message: tLogin('password_required') },
          { min: 6, message: tLogin('password_min_length') },
          {
            pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
            message: tLogin('password_complexity'),
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={tLogin('password_placeholder')}
        />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: tLogin('confirm_password_required') },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error(tLogin('confirm_password_mismatch')),
              );
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={tLogin('confirm_password_placeholder')}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          {t('register_bind_button')}
        </Button>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    { key: 'login', label: t('tab_login_bind'), children: loginTab },
    { key: 'register', label: t('tab_register_bind'), children: registerTab },
  ];

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[rgb(var(--bg-elevated))] rounded-2xl border border-[rgb(var(--border-secondary))] p-8 shadow-sm">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              {t('title')}
            </h1>
          </div>

          {/* OIDC Account Info */}
          <Card size="small" className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              {bindInfo.picture && <Avatar src={bindInfo.picture} size={40} />}
              <div>
                <div className="font-medium text-[rgb(var(--text-primary))]">
                  {bindInfo.name || bindInfo.email}
                </div>
                <div className="text-sm text-[rgb(var(--text-tertiary))]">
                  {bindInfo.provider_name}
                </div>
              </div>
            </div>
            <Descriptions size="small" column={1}>
              {bindInfo.email && (
                <Descriptions.Item label={t('provider_email')}>
                  {bindInfo.email}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">
            {t('description', { provider: bindInfo.provider_name })}
          </p>

          {/* Tabs */}
          <Tabs items={tabItems} centered />
        </div>
      </div>
    </div>
  );
}

export default function OIDCBindConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Spin size="large" />
        </div>
      }
    >
      <OIDCBindConfirmContent />
    </Suspense>
  );
}
