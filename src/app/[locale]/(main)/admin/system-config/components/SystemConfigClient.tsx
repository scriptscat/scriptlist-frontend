'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Progress,
  Spin,
  Switch,
} from 'antd';
import { useTranslations } from 'next-intl';
import { adminService } from '@/lib/api/services/admin';
import { scriptService } from '@/lib/api/services/scripts';
import type {
  MigrateAvatarStatus,
  SystemConfigItem,
} from '@/lib/api/services/admin';
import { APIError } from '@/types/api';

const policyDefaults: Record<string, string> = {
  'script_audit.enabled': 'true',
  'script_audit.max_pending_per_user': '1',
  'credit.review_threshold': '30',
  'credit.signal_register': '10',
  'credit.signal_register_7d': '10',
  'credit.signal_register_30d': '20',
  'credit.signal_register_180d': '20',
  'credit.signal_oauth_bind': '20',
  'credit.event_audit_approved': '15',
  'credit.event_audit_rejected': '-10',
  'credit.event_force_deleted': '-50',
  'credit.max_admin_adjust_delta': '1000',
};

export default function SystemConfigClient() {
  const t = useTranslations('admin.system_config');
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Record<string, string>>({});

  // Migrate avatar state
  const [migrateStarting, setMigrateStarting] = useState(false);
  const [migrateStatus, setMigrateStatus] =
    useState<MigrateAvatarStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Recompute trending_score state
  const [recomputing, setRecomputing] = useState(false);
  const [rebuildingEsIndex, setRebuildingEsIndex] = useState(false);

  const fetchConfigs = useCallback(async (isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    try {
      const resp = await adminService.getSystemConfigs();
      const map: Record<string, string> = {};
      for (const c of resp.configs) {
        map[c.key] = c.value;
      }
      setConfigs({ ...policyDefaults, ...map });
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  }, []);

  const fetchMigrateStatus = useCallback(async () => {
    try {
      const status = await adminService.getMigrateAvatarStatus();
      setMigrateStatus(status);
      if (!status.running && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    } catch {
      // ignore polling errors
    }
  }, []);

  useEffect(() => {
    fetchConfigs(true);
    fetchMigrateStatus();
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(fetchMigrateStatus, 2000);
  }, [fetchMigrateStatus]);

  const handleRecomputeTrending = async () => {
    setRecomputing(true);
    try {
      const resp = await adminService.recomputeTrendingScore();
      if (resp.started) {
        message.success(t('recompute_trending_started'));
      } else {
        message.info(t('recompute_trending_running'));
      }
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    } finally {
      setRecomputing(false);
    }
  };

  const handleRebuildEsIndex = async () => {
    setRebuildingEsIndex(true);
    try {
      await scriptService.migrateEs();
      message.success(t('es_index_started'));
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    } finally {
      setRebuildingEsIndex(false);
    }
  };

  const handleMigrateAvatar = async () => {
    setMigrateStarting(true);
    try {
      await adminService.migrateAvatar();
      message.success(t('migrate_avatar_started'));
      await fetchMigrateStatus();
      startPolling();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    } finally {
      setMigrateStarting(false);
    }
  };

  const handleSave = async (group: string, keys: string[]) => {
    setSaving(group);
    try {
      const items: SystemConfigItem[] = keys.map((key) => ({
        key,
        value: configs[key] || '',
      }));
      await adminService.updateSystemConfigs(items);
      message.success(t('save_success'));
      fetchConfigs();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    } finally {
      setSaving(null);
    }
  };

  const updateConfig = (key: string, value: string) => {
    setConfigs((prev) => ({ ...prev, [key]: value }));
  };

  const boolConfig = (key: string) =>
    configs[key] === 'true' || configs[key] === '1';

  const numberConfig = (key: string) => {
    const value = Number(configs[key]);
    return Number.isFinite(value) ? value : undefined;
  };

  const updateNumberConfig = (key: string, value: number | string | null) => {
    updateConfig(key, value === null ? '' : String(value));
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  const turnstileKeys = [
    'captcha.turnstile.site_key',
    'captcha.turnstile.secret_key',
  ];
  const ucenterKeys = ['ucenter.api', 'ucenter.key', 'ucenter.appid'];
  const aiKeys = ['ai.base_url', 'ai.api_key', 'ai.model', 'ai.system_prompt'];
  const auditCreditKeys = [
    'script_audit.enabled',
    'script_audit.max_pending_per_user',
    'credit.review_threshold',
    'credit.signal_register',
    'credit.signal_register_7d',
    'credit.signal_register_30d',
    'credit.signal_register_180d',
    'credit.signal_oauth_bind',
    'credit.event_audit_approved',
    'credit.event_audit_rejected',
    'credit.event_force_deleted',
    'credit.max_admin_adjust_delta',
  ];

  const migrateRunning = migrateStatus?.running ?? false;
  const migrateTotal = migrateStatus?.total ?? 0;
  const migrateProcessed =
    (migrateStatus?.migrated ?? 0) +
    (migrateStatus?.skipped ?? 0) +
    (migrateStatus?.failed ?? 0);
  const migratePercent =
    migrateTotal > 0 ? Math.round((migrateProcessed / migrateTotal) * 100) : 0;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{t('title')}</h2>

      <div className="space-y-6">
        {/* Turnstile */}
        <Card title={t('turnstile_title')} size="small">
          <Form layout="vertical">
            <Form.Item label={t('turnstile_site_key')}>
              <Input
                value={configs['captcha.turnstile.site_key'] || ''}
                onChange={(e) =>
                  updateConfig('captcha.turnstile.site_key', e.target.value)
                }
              />
            </Form.Item>
            <Form.Item label={t('turnstile_secret_key')}>
              <Input.Password
                value={configs['captcha.turnstile.secret_key'] || ''}
                onChange={(e) =>
                  updateConfig('captcha.turnstile.secret_key', e.target.value)
                }
              />
            </Form.Item>
            <Button
              type="primary"
              loading={saving === 'turnstile'}
              onClick={() => handleSave('turnstile', turnstileKeys)}
            >
              {t('save_button')}
            </Button>
          </Form>
        </Card>

        {/* Script audit and credit */}
        <Card title={t('audit_credit_title')} size="small">
          <Form layout="vertical">
            <Form.Item
              label={t('audit_enabled')}
              extra={t('audit_enabled_help')}
            >
              <Switch
                checked={boolConfig('script_audit.enabled')}
                onChange={(checked) =>
                  updateConfig(
                    'script_audit.enabled',
                    checked ? 'true' : 'false',
                  )
                }
              />
            </Form.Item>
            <Form.Item
              label={t('audit_max_pending')}
              extra={t('audit_max_pending_help')}
            >
              <InputNumber
                min={1}
                precision={0}
                className="w-full"
                value={numberConfig('script_audit.max_pending_per_user')}
                onChange={(value) =>
                  updateNumberConfig('script_audit.max_pending_per_user', value)
                }
              />
            </Form.Item>
            <Form.Item
              label={t('credit_review_threshold')}
              extra={t('credit_review_threshold_help')}
            >
              <InputNumber
                min={1}
                precision={0}
                className="w-full"
                value={numberConfig('credit.review_threshold')}
                onChange={(value) =>
                  updateNumberConfig('credit.review_threshold', value)
                }
              />
            </Form.Item>
            <Form.Item
              label={t('credit_signal_register')}
              extra={t('credit_signal_register_help')}
            >
              <InputNumber
                min={0}
                precision={0}
                className="w-full"
                value={numberConfig('credit.signal_register')}
                onChange={(value) =>
                  updateNumberConfig('credit.signal_register', value)
                }
              />
            </Form.Item>
            <Form.Item label={t('credit_signal_register_7d')}>
              <InputNumber
                min={0}
                precision={0}
                className="w-full"
                value={numberConfig('credit.signal_register_7d')}
                onChange={(value) =>
                  updateNumberConfig('credit.signal_register_7d', value)
                }
              />
            </Form.Item>
            <Form.Item label={t('credit_signal_register_30d')}>
              <InputNumber
                min={0}
                precision={0}
                className="w-full"
                value={numberConfig('credit.signal_register_30d')}
                onChange={(value) =>
                  updateNumberConfig('credit.signal_register_30d', value)
                }
              />
            </Form.Item>
            <Form.Item label={t('credit_signal_register_180d')}>
              <InputNumber
                min={0}
                precision={0}
                className="w-full"
                value={numberConfig('credit.signal_register_180d')}
                onChange={(value) =>
                  updateNumberConfig('credit.signal_register_180d', value)
                }
              />
            </Form.Item>
            <Form.Item
              label={t('credit_signal_oauth_bind')}
              extra={t('credit_signal_oauth_bind_help')}
            >
              <InputNumber
                min={0}
                precision={0}
                className="w-full"
                value={numberConfig('credit.signal_oauth_bind')}
                onChange={(value) =>
                  updateNumberConfig('credit.signal_oauth_bind', value)
                }
              />
            </Form.Item>
            <Form.Item
              label={t('credit_event_audit_approved')}
              extra={t('credit_event_help')}
            >
              <InputNumber
                precision={0}
                className="w-full"
                value={numberConfig('credit.event_audit_approved')}
                onChange={(value) =>
                  updateNumberConfig('credit.event_audit_approved', value)
                }
              />
            </Form.Item>
            <Form.Item label={t('credit_event_audit_rejected')}>
              <InputNumber
                precision={0}
                className="w-full"
                value={numberConfig('credit.event_audit_rejected')}
                onChange={(value) =>
                  updateNumberConfig('credit.event_audit_rejected', value)
                }
              />
            </Form.Item>
            <Form.Item label={t('credit_event_force_deleted')}>
              <InputNumber
                precision={0}
                className="w-full"
                value={numberConfig('credit.event_force_deleted')}
                onChange={(value) =>
                  updateNumberConfig('credit.event_force_deleted', value)
                }
              />
            </Form.Item>
            <Form.Item
              label={t('credit_max_admin_adjust_delta')}
              extra={t('credit_max_admin_adjust_delta_help')}
            >
              <InputNumber
                min={1}
                precision={0}
                className="w-full"
                value={numberConfig('credit.max_admin_adjust_delta')}
                onChange={(value) =>
                  updateNumberConfig('credit.max_admin_adjust_delta', value)
                }
              />
            </Form.Item>
            <Button
              type="primary"
              loading={saving === 'audit-credit'}
              onClick={() => handleSave('audit-credit', auditCreditKeys)}
            >
              {t('save_button')}
            </Button>
          </Form>
        </Card>

        {/* UCenter */}
        <Card title={t('ucenter_title')} size="small">
          <Form layout="vertical">
            <Form.Item label={t('ucenter_api')}>
              <Input
                value={configs['ucenter.api'] || ''}
                onChange={(e) => updateConfig('ucenter.api', e.target.value)}
              />
            </Form.Item>
            <Form.Item label={t('ucenter_key')}>
              <Input.Password
                value={configs['ucenter.key'] || ''}
                onChange={(e) => updateConfig('ucenter.key', e.target.value)}
              />
            </Form.Item>
            <Form.Item label={t('ucenter_appid')}>
              <Input
                value={configs['ucenter.appid'] || ''}
                onChange={(e) => updateConfig('ucenter.appid', e.target.value)}
              />
            </Form.Item>
            <Button
              type="primary"
              loading={saving === 'ucenter'}
              onClick={() => handleSave('ucenter', ucenterKeys)}
            >
              {t('save_button')}
            </Button>
          </Form>
        </Card>

        {/* Migrate Avatar */}
        <Card title={t('migrate_avatar_title')} size="small">
          <div className="space-y-4">
            <Popconfirm
              title={t('migrate_avatar_confirm')}
              onConfirm={handleMigrateAvatar}
              disabled={migrateRunning}
            >
              <Button
                type="primary"
                loading={migrateStarting}
                disabled={migrateRunning}
              >
                {t('migrate_avatar_button')}
              </Button>
            </Popconfirm>

            {migrateStatus &&
              (migrateRunning || migrateStatus.message !== '') && (
                <div>
                  {migrateRunning && (
                    <Progress percent={migratePercent} status="active" />
                  )}
                  {!migrateRunning &&
                    migrateStatus.message === 'completed' &&
                    migrateProcessed > 0 && (
                      <Progress percent={100} status="success" />
                    )}
                  <div className="text-sm text-gray-500 mt-2">
                    {t('migrate_avatar_progress', {
                      migrated: migrateStatus.migrated,
                      skipped: migrateStatus.skipped,
                      failed: migrateStatus.failed,
                      total: migrateStatus.total,
                    })}
                  </div>
                  {!migrateRunning &&
                    migrateStatus.message &&
                    migrateStatus.message !== 'completed' &&
                    migrateStatus.message !== '' && (
                      <div className="text-sm text-red-500 mt-1">
                        {migrateStatus.message}
                      </div>
                    )}
                </div>
              )}
          </div>
        </Card>

        {/* ES search index */}
        <Card title={t('es_index_title')} size="small">
          <div className="space-y-2">
            <div className="text-sm text-gray-500">{t('es_index_hint')}</div>
            <Popconfirm
              title={t('es_index_confirm')}
              onConfirm={handleRebuildEsIndex}
            >
              <Button type="primary" loading={rebuildingEsIndex}>
                {t('es_index_button')}
              </Button>
            </Popconfirm>
          </div>
        </Card>

        {/* Ranking: recompute trending_score */}
        <Card title={t('ranking_title')} size="small">
          <div className="space-y-2">
            <div className="text-sm text-gray-500">
              {t('recompute_trending_hint')}
            </div>
            <Popconfirm
              title={t('recompute_trending_confirm')}
              onConfirm={handleRecomputeTrending}
            >
              <Button type="primary" loading={recomputing}>
                {t('recompute_trending_button')}
              </Button>
            </Popconfirm>
          </div>
        </Card>

        {/* AI */}
        <Card title={t('ai_title')} size="small">
          <Form layout="vertical">
            <Form.Item label={t('ai_base_url')}>
              <Input
                value={configs['ai.base_url'] || ''}
                onChange={(e) => updateConfig('ai.base_url', e.target.value)}
              />
            </Form.Item>
            <Form.Item label={t('ai_api_key')}>
              <Input.Password
                value={configs['ai.api_key'] || ''}
                onChange={(e) => updateConfig('ai.api_key', e.target.value)}
              />
            </Form.Item>
            <Form.Item label={t('ai_model')}>
              <Input
                value={configs['ai.model'] || ''}
                onChange={(e) => updateConfig('ai.model', e.target.value)}
              />
            </Form.Item>
            <Form.Item label={t('ai_system_prompt')}>
              <Input.TextArea
                rows={4}
                value={configs['ai.system_prompt'] || ''}
                onChange={(e) =>
                  updateConfig('ai.system_prompt', e.target.value)
                }
              />
            </Form.Item>
            <Button
              type="primary"
              loading={saving === 'ai'}
              onClick={() => handleSave('ai', aiKeys)}
            >
              {t('save_button')}
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
