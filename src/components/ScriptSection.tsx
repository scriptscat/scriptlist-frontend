'use client';

import { Card, Typography } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { formatNumber, useSemDateTime } from '@/lib/utils/semdate';
import { ScriptUtils } from '@/app/[locale]/(main)/script-show-page/[id]/utils';
import type { ScriptListItem } from '@/app/[locale]/(main)/script-show-page/[id]/types';

const { Text } = Typography;

interface ScriptSectionProps {
  icon: string;
  chipClass: string;
  iconClass?: string;
  title: string;
  moreHref: string;
  scripts: ScriptListItem[];
}

const iconPalette = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#0d6efd',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#0891b2',
];

function pickIconColor(id: number): string {
  return iconPalette[Math.abs(id) % iconPalette.length];
}

function firstChar(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const ch = trimmed.charAt(0);
  return /[a-zA-Z]/.test(ch) ? ch.toUpperCase() : ch;
}

function ScriptIcon({
  script,
  size,
  radius,
  textSize,
}: {
  script: ScriptListItem;
  size: number;
  radius: number;
  textSize: string;
}) {
  const iconUrl = ScriptUtils.icon(script.script.meta_json);
  if (iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img
        src={iconUrl}
        width={size}
        height={size}
        loading="lazy"
        className="flex-shrink-0 object-cover"
        style={{ borderRadius: radius }}
      />
    );
  }
  return (
    <div
      style={{
        background: pickIconColor(script.id),
        width: size,
        height: size,
        borderRadius: radius,
      }}
      className={`flex-shrink-0 flex items-center justify-center text-white font-bold leading-none ${textSize}`}
    >
      {firstChar(script.name)}
    </div>
  );
}

function CompactCard({ script }: { script: ScriptListItem }) {
  const locale = useLocale();
  const semDataTime = useSemDateTime();
  const name = ScriptUtils.i18nName(script, locale);
  const description = ScriptUtils.i18nDescription(script, locale);
  const score = ScriptUtils.score(script.score, script.score_num);

  return (
    <Link
      href={`/script-show-page/${script.id}`}
      target="_blank"
      className="block h-full group text-app-primary hover:text-app-primary"
    >
      <div className="h-full bg-app-elevated rounded-[10px] border border-app-primary p-4 flex flex-col gap-2.5 transition-all duration-150 group-hover:border-[rgb(var(--primary-500))] group-hover:shadow-md">
        <div className="flex items-center gap-3">
          <ScriptIcon
            script={script}
            size={44}
            radius={10}
            textSize="text-xl"
          />
          <div className="flex-1 min-w-0">
            <div
              className="text-app-primary text-sm font-semibold leading-snug line-clamp-2 min-h-[2.75em] mb-0.5 break-all overflow-hidden"
              title={name}
            >
              {name}
            </div>
            <div
              className="text-app-tertiary text-xs truncate"
              title={`@${script.username}`}
            >
              {`@${script.username}`}
            </div>
          </div>
        </div>
        <div
          className="text-app-secondary text-xs leading-snug line-clamp-2 min-h-[2.75em] break-all overflow-hidden"
          title={description}
        >
          {description}
        </div>
        <div className="flex items-center gap-4 mt-auto pt-1 text-xs">
          <span className="inline-flex items-center gap-1 text-app-secondary font-medium">
            <span
              className="font-bold"
              style={{ color: 'rgb(var(--primary-500))' }}
            >
              {'↓'}
            </span>
            {formatNumber(script.total_install)}
          </span>
          <span className="inline-flex items-center gap-1 text-app-secondary font-medium">
            <span className="text-yellow-500">{'★'}</span>
            {score || '-'}
          </span>
          <span className="text-app-tertiary ml-auto truncate">
            {semDataTime(script.updatetime)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ListRow({ script }: { script: ScriptListItem }) {
  const locale = useLocale();
  const semDataTime = useSemDateTime();
  const name = ScriptUtils.i18nName(script, locale);
  const description = ScriptUtils.i18nDescription(script, locale);
  const score = ScriptUtils.score(script.score, script.score_num);

  return (
    <Link
      href={`/script-show-page/${script.id}`}
      target="_blank"
      className="flex items-center gap-4 px-4 py-2 hover:bg-[rgb(var(--primary-50))] dark:hover:bg-[rgb(33,38,45)] transition-colors"
    >
      <ScriptIcon script={script} size={24} radius={6} textSize="text-xs" />
      <div className="w-[260px] flex-shrink-0 min-w-0">
        <Text
          strong
          className="!text-app-primary !text-[13px] block truncate"
          title={name}
        >
          {name}
        </Text>
      </div>
      <div className="w-[140px] flex-shrink-0 min-w-0 hidden md:block">
        <Text
          type="secondary"
          className="!text-app-tertiary !text-xs block truncate"
        >
          {`@${script.username}`}
        </Text>
      </div>
      <div className="flex-1 min-w-0 hidden lg:block">
        <Text
          type="secondary"
          className="!text-app-secondary !text-xs block truncate"
          title={description}
        >
          {description}
        </Text>
      </div>
      <span className="inline-flex items-center gap-1 text-xs text-app-secondary font-medium flex-shrink-0 w-[80px] justify-end">
        <span
          className="font-bold"
          style={{ color: 'rgb(var(--primary-500))' }}
        >
          {'↓'}
        </span>
        {formatNumber(script.total_install)}
      </span>
      <span className="inline-flex items-center gap-1 text-xs text-app-secondary font-medium flex-shrink-0 w-[56px] justify-end">
        <span className="text-yellow-500">{'★'}</span>
        {score || '-'}
      </span>
      <Text
        type="secondary"
        className="!text-app-tertiary !text-xs flex-shrink-0 w-[72px] text-right hidden xl:block"
      >
        {semDataTime(script.updatetime)}
      </Text>
    </Link>
  );
}

export default function ScriptSection({
  icon,
  chipClass,
  iconClass,
  title,
  moreHref,
  scripts,
}: ScriptSectionProps) {
  const t = useTranslations('script.section');
  const cards = scripts.slice(0, 4);
  const rows = scripts.slice(4, 12);

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-[10px] flex items-center justify-center !bg-[rgb(var(--bg-tertiary))] border !border-[rgb(var(--border-primary))]">
          <div
            className={`w-[26px] h-[26px] rounded-[7px] flex items-center justify-center ${chipClass}`}
          >
            <Icon icon={icon} className={`text-base ${iconClass ?? ''}`} />
          </div>
        </div>
        <Text
          strong
          className="!text-app-primary !text-xl flex-1 min-w-0 truncate"
        >
          {title}
        </Text>
        <Link
          href={moreHref}
          className="text-sm flex items-center gap-1 whitespace-nowrap hover:gap-1.5 transition-all"
          style={{ color: 'rgb(var(--primary-500))' }}
        >
          {t('more')}
          <RightOutlined className="text-[10px]" />
        </Link>
      </div>

      {cards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {cards.map((s) => (
            <CompactCard key={s.id} script={s} />
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <Card
          className="!border-app-primary"
          styles={{ body: { padding: 0 } }}
          style={{ borderRadius: 12, overflow: 'hidden' }}
        >
          <div className="flex flex-col divide-y divide-[rgb(var(--border-secondary))]">
            {rows.map((s) => (
              <ListRow key={s.id} script={s} />
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}
