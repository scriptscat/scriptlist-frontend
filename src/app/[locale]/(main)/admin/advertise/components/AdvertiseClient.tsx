'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Segmented,
  Select,
  Spin,
  Switch,
  Table,
  Tag,
  Upload,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { advertiseService } from '@/lib/api/services/advertise';
import type {
  AdClickItem,
  AdClickStats,
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
  const [slotFilter, setSlotFilter] = useState<string | undefined>();
  const [enabledFilter, setEnabledFilter] = useState<boolean | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAdvertise | null>(null);
  const [lightUrl, setLightUrl] = useState('');
  const [darkUrl, setDarkUrl] = useState('');
  const [form] = Form.useForm();
  const selectedSlot = Form.useWatch('slot_key', form) as string | undefined;
  const selectedMeta = selectedSlot ? getAdSlotMeta(selectedSlot) : undefined;
  const slotName = (key: string) => t(`slots.${key}.name`);
  const slotPosition = (key: string) => t(`slots.${key}.position`);

  // 点击详情弹窗状态
  const [detailAd, setDetailAd] = useState<AdminAdvertise | null>(null);
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<AdClickStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [clicks, setClicks] = useState<AdClickItem[]>([]);
  const [clicksTotal, setClicksTotal] = useState(0);
  const [clicksPage, setClicksPage] = useState(1);
  const [clicksLoading, setClicksLoading] = useState(false);

  const fetchData = useCallback(
    async (p: number = page) => {
      setLoading(true);
      try {
        const resp = await advertiseService.adminList(
          p,
          20,
          slotFilter,
          enabledFilter,
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
    [page, slotFilter, enabledFilter],
  );

  useEffect(() => {
    fetchData(page);
  }, [page, slotFilter, enabledFilter]);

  const handleTableChange: TableProps<AdminAdvertise>['onChange'] = (
    pagination,
    filters,
  ) => {
    const nextSlot = (filters.slot_key?.[0] as string | undefined) ?? undefined;
    const rawEnabled = filters.enabled?.[0];
    const nextEnabled =
      rawEnabled === undefined ? undefined : rawEnabled === 'true';
    const filterChanged =
      nextSlot !== slotFilter || nextEnabled !== enabledFilter;
    setSlotFilter(nextSlot);
    setEnabledFilter(nextEnabled);
    setPage(filterChanged ? 1 : pagination.current || 1);
  };

  const openClickDetail = (r: AdminAdvertise) => {
    setDetailAd(r);
    setDays(30);
    setClicksPage(1);
    setStats(null);
    setClicks([]);
  };

  const closeClickDetail = () => setDetailAd(null);

  // 拉取点击日趋势 + 汇总（窗口天数变化时重新拉取）
  useEffect(() => {
    if (!detailAd) return;
    let cancelled = false;
    setStatsLoading(true);
    advertiseService
      .adminClickStats(detailAd.id, days)
      .then((r) => {
        if (!cancelled) setStats(r);
      })
      .catch((err) => {
        if (err instanceof APIError) message.error(err.msg);
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [detailAd, days]);

  // 拉取原始点击明细（分页）
  useEffect(() => {
    if (!detailAd) return;
    let cancelled = false;
    setClicksLoading(true);
    advertiseService
      .adminClickList(detailAd.id, clicksPage, 10)
      .then((r) => {
        if (cancelled) return;
        setClicks(r.list || []);
        setClicksTotal(r.total);
      })
      .catch((err) => {
        if (err instanceof APIError) message.error(err.msg);
      })
      .finally(() => {
        if (!cancelled) setClicksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [detailAd, clicksPage]);

  // 按窗口天数把后端返回的稀疏日聚合补齐成连续日期序列（缺失日补 0），便于趋势展示
  const trend = useMemo(() => {
    const map = new Map((stats?.daily ?? []).map((d) => [d.date, d.clicks]));
    const out: { date: string; clicks: number }[] = [];
    const start = dayjs().subtract(days - 1, 'day');
    for (let i = 0; i < days; i++) {
      const date = start.add(i, 'day').format('YYYY-MM-DD');
      out.push({ date, clicks: map.get(date) ?? 0 });
    }
    return out;
  }, [stats, days]);

  const maxTrend = useMemo(
    () => Math.max(1, ...trend.map((d) => d.clicks)),
    [trend],
  );

  const fmtTime = (ts: number) =>
    ts ? dayjs(ts * 1000).format('YYYY-MM-DD HH:mm') : '-';

  const formatSchedule = (r: AdminAdvertise) => {
    if (!r.start_at && !r.end_at) return t('schedule_forever');
    return `${r.start_at ? fmtTime(r.start_at) : t('schedule_unbounded')} ~ ${
      r.end_at ? fmtTime(r.end_at) : t('schedule_unbounded')
    }`;
  };

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
      filters: AD_SLOT_KEYS.map((k) => ({ text: slotName(k), value: k })),
      filterMultiple: false,
      filteredValue: slotFilter ? [slotFilter] : null,
      render: (v: string, r: AdminAdvertise) => {
        const meta = getAdSlotMeta(v);
        return (
          <div>
            <Button
              type="link"
              className="!p-0 !h-auto"
              onClick={() => openClickDetail(r)}
            >
              {meta ? slotName(v) : v}
            </Button>
            {meta && (
              <div className="text-xs text-gray-400">{`${v} · ${meta.size}`}</div>
            )}
          </div>
        );
      },
    },
    { title: t('col_title'), dataIndex: 'title', ellipsis: true },
    {
      title: t('col_weight'),
      dataIndex: 'weight',
      width: 80,
    },
    {
      title: t('col_schedule'),
      width: 200,
      render: (_: unknown, r: AdminAdvertise) => (
        <span className="text-xs">{formatSchedule(r)}</span>
      ),
    },
    {
      title: t('col_enabled'),
      dataIndex: 'enabled',
      width: 90,
      filters: [
        { text: t('enabled'), value: 'true' },
        { text: t('disabled'), value: 'false' },
      ],
      filterMultiple: false,
      filteredValue:
        enabledFilter === undefined ? null : [String(enabledFilter)],
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
        onChange={handleTableChange}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          showSizeChanger: false,
        }}
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

      <Modal
        title={
          detailAd ? t('click_detail_title', { title: detailAd.title }) : ''
        }
        open={detailAd !== null}
        onCancel={closeClickDetail}
        footer={null}
        width={900}
        destroyOnHidden
      >
        {detailAd && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-6">
                <div>
                  <div className="text-xs text-gray-400">
                    {t('stat_total_clicks')}
                  </div>
                  <div className="text-xl font-semibold">
                    {stats?.total_clicks ?? '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">
                    {t('stat_filtered_empty')}
                  </div>
                  <div className="text-xl font-semibold">
                    {stats?.empty_referer_clicks ?? '-'}
                  </div>
                </div>
              </div>
              <Segmented
                value={days}
                onChange={(v) => setDays(v as number)}
                options={[
                  { label: t('range_7d'), value: 7 },
                  { label: t('range_30d'), value: 30 },
                  { label: t('range_90d'), value: 90 },
                ]}
              />
            </div>

            <div>
              <div className="mb-2 text-sm font-medium">{t('trend_title')}</div>
              <Spin spinning={statsLoading}>
                {stats && stats.total_clicks > 0 ? (
                  <div className="flex h-28 items-end gap-[2px] border-b border-gray-200 pt-2 dark:border-zinc-700">
                    {trend.map((d) => (
                      <div
                        key={d.date}
                        className="flex h-full flex-1 items-end"
                        title={`${d.date}: ${d.clicks}`}
                      >
                        <div
                          className="w-full rounded-t bg-blue-400 dark:bg-blue-500"
                          style={{
                            height: `${(d.clicks / maxTrend) * 100}%`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t('trend_empty')}
                  />
                )}
              </Spin>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium">
                {t('clicks_title')}
              </div>
              <Table<AdClickItem>
                rowKey="id"
                size="small"
                loading={clicksLoading}
                dataSource={clicks}
                pagination={{
                  current: clicksPage,
                  total: clicksTotal,
                  pageSize: 10,
                  showSizeChanger: false,
                  onChange: setClicksPage,
                }}
                columns={[
                  {
                    title: t('click_col_time'),
                    width: 150,
                    render: (_: unknown, c: AdClickItem) =>
                      fmtTime(c.createtime),
                  },
                  {
                    title: t('click_col_referer'),
                    dataIndex: 'referer',
                    ellipsis: true,
                    render: (v: string) => (
                      <a href={v} target="_blank" rel="noopener noreferrer">
                        {v}
                      </a>
                    ),
                  },
                  {
                    title: t('click_col_locale'),
                    dataIndex: 'locale',
                    width: 80,
                  },
                  {
                    title: t('click_col_theme'),
                    dataIndex: 'theme',
                    width: 80,
                  },
                  { title: t('click_col_ip'), dataIndex: 'ip', width: 130 },
                  {
                    title: t('click_col_uid'),
                    dataIndex: 'uid',
                    width: 80,
                    render: (v: number) => (v ? v : '-'),
                  },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
