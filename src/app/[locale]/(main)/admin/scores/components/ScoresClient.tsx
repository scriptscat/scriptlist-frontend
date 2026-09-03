'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import type { ScoreItem } from '@/lib/api/services/admin';
import { useAdminScores } from '@/lib/api/hooks/admin';
import { scriptService } from '@/lib/api/services/scripts/scripts';
import { APIError } from '@/types/api';
import type { ColumnsType } from 'antd/es/table';
import { Link } from '@/i18n/routing';
import { useTableStateLocale } from '../../components/tableState';

export default function ScoresClient() {
  const t = useTranslations('admin.scores');
  const [page, setPage] = useState(1);
  const [scriptId, setScriptId] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  // 筛选条件点「搜索」后才生效，保持原来「翻页才重新拉取」的行为。
  const [applied, setApplied] = useState<{
    scriptId?: number;
    keyword: string;
  }>({ scriptId: undefined, keyword: '' });

  const {
    list: data,
    total,
    isLoading,
    isRefreshing,
    error,
    refresh: fetchData,
  } = useAdminScores({
    page,
    scriptId: applied.scriptId,
    keyword: applied.keyword,
  });
  const tableLocale = useTableStateLocale({
    isLoading,
    error,
    onRetry: fetchData,
  });

  const handleSearch = () => {
    setPage(1);
    setApplied({ scriptId, keyword });
  };

  const handleDelete = async (scriptId: number, scoreId: number) => {
    try {
      await scriptService.deleteScore(scriptId, scoreId);
      message.success(t('delete_success'));
      fetchData();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const getScoreTag = (score: number) => {
    if (score >= 8) return <Tag color="green">{score}</Tag>;
    if (score >= 5) return <Tag color="orange">{score}</Tag>;
    return <Tag color="red">{score}</Tag>;
  };

  const columns: ColumnsType<ScoreItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('col_username'),
      key: 'username',
      render: (_: unknown, record: ScoreItem) => (
        <Link href={`/users/${record.user_id}`} target="_blank">
          {record.username}
        </Link>
      ),
    },
    {
      title: t('col_script'),
      key: 'script_name',
      ellipsis: true,
      render: (_: unknown, record: ScoreItem) => (
        <Link href={`/script-show-page/${record.script_id}`} target="_blank">
          {record.script_name}
        </Link>
      ),
    },
    {
      title: t('col_score'),
      dataIndex: 'score',
      key: 'score',
      render: (val: number) => getScoreTag(val),
    },
    {
      title: t('col_message'),
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
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
      render: (_: unknown, record: ScoreItem) => (
        <Popconfirm
          title={t('delete_confirm')}
          onConfirm={() => handleDelete(record.script_id, record.id)}
        >
          <Button type="link" size="small" danger>
            {t('action_delete')}
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Space>
          <InputNumber
            placeholder={t('filter_script_id')}
            value={scriptId}
            onChange={(val) => setScriptId(val || undefined)}
            style={{ width: 150 }}
          />
          <Input
            placeholder={t('search_placeholder')}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
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
        loading={isLoading || isRefreshing}
        locale={tableLocale}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: setPage,
        }}
      />
    </div>
  );
}
