'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Divider, Form, Input, message, Tabs } from 'antd';
import {
  GithubOutlined,
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { authService } from '@/lib/api/services/auth';
import { APIError } from '@/types/api';
import { Link } from '@/i18n/routing';

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function LoginClient() {
  const t = useTranslations('login');
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const loginTurnstileRef = useRef<TurnstileInstance>(null);
  const registerTurnstileRef = useRef<TurnstileInstance>(null);
  const [loginToken, setLoginToken] = useState('');
  const [registerToken, setRegisterToken] = useState('');

  // 验证码相关状态
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleLogin = async (values: { account: string; password: string }) => {
    if (turnstileSiteKey && !loginToken) {
      message.error(t('captcha_required'));
      return;
    }
    setLoading(true);
    try {
      await authService.login({
        account: values.account,
        password: values.password,
        turnstile_token: loginToken,
      });
      window.location.href = '/';
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('login_failed'));
      }
      loginTurnstileRef.current?.reset();
      setLoginToken('');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = useCallback(async () => {
    try {
      await registerForm.validateFields(['email']);
    } catch {
      return;
    }
    if (turnstileSiteKey && !registerToken) {
      message.error(t('captcha_required'));
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
      message.success(t('code_sent'));
      // 重置 turnstile，以便倒计时结束后用户可以再次发送验证码
      registerTurnstileRef.current?.reset();
      setRegisterToken('');
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('code_send_failed'));
      }
      registerTurnstileRef.current?.reset();
      setRegisterToken('');
    } finally {
      setSendingCode(false);
    }
  }, [registerForm, registerToken, t]);

  const handleRegister = async (values: {
    email: string;
    username: string;
    password: string;
    code: string;
  }) => {
    setLoading(true);
    try {
      await authService.register({
        email: values.email,
        username: values.username,
        password: values.password,
        code: values.code,
      });
      setRegisterSuccess(true);
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

  const handleGithubLogin = () => {
    message.info(t('github_coming_soon'));
  };

  const loginTab = (
    <Form
      form={loginForm}
      onFinish={handleLogin}
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
      <Form.Item>
        <div className="flex justify-end mb-2">
          <Link
            href="/forgot-password"
            className="text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
          >
            {t('forgot_password')}
          </Link>
        </div>
        {turnstileSiteKey && (
          <div className="mb-4">
            <Turnstile
              ref={loginTurnstileRef}
              siteKey={turnstileSiteKey}
              onSuccess={setLoginToken}
            />
          </div>
        )}
        <Button type="primary" htmlType="submit" block loading={loading}>
          {t('login_button')}
        </Button>
      </Form.Item>
    </Form>
  );

  const registerTab = registerSuccess ? (
    <Alert
      type="success"
      message={t('register_success_title')}
      description={t('register_success_description')}
      showIcon
    />
  ) : (
    <Form
      form={registerForm}
      onFinish={handleRegister}
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
        <Input prefix={<MailOutlined />} placeholder={t('email_placeholder')} />
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
              { required: true, message: t('code_required') },
              { len: 6, message: t('code_required') },
            ]}
          >
            <Input
              prefix={<SafetyOutlined />}
              placeholder={t('code_placeholder')}
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
              ? t('resend_code_countdown', { seconds: countdown })
              : t('send_code')}
          </Button>
        </div>
      </Form.Item>
      <Form.Item
        name="username"
        rules={[
          { required: true, message: t('username_required') },
          { min: 2, message: t('username_min_length') },
          { max: 32, message: t('username_max_length') },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder={t('username_placeholder')}
        />
      </Form.Item>
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
              return Promise.reject(new Error(t('confirm_password_mismatch')));
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
          {t('register_button')}
        </Button>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    { key: 'login', label: t('tab_login'), children: loginTab },
    { key: 'register', label: t('tab_register'), children: registerTab },
  ];

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[rgb(var(--bg-elevated))] rounded-2xl border border-[rgb(var(--border-secondary))] p-8 shadow-sm">
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              {t('title')}
            </h1>
          </div>

          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            centered
          />

          {/* Divider */}
          <Divider plain className="!my-4">
            <span className="text-[rgb(var(--text-tertiary))] text-sm">
              {t('divider_text')}
            </span>
          </Divider>

          {/* OAuth Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              icon={<GithubOutlined />}
              block
              size="large"
              onClick={handleGithubLogin}
            >
              {t('github_login')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
