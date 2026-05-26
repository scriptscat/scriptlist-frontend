'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Input,
  InputNumber,
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
import type { ColumnsType, TableProps } from 'antd/es/table';
import { Link } from '@/i18n/routing';
import DeleteScriptModal from './DeleteScriptModal';

type ScriptSortField = 'trending_score';
type ScriptSortOrder = 'asc' | 'desc';

export default function ScriptsClient() {
  const t = useTranslations('admin.scripts');
  const [data, setData] = useState<ScriptItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [searchField, setSearchField] = useState<
    'name' | 'description' | 'content'
  >('name');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [appliedSearchField, setAppliedSearchField] = useState<
    'name' | 'description' | 'content'
  >('name');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    undefined,
  );
  const [visibilityModalOpen, setVisibilityModalOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<ScriptItem | null>(null);
  const [newPublic, setNewPublic] = useState(1);
  const [newUnwell, setNewUnwell] = useState(2);
  const [sortField, setSortField] = useState<ScriptSortField | undefined>();
  const [sortOrder, setSortOrder] = useState<ScriptSortOrder | undefined>();
  const [trendingModalOpen, setTrendingModalOpen] = useState(false);
  const [editingTrendingScript, setEditingTrendingScript] =
    useState<ScriptItem | null>(null);
  const [newTrendingScore, setNewTrendingScore] = useState<number | null>(0);
  const [updatingTrendingScore, setUpdatingTrendingScore] = useState(false);
  const [deletingScript, setDeletingScript] = useState<ScriptItem | null>(null);

  const fetchData = useCallback(
    async (
      p: number,
      kw: string,
      st: number | undefined,
      field: 'name' | 'description' | 'content',
      sf: ScriptSortField | undefined,
      so: ScriptSortOrder | undefined,
    ) => {
      setLoading(true);
      try {
        const resp = await adminService.listScripts(
          p,
          20,
          kw || undefined,
          st,
          kw ? field : undefined,
          sf,
          so,
        );
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
    [],
  );

  useEffect(() => {
    fetchData(
      page,
      appliedKeyword,
      statusFilter,
      appliedSearchField,
      sortField,
      sortOrder,
    );
  }, [
    fetchData,
    page,
    appliedKeyword,
    statusFilter,
    appliedSearchField,
    sortField,
    sortOrder,
  ]);

  const handleSearch = () => {
    setAppliedKeyword(keyword);
    setAppliedSearchField(searchField);
    setPage(1);
  };

  const refreshList = useCallback(() => {
    fetchData(
      page,
      appliedKeyword,
      statusFilter,
      appliedSearchField,
      sortField,
      sortOrder,
    );
  }, [
    fetchData,
    page,
    appliedKeyword,
    statusFilter,
    appliedSearchField,
    sortField,
    sortOrder,
  ]);

  const handleRestore = async (id: number) => {
    try {
      await adminService.restoreScript(id);
      message.success(t('restore_success'));
      fetchData(
        page,
        appliedKeyword,
        statusFilter,
        appliedSearchField,
        sortField,
        sortOrder,
      );
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

  const openTrendingModal = (script: ScriptItem) => {
    setEditingTrendingScript(script);
    setNewTrendingScore(script.trending_score ?? 0);
    setTrendingModalOpen(true);
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
      fetchData(
        page,
        appliedKeyword,
        statusFilter,
        appliedSearchField,
        sortField,
        sortOrder,
      );
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const handleUpdateTrendingScore = async () => {
    if (!editingTrendingScript || newTrendingScore === null) return;
    if (!Number.isFinite(newTrendingScore)) {
      message.error(t('trending_score_invalid'));
      return;
    }
    setUpdatingTrendingScore(true);
    try {
      await adminService.updateScriptTrendingScore(
        editingTrendingScript.id,
        newTrendingScore,
      );
      message.success(t('trending_score_success'));
      setTrendingModalOpen(false);
      setEditingTrendingScript(null);
      fetchData(
        page,
        appliedKeyword,
        statusFilter,
        appliedSearchField,
        sortField,
        sortOrder,
      );
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    } finally {
      setUpdatingTrendingScore(false);
    }
  };

  const handleTableChange: TableProps<ScriptItem>['onChange'] = (
    pagination,
    _filters,
    sorter,
  ) => {
    const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    if (currentSorter?.field === 'trending_score' && currentSorter.order) {
      setSortField('trending_score');
      setSortOrder(currentSorter.order === 'ascend' ? 'asc' : 'desc');
    } else {
      setSortField(undefined);
      setSortOrder(undefined);
    }
    setPage(pagination.current || 1);
  };

  const formatTrendingScore = (score: number | undefined) => {
    if (typeof score !== 'number' || !Number.isFinite(score)) return '0';
    return score.toFixed(6).replace(/\.?0+$/, '');
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
      key: 'name',
      ellipsis: true,
      render: (_: unknown, record: ScriptItem) => (
        <Link href={`/script-show-page/${record.id}`} target="_blank">
          {record.name}
        </Link>
      ),
    },
    {
      title: t('col_author'),
      key: 'username',
      render: (_: unknown, record: ScriptItem) => (
        <Link href={`/users/${record.user_id}`} target="_blank">
          {record.username}
        </Link>
      ),
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
      title: t('col_trending_score'),
      dataIndex: 'trending_score',
      key: 'trending_score',
      width: 150,
      sorter: true,
      sortOrder:
        sortField === 'trending_score'
          ? sortOrder === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
      render: (val: number) => formatTrendingScore(val),
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
            <Button
              type="link"
              size="small"
              danger
              onClick={() => setDeletingScript(record)}
            >
              {t('action_delete')}
            </Button>
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
          <Button
            type="link"
            size="small"
            onClick={() => openTrendingModal(record)}
          >
            {t('action_trending_score')}
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
          <Select
            value={searchField}
            onChange={setSearchField}
            style={{ width: 120 }}
            options={[
              { value: 'name', label: t('search_field_name') },
              { value: 'description', label: t('search_field_description') },
              { value: 'content', label: t('search_field_content') },
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
        onChange={handleTableChange}
        pagination={{
          current: page,
          total,
          pageSize: 20,
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

      <Modal
        title={t('trending_score_title')}
        open={trendingModalOpen}
        onOk={handleUpdateTrendingScore}
        confirmLoading={updatingTrendingScore}
        onCancel={() => {
          setTrendingModalOpen(false);
          setEditingTrendingScript(null);
        }}
      >
        <div className="py-4 space-y-4">
          <Alert type="info" showIcon message={t('trending_score_hint')} />
          <div>
            <div className="mb-2">{t('trending_score_label')}</div>
            <InputNumber
              value={newTrendingScore}
              onChange={(value) =>
                setNewTrendingScore(typeof value === 'number' ? value : null)
              }
              precision={6}
              step={0.1}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Modal>

      {deletingScript && (
        <DeleteScriptModal
          open={!!deletingScript}
          scriptId={deletingScript.id}
          scriptName={deletingScript.name}
          authorId={deletingScript.user_id}
          authorName={deletingScript.username}
          onCancel={() => setDeletingScript(null)}
          onSuccess={() => {
            setDeletingScript(null);
            refreshList();
          }}
        />
      )}
    </div>
  );
}
