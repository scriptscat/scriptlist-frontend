import type { Metadata } from 'next';
import type { ScriptDetailPageProps } from './types';
import { headers } from 'next/headers';
import ScriptDetailClient from './components/ScriptDetailClient';
import { generateScriptMetadata } from './metadata';
import scriptService from '@/lib/api/services/scripts';

export default async function ScriptDetailPage({
  params,
}: ScriptDetailPageProps) {
  const { id } = await params;
  // Fetch content separately - React.cache deduplicates with layout's call
  const script = await scriptService.infoCached(id);

  try {
    const h = await headers();
    const fwd: Record<string, string> = {};
    const xff = h.get('x-forwarded-for');
    const xri = h.get('x-real-ip');
    const ua = h.get('user-agent');
    if (xff) fwd['X-Forwarded-For'] = xff;
    if (xri) fwd['X-Real-IP'] = xri;
    if (ua) fwd['User-Agent'] = ua;
    await scriptService.recordVisit(id, fwd);
  } catch {
    // 访问统计失败不阻断详情页渲染
  }

  return <ScriptDetailClient content={script.content} />;
}

export async function generateMetadata({
  params,
}: ScriptDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  return generateScriptMetadata(id, 'detail', locale);
}
