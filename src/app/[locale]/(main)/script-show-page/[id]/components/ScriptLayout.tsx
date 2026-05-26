'use client';

import { useState } from 'react';
import { Alert, Button, message, Popconfirm } from 'antd';
import type { ScriptInfoMeta } from '../types';
import ScriptNavigation from './ScriptNavigation';
import { useTranslations } from 'next-intl';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from '@/i18n/routing';
import { adminService } from '@/lib/api/services/admin';
import { APIError } from '@/types/api';

interface ScriptLayoutProps {
  script: ScriptInfoMeta;
  activeTab: string;
  children: React.ReactNode;
}

export default function ScriptLayout({
  script,
  activeTab,
  children,
}: ScriptLayoutProps) {
  const t = useTranslations('script');
  const { user } = useUser();
  const router = useRouter();
  const [restoring, setRestoring] = useState(false);

  const isDeleted = script.status !== 1;
  const isAdmin = !!user && user.is_admin >= 1;
  const showDeletedAlert = isDeleted && isAdmin;

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await adminService.restoreScript(script.id);
      message.success(t('alerts.deleted_restore_success'));
      router.refresh();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('alerts.deleted_restore_failed'));
      }
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div>
      {showDeletedAlert && (
        <Alert
          message={t('alerts.deleted_title')}
          description={t('alerts.deleted_description')}
          type="error"
          className="!mb-3"
          showIcon
          action={
            <Popconfirm
              title={t('alerts.deleted_restore_confirm')}
              onConfirm={handleRestore}
            >
              <Button size="small" type="primary" loading={restoring}>
                {t('alerts.deleted_restore_button')}
              </Button>
            </Popconfirm>
          }
        />
      )}

      {script.archive == 1 && (
        <Alert
          message={t('alerts.archived_title')}
          description={t('alerts.archived_description')}
          type="warning"
          className="!mb-3"
          showIcon
          closable
        />
      )}

      {script.danger == 1 && (
        <Alert
          message={t('alerts.obfuscated_title')}
          description={t('alerts.obfuscated_description')}
          type="error"
          showIcon
          closable
        />
      )}

      {/* 脚本导航 */}
      <div className="mb-3">
        <ScriptNavigation activeKey={activeTab} />
      </div>

      {/* 页面内容 */}
      {children}
    </div>
  );
}
