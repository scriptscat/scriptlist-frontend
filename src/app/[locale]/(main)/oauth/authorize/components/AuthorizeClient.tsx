'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card, Result, Spin, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api';
import { APIError } from '@/types/api';

interface AppInfo {
  app_name: string;
  description: string;
  client_id: string;
  redirect_uri: string;
  scope: string;
  state: string;
}

export default function AuthorizeClient() {
  const t = useTranslations('oauth.authorize');
  const searchParams = useSearchParams();
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const responseType = searchParams.get('response_type');
  const scope = searchParams.get('scope') || '';
  const state = searchParams.get('state') || '';

  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!clientId || !redirectUri || responseType !== 'code') {
      setError(t('invalid_request'));
      setLoading(false);
      return;
    }
    apiClient
      .get<AppInfo>('/oauth/authorize', {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: responseType,
        scope,
        state,
      })
      .then((data) => {
        setAppInfo(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof APIError && err.statusCode === 401) {
          const currentPath = `/oauth/authorize?${searchParams.toString()}`;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          return;
        }
        const apiErr = err instanceof APIError ? err : null;
        setError(apiErr?.msg || t('load_failed'));
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- OAuth authorize runs once on mount with stable search params
  }, []);

  const isSafeRedirect = (uri: string): boolean => {
    try {
      const parsed = new URL(uri);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      const resp = await apiClient.post<{ redirect_uri: string }>(
        '/oauth/authorize',
        {
          client_id: clientId,
          redirect_uri: redirectUri,
          scope,
          state,
        },
      );
      if (!isSafeRedirect(resp.redirect_uri)) {
        message.error(t('invalid_redirect'));
        setApproving(false);
        return;
      }
      window.location.href = resp.redirect_uri;
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('approve_failed'));
      }
      setApproving(false);
    }
  };

  const handleDeny = () => {
    const safeRedirect = appInfo?.redirect_uri;
    if (safeRedirect && isSafeRedirect(safeRedirect)) {
      const url = new URL(safeRedirect);
      url.searchParams.set('error', 'access_denied');
      if (state) {
        url.searchParams.set('state', state);
      }
      window.location.href = url.toString();
    } else {
      window.history.back();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Result status="error" title={t('error_title')} subTitle={error} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">
              {t('title')}
            </h2>
            <p className="mt-2 text-[rgb(var(--text-secondary))]">
              {t('description', { app_name: appInfo?.app_name ?? '' })}
            </p>
          </div>

          {appInfo?.description && (
            <p className="text-sm text-[rgb(var(--text-tertiary))] mb-4 text-center">
              {appInfo.description}
            </p>
          )}

          <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4 mb-6">
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              {t('permissions_label')}
            </p>
            <ul className="mt-2 space-y-1">
              <li className="text-sm text-[rgb(var(--text-primary))]">
                {t('permission_profile')}
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button block size="large" onClick={handleDeny}>
              <CloseCircleOutlined />
              {t('deny_button')}
            </Button>
            <Button
              type="primary"
              block
              size="large"
              loading={approving}
              onClick={handleApprove}
            >
              <CheckCircleOutlined />
              {t('approve_button')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
