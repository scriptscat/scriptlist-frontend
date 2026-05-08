'use client';

import { Alert, Typography } from 'antd';
import { useTranslations } from 'next-intl';

interface Props {
  message: string;
}

export default function IntegrityErrorAlert({ message }: Props) {
  const t = useTranslations('errors.integrity_rejected');
  return (
    <Alert
      type="error"
      showIcon
      title={t('title')}
      description={
        <div>
          <Typography.Paragraph>{message}</Typography.Paragraph>
          <Typography.Paragraph type="secondary">
            {t('help')}
          </Typography.Paragraph>
        </div>
      }
    />
  );
}
