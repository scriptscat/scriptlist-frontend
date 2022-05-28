import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Button, Card, Steps } from 'antd';
import { useState } from 'react';

export const loader: LoaderFunction = ({ context }) => {
  console.log(context);
  return json({});
};

export default function Webhook() {
  const [current, setCurrent] = useState(0);

  const onChange = (value: number) => {
    console.log('onChange:', current);
    setCurrent(value);
  };
  return (
    <>
      <Card title="Scriptcat(脚本猫)的WebHook设置">
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
                <span className="text-lg">Url</span>
                <span className="text-sm">
                  http://test.list.ggnb.top:18000/api/v1/webhook/4
                </span>
                <span className="text-lg mt-2">Content-Type</span>
                <span className="text-sm">application/json</span>
                <span className="text-lg mt-2">Secret</span>
                <span className="text-sm">
                  ehqvib5fove3d6lwpv9d91xqr2pn8w23o676ng5jpiliq02mn0qak0c8sok9fl26
                </span>
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
        <Button type="primary" danger>
          刷新Secret
        </Button>
      </Card>
    </>
  );
}
