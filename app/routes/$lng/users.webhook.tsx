import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { V2_MetaFunction } from '@remix-run/react';
import { useLoaderData } from '@remix-run/react';
import { Button, Card, message, Modal, Steps } from 'antd';
import { useContext } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '~/context-manager';
import { GetWebhook, RefreshWebhookToken } from '~/services/users/api';
import type { Webhook as WebhookResp } from '~/services/users/types';

export type LoaderData = {
  token: WebhookResp;
};

export const meta: V2_MetaFunction = () => {
  const { t } = useTranslation();
  return [{ title: t('webhook_management') + ' - ScriptCat' }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const resp = await GetWebhook(request);
  if (resp.code != 0) {
    throw new Response(resp.msg, {
      status: 403,
      statusText: 'Forbidden',
    });
  }
  return json({ token: resp.data } as LoaderData);
};

export default function Webhook() {
  const data = useLoaderData<LoaderData>();
  const [modal, contextHolder] = Modal.useModal();
  const [current, setCurrent] = useState(0);
  const [token, setToken] = useState(data.token.token);
  const user = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const onChange = (value: number) => {
    setCurrent(value);
  };
  return (
    <>
      <Card title={t('webhook_title')}>
        <span>{t('webhook_description')}</span>
        {contextHolder}
        <div className="flex flex-col">
          <span className="text-base">{t('webhook_binding_description')}</span>
          <span className="text-base">
            {t('webhook_push_event_description')}
          </span>
          <span className="text-base">
            {t('webhook_sync_script_description')}
          </span>
          <span className="text-base">
            {t('webhook_sync_script_manual_auto')}
          </span>
          <span className="text-base">
            {t('webhook_sync_type_before_first_push')}
          </span>
        </div>

        <Steps current={current} onChange={onChange} direction="vertical">
          <Steps.Step
            title={t('webhook_step1_title')}
            description={t('webhook_step1_description')}
          />
          <Steps.Step
            title={t('webhook_step2_title')}
            description={t('webhook_step2_description')}
          />
          <Steps.Step
            title={t('webhook_step3_title')}
            description={
              <div className="flex flex-col">
                <span className="text-lg mt-2">
                  {t('webhook_step3_select_event')}
                </span>
                <span className="text-sm">
                  {t('webhook_step3_push_event_description')}
                </span>
                <span className="text-sm">
                  {t('webhook_step3_release_event_description')}
                </span>
              </div>
            }
          />
        </Steps>
        <div className="flex flex-col">
          <span className="text-lg">Url</span>
          <span className="text-sm">
            {user.env?.APP_API_URL}/webhook/{user.user?.user_id}
          </span>
          <span className="text-lg mt-2">Content-Type</span>
          <span className="text-sm">application/json</span>
          <span className="text-lg mt-2">Secret</span>
          <span className="text-sm">{token}</span>
        </div>
        <Button
          type="primary"
          danger
          className="!mt-2"
          loading={loading}
          onClick={() => {
            modal.confirm({
              title: t('webhook_refresh_secret_confirm_title'),
              content: t('webhook_refresh_secret_confirm_content'),
              icon: <ExclamationCircleOutlined />,
              okText: t('onfirm'),
              cancelText: t('cancel'),
              onOk: async () => {
                setLoading(true);
                const resp = await RefreshWebhookToken();
                setLoading(false);
                if (resp.code === 0) {
                  setToken(resp.data.token);
                  message.success(t('webhook_refresh_success_message'));
                } else {
                  message.error(resp.msg);
                }
              },
            });
          }}
        >
          {t('webhook_refresh_secret_button')}
        </Button>
      </Card>
    </>
  );
}
