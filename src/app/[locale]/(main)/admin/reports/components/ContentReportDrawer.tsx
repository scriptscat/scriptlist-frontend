'use client';

import type { ReactNode } from 'react';
import {
  Button,
  Drawer,
  Empty,
  Input,
  Rate,
  Skeleton,
  Tag,
  Typography,
} from 'antd';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAdminContentReport } from '@/lib/api/hooks/admin';
import type { AdminContentReportDetail } from '@/types/api';
import { CONTENT_REPORT_NOTE_MAX } from './drawerActions';
import { REPORT_STATUS_COLORS, TARGET_TYPE_COLORS } from './contentReportView';
import { buildContentReportOriginHref } from './reportTabs';

interface ContentReportDrawerProps {
  /** null = 抽屉关闭 */
  reportId: number | null;
  onClose: () => void;
  /**
   * 操作区插槽（删除 / 标记已处理 / 驳回 / 重新打开按钮）。
   * 详情加载成功后渲染在抽屉底部；不传则无底部栏。
   */
  footer?: (detail: AdminContentReportDetail) => ReactNode;
  /** 待处理时正文底部的处理备注输入（受控，由父组件持有以便 footer 读取） */
  note?: string;
  onNoteChange?: (note: string) => void;
}

const formatTime = (sec: number) => new Date(sec * 1000).toLocaleString();

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 py-1">
      <span className="w-20 shrink-0 text-[rgb(var(--text-secondary))]">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default function ContentReportDrawer({
  reportId,
  onClose,
  footer,
  note = '',
  onNoteChange,
}: ContentReportDrawerProps) {
  const t = useTranslations('admin.reports');
  const tReason = useTranslations('components.contentReport');
  const { data, isLoading, error, refresh } = useAdminContentReport(reportId);

  const body = (d: AdminContentReportDetail) => {
    const closed = d.status !== 1;
    const resultKey =
      d.handle_result || (d.status === 2 ? 'resolved' : 'rejected');
    return (
      <>
        <Row label={t('content.col_type')}>
          <Tag color={TARGET_TYPE_COLORS[d.target_type]}>
            {t(`content.type_${d.target_type}`)}
          </Tag>
          {d.target_type === 'score' && (
            <Rate disabled value={d.snapshot.score / 10} />
          )}
        </Row>
        <Row label={t('col_script')}>
          <Link href={`/script-show-page/${d.script_id}`} target="_blank">
            {d.script_name || `#${d.script_id}`}
          </Link>
          {!d.target_deleted && (
            <Link
              className="ml-2"
              href={buildContentReportOriginHref(d)}
              target="_blank"
            >
              {t('content.view_origin')}
            </Link>
          )}
        </Row>
        <Row label={t('content.col_author')}>
          <Link href={`/users/${d.author_id}`} target="_blank">
            {d.author_name}
          </Link>
          <span className="ml-2 text-[rgb(var(--text-secondary))]">
            {t('content.published_at', {
              time: formatTime(d.snapshot.createtime),
            })}
          </span>
        </Row>
        <Row label={t('col_status')}>
          <Tag color={REPORT_STATUS_COLORS[d.status]}>
            {t(`content.status_${d.status}`)}
          </Tag>
          {closed && <span>{t(`content.result_${resultKey}`)}</span>}
        </Row>
        {closed && (
          <>
            <Row label={t('content.handler')}>
              {d.handler_name}
              <span className="ml-2 text-[rgb(var(--text-secondary))]">
                {formatTime(d.handletime)}
              </span>
            </Row>
            <Row label={t('content.handle_note')}>
              {d.handle_note || t('content.no_note')}
            </Row>
          </>
        )}

        <h4 className="mt-4 mb-2 font-semibold">{t('content.snapshot')}</h4>
        {/* 纯文本 + pre-wrap 保留换行；绝不当 HTML 渲染 */}
        <div className="rounded border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))] p-3 break-words whitespace-pre-wrap">
          {d.target_deleted && (
            <Typography.Text type="secondary" className="mb-1 block">
              {t('content.target_deleted')}
            </Typography.Text>
          )}
          {d.snapshot.title && (
            <div className="mb-1 font-semibold">{d.snapshot.title}</div>
          )}
          {d.snapshot.content}
        </div>

        <h4 className="mt-4 mb-2 font-semibold">
          {t('content.records', { count: d.reports.length })}
        </h4>
        <ul className="m-0 list-none p-0">
          {d.reports.map((r) => (
            <li key={r.id} className="mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/users/${r.user_id}`} target="_blank">
                  {r.username}
                </Link>
                <Tag>{tReason(`reasons.${r.reason}.name`)}</Tag>
                <span className="text-[rgb(var(--text-secondary))]">
                  {formatTime(r.createtime)}
                </span>
              </div>
              <div className="whitespace-pre-wrap break-words">
                {r.content || (
                  <span className="text-[rgb(var(--text-secondary))]">
                    {t('content.no_note')}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        {!closed && onNoteChange && (
          <>
            <h4 className="mt-4 mb-2 font-semibold">
              {t('content.handle_note')}
              <span className="ml-2 font-normal text-[rgb(var(--text-secondary))]">
                {t('content.note_hint')}
              </span>
            </h4>
            <Input.TextArea
              aria-label={t('content.handle_note')}
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              maxLength={CONTENT_REPORT_NOTE_MAX}
              showCount
              autoSize={{ minRows: 3, maxRows: 8 }}
              placeholder={t('content.note_placeholder')}
            />
          </>
        )}
      </>
    );
  };

  return (
    <Drawer
      open={reportId !== null}
      onClose={onClose}
      size={560}
      title={t('content.drawer_title', { id: reportId ?? '' })}
      destroyOnHidden
      footer={data && footer ? footer(data) : undefined}
    >
      <div aria-busy={isLoading}>
        {isLoading && <Skeleton active paragraph={{ rows: 8 }} />}
        {!isLoading && error && (
          <div role="alert">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('content.load_failed')}
            >
              <Button size="small" onClick={refresh}>
                {t('content.retry')}
              </Button>
            </Empty>
          </div>
        )}
        {data && body(data)}
      </div>
    </Drawer>
  );
}
