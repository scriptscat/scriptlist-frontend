'use client';

import { Alert } from 'antd';
import { useTranslations } from 'next-intl';
import PairDetailClient from '@/components/similarity/PairDetailClient';

export default function EvidencePageClient({ pairID }: { pairID: number }) {
  const t = useTranslations('similarity.evidence');
  return (
    <div className="space-y-4">
      <Alert
        type="warning"
        title={t('disclaimer_title')}
        description={t('disclaimer_body')}
      />
      <PairDetailClient pairID={pairID} source="evidence" />
    </div>
  );
}
