'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tabs,
  Tag,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { announcementService } from '@/lib/api/services/announcement';
import type {
  AdminAnnouncement,
  AdminCreateAnnouncementRequest,
  AdminUpdateAnnouncementRequest,
} from '@/lib/api/services/announcement';
import { APIError } from '@/types/api';
import type { ColumnsType } from 'antd/es/table';

const LOCALES = ['zh-CN', 'en-US'];

function parseJsonField(val: string): Record<string, string> {
  try {
    return JSON.parse(val) || {};
  } catch {
    return {};
  }
}

export default function AnnouncementsClient() {
  const t = useTranslations('admin.announcements');
  const [data, setData] = useState<AdminAnnouncement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAnnouncement | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(
    async (p: number = page) => {
      setLoading(true);
      try {
        const resp = await announcementService.adminGetList(p);
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
    [page],
  );

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handleCreate = () => {
    setEditing(null);
    form.resetFields();
    // 初始化多语言字段
    LOCALES.forEach((locale) => {
      form.setFieldsValue({
        [`title_${locale}`]: '',
        [`content_${locale}`]: '',
      });
    });
    form.setFieldsValue({ level: 1, status: 1 });
    setModalOpen(true);
  };

  const handleEdit = (record: AdminAnnouncement) => {
    setEditing(record);
    const titleMap = parseJsonField(record.title);
    const contentMap = parseJsonField(record.content);
    const values: Record<string, any> = {
      level: record.level,
      status: record.status,
    };
    LOCALES.forEach((locale) => {
      values[`title_${locale}`] = titleMap[locale] || '';
      values[`content_${locale}`] = contentMap[locale] || '';
    });
    form.setFieldsValue(values);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await announcementService.adminDelete(id);
      message.success(t('delete_success'));
      fetchData();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const titleMap: Record<string, string> = {};
      const contentMap: Record<string, string> = {};
      LOCALES.forEach((locale) => {
        const titleVal = values[`title_${locale}`]?.trim();
        const contentVal = values[`content_${locale}`]?.trim();
        if (titleVal) titleMap[locale] = titleVal;
        if (contentVal) contentMap[locale] = contentVal;
      });

      if (Object.keys(titleMap).length === 0) {
        message.error(t('at_least_one_language'));
        return;
      }

      if (editing) {
        const updateData: AdminUpdateAnnouncementRequest = {
          title: JSON.stringify(titleMap),
          content: JSON.stringify(contentMap),
          level: values.level,
          status: values.status,
        };
        await announcementService.adminUpdate(editing.id, updateData);
        message.success(t('update_success'));
      } else {
        const createData: AdminCreateAnnouncementRequest = {
          title: JSON.stringify(titleMap),
          content: JSON.stringify(contentMap),
          level: values.level,
        };
        await announcementService.adminCreate(createData);
        message.success(t('create_success'));
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const columns: ColumnsType<AdminAnnouncement> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('col_title'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (val: string) => {
        const m = parseJsonField(val);
        return m['zh-CN'] || m['en-US'] || val;
      },
    },
    {
      title: t('col_level'),
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (val: number) => (
        <Tag color={val === 2 ? 'orange' : 'blue'}>
          {val === 2 ? t('level_important') : t('level_normal')}
        </Tag>
      ),
    },
    {
      title: t('col_status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val: number) => (
        <Tag color={val === 1 ? 'green' : 'default'}>
          {val === 1 ? t('status_enabled') : t('status_disabled')}
        </Tag>
      ),
    },
    {
      title: t('col_createtime'),
      dataIndex: 'createtime',
      key: 'createtime',
      width: 180,
      render: (val: number) => new Date(val * 1000).toLocaleString(),
    },
    {
      title: t('col_actions'),
      key: 'actions',
      width: 150,
      render: (_: unknown, record: AdminAnnouncement) => (
        <span>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            {t('action_edit')}
          </Button>
          <Popconfirm
            title={t('delete_confirm')}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger>
              {t('action_delete')}
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  const tabItems = LOCALES.map((locale) => ({
    key: locale,
    label: locale,
    children: (
      <div className="space-y-4">
        <Form.Item
          name={`title_${locale}`}
          label={`${t('field_title')} (${locale})`}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name={`content_${locale}`}
          label={`${t('field_content')} (${locale})`}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </div>
    ),
  }));

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          {t('action_create')}
        </Button>
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
        title={editing ? t('edit_title') : t('create_title')}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Tabs items={tabItems} />
          <Form.Item
            name="level"
            label={t('field_level')}
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value={1}>{t('level_normal')}</Select.Option>
              <Select.Option value={2}>{t('level_important')}</Select.Option>
            </Select>
          </Form.Item>
          {editing && (
            <Form.Item
              name="status"
              label={t('field_status')}
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value={1}>{t('status_enabled')}</Select.Option>
                <Select.Option value={2}>{t('status_disabled')}</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
