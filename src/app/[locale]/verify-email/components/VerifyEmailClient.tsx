'use client';

import React, { useEffect, useState } from 'react';
import { Button, Result, Spin } from 'antd';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { authService } from '@/lib/api/services/auth';
import { Link } from '@/i18n/routing';
import type { APIError } from '@/types/api';

type VerifyStatus = 'loading' | 'success' | 'error' | 'no_token';

export default function VerifyEmailClient() {
  const t = useTranslations('auth.verify_email');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<VerifyStatus>(
    token ? 'loading' : 'no_token',
  );
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) return;
    authService
      .verifyEmail({ token })
      .then(() => {
        setStatus('success');
      })
      .catch((err: APIError) => {
        setStatus('error');
        setErrorMsg(err.msg || t('verify_failed'));
      });
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Spin size="large" tip={t('verifying')} />
      </div>
    );
  }

  if (status === 'success') {
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

  if (status === 'no_token') {
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

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Result
        status="error"
        title={t('error_title')}
        subTitle={errorMsg || t('verify_failed')}
        extra={
          <Link href="/login">
            <Button type="primary">{t('go_login')}</Button>
          </Link>
        }
      />
    </div>
  );
}
