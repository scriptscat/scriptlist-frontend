'use client';

import { Avatar, Card, Tag } from 'antd';
import {
  CalendarOutlined,
  DownloadOutlined,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import ScriptIcon from '@/components/ScriptIcon';
import { formatCompactNumber, useSemDateTime } from '@/lib/utils/semdate';
import { hashColor } from '@/lib/utils/utils';
import { ScriptUtils } from '../utils';
import type { ScriptInfoMeta } from '../types';

interface ScriptDetailMobileHeaderProps {
  script: ScriptInfoMeta;
  /** 按当前语言解析后的名称与简介（与桌面头部同源）。 */
  name: string;
  description: string;
}

/**
 * 详情页 < lg 的头部（方案 B，与列表卡片同款）：图标 + 名称 + 评分、版本 + 作者、
 * 近 24 小时安装，下半部分是可展开的简介、标签和「总安装量 · 更新于 · 创建于」底栏。
 * ≥ lg 隐藏，桌面端继续使用原头部卡与侧栏统计卡。
 */
export default function ScriptDetailMobileHeader({
  script,
  name,
  description,
}: ScriptDetailMobileHeaderProps) {
  const t = useTranslations('script.detail');
  const semDateTime = useSemDateTime();
  const score = ScriptUtils.score(script.score, script.score_num);

  const descRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  // 简介超过 3 行（被截断）时才需要「展开」；展开后保留按钮用于收起。
  const [clamped, setClamped] = useState(false);
  useEffect(() => {
    const el = descRef.current;
    if (!el || expanded) return;
    const measure = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded, description]);

  return (
    <Card
      data-testid="script-mobile-header"
      className="shadow-sm lg:hidden"
      classNames={{ body: '!p-4' }}
    >
      <div className="flex items-start gap-3">
        <ScriptIcon
          script={script}
          name={name}
          size={48}
          radius={8}
          textSize="text-xl"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h2 className="m-0 min-w-0 flex-1 break-words text-lg font-semibold leading-snug text-app-primary">
              {name}
            </h2>
            <span
              data-testid="mobile-header-rating"
              className="flex flex-none items-center gap-1 font-semibold text-yellow-500 tabular-nums"
              title={t('stats.user_rating')}
            >
              <StarOutlined />
              {score || '-'}
            </span>
          </div>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
            <Tag color="red" variant="outlined" className="!m-0">
              {'v' + script.script.version}
            </Tag>
            <Link
              href={`/users/${script.user_id}`}
              target="_blank"
              className="flex min-w-0 items-center gap-1.5"
            >
              <Avatar
                size={20}
                src={script.avatar}
                icon={<UserOutlined />}
                className="flex-shrink-0"
              />
              <span className="truncate text-sm text-app-secondary">
                {script.username}
              </span>
            </Link>
          </div>
          <div
            data-testid="mobile-header-today"
            className="mt-1 flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 flex-none rounded-full bg-green-500"
            />
            <span>{t('stats.today_installs')}</span>
            <span className="tabular-nums">
              {'+' + formatCompactNumber(script.today_install)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <p
          ref={descRef}
          data-testid="mobile-header-description"
          className={`m-0 break-words text-sm leading-relaxed text-app-secondary ${expanded ? '' : 'line-clamp-3'}`}
        >
          {description}
        </p>
        {(clamped || expanded) && (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex min-h-8 cursor-pointer items-center border-0 bg-transparent p-0 text-sm text-[rgb(var(--primary-500))] hover:text-[rgb(var(--primary-600))] focus-visible:outline-2 focus-visible:outline-[rgb(var(--border-focus))]"
          >
            {expanded ? t('info.collapse') : t('info.expand')}
          </button>
        )}
      </div>

      {(script.category || script.tags.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {script.category && (
            <Tag color={hashColor(script.category.name)} className="!m-0">
              {script.category.name}
            </Tag>
          )}
          {script.tags.map((tag) => (
            <Tag
              key={tag.id}
              color={hashColor(tag.name)}
              variant="filled"
              className="!m-0"
            >
              {'#' + tag.name}
            </Tag>
          ))}
        </div>
      )}

      {/* 底栏：每一项不折行，只在「·」处换行 */}
      <div
        data-testid="mobile-header-footer"
        className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-app-secondary pt-3 text-xs text-app-secondary"
      >
        <span className="whitespace-nowrap">
          <DownloadOutlined className="mr-1" />
          <span className="mr-1 text-sm font-semibold text-app-primary tabular-nums">
            {formatCompactNumber(script.total_install)}
          </span>
          {t('stats.total_installs')}
        </span>
        <span aria-hidden="true">{'·'}</span>
        <span className="whitespace-nowrap">
          <CalendarOutlined className="mr-1" />
          {t('info.updated_at', { time: semDateTime(script.updatetime) })}
        </span>
        <span aria-hidden="true">{'·'}</span>
        <span className="whitespace-nowrap">
          {t('info.created_at', { time: semDateTime(script.createtime) })}
        </span>
      </div>
    </Card>
  );
}
