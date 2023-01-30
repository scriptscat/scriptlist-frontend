import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Button, Card, message, Modal, Steps } from 'antd';
import { useContext } from 'react';
import { useState } from 'react';
import { UserContext } from '~/context-manager';
import { GetWebhook, RefreshWebhookToken } from '~/services/users/api';
import type { Webhook as WebhookResp } from '~/services/users/types';

export type LoaderData = {
  token: WebhookResp;
};

export const meta: MetaFunction = () => ({
  title: 'Webhook管理 - ScriptCat',
});

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

  const onChange = (value: number) => {
    setCurrent(value);
  };
  return (
    <>
      <Card title="Scriptcat(脚本猫)的WebHook设置">
        <span>
          使用Webhook可以接受来自Github等地方等消息,在脚本页面的脚本管理中配置更新URL,可以实现自动的即时的脚本更新
        </span>
        {contextHolder}
        <div className="flex flex-col">
          <span className="text-base">
            与“脚本猫”绑定的Webhook（网页通知事件）可以基于代码仓库的更新而自动更新网站上对应的脚本。
          </span>
          <span className="text-base">
            脚本猫支持 GitHub的push（推送）事件和 GitHub的release（发布）事件。
          </span>
          <span className="text-base">
            要使用该功能，你必须在脚本猫设定通过地址同步脚本的功能。
          </span>
          <span className="text-base">
            你可以通过导入脚本到脚本猫来添加，或从已提交脚本的“管理”页面来设定同步。
          </span>
          <span className="text-base">
            你的脚本在收到第一次自动推送的事件之前，脚本的同步类型还是会显示为“自动”或“手动”。
          </span>
        </div>

        <Steps current={current} onChange={onChange} direction="vertical">
          <Steps.Step title="Step 1" description="访问Github仓库进入Settings" />
          <Steps.Step
            title="Step 2"
            description='点击"Add webhook"，输入下方数据'
          />
          <Steps.Step
            title="Step 3"
            description={
              <div className="flex flex-col">
                <span className="text-lg mt-2">选择事件</span>
                <span className="text-sm">
                  如果你想让Script的脚本只在"push"行为后更新,请选择"Just the
                  push event"
                </span>
                <span className="text-sm">
                  如果你想让Script的脚本只在"releases"行为后更新,请选择"Let me
                  select individual events"
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
              title: '确认是否刷新密钥?',
              content: '请注意,刷新之后之前的密钥将会失效,无法再恢复',
              icon: <ExclamationCircleOutlined />,
              okText: '确认',
              cancelText: '取消',
              onOk: async () => {
                setLoading(true);
                const resp = await RefreshWebhookToken();
                setLoading(false);
                if (resp.code === 0) {
                  setToken(resp.data.token);
                  message.success('刷新成功,请注意修改原来的密钥');
                } else {
                  message.error(resp.msg);
                }
              },
            });
          }}
        >
          刷新Secret
        </Button>
      </Card>
    </>
  );
}
