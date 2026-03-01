'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { adminService } from '@/lib/api/services/admin';
import type { ScoreItem } from '@/lib/api/services/admin';
import { APIError } from '@/types/api';
import type { ColumnsType } from 'antd/es/table';

export default function ScoresClient() {
  const t = useTranslations('admin.scores');
  const [data, setData] = useState<ScoreItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [scriptId, setScriptId] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');

  const fetchData = useCallback(
    async (
      p: number = page,
      sid: number | undefined = scriptId,
      kw: string = keyword,
    ) => {
      setLoading(true);
      try {
        const resp = await adminService.listScores(p, 20, sid, kw || undefined);
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
    [page, scriptId, keyword],
  );

  useEffect(() => {
    fetchData(page, scriptId, keyword);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchData(1, scriptId, keyword);
  };

  const handleDelete = async (id: number) => {
    try {
      await adminService.deleteScore(id);
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
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: t('col_script'),
      dataIndex: 'script_name',
      key: 'script_name',
      ellipsis: true,
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
          onConfirm={() => handleDelete(record.id)}
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
        loading={loading}
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
