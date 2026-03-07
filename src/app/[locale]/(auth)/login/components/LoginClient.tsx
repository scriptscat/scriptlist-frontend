'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Divider, Form, Input, message } from 'antd';
import {
  LockOutlined,
  LoginOutlined,
  MailOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { authService } from '@/lib/api/services/auth';
import { oidcService } from '@/lib/api/services/oidc';
import type { OIDCProviderInfo } from '@/lib/api/services/oidc';
import { APIError } from '@/types/api';
import { Link } from '@/i18n/routing';
import { useGlobalConfig } from '@/contexts/GlobalConfigContext';
import AgreeTermsCheckbox from '@/components/AgreeTermsCheckbox';
import Image from 'next/image';

export default function LoginClient() {
  const t = useTranslations('login');
  const {
    turnstile_site_key: turnstileSiteKey,
    qq_migrate_enabled: qqMigrateEnabled,
  } = useGlobalConfig();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  // Only allow relative paths to prevent open redirect (reject protocol-relative URLs like //evil.com)
  const safeRedirect =
    redirectParam &&
    redirectParam.startsWith('/') &&
    !redirectParam.startsWith('//')
      ? redirectParam
      : '/';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const loginTurnstileRef = useRef<TurnstileInstance>(null);
  const registerTurnstileRef = useRef<TurnstileInstance>(null);
  const [loginToken, setLoginToken] = useState('');
  const [registerToken, setRegisterToken] = useState('');

  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [oidcProviders, setOidcProviders] = useState<OIDCProviderInfo[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    oidcService
      .getProviders()
      .then((resp) => {
        setOidcProviders(resp.providers || []);
      })
      .catch(() => {});
  }, []);

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
      window.location.href = safeRedirect;
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
  }, [registerForm, registerToken, t, turnstileSiteKey]);

  const handleRegister = async (values: {
    email: string;
    username: string;
    password: string;
    code: string;
    agree_terms: boolean;
  }) => {
    setLoading(true);
    try {
      await authService.register({
        email: values.email,
        username: values.username,
        password: values.password,
        code: values.code,
        agree_terms: values.agree_terms,
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

  const handleOIDCLogin = (providerId: number) => {
    const oidcUrl = `/api/v2/auth/oidc/${providerId}/login`;
    if (safeRedirect !== '/') {
      window.location.href = `${oidcUrl}?redirect=${encodeURIComponent(safeRedirect)}`;
    } else {
      window.location.href = oidcUrl;
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto">
      {/* Logo & branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgb(var(--bg-elevated))]/80 shadow-lg mb-4 backdrop-blur-sm border border-[rgb(var(--border-secondary))]/50">
          <Image
            height={36}
            width={36}
            src="/assets/logo.png"
            alt="ScriptCat"
          />
        </div>
        <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))] tracking-tight">
          {t('title')}
        </h1>
      </div>

      {/* Card */}
      <div className="bg-[rgb(var(--bg-elevated))]/80 backdrop-blur-xl rounded-2xl border border-[rgb(var(--border-secondary))]/60 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {/* Tab switcher */}
        <div className="flex mb-6 bg-[rgb(var(--bg-tertiary))]/60 rounded-xl p-1 gap-1">
          <button
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 border-0 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] shadow-sm'
                : 'bg-transparent text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))]'
            }`}
            onClick={() => setActiveTab('login')}
          >
            {t('tab_login')}
          </button>
          <button
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 border-0 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] shadow-sm'
                : 'bg-transparent text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))]'
            }`}
            onClick={() => setActiveTab('register')}
          >
            {t('tab_register')}
          </button>
        </div>

        {/* Login form */}
        {activeTab === 'login' && (
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
                prefix={
                  <UserOutlined className="text-[rgb(var(--text-tertiary))]" />
                }
                placeholder={t('account_placeholder')}
                className="!rounded-xl"
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
                prefix={
                  <LockOutlined className="text-[rgb(var(--text-tertiary))]" />
                }
                placeholder={t('password_placeholder')}
                className="!rounded-xl"
              />
            </Form.Item>
            <div className="flex justify-end -mt-2 mb-4">
              <Link
                href="/forgot-password"
                className="text-xs text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--primary-500))] transition-colors"
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
            <Form.Item className="!mb-0">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="!rounded-xl !h-11 !font-medium"
              >
                {t('login_button')}
              </Button>
            </Form.Item>
          </Form>
        )}

        {/* Register form */}
        {activeTab === 'register' && (
          <>
            {registerSuccess ? (
              <Alert
                type="success"
                message={t('register_success_title')}
                description={t('register_success_description')}
                showIcon
                className="!rounded-xl"
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
                        prefix={
                          <SafetyOutlined className="text-[rgb(var(--text-tertiary))]" />
                        }
                        placeholder={t('code_placeholder')}
                        maxLength={6}
                        className="!rounded-xl"
                      />
                    </Form.Item>
                    <Button
                      onClick={handleSendCode}
                      loading={sendingCode}
                      disabled={countdown > 0}
                      className="!rounded-xl !min-w-[120px]"
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
                    prefix={
                      <UserOutlined className="text-[rgb(var(--text-tertiary))]" />
                    }
                    placeholder={t('username_placeholder')}
                    className="!rounded-xl"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: t('password_required') },
                    { min: 6, message: t('password_min_length') },
                    {
                      pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
                      message: t('password_complexity'),
                    },
                  ]}
                >
                  <Input.Password
                    prefix={
                      <LockOutlined className="text-[rgb(var(--text-tertiary))]" />
                    }
                    placeholder={t('password_placeholder')}
                    className="!rounded-xl"
                  />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    {
                      required: true,
                      message: t('confirm_password_required'),
                    },
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
                    prefix={
                      <LockOutlined className="text-[rgb(var(--text-tertiary))]" />
                    }
                    placeholder={t('confirm_password_placeholder')}
                    className="!rounded-xl"
                  />
                </Form.Item>
                <AgreeTermsCheckbox />
                <Form.Item className="!mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    className="!rounded-xl !h-11 !font-medium"
                  >
                    {t('register_button')}
                  </Button>
                </Form.Item>
              </Form>
            )}
          </>
        )}

        {/* OIDC providers */}
        {oidcProviders.length > 0 && (
          <>
            <Divider plain className="!my-5">
              <span className="text-[rgb(var(--text-tertiary))] text-xs tracking-wider uppercase">
                {t('divider_text')}
              </span>
            </Divider>
            <div className="flex flex-col gap-2.5">
              {oidcProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleOIDCLogin(provider.id)}
                  className="flex items-center justify-center gap-2.5 w-full h-11 rounded-xl border border-[rgb(var(--border-primary))] bg-transparent hover:bg-[rgb(var(--bg-tertiary))]/60 text-[rgb(var(--text-primary))] text-sm font-medium transition-all duration-200 cursor-pointer hover:border-[rgb(var(--border-focus))]/40 hover:shadow-sm"
                >
                  {provider.icon ? (
                    <img
                      src={provider.icon}
                      alt={provider.name}
                      className="w-[18px] h-[18px]"
                    />
                  ) : (
                    <LoginOutlined className="text-base" />
                  )}
                  {t('oidc_login_with', { provider: provider.name })}
                </button>
              ))}
            </div>
          </>
        )}

        {/* QQ 迁移登录（临时，迁移期结束后删除） */}
        {qqMigrateEnabled && (
          <div className="mt-4">
            {oidcProviders.length === 0 && (
              <Divider plain className="!my-5">
                <span className="text-[rgb(var(--text-tertiary))] text-xs tracking-wider uppercase">
                  {t('divider_text')}
                </span>
              </Divider>
            )}
            <button
              onClick={() => {
                window.location.href = '/api/v2/auth/qq-migrate';
              }}
              className="flex items-center justify-center gap-2.5 w-full h-11 rounded-xl border border-[rgb(var(--border-primary))] bg-transparent hover:bg-[rgb(var(--bg-tertiary))]/60 text-[rgb(var(--text-primary))] text-sm font-medium transition-all duration-200 cursor-pointer hover:border-[rgb(var(--border-focus))]/40 hover:shadow-sm"
            >
              <LoginOutlined className="text-base" />
              {t('qq_migrate_button')}
            </button>
            <p className="text-xs text-[rgb(var(--text-tertiary))] text-center mt-2">
              {t('qq_migrate_notice')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
