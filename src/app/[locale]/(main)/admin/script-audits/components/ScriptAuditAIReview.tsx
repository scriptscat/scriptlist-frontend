'use client';

import { useMemo } from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import { selectLocalizedSummary } from '@/app/[locale]/(main)/script-show-page/[id]/localizedSummary';
import { Link } from '@/i18n/routing';
import { useScriptAuditAIReview } from '@/lib/api/hooks/useAIReviews';
import type { AIReviewStatus } from '@/lib/api/services/aiReview';

interface RiskSignal {
  name?: string;
  severity?: string;
  evidence_line?: number | null;
}

const STATUS_TAG_COLORS: Record<number, string> = {
  1: 'green',
  2: 'red',
  3: 'orange',
  4: 'red',
  5: 'default',
};

const STATUS_LABEL_KEYS: Record<number, string> = {
  0: 'ai_review_card_running',
  1: 'ai_review_card_pass',
  2: 'ai_review_card_reject',
  3: 'ai_review_card_uncertain',
  4: 'ai_review_card_failed',
  5: 'ai_review_card_skipped',
};

const SEVERITY_COLORS: Record<string, string> = {
  high: '#cf222e',
  medium: '#bf8700',
  low: '#1a7f37',
};

function parseJSONList<T>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function formatLatency(latencyMs: number): string {
  return `${(latencyMs / 1000).toFixed(2)}s`;
}

function severityDotColor(severity: string | undefined): string {
  if (!severity) return '#8c959f';
  return SEVERITY_COLORS[severity.toLowerCase()] ?? '#8c959f';
}

interface ScriptAuditAIReviewProps {
  auditId: number;
  onTrigger: () => void;
  triggering?: boolean;
}

/**
 * 审核详情抽屉顶部的 AI 审核结论卡。
 *
 * 只读展示：即使 AI 判定 pass 也**不会**自动通过审核，仍由管理员确认后手动点「通过」。
 */
export default function ScriptAuditAIReview({
  auditId,
  onTrigger,
  triggering,
}: ScriptAuditAIReviewProps) {
  const t = useTranslations('admin.script_audits');
  const locale = useLocale();
  const { aiReview, isLoading, error, pollingStopped, refresh } =
    useScriptAuditAIReview(auditId);

  const riskSignals = useMemo(
    () => parseJSONList<RiskSignal>(aiReview?.risk_signals),
    [aiReview?.risk_signals],
  );

  if (isLoading) {
    return (
      <Card size="small">
        <Space>
          <Spin size="small" />
          <span>{t('ai_review_card_running')}</span>
        </Space>
      </Card>
    );
  }

  if (!aiReview) {
    return (
      <Card size="small" title={t('ai_review_card_title')}>
        <Space orientation="vertical" className="w-full">
          <Typography.Text type="secondary">
            {error ? t('ai_review_card_timeout') : t('ai_review_card_empty')}
          </Typography.Text>
          <Space>
            <Button onClick={onTrigger} loading={triggering} type="primary">
              {t('action_ai_review')}
            </Button>
            <Button onClick={refresh}>{t('refresh')}</Button>
          </Space>
        </Space>
      </Card>
    );
  }

  const status: AIReviewStatus = aiReview.status;
  const statusLabel = t(STATUS_LABEL_KEYS[status] ?? 'ai_review_card_skipped');
  const summary = aiReview.summary
    ? selectLocalizedSummary(aiReview.summary, locale)
    : '';

  return (
    <Card
      size="small"
      title={
        <Space wrap>
          <span>{t('ai_review_card_title')}</span>
          {status === 0 ? (
            <Space size={4}>
              <Spin size="small" />
              <span>{statusLabel}</span>
            </Space>
          ) : (
            <Tag color={STATUS_TAG_COLORS[status] ?? 'default'}>
              {statusLabel}
            </Tag>
          )}
          {pollingStopped && status === 0 && (
            <Space size={4}>
              <Typography.Text type="warning">
                {t('ai_review_card_timeout')}
              </Typography.Text>
              <Button size="small" onClick={refresh}>
                {t('refresh')}
              </Button>
            </Space>
          )}
        </Space>
      }
      extra={
        <Space size={8} wrap>
          <Typography.Text type="secondary">
            {t('ai_review_card_updated_at')}
            {': '}
            {new Date(aiReview.updatetime * 1000).toLocaleString()}
          </Typography.Text>
          {aiReview.model && (
            <Typography.Text type="secondary">{aiReview.model}</Typography.Text>
          )}
          {aiReview.latency_ms > 0 && (
            <Typography.Text type="secondary">
              {formatLatency(aiReview.latency_ms)}
            </Typography.Text>
          )}
        </Space>
      }
    >
      <Space orientation="vertical" size={12} className="w-full">
        {status === 1 && (
          <Alert
            type="success"
            showIcon
            title={t('ai_review_card_pass_hint')}
          />
        )}

        {status === 4 && (
          <>
            {aiReview.last_error && (
              <pre className="whitespace-pre-wrap text-xs font-mono bg-gray-50 dark:bg-zinc-800 p-2 rounded m-0">
                {aiReview.last_error}
              </pre>
            )}
            <Button onClick={onTrigger} loading={triggering} size="small">
              {t('ai_review_card_retry')}
            </Button>
          </>
        )}

        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label={t('ai_review_card_reason')}>
            <Typography.Paragraph className="!mb-0" copyable>
              {aiReview.reason || '-'}
            </Typography.Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label={t('ai_review_card_summary')}>
            {summary || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('ai_review_card_tags')}>
            {aiReview.tags.length ? (
              <Space wrap>
                {aiReview.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('ai_review_card_signals')}>
            {riskSignals.length ? (
              <Space orientation="vertical" size={4} className="w-full">
                {riskSignals.map((signal, index) => (
                  <div
                    key={`${signal.name ?? 'signal'}-${index}`}
                    className="flex items-center gap-2"
                  >
                    <span
                      aria-hidden
                      className="inline-block w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: severityDotColor(signal.severity),
                      }}
                    />
                    <span>{signal.name || '-'}</span>
                    {signal.severity && (
                      <Typography.Text type="secondary">
                        {signal.severity}
                      </Typography.Text>
                    )}
                    {signal.evidence_line ? (
                      <Typography.Text type="secondary">
                        {`@ L${signal.evidence_line}`}
                      </Typography.Text>
                    ) : null}
                  </div>
                ))}
              </Space>
            ) : (
              '-'
            )}
          </Descriptions.Item>
        </Descriptions>

        {aiReview.admin_note && (
          <div>
            <Typography.Text type="secondary">
              {t('ai_review_card_note')}
            </Typography.Text>
            <div className="mt-1 border-l-2 border-solid border-[#d8c2f7] pl-3 whitespace-pre-wrap text-sm">
              {aiReview.admin_note}
            </div>
          </div>
        )}

        <Link href="/admin/ai-review" className="text-sm">
          {t('ai_review_card_view_records')}
        </Link>
      </Space>
    </Card>
  );
}
