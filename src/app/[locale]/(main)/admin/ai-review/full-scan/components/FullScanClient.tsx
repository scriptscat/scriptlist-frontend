'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Descriptions,
  InputNumber,
  Space,
  Tag,
  message,
} from 'antd';
import { useTranslations } from 'next-intl';
import { useFullScanStatus } from '@/lib/api/hooks/useAIReviews';
import { aiReviewService } from '@/lib/api/services/aiReview';
import { APIError } from '@/types/api';

export default function FullScanClient() {
  const t = useTranslations('admin.ai_review.fullscan');
  const { data: status, mutate } = useFullScanStatus(3000);
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [reset, setReset] = useState(false);
  const [startID, setStartID] = useState<number | null>(null);
  const [endID, setEndID] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const trigger = async () => {
    setSubmitting(true);
    try {
      await aiReviewService.triggerFullScan(reset, onlyMissing, {
        start_id: startID || undefined,
        end_id: endID || undefined,
        limit: limit || undefined,
      });
      message.success(t('triggered'));
      mutate();
    } catch (err) {
      message.error(err instanceof APIError ? err.msg : t('triggered'));
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async () => {
    setSubmitting(true);
    try {
      await aiReviewService.cancelFullScan();
      message.success(t('cancelled'));
      mutate();
    } catch (err) {
      message.error(err instanceof APIError ? err.msg : t('cancelled'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title={t('title')}>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label={t('running')}>
          {status?.running ? (
            <Tag color="processing">{t('yes')}</Tag>
          ) : (
            <Tag>{t('no')}</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t('processed')}>
          {`${status?.processed ?? 0} / ${status?.total ?? 0}`}
        </Descriptions.Item>
        <Descriptions.Item label={t('last_id')}>
          {status?.last_id ?? 0}
        </Descriptions.Item>
        <Descriptions.Item label={t('scope')}>
          {status?.start_id || status?.end_id || status?.limit
            ? t('scope_value', {
                start: status.start_id || 0,
                end: status.end_id || 0,
                limit: status.limit || 0,
              })
            : t('scope_all')}
        </Descriptions.Item>
        <Descriptions.Item label={t('started_at')}>
          {status?.started_at
            ? new Date(status.started_at * 1000).toLocaleString()
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item label={t('recent_errs')}>
          {status?.recent_errs?.length ? (
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {status.recent_errs.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : (
            '-'
          )}
        </Descriptions.Item>
      </Descriptions>
      <Space style={{ marginTop: 16 }} wrap>
        <InputNumber
          min={1}
          precision={0}
          value={startID}
          onChange={setStartID}
          placeholder={t('start_id')}
          style={{ width: 160 }}
        />
        <InputNumber
          min={1}
          precision={0}
          value={endID}
          onChange={setEndID}
          placeholder={t('end_id')}
          style={{ width: 160 }}
        />
        <InputNumber
          min={1}
          precision={0}
          value={limit}
          onChange={setLimit}
          placeholder={t('limit')}
          style={{ width: 180 }}
        />
        <Checkbox
          checked={onlyMissing}
          onChange={(e) => setOnlyMissing(e.target.checked)}
        >
          {t('only_missing')}
        </Checkbox>
        <Checkbox checked={reset} onChange={(e) => setReset(e.target.checked)}>
          {t('reset_cursor')}
        </Checkbox>
        <Button
          type="primary"
          onClick={trigger}
          disabled={status?.running || submitting}
          loading={submitting}
        >
          {t('trigger')}
        </Button>
        <Button
          danger
          onClick={cancel}
          disabled={!status?.running || submitting}
        >
          {t('cancel')}
        </Button>
      </Space>
    </Card>
  );
}
