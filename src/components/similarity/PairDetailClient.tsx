'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  message,
  Skeleton,
  Space,
  Tag,
} from 'antd';
import { useTranslations } from 'next-intl';
import { similarityService } from '@/lib/api/services/similarity';
import type { PairDetail } from '@/lib/api/services/similarity';
import { APIError } from '@/types/api';
import CodeDiffViewer from './CodeDiffViewer';

interface Props {
  pairID: number;
  source: 'admin' | 'evidence';
}

export default function PairDetailClient({ pairID, source }: Props) {
  const t = useTranslations('admin.similarity');
  const [detail, setDetail] = useState<PairDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp =
        source === 'admin'
          ? await similarityService.getPairDetail(pairID)
          : await similarityService.getEvidencePair(pairID);
      setDetail(resp.detail);
    } catch (err) {
      if (err instanceof APIError) message.error(err.msg);
    } finally {
      setLoading(false);
    }
  }, [pairID, source]);

  useEffect(() => {
    load();
  }, [load]);

  const whitelist = async () => {
    try {
      await similarityService.addPairWhitelist(pairID, 'admin whitelist');
      message.success(t('msg_whitelisted'));
      load();
    } catch (err) {
      if (err instanceof APIError) message.error(err.msg);
    }
  };

  if (loading) return <Skeleton active />;
  if (!detail) return null;

  return (
    <div className="space-y-4">
      <Card>
        <Descriptions column={2} size="small">
          <Descriptions.Item label={t('label_jaccard')}>
            {detail.jaccard.toFixed(3)}
          </Descriptions.Item>
          <Descriptions.Item label={t('label_common')}>
            {detail.common_count}
          </Descriptions.Item>
          <Descriptions.Item label={t('label_earlier')}>
            <Tag color="blue">{detail.earlier_side}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('label_detected_at')}>
            {new Date(detail.detected_at * 1000).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label={t('label_script_a')}>
            {detail.script_a.name} @ {detail.script_a.version}
          </Descriptions.Item>
          <Descriptions.Item label={t('label_script_b')}>
            {detail.script_b.name} @ {detail.script_b.version}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      {source === 'admin' && detail.admin_actions && (
        <Space>
          <Button
            type="primary"
            onClick={whitelist}
            disabled={!detail.admin_actions.can_whitelist}
          >
            {t('action_whitelist')}
          </Button>
        </Space>
      )}
      <Card title={t('label_code_diff')}>
        <CodeDiffViewer
          codeA={detail.code_a}
          codeB={detail.code_b}
          segments={detail.match_segments}
        />
      </Card>
    </div>
  );
}
