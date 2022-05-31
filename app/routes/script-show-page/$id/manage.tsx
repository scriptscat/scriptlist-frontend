import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Button, Card, Divider, Input, Radio, Space } from 'antd';
import { useState } from 'react';
import { GetScriptSetting } from '~/services/scripts/api';
import { ScriptSetting } from '~/services/scripts/types';

type LoaderData = {
  setting: ScriptSetting;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const resp = await GetScriptSetting(parseInt(params.id as string), request);
  if (resp.code === 3005) {
    throw new Response('没有权限访问此页面', {
      status: 403,
      statusText: 'Forbidden ',
    });
  }
  return json({ setting: resp.data } as LoaderData);
};

export default function Manage() {
  const data = useLoaderData<LoaderData>();
  const [syncUrl, setSyncUrl] = useState(data.setting.sync_url);
  const [syncMode, setSyncMode] = useState(data.setting.sync_mode);
  const [contentUrl, setContentUrl] = useState(data.setting.content_url);

  return (
    <Card>
      <div className="flex flex-col items-start gap-1">
        <h3 className="text-lg">源代码同步</h3>
        <span>自动从输入的地址中进行源代码同步操作。</span>
        <Input
          placeholder="脚本源代码同步 URL"
          value={syncUrl}
          onChange={(value) => setSyncUrl(value.target.value)}
        />
        <h3 className="text-lg">脚本同步方式</h3>
        <Radio.Group
          onChange={(value) => setSyncMode(value.target.value)}
          value={syncMode}
        >
          <Space direction="vertical">
            <Radio value={1}>自动，系统将在未来时间内定期进行更新检查</Radio>
            <Radio value={2}>手动，仅在你手动点击按钮的时候进行更新检查</Radio>
          </Space>
        </Radio.Group>
        <h3 className="text-lg">同步脚本附加信息</h3>
        <span>强制使用markdown语法</span>
        <Input
          placeholder="脚本README同步 URL"
          value={contentUrl}
          onChange={(value) => setContentUrl(value.target.value)}
        />
        <Button type="primary">更新设置并且立刻同步</Button>
        <Divider></Divider>
        <h3 className="text-lg">脚本管理</h3>
        <Space>
          <Button
            type="primary"
            className="!bg-orange-400 !border-orange-400 hover:!bg-orange-300 hover:!border-orange-300"
          >
            归档脚本
          </Button>
          <Button type="primary" danger>
            删除脚本
          </Button>
        </Space>
        <Divider></Divider>
        <h3 className="text-lg">管理日志</h3>
        <span>暂未开放</span>
      </div>
    </Card>
  );
}
