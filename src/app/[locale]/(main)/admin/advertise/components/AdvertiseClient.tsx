'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Switch,
  Table,
  Tag,
  Upload,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import type { ColumnsType } from 'antd/es/table';
import { advertiseService } from '@/lib/api/services/advertise';
import type {
  AdminAdvertise,
  AdminAdvertiseInput,
} from '@/lib/api/services/advertise';
import { resourceService } from '@/lib/api/services/resource';
import { API_CONFIG } from '@/lib/api/config';
import { APIError } from '@/types/api';
import { AD_SLOT_KEYS, getAdSlotMeta } from '@/components/AdSlot/slots';

const LANGS = ['en', 'zh-CN', 'zh-TW', 'ru', 'ja', 'de', 'vi'];

export default function AdvertiseClient() {
  const t = useTranslations('admin.advertise');
  const [data, setData] = useState<AdminAdvertise[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAdvertise | null>(null);
  const [lightUrl, setLightUrl] = useState('');
  const [darkUrl, setDarkUrl] = useState('');
  const [form] = Form.useForm();
  const selectedSlot = Form.useWatch('slot_key', form) as string | undefined;
  const selectedMeta = selectedSlot ? getAdSlotMeta(selectedSlot) : undefined;
  const slotName = (key: string) => t(`slots.${key}.name`);
  const slotPosition = (key: string) => t(`slots.${key}.position`);

  const fetchData = useCallback(
    async (p: number = page) => {
      setLoading(true);
      try {
        const resp = await advertiseService.adminList(p);
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
    setLightUrl('');
    setDarkUrl('');
    form.setFieldsValue({ weight: 1, enabled: true, languages: [] });
    setModalOpen(true);
  };

  const handleEdit = (r: AdminAdvertise) => {
    setEditing(r);
    setLightUrl(r.image_url_light);
    setDarkUrl(r.image_url_dark);
    form.setFieldsValue({
      slot_key: r.slot_key,
      title: r.title,
      languages: r.languages ? r.languages.split(',') : [],
      link_url: r.link_url,
      weight: r.weight,
      enabled: r.enabled,
      range:
        r.start_at || r.end_at
          ? [
              r.start_at ? dayjs(r.start_at * 1000) : null,
              r.end_at ? dayjs(r.end_at * 1000) : null,
            ]
          : undefined,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await advertiseService.adminDelete(id);
      message.success(t('delete_success'));
      fetchData();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const upload = async (file: File, setUrl: (u: string) => void) => {
    try {
      const resp = await resourceService.uploadImage(file, 'advertise', 0);
      setUrl(`${API_CONFIG.baseURL}/resource/image/${resp.id}`);
      message.success(t('upload_success'));
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const v = await form.validateFields();
      if (!lightUrl) {
        message.error(t('light_required'));
        return;
      }
      const range = v.range as
        | [dayjs.Dayjs | null, dayjs.Dayjs | null]
        | undefined;
      const input: AdminAdvertiseInput = {
        slot_key: v.slot_key,
        title: v.title,
        languages: (v.languages || []).join(','),
        image_url_light: lightUrl,
        image_url_dark: darkUrl,
        link_url: v.link_url,
        weight: v.weight,
        enabled: v.enabled,
        start_at: range?.[0] ? Math.floor(range[0].valueOf() / 1000) : 0,
        end_at: range?.[1] ? Math.floor(range[1].valueOf() / 1000) : 0,
      };
      if (editing) {
        await advertiseService.adminUpdate(editing.id, input);
        message.success(t('update_success'));
      } else {
        await advertiseService.adminCreate(input);
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

  const columns: ColumnsType<AdminAdvertise> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    {
      title: t('col_slot'),
      dataIndex: 'slot_key',
      render: (v: string) => {
        const meta = getAdSlotMeta(v);
        if (!meta) return v;
        return (
          <div>
            <div>{slotName(v)}</div>
            <div className="text-xs text-gray-400">{`${v} · ${meta.size}`}</div>
          </div>
        );
      },
    },
    { title: t('col_title'), dataIndex: 'title', ellipsis: true },
    {
      title: t('col_enabled'),
      dataIndex: 'enabled',
      width: 90,
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'default'}>
          {v ? t('enabled') : t('disabled')}
        </Tag>
      ),
    },
    {
      title: t('col_stats'),
      width: 180,
      render: (_: unknown, r: AdminAdvertise) =>
        `${r.impressions} / ${r.clicks} (${r.impressions ? ((r.clicks / r.impressions) * 100).toFixed(1) : '0'}%)`,
    },
    {
      title: t('col_actions'),
      width: 140,
      render: (_: unknown, r: AdminAdvertise) => (
        <span>
          <Button type="link" size="small" onClick={() => handleEdit(r)}>
            {t('action_edit')}
          </Button>
          <Popconfirm
            title={t('delete_confirm')}
            onConfirm={() => handleDelete(r.id)}
          >
            <Button type="link" size="small" danger>
              {t('action_delete')}
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ];

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
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
      />

      <Modal
        title={editing ? t('edit_title') : t('create_title')}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={680}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="slot_key"
            label={t('field_slot')}
            rules={[{ required: true }]}
          >
            <Select
              options={AD_SLOT_KEYS.map((s) => ({
                value: s,
                label: `${slotName(s)} · ${getAdSlotMeta(s)?.size ?? ''}`,
              }))}
            />
          </Form.Item>
          {selectedMeta && selectedSlot && (
            <Alert
              type="info"
              showIcon
              className="!mb-4"
              title={slotName(selectedSlot)}
              description={
                <div className="text-xs">
                  <div>{slotPosition(selectedSlot)}</div>
                  <div className="mt-1 font-medium">
                    {t('recommended_size', { size: selectedMeta.size })}
                  </div>
                </div>
              }
            />
          )}
          <Form.Item
            name="title"
            label={t('field_title')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="languages" label={t('field_languages')}>
            <Select
              mode="multiple"
              allowClear
              options={LANGS.map((l) => ({ value: l, label: l }))}
            />
          </Form.Item>
          <Form.Item
            label={t('field_light')}
            required
            extra={
              selectedMeta
                ? t('recommended_size', { size: selectedMeta.size })
                : undefined
            }
          >
            <Upload
              accept="image/*"
              showUploadList={false}
              maxCount={1}
              beforeUpload={(file) => {
                upload(file as File, setLightUrl);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>{t('upload')}</Button>
            </Upload>
            {lightUrl && <Input className="mt-2" value={lightUrl} readOnly />}
          </Form.Item>
          <Form.Item
            label={t('field_dark')}
            extra={
              selectedMeta
                ? t('recommended_size', { size: selectedMeta.size })
                : undefined
            }
          >
            <Upload
              accept="image/*"
              showUploadList={false}
              maxCount={1}
              beforeUpload={(file) => {
                upload(file as File, setDarkUrl);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>{t('upload')}</Button>
            </Upload>
            {darkUrl && <Input className="mt-2" value={darkUrl} readOnly />}
          </Form.Item>
          <Form.Item
            name="link_url"
            label={t('field_link')}
            rules={[{ required: true }]}
          >
            <Input placeholder="https://" />
          </Form.Item>
          <Form.Item
            name="weight"
            label={t('field_weight')}
            rules={[{ required: true }]}
          >
            <InputNumber min={1} className="!w-full" />
          </Form.Item>
          <Form.Item name="range" label={t('field_range')}>
            <DatePicker.RangePicker showTime className="!w-full" />
          </Form.Item>
          <Form.Item
            name="enabled"
            label={t('field_enabled')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
