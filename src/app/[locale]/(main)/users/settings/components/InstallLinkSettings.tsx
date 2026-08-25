'use client';

import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, message, Modal, Typography } from 'antd';
import { useTranslations } from 'next-intl';

import { useRefreshInstallToken } from '@/lib/api/hooks/userSettings';

const { Paragraph } = Typography;

export default function InstallLinkSettings() {
  const [modal, contextHolder] = Modal.useModal();
  const t = useTranslations('user.install_link');
  const { refreshInstallToken, loading } = useRefreshInstallToken();

  const handleReset = () => {
    modal.confirm({
      title: t('reset_confirm_title'),
      icon: <ExclamationCircleOutlined />,
      content: t('reset_confirm_content'),
      okText: t('reset_confirm_ok'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await refreshInstallToken();
          message.success(t('reset_success'));
        } catch {
          message.error(t('reset_failed'));
        }
      },
    });
  };

  return (
    <>
      {contextHolder}
      <Card title={t('title')}>
        <Paragraph type="secondary">{t('description')}</Paragraph>
        <Alert
          type="warning"
          showIcon
          message={t('reset_warning_title')}
          description={t('reset_warning_content')}
          className="mb-4"
        />
        <Button
          danger
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={handleReset}
        >
          {t('reset')}
        </Button>
      </Card>
    </>
  );
}
