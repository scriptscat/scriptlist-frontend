'use client';

import { useCallback, useEffect, useState } from 'react';
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
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { adminService } from '@/lib/api/services/admin';
import type { UserItem } from '@/lib/api/services/admin';
import { APIError } from '@/types/api';
import type { ColumnsType } from 'antd/es/table';
import { Link } from '@/i18n/routing';

export default function UsersClient() {
  const t = useTranslations('admin.users');
  const [data, setData] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [adminLevelModalOpen, setAdminLevelModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [newAdminLevel, setNewAdminLevel] = useState(0);

  const fetchData = useCallback(
    async (p: number = page, kw: string = keyword) => {
      setLoading(true);
      try {
        const resp = await adminService.listUsers(p, 20, kw || undefined);
        setData(resp.list || []);
        setTotal(resp.total);
      } catch (err) {
        if (err instanceof APIError) {
          message.error(err.msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [page, keyword],
  );

  useEffect(() => {
    fetchData(page, keyword);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchData(1, keyword);
  };

  const handleBan = async (id: number) => {
    try {
      await adminService.updateUserStatus(id, 2);
      message.success(t('ban_success'));
      fetchData();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
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

  const getStatusTag = (status: number) => {
    if (status === 2) return <Tag color="red">{t('status_banned')}</Tag>;
    return <Tag color="green">{t('status_active')}</Tag>;
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
      render: (_: unknown, record: UserItem) => (
        <div>
          <div>{record.register_ip || '-'}</div>
          {record.ip_location && (
            <div className="text-xs text-neutral-500">{record.ip_location}</div>
          )}
        </div>
      ),
    },
    {
      title: t('col_status'),
      dataIndex: 'status',
      key: 'status',
      render: (val: number) => getStatusTag(val),
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
            <Popconfirm
              title={t('ban_confirm')}
              onConfirm={() => handleBan(record.id)}
            >
              <Button type="link" size="small" danger>
                {t('action_ban')}
              </Button>
            </Popconfirm>
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Space>
          <Input
            placeholder={t('search_placeholder')}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            {t('search_button')}
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: setPage,
        }}
      />

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
