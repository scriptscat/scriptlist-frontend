'use client';

import { useState } from 'react';
import { Tabs } from 'antd';
import { useTranslations } from 'next-intl';
import PairsTable from './PairsTable';
import SuspectsTable from './SuspectsTable';
import IntegrityReviewTable from './IntegrityReviewTable';
import IntegrityWhitelistTable from './IntegrityWhitelistTable';
import PairWhitelistTable from './PairWhitelistTable';

export default function SimilarityDashboardClient() {
  const t = useTranslations('admin.similarity');
  const [activeKey, setActiveKey] = useState('pairs');

  return (
    <Tabs
      activeKey={activeKey}
      onChange={setActiveKey}
      items={[
        { key: 'pairs', label: t('tab_pairs'), children: <PairsTable /> },
        {
          key: 'suspects',
          label: t('tab_suspects'),
          children: <SuspectsTable />,
        },
        {
          key: 'reviews',
          label: t('tab_integrity_reviews'),
          children: <IntegrityReviewTable />,
        },
        {
          key: 'pair-whitelist',
          label: t('tab_pair_whitelist'),
          children: <PairWhitelistTable />,
        },
        {
          key: 'int-whitelist',
          label: t('tab_integrity_whitelist'),
          children: <IntegrityWhitelistTable />,
        },
      ]}
    />
  );
}
