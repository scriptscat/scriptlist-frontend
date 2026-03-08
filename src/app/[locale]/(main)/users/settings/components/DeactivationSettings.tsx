'use client';

import { StopOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Typography,
} from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  useSendDeactivateCode,
  useDeactivate,
  useCancelDeactivate,
} from '@/lib/api/hooks/userSettings';

const { Paragraph } = Typography;

interface DeactivationSettingsProps {
  userStatus?: number;
  deactivateAt?: number;
  embedded?: boolean;
}

export default function DeactivationSettings({
  userStatus,
  deactivateAt,
  embedded,
}: DeactivationSettingsProps) {
  const t = useTranslations('user.deactivate');
  const { sendCode, loading: sendLoading } = useSendDeactivateCode();
  const { deactivate, loading: deactivateLoading } = useDeactivate();
  const { cancelDeactivate, loading: cancelLoading } = useCancelDeactivate();
  const [form] = Form.useForm();
  const router = useRouter();

  const isDeactivating = userStatus === 3;

  const effectiveDate = deactivateAt
    ? new Date((deactivateAt + 30 * 24 * 3600) * 1000).toLocaleDateString()
    : '';

  const handleSendCode = async () => {
    try {
      await sendCode();
      message.success(t('code_sent'));
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || t('deactivate_failed'));
    }
  };

  const handleDeactivate = async (values: { code: string }) => {
    Modal.confirm({
      title: t('confirm_title'),
      icon: <ExclamationCircleOutlined />,
      content: t('confirm_content'),
      okText: t('confirm_deactivate'),
      okType: 'danger',
      onOk: async () => {
        try {
          await deactivate(values.code);
          message.success(t('deactivate_success'));
          form.resetFields();
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        } catch (error: unknown) {
          const err = error as { message?: string };
          message.error(err?.message || t('deactivate_failed'));
        }
      },
    });
  };

  const handleCancelDeactivate = async () => {
    try {
      await cancelDeactivate();
      message.success(t('cancel_success'));
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || t('cancel_failed'));
    }
  };

  // 注销冷却中状态
  if (isDeactivating) {
    return (
      <div className="flex flex-col gap-5">
        {!embedded && (
          <div className="flex items-start gap-4 rounded-xl border border-red-200 bg-red-50 px-6 py-5 dark:border-red-900 dark:bg-red-950/50">
            <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-red-500/10 text-xl text-red-500">
              <StopOutlined />
            </div>
            <div>
              <h3 className="m-0 mb-1 text-base font-semibold text-red-600 dark:text-red-400">
                {t('cooling_title')}
              </h3>
              <Paragraph className="!mb-0 text-red-600 dark:text-red-400">
                {t('cooling_description', { effectiveDate })}
              </Paragraph>
            </div>
          </div>
        )}

        <Card bordered>
          <div className="flex flex-col gap-4">
            <Alert
              type="warning"
              showIcon
              message={
                <div className="flex flex-col gap-1">
                  <span>
                    {t('applied_at')}
                    {': '}
                    {deactivateAt
                      ? new Date(deactivateAt * 1000).toLocaleString()
                      : '-'}
                  </span>
                  <span>
                    {t('effective_at')}
                    {': '}
                    {effectiveDate}
                  </span>
                </div>
              }
            />
            <Button
              type="primary"
              onClick={handleCancelDeactivate}
              loading={cancelLoading}
              size="large"
            >
              {t('cancel_deactivate')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 正常状态 - 显示注销表单
  return (
    <div className="flex flex-col gap-5">
      {!embedded && (
        <div className="flex items-start gap-4 rounded-xl border border-red-200 bg-red-50 px-6 py-5 dark:border-red-900 dark:bg-red-950/50">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-red-500/10 text-xl text-red-500">
            <StopOutlined />
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
        <Alert type="error" showIcon message={t('warning')} className="mb-6" />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleDeactivate}
          autoComplete="off"
          className="max-w-[440px]"
        >
          <Form.Item>
            <Button onClick={handleSendCode} loading={sendLoading} size="large">
              {t('send_code')}
            </Button>
          </Form.Item>

          <Form.Item
            name="code"
            label={t('code_label')}
            rules={[{ required: true, message: t('code_placeholder') }]}
          >
            <Input
              placeholder={t('code_placeholder')}
              size="large"
              maxLength={6}
            />
          </Form.Item>

          <Form.Item className="!mb-0 !mt-6">
            <Button
              type="primary"
              danger
              htmlType="submit"
              loading={deactivateLoading}
              size="large"
            >
              {t('confirm_deactivate')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
