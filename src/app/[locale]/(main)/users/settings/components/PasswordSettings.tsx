'use client';

import { LockOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { useChangePassword } from '@/lib/api/hooks/userSettings';
import { useRouter } from 'next/navigation';
import PasswordFormItems from '@/components/PasswordFormItems';

const { Title, Paragraph } = Typography;

export default function PasswordSettings() {
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
    <div className="flex flex-col gap-3">
      <Card className="bg-gradient-to-r">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <LockOutlined className="text-2xl" />
            </div>
          </div>
          <div className="flex-1">
            <Title level={4} className="!mb-2">
              {t('title')}
            </Title>
            <Paragraph className="!mb-4">{t('description')}</Paragraph>
          </div>
        </div>
      </Card>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          style={{ maxWidth: 400 }}
        >
          <Form.Item
            name="old_password"
            label={t('old_password')}
            rules={[{ required: true, message: t('old_password_required') }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('old_password_placeholder')}
            />
          </Form.Item>

          <PasswordFormItems t={(key: string) => t(key)} />

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('submit')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
