'use client';

import { LockOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { useChangePassword } from '@/lib/api/hooks/userSettings';
import { useRouter } from 'next/navigation';
import PasswordFormItems from '@/components/PasswordFormItems';

const { Paragraph } = Typography;

interface PasswordSettingsProps {
  embedded?: boolean;
}

export default function PasswordSettings({ embedded }: PasswordSettingsProps) {
  const t = useTranslations('user.password');
  const { changePassword, loading } = useChangePassword();
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = async (values: {
    old_password: string;
    new_password: string;
  }) => {
    try {
      await changePassword(values.old_password, values.new_password);
      message.success(t('change_success'));
      form.resetFields();
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || t('change_failed'));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {!embedded && (
        <div className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-5 dark:border-neutral-700 dark:bg-neutral-800/50">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-emerald-500/10 text-xl text-emerald-500">
            <LockOutlined />
          </div>
          <div>
            <h3 className="m-0 mb-1 text-base font-semibold">{t('title')}</h3>
            <Paragraph className="!mb-0" type="secondary">
              {t('description')}
            </Paragraph>
          </div>
        </div>
      )}

      <Card bordered>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          className="max-w-[440px]"
        >
          <Form.Item
            name="old_password"
            label={t('old_password')}
            rules={[{ required: true, message: t('old_password_required') }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('old_password_placeholder')}
              size="large"
            />
          </Form.Item>

          <div className="my-4 h-px bg-neutral-200 dark:bg-neutral-700" />

          <PasswordFormItems t={(key: string) => t(key)} />

          <Form.Item className="!mb-0 !mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              {t('submit')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
