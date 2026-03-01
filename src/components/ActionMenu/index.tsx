'use client';

import { useState, useMemo } from 'react';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  FileExclamationOutlined,
} from '@ant-design/icons';
import { Dropdown, Modal, Select, Space, Input, message } from 'antd';
import { useUser } from '@/contexts/UserContext';
import { useTranslations } from 'next-intl';

const { TextArea } = Input;

export type MenuItemKey = 'delete';

export type DeleteLevel = 'admin' | 'super_moderator' | 'moderator';

export interface ActionMenuProps {
  children: React.ReactNode;
  uid: number | number[];
  deleteLevel: DeleteLevel; // 删除等级 管理员 超级版主 版主
  allowSelfDelete: boolean; // 允许自己删除
  onDeleteClick: (reason?: string) => void;
  // 处罚
  punish?: boolean;
  onPunishClick?: () => void;
  // 举报
  scriptId?: number;
  onReportClick?: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  children,
  deleteLevel,
  allowSelfDelete,
  uid,
  onDeleteClick,
  punish,
  onPunishClick,
  scriptId,
  onReportClick,
}) => {
  const user = useUser();
  const t = useTranslations('common');
  const authorMap = useMemo(() => {
    const map = new Map<number, boolean>();
    if (uid instanceof Array) {
      uid.forEach((v) => map.set(v, true));
    } else {
      map.set(uid, true);
    }
    return map;
  }, [uid]);

  const [modal, contextHolder] = Modal.useModal();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReasonType, setDeleteReasonType] = useState<string>('none');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 是否是管理员删除他人内容
  const isAdminDeleteOthers = useMemo(() => {
    if (!user.user) return false;
    return user.user.is_admin === 1 && !authorMap.has(user.user.user_id);
  }, [user.user, authorMap]);

  const items = [];

  if (user.user) {
    // 判断用户等级是否为管理员 或者 允许作者删除
    if (
      (user.user.is_admin > 0 &&
        (user.user.is_admin === 1 ||
          (deleteLevel === 'super_moderator' && user.user.is_admin <= 2) ||
          (deleteLevel === 'moderator' && user.user.is_admin <= 3))) ||
      (allowSelfDelete && authorMap.has(user.user.user_id))
    ) {
      items.push({
        label: (
          <Space className="anticon-middle">
            <DeleteOutlined />
            <span>{t('delete')}</span>
          </Space>
        ),
        key: 'delete',
      });

      if (punish) {
        // items.push({
        //   label: (
        //     <Space className="anticon-middle">
        //       <ExclamationCircleOutlined />
        //       <span>{t('punish')}</span>
        //     </Space>
        //   ),
        //   key: 'punish',
        // });
      }
    }
  }

  if (!user.user || !authorMap.has(user.user.user_id)) {
    items.push({
      label: (
        <Space className="anticon-middle">
          <FileExclamationOutlined />
          <span>{t('report')}</span>
        </Space>
      ),
      key: 'report',
    });
  }

  // 获取最终的删除理由
  const getFinalReason = () => {
    const reasonMap: Record<string, string> = {
      none: '',
      violation: t('admin_delete_reason_violation'),
      malicious: t('admin_delete_reason_malicious'),
      copyright: t('admin_delete_reason_copyright'),
      spam: t('admin_delete_reason_spam'),
      custom: deleteReason,
    };
    return reasonMap[deleteReasonType] || '';
  };

  const handleAdminDeleteOk = async () => {
    setDeleteLoading(true);
    try {
      await onDeleteClick(getFinalReason() || undefined);
      setDeleteModalOpen(false);
      setDeleteReasonType('none');
      setDeleteReason('');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {contextHolder}
      <Dropdown
        menu={{
          items: items,
          onClick: (value) => {
            if (value.key === 'report') {
              if (!user.user) {
                message.warning(t('login_required'));
                return;
              }
              if (onReportClick) {
                onReportClick();
              } else if (scriptId) {
                window.open(
                  `/script-show-page/${scriptId}/report/create`,
                  '_blank',
                );
              }
            } else if (value.key === 'punish') {
              modal.confirm({
                title: t('confirm_punish'),
                content: (
                  <Space
                    direction="vertical"
                    style={{
                      width: '100%',
                    }}
                  >
                    <span>{t('select_punish_option')}</span>
                    <Select defaultValue="lucy" style={{ width: '100%' }}>
                      {/* <Option value="jack">Jack</Option>
                      <Option value="lucy">Lucy</Option>
                      <Option value="disabled" disabled>
                        Disabled
                      </Option>
                      <Option value="Yiminghe">yiminghe</Option> */}
                    </Select>
                    <span>{t('punish_reason')}</span>
                    <TextArea
                      rows={2}
                      style={{ width: '100%', border: '1px solid #444' }}
                    />
                  </Space>
                ),
                icon: <ExclamationCircleOutlined />,
                okText: t('confirm'),
                cancelText: t('cancel'),
                maskClosable: true,
                onOk: () => {
                  onPunishClick?.();
                },
              });
            } else if (isAdminDeleteOthers) {
              // 管理员删除他人内容: 显示带理由选择的 Modal
              setDeleteModalOpen(true);
            } else {
              // 普通用户删除自己的内容: 简单确认框
              modal.confirm({
                title: t('confirm_delete'),
                content: t('delete_warning'),
                icon: <ExclamationCircleOutlined />,
                okText: t('confirm'),
                cancelText: t('cancel'),
                maskClosable: true,
                onOk: () => {
                  onDeleteClick();
                },
              });
            }
          },
        }}
      >
        {children}
      </Dropdown>

      {/* 管理员删除理由 Modal */}
      <Modal
        title={t('admin_delete_title')}
        open={deleteModalOpen}
        onOk={handleAdminDeleteOk}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteReasonType('none');
          setDeleteReason('');
        }}
        okText={t('confirm')}
        cancelText={t('cancel')}
        confirmLoading={deleteLoading}
        maskClosable
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <span>{t('admin_delete_content')}</span>
          <span>{t('admin_delete_reason_label')}</span>
          <Select
            value={deleteReasonType}
            onChange={(val) => {
              setDeleteReasonType(val);
              if (val !== 'custom') setDeleteReason('');
            }}
            style={{ width: '100%' }}
          >
            <Select.Option value="none">
              {t('admin_delete_reason_none')}
            </Select.Option>
            <Select.Option value="violation">
              {t('admin_delete_reason_violation')}
            </Select.Option>
            <Select.Option value="malicious">
              {t('admin_delete_reason_malicious')}
            </Select.Option>
            <Select.Option value="copyright">
              {t('admin_delete_reason_copyright')}
            </Select.Option>
            <Select.Option value="spam">
              {t('admin_delete_reason_spam')}
            </Select.Option>
            <Select.Option value="custom">
              {t('admin_delete_reason_custom')}
            </Select.Option>
          </Select>
          {deleteReasonType === 'custom' && (
            <TextArea
              rows={3}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder={t('admin_delete_reason_custom_placeholder')}
              style={{ width: '100%' }}
            />
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default ActionMenu;
