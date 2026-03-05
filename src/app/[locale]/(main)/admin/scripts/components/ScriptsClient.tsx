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
import type { ScriptItem } from '@/lib/api/services/admin';
import { scriptService } from '@/lib/api/services/scripts/scripts';
import { APIError } from '@/types/api';
import type { ColumnsType } from 'antd/es/table';

export default function ScriptsClient() {
  const t = useTranslations('admin.scripts');
  const [data, setData] = useState<ScriptItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    undefined,
  );
  const [visibilityModalOpen, setVisibilityModalOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<ScriptItem | null>(null);
  const [newPublic, setNewPublic] = useState(1);
  const [newUnwell, setNewUnwell] = useState(2);

  const fetchData = useCallback(
    async (
      p: number = page,
      kw: string = keyword,
      st: number | undefined = statusFilter,
    ) => {
      setLoading(true);
      try {
        const resp = await adminService.listScripts(p, 20, kw || undefined, st);
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
    [page, keyword, statusFilter],
  );

  useEffect(() => {
    fetchData(page, keyword, statusFilter);
  }, [page, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchData(1, keyword, statusFilter);
  };

  const handleDelete = async (id: number) => {
    try {
      await scriptService.deleteScript(id);
      message.success(t('delete_success'));
      fetchData();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await adminService.restoreScript(id);
      message.success(t('restore_success'));
      fetchData();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const openVisibilityModal = (script: ScriptItem) => {
    setEditingScript(script);
    setNewPublic(script.public);
    setNewUnwell(script.unwell);
    setVisibilityModalOpen(true);
  };

  const handleUpdateVisibility = async () => {
    if (!editingScript) return;
    try {
      await Promise.all([
        scriptService.updatePublic(editingScript.id, newPublic),
        scriptService.updateUnwell(editingScript.id, newUnwell),
      ]);
      message.success(t('visibility_success'));
      setVisibilityModalOpen(false);
      setEditingScript(null);
      fetchData();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const getTypeTag = (type: number) => {
    switch (type) {
      case 1:
        return <Tag color="blue">{t('type_userscript')}</Tag>;
      case 2:
        return <Tag color="orange">{t('type_subscribe')}</Tag>;
      case 3:
        return <Tag color="purple">{t('type_library')}</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  const getPublicTag = (pub: number) => {
    switch (pub) {
      case 1:
        return <Tag color="green">{t('public_public')}</Tag>;
      case 2:
        return <Tag color="orange">{t('public_unlisted')}</Tag>;
      case 3:
        return <Tag color="red">{t('public_private')}</Tag>;
      default:
        return <Tag>{pub}</Tag>;
    }
  };

  const getStatusTag = (status: number) => {
    if (status === 1) return <Tag color="green">{t('status_active')}</Tag>;
    return <Tag color="red">{t('status_deleted')}</Tag>;
  };

  const columns: ColumnsType<ScriptItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('col_name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('col_author'),
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: t('col_type'),
      dataIndex: 'type',
      key: 'type',
      render: (val: number) => getTypeTag(val),
    },
    {
      title: t('col_visibility'),
      key: 'visibility',
      render: (_: unknown, record: ScriptItem) => getPublicTag(record.public),
    },
    {
      title: t('col_status'),
      dataIndex: 'status',
      key: 'status',
      render: (val: number) => getStatusTag(val),
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
      render: (_: unknown, record: ScriptItem) => (
        <Space>
          {record.status === 1 ? (
            <Popconfirm
              title={t('delete_confirm')}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" size="small" danger>
                {t('action_delete')}
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title={t('restore_confirm')}
              onConfirm={() => handleRestore(record.id)}
            >
              <Button type="link" size="small">
                {t('action_restore')}
              </Button>
            </Popconfirm>
          )}
          <Button
            type="link"
            size="small"
            onClick={() => openVisibilityModal(record)}
          >
            {t('action_visibility')}
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
          <Select
            placeholder={t('filter_status')}
            allowClear
            style={{ width: 120 }}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              { value: 1, label: t('status_active') },
              { value: 0, label: t('status_deleted') },
            ]}
          />
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
        title={t('visibility_title')}
        open={visibilityModalOpen}
        onOk={handleUpdateVisibility}
        onCancel={() => {
          setVisibilityModalOpen(false);
          setEditingScript(null);
        }}
      >
        <div className="py-4 space-y-4">
          <div>
            <div className="mb-2">{t('field_public')}</div>
            <Select
              value={newPublic}
              onChange={setNewPublic}
              style={{ width: '100%' }}
              options={[
                { value: 1, label: t('public_public') },
                { value: 2, label: t('public_unlisted') },
                { value: 3, label: t('public_private') },
              ]}
            />
          </div>
          <div>
            <div className="mb-2">{t('field_unwell')}</div>
            <Select
              value={newUnwell}
              onChange={setNewUnwell}
              style={{ width: '100%' }}
              options={[
                { value: 1, label: t('unwell_yes') },
                { value: 2, label: t('unwell_no') },
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
