import { notFound } from 'next/navigation';
import type { ScriptDetailLayoutProps, ScriptState } from './types';
import ScriptLayoutProvider from './components/ScriptLayoutProvider';
import scriptService from '@/lib/api/services/scripts';
import GoogleAdScript from '@/components/GoogleAd/script';
import ErrorPage from '@/components/ErrorPage';
import { APIError } from '@/types/api';

export default async function ScriptDetailLayout({
  children,
  params,
}: ScriptDetailLayoutProps) {
  // 使用缓存版本避免与metadata中的重复请求
  const { id } = await params;
  let script;
  try {
    script = await scriptService.infoCached(id);

    if (!script) {
      notFound();
    }
  } catch (error) {
    if (error instanceof APIError && error.statusCode > 0) {
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
  return (
    <>
      <GoogleAdScript />
      <ScriptLayoutProvider script={script} scriptState={scriptState}>
        {children}
      </ScriptLayoutProvider>
    </>
  );
}
