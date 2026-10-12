'use client';

import { useEffect, useState } from 'react';
import { languageMap } from '@/i18n/routing';
import { reportClientError } from '@/lib/error-report/client';
import { generateErrorId, localeFromPath } from '@/lib/error-report/core';

// 根布局崩溃时 next-intl 的 Provider 和全局样式都不在了，这里只能自带文案与内联样式。
// 英文作兜底，再按路径里的语言去取与 500 错误页相同的翻译。
const FALLBACK_TEXT = {
  title: 'Internal Server Error',
  description:
    'Our server is temporarily unable to process your request. We have received the error report and are working hard to fix this issue.',
  errorId: 'Error ID',
  home: 'Back to Home',
  refresh: 'Refresh Page',
};

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const [errorId] = useState(generateErrorId);
  // 语言与文案一起在翻译取回后才切换；取不回来就保持英文兜底
  const [view, setView] = useState<{
    locale?: string;
    text: typeof FALLBACK_TEXT;
  }>({ text: FALLBACK_TEXT });
  const { locale, text } = view;

  useEffect(() => {
    console.error('Application error:', error);

    reportClientError({
      kind: 'boundary',
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      errorId,
    });
  }, [error, errorId]);

  useEffect(() => {
    const current = localeFromPath(window.location.pathname);
    const tag = current && languageMap[current]?.locale;
    if (!current || !tag) {
      return;
    }
    fetch(`/locales/${tag}/translations.json`)
      .then((resp) => resp.json())
      .then((messages) => {
        const e = messages?.error ?? {};
        setView({
          locale: current,
          text: {
            title: e['500_title'] ?? FALLBACK_TEXT.title,
            description: e['500_description'] ?? FALLBACK_TEXT.description,
            errorId: e.error_id ?? FALLBACK_TEXT.errorId,
            home: e.back_to_home ?? FALLBACK_TEXT.home,
            refresh: e.refresh_page ?? FALLBACK_TEXT.refresh,
          },
        });
      })
      .catch(() => {});
  }, []);

  return (
    <html lang={locale ?? 'en'}>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          colorScheme: 'light dark',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <main style={{ maxWidth: 560 }}>
          <h1 style={{ fontSize: 24 }}>{text.title}</h1>
          <p style={{ opacity: 0.75 }}>{text.description}</p>
          <p style={{ opacity: 0.75 }}>{`${text.errorId}: ${errorId}`}</p>
          <p style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {/* 根布局已崩溃，客户端路由不可用，只能整页跳转 */}
            <a href={locale ? `/${locale}` : '/'}>{text.home}</a>
            <button type="button" onClick={() => window.location.reload()}>
              {text.refresh}
            </button>
          </p>
        </main>
      </body>
    </html>
  );
}
