import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { ScriptDetailLayoutProps, ScriptState } from './types';
import ScriptLayoutProvider from './components/ScriptLayoutProvider';
import { ScriptProvider } from './components/ScriptContext';
import { isReportDetailPath } from './reportRoute';
import { PATHNAME_HEADER } from '@/lib/pathname-header';
import ScriptBreadcrumb from './components/ScriptBreadcrumb';
import scriptService from '@/lib/api/services/scripts';
import ErrorPage from '@/components/ErrorPage';
import { APIError } from '@/types/api';
import { PageIntlProvider } from '@/components/PageIntlProvider';

export default async function ScriptDetailLayout({
  children,
  params,
}: ScriptDetailLayoutProps) {
  // 使用缓存版本避免与metadata中的重复请求
  const { id, locale } = await params;
  let script;
  try {
    script = await scriptService.infoCached(id);

    if (!script) {
      notFound();
    }
  } catch (error) {
    if (error instanceof APIError && error.statusCode > 0) {
      // 脚本被删除后举报详情仍对参与方开放，但后端的 /scripts/:id 一律 404，
      // 所以这里拿不到脚本信息，只能把渲染让给子路由自己去校验权限。
      // 放行范围必须限定在举报详情：否则随便一个不存在的脚本 id 都会绕过下面
      // 友好的 404 页，掉进通用 error boundary。
      if (
        error.statusCode === 404 &&
        isReportDetailPath((await headers()).get(PATHNAME_HEADER))
      ) {
        return (
          <PageIntlProvider namespaces={['script', 'admin', 'ads']}>
            <ScriptProvider>{children}</ScriptProvider>
          </PageIntlProvider>
        );
      }
      return (
        <ErrorPage
          error={error}
          statusCode={error.statusCode}
          showErrorDetails={error.statusCode >= 500}
          showFeedback={error.statusCode >= 500}
        />
      );
    }
    throw error;
  }

  // 获取脚本状态（关注状态等）
  let scriptState: ScriptState | undefined = undefined;
  try {
    scriptState = await scriptService.getScriptStateCached(script.id);
  } catch (error) {
    // 如果获取状态失败（比如用户未登录），使用默认状态
    console.warn('Failed to fetch script state:', error);
  }
  // Strip content field from script to avoid serializing it to all sub-routes

  const { content: _content, ...scriptMeta } = script;

  return (
    <PageIntlProvider namespaces={['script', 'admin', 'ads']}>
      <ScriptBreadcrumb scriptName={script.name} locale={locale} />
      <ScriptLayoutProvider script={scriptMeta} scriptState={scriptState}>
        {children}
      </ScriptLayoutProvider>
    </PageIntlProvider>
  );
}
