'use client';

import { Button, Card, Descriptions, Empty, message, Space, Tag } from 'antd';
import { useTranslations } from 'next-intl';
import { usePairDetail } from '@/lib/api/hooks/similarity';
import { similarityService } from '@/lib/api/services/similarity';
import { ListSkeleton } from '@/components/ui/ListSkeleton';
import { LoadingBlock } from '@/components/ui/LoadingBlock';
import { APIError } from '@/types/api';
import CodeDiffViewer from './CodeDiffViewer';

interface Props {
  pairID: number;
  source: 'admin' | 'evidence';
}

/** `CodeDiffViewer` 内部固定 600px 高，加载态按同一高度预留，数据到达时不跳。 */
const DIFF_VIEWER_HEIGHT = 600;

export default function PairDetailClient({ pairID, source }: Props) {
  const t = useTranslations('admin.similarity');
  const tLoading = useTranslations('components.loading');
  const { detail, isLoading, error, refresh } = usePairDetail(pairID, source);

  const whitelist = async () => {
    try {
      await similarityService.addPairWhitelist(pairID, 'admin whitelist');
      message.success(t('msg_whitelisted'));
      refresh();
    } catch (err) {
      if (err instanceof APIError) message.error(err.msg);
    }
  };

  if (isLoading) {
    // 真实内容是「一张 Descriptions 卡片 + 一个 600px 的代码 diff」，
    // 泛泛的三行 Skeleton 会让 diff 落地时整页往下窜一大截。
    return (
      <div className="space-y-4">
        <ListSkeleton count={2} rows={4} />
        <LoadingBlock
          height={DIFF_VIEWER_HEIGHT}
          variant="spinner"
          label={tLoading('code')}
        />
      </div>
    );
  }

  // 取数失败时原本 `return null`：免责声明底下整页空白，只有一条 3 秒的 toast。
  if (error || !detail) {
    return (
      <Card>
        <div role="alert">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={tLoading('failed')}
          >
            <Button type="primary" onClick={refresh}>
              {tLoading('retry')}
            </Button>
          </Empty>
        </div>
      </Card>
    );
  }

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
            {detail.script_a.name}
            {' @ '}
            {detail.script_a.version}
          </Descriptions.Item>
          <Descriptions.Item label={t('label_script_b')}>
            {detail.script_b.name}
            {' @ '}
            {detail.script_b.version}
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
