'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { adminService } from '@/lib/api/services/admin';
import type { UserItem } from '@/lib/api/services/admin';
import { useAdminUsers } from '@/lib/api/hooks/admin';
import { APIError } from '@/types/api';
import type { ColumnsType } from 'antd/es/table';
import { Link } from '@/i18n/routing';
import { useTableStateLocale } from '../../components/tableState';
import { AdminResponsiveList } from '../../components/AdminResponsiveList';
import type {
  AdminCardAction,
  AdminCardSpec,
} from '../../components/AdminResponsiveList';
import BanUserModal from '@/components/UserProfile/BanUserModal';
import { useBanTime } from '@/lib/utils/banTime';

export default function UsersClient() {
  const t = useTranslations('admin.users');
  const tBan = useTranslations('components.ban');
  const banTime = useBanTime();
  const [banningUser, setBanningUser] = useState<UserItem | null>(null);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  // 输入框的值只有点「搜索」时才生效，和原来「翻页才重新拉取」的行为一致。
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [adminLevelModalOpen, setAdminLevelModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [newAdminLevel, setNewAdminLevel] = useState(0);

  const {
    list: data,
    total,
    isLoading,
    isRefreshing,
    error,
    refresh: fetchData,
  } = useAdminUsers({ page, keyword: appliedKeyword });
  const tableLocale = useTableStateLocale({
    isLoading,
    error,
    onRetry: fetchData,
  });

  const handleSearch = () => {
    setPage(1);
    setAppliedKeyword(keyword);
  };

  const handleUnban = async (id: number) => {
    try {
      await adminService.updateUserStatus(id, 1);
      message.success(t('unban_success'));
      fetchData();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const openAdminLevelModal = (user: UserItem) => {
    setEditingUser(user);
    setNewAdminLevel(user.admin_level);
    setAdminLevelModalOpen(true);
  };

  const handleUpdateAdminLevel = async () => {
    if (!editingUser) return;
    try {
      await adminService.updateUserAdminLevel(editingUser.id, newAdminLevel);
      message.success(t('admin_level_success'));
      setAdminLevelModalOpen(false);
      setEditingUser(null);
      fetchData();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const renderStatus = (record: UserItem) => {
    if (record.status !== 2) {
      return <Tag color="green">{t('status_active')}</Tag>;
    }
    const expireAt = record.ban_expire_at ?? 0;
    if (!expireAt) {
      return <Tag color="red">{tBan('permanent')}</Tag>;
    }
    return (
      <div>
        <Tag color="red">{tBan('banned')}</Tag>
        <Tooltip
          title={
            <div>
              <div>
                <span className="opacity-60 mr-1.5">
                  {tBan('tooltip_until')}
                </span>
                {banTime.full(expireAt)}
              </div>
              {record.ban_reason && (
                <div>
                  <span className="opacity-60 mr-1.5">
                    {tBan('tooltip_reason')}
                  </span>
                  {record.ban_reason}
                </div>
              )}
            </div>
          }
        >
          <div className="mt-1 w-fit cursor-help whitespace-nowrap text-xs text-app-secondary underline decoration-dotted underline-offset-4">
            {tBan('until_with_remaining', {
              until: banTime.until(expireAt),
              remaining: banTime.remaining(expireAt),
            })}
          </div>
        </Tooltip>
      </div>
    );
  };

  const getAdminLevelTag = (level: number) => {
    switch (level) {
      case 1:
        return <Tag color="purple">{t('level_admin')}</Tag>;
      case 2:
        return <Tag color="blue">{t('level_super_mod')}</Tag>;
      case 3:
        return <Tag color="cyan">{t('level_mod')}</Tag>;
      default:
        return <Tag>{t('level_user')}</Tag>;
    }
  };

  // 注册 IP 单元格（表格与窄屏卡片共用）
  const renderRegisterIp = (record: UserItem) => (
    <div>
      <div>{record.register_ip || '-'}</div>
      {record.ip_location && (
        <div className="text-xs text-neutral-500">{record.ip_location}</div>
      )}
    </div>
  );

  const columns: ColumnsType<UserItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('col_username'),
      key: 'username',
      render: (_: unknown, record: UserItem) => (
        <Link href={`/users/${record.id}`} target="_blank">
          {record.username}
        </Link>
      ),
    },
    {
      title: t('col_email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('col_register_ip'),
      key: 'register_ip',
      render: (_: unknown, record: UserItem) => renderRegisterIp(record),
    },
    {
      title: t('col_status'),
      dataIndex: 'status',
      key: 'status',
      render: (_: unknown, record: UserItem) => renderStatus(record),
    },
    {
      title: t('col_admin_level'),
      dataIndex: 'admin_level',
      key: 'admin_level',
      render: (val: number) => getAdminLevelTag(val),
    },
    {
      title: t('col_createtime'),
      dataIndex: 'createtime',
      key: 'createtime',
      render: (val: number) => new Date(val * 1000).toLocaleString(),
    },
    {
      title: t('col_actions'),
      key: 'actions',
      render: (_: unknown, record: UserItem) => (
        <Space>
          {record.status === 1 ? (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => setBanningUser(record)}
            >
              {t('action_ban')}
            </Button>
          ) : (
            <Popconfirm
              title={t('unban_confirm')}
              onConfirm={() => handleUnban(record.id)}
            >
              <Button type="link" size="small">
                {t('action_unban')}
              </Button>
            </Popconfirm>
          )}
          <Button
            type="link"
            size="small"
            onClick={() => openAdminLevelModal(record)}
          >
            {t('action_admin_level')}
          </Button>
        </Space>
      ),
    },
  ];

  // 与操作列同序：封禁 / 解封在前，主位取第一个安全操作
  const cardActions = (record: UserItem): AdminCardAction[] => [
    record.status === 1
      ? {
          key: 'ban',
          label: t('action_ban'),
          danger: true,
          onClick: () => setBanningUser(record),
        }
      : {
          key: 'unban',
          label: t('action_unban'),
          confirm: { title: t('unban_confirm') },
          onClick: () => handleUnban(record.id),
        },
    {
      key: 'admin_level',
      label: t('action_admin_level'),
      onClick: () => openAdminLevelModal(record),
    },
  ];

  const toCard = (record: UserItem): AdminCardSpec => ({
    title: (
      <Link href={`/users/${record.id}`} target="_blank">
        {record.username}
      </Link>
    ),
    subtitle: [`#${record.id}`, record.email],
    badges: (
      <>
        {renderStatus(record)}
        {getAdminLevelTag(record.admin_level)}
      </>
    ),
    fields: [
      {
        label: t('col_register_ip'),
        value: renderRegisterIp(record),
      },
    ],
    time: record.createtime,
    actions: cardActions(record),
  });

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('search_placeholder')}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            className="min-w-0 flex-1 md:!w-[250px] md:flex-none"
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            {t('search_button')}
          </Button>
        </div>
      </div>

      <AdminResponsiveList<UserItem>
        table={
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={isLoading || isRefreshing}
            locale={tableLocale}
            pagination={{
              current: page,
              total,
              pageSize: 20,
              onChange: setPage,
            }}
          />
        }
        rows={data}
        rowKey="id"
        card={toCard}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRetry={fetchData}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: setPage,
        }}
      />

      {banningUser && (
        <BanUserModal
          visible
          userId={banningUser.id}
          username={banningUser.username}
          onCancel={() => setBanningUser(null)}
          onSuccess={() => {
            setBanningUser(null);
            fetchData();
          }}
        />
      )}

      <Modal
        title={t('admin_level_title')}
        open={adminLevelModalOpen}
        onOk={handleUpdateAdminLevel}
        onCancel={() => {
          setAdminLevelModalOpen(false);
          setEditingUser(null);
        }}
      >
        <div className="py-4">
          <Select
            value={newAdminLevel}
            onChange={setNewAdminLevel}
            style={{ width: '100%' }}
            options={[
              { value: 0, label: t('level_user') },
              { value: 1, label: t('level_admin') },
              { value: 2, label: t('level_super_mod') },
              { value: 3, label: t('level_mod') },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
