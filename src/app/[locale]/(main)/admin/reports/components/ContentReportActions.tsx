'use client';

import { useState } from 'react';
import { Button, Popconfirm, message } from 'antd';
import { useTranslations } from 'next-intl';
import { useContentReportActions } from '@/lib/api/hooks/admin';
import { APIError } from '@/types/api';
import type { AdminContentReportDetail } from '@/types/api';
import {
  buildHandleBody,
  drawerActionsFor,
  type DrawerAction,
} from './drawerActions';

interface ContentReportActionsProps {
  detail: AdminContentReportDetail;
  /** 处理备注（由抽屉正文的输入框持有） */
  note: string;
  /** 成功后调用：关闭抽屉 */
  onDone: () => void;
}

/** 抽屉底部操作区：待处理 → 驳回 / 标记已处理 / 删除内容并结案；已结案 → 重新打开。 */
export default function ContentReportActions({
  detail,
  note,
  onDone,
}: ContentReportActionsProps) {
  const t = useTranslations('admin.reports.content');
  const actions = useContentReportActions();
  const [busy, setBusy] = useState<DrawerAction | null>(null);

  const run = async (action: DrawerAction) => {
    setBusy(action);
    try {
      if (action === 'reopen') {
        await actions.reopen(detail.id);
      } else {
        await actions.handle(detail.id, buildHandleBody(action, note));
      }
      message.success(t('action_success'));
      onDone();
    } catch (err) {
      // 失败：抽屉与备注保持原样，只提示错误
      message.error(err instanceof APIError ? err.msg : t('action_failed'));
    } finally {
      setBusy(null);
    }
  };

  const props = (action: DrawerAction) => ({
    loading: busy === action,
    disabled: busy !== null && busy !== action,
  });

  return (
    <div className="flex justify-end gap-2">
      {drawerActionsFor(detail.status).map((action) => {
        if (action === 'delete') {
          return (
            <Popconfirm
              key={action}
              title={t('delete_confirm_title')}
              description={t('delete_confirm_desc')}
              okText={t('action_delete')}
              okButtonProps={{ danger: true }}
              onConfirm={() => run('delete')}
              disabled={busy !== null}
            >
              <Button type="primary" danger {...props('delete')}>
                {t('action_delete')}
              </Button>
            </Popconfirm>
          );
        }
        return (
          <Button
            key={action}
            {...props(action)}
            onClick={() => void run(action)}
          >
            {t(`action_${action}`)}
          </Button>
        );
      })}
    </div>
  );
}
