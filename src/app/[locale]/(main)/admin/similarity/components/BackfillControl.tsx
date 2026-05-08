'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  InputNumber,
  Modal,
  Progress,
  Space,
  Tag,
  message,
} from 'antd';
import { useTranslations } from 'next-intl';
import { similarityService } from '@/lib/api/services/similarity';
import type { BackfillStatus } from '@/lib/api/services/similarity';
import { APIError } from '@/types/api';

const POLL_INTERVAL_MS = 5000;

function formatUnix(ts: number) {
  if (!ts) return '-';
  return new Date(ts * 1000).toLocaleString();
}

export default function BackfillControl() {
  const t = useTranslations('admin.similarity');
  const [status, setStatus] = useState<BackfillStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanId, setScanId] = useState<number | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const resp = await similarityService.getBackfillStatus();
      setStatus(resp);
    } catch (err) {
      if (err instanceof APIError) message.error(err.msg);
    }
  }, []);

  // Poll every 5s while the backfill is running, stop otherwise.
  useEffect(() => {
    loadStatus();
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [loadStatus]);

  useEffect(() => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    if (status?.running) {
      pollTimer.current = setTimeout(loadStatus, POLL_INTERVAL_MS);
    }
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [status, loadStatus]);

  const trigger = useCallback(
    async (reset: boolean) => {
      setLoading(true);
      try {
        const resp = await similarityService.triggerBackfill(reset);
        setStatus(resp);
        message.success(t('backfill.msg_started'));
      } catch (err) {
        if (err instanceof APIError) message.error(err.msg);
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const confirmStart = useCallback(() => {
    Modal.confirm({
      title: t('backfill.confirm_start_title'),
      content: t('backfill.confirm_start_body'),
      onOk: () => trigger(false),
    });
  }, [t, trigger]);

  const confirmRestart = useCallback(() => {
    Modal.confirm({
      title: t('backfill.confirm_restart_title'),
      content: t('backfill.confirm_restart_body'),
      okButtonProps: { danger: true },
      onOk: () => trigger(true),
    });
  }, [t, trigger]);

  const runManualScan = useCallback(async () => {
    if (!scanId || scanId <= 0) return;
    setLoading(true);
    try {
      await similarityService.manualScan(scanId);
      message.success(t('backfill.msg_manual_scan_published'));
    } catch (err) {
      if (err instanceof APIError) message.error(err.msg);
    } finally {
      setLoading(false);
    }
  }, [scanId, t]);

  const refreshStopFp = useCallback(async () => {
    setLoading(true);
    try {
      await similarityService.refreshStopFp();
      message.success(t('backfill.msg_stop_fp_refreshed'));
    } catch (err) {
      if (err instanceof APIError) message.error(err.msg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const percent =
    status && status.total > 0
      ? Math.min(100, Math.round((status.cursor / status.total) * 100))
      : 0;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message={t('backfill.help_title')}
        description={t('backfill.help_body')}
      />
      <Card title={t('backfill.status_title')}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label={t('backfill.label_running')}>
            {status?.running ? (
              <Tag color="processing">{t('backfill.state_running')}</Tag>
            ) : (
              <Tag>{t('backfill.state_idle')}</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('backfill.label_total')}>
            {status?.total ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label={t('backfill.label_cursor')}>
            {status?.cursor ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label={t('backfill.label_progress')}>
            <Progress percent={percent} size="small" />
          </Descriptions.Item>
          <Descriptions.Item label={t('backfill.label_started_at')}>
            {formatUnix(status?.started_at ?? 0)}
          </Descriptions.Item>
          <Descriptions.Item label={t('backfill.label_finished_at')}>
            {formatUnix(status?.finished_at ?? 0)}
          </Descriptions.Item>
        </Descriptions>
        <Space style={{ marginTop: 16 }} wrap>
          <Button
            type="primary"
            loading={loading}
            disabled={status?.running}
            onClick={confirmStart}
          >
            {t('backfill.btn_start')}
          </Button>
          <Button
            danger
            loading={loading}
            disabled={status?.running}
            onClick={confirmRestart}
          >
            {t('backfill.btn_restart')}
          </Button>
          <Button onClick={loadStatus} loading={loading}>
            {t('backfill.btn_refresh')}
          </Button>
        </Space>
      </Card>

      <Card title={t('backfill.manual_scan_title')}>
        <Space wrap>
          <InputNumber
            placeholder={t('backfill.manual_scan_placeholder')}
            value={scanId ?? undefined}
            onChange={(v) => setScanId(typeof v === 'number' ? v : null)}
            min={1}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            loading={loading}
            disabled={!scanId || scanId <= 0}
            onClick={runManualScan}
          >
            {t('backfill.btn_manual_scan')}
          </Button>
        </Space>
      </Card>

      <Card title={t('backfill.stop_fp_title')}>
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message={t('backfill.stop_fp_warn_title')}
          description={t('backfill.stop_fp_warn_body')}
        />
        <Button loading={loading} onClick={refreshStopFp}>
          {t('backfill.btn_stop_fp_refresh')}
        </Button>
      </Card>
    </Space>
  );
}
