'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Form, Input, message, Spin } from 'antd';
import { useTranslations } from 'next-intl';
import { adminService } from '@/lib/api/services/admin';
import type { SystemConfigItem } from '@/lib/api/services/admin';
import { APIError } from '@/types/api';

export default function SystemConfigClient() {
  const t = useTranslations('admin.system_config');
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Record<string, string>>({});

  const fetchConfigs = useCallback(async (isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    try {
      const resp = await adminService.getSystemConfigs();
      const map: Record<string, string> = {};
      for (const c of resp.configs) {
        map[c.key] = c.value;
      }
      setConfigs(map);
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs(true);
  }, []);

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
