'use client';

import { useMemo } from 'react';
import { Card, Tag, Tooltip } from 'antd';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import { getCapabilities, getConnectDomains } from '@/lib/scriptCapabilities';

const MAX_DOMAINS = 4;

export default function ScriptPermissionsCard({
  meta,
  cookieRisk = false,
}: {
  meta: Record<string, string[] | undefined>;
  cookieRisk?: boolean;
}) {
  const t = useTranslations('script.detail.permissions');
  const domains = useMemo(() => getConnectDomains(meta), [meta]);
  const caps = useMemo(
    () => getCapabilities(meta, cookieRisk),
    [meta, cookieRisk],
  );

  if (domains.length === 0 && caps.length === 0) return null;

  const shown = domains.slice(0, MAX_DOMAINS);
  const extra = domains.length - shown.length;

  return (
    <Card
      size="small"
      className="!rounded-xl"
      classNames={{ body: '!p-4' }}
      title={
        <span className="flex items-center gap-1.5">
          <Icon icon="mdi:shield-outline" className="text-base" />
          {t('title')}
        </span>
      }
    >
      <div className="space-y-3">
        {domains.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs text-gray-500">{t('connect')}</div>
            <div className="flex flex-wrap gap-1.5">
              {shown.map((d) => (
                <Tag key={d} className="!m-0 font-mono text-xs">
                  {d}
                </Tag>
              ))}
              {extra > 0 && (
                <span className="text-xs text-[#1677ff]">
                  {t('more', { count: extra })}
                </span>
              )}
            </div>
          </div>
        )}
        {caps.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs text-gray-500">{t('grants')}</div>
            <div className="flex flex-wrap gap-1.5">
              {caps.map((c) => (
                <Tooltip
                  key={c.key}
                  title={c.risk === 'high' ? t('high_risk') : undefined}
                >
                  <Tag
                    color={c.risk === 'high' ? 'warning' : 'processing'}
                    className="!m-0 text-xs"
                  >
                    {t(`cap.${c.key}`)}
                  </Tag>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
