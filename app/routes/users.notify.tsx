import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { V2_MetaFunction } from '@remix-run/react';
import { useLoaderData } from '@remix-run/react';
import { Card, Checkbox, message, Space } from 'antd';
import { useState } from 'react';
import { SetUsetNotify, UserConfig } from '~/services/users/api';
import type { UserConfig as UserConfigItem } from '~/services/users/types';

export const meta: V2_MetaFunction = () => [
  { title: '用户通知管理 - ScriptCat' },
];

const notifyItem = [
  {
    key: 'at',
    description: '艾特我时发送邮件通知',
  },
  {
    key: 'create_script',
    description: '关注的用户创建脚本时发送邮件通知',
  },
  {
    key: 'score',
    description: '当我的脚本被评分时发送通知',
  },
  {
    key: 'script_update',
    description: '关注的脚本更新时发送通知',
  },
  {
    key: 'script_issue',
    description: '关注的脚本创建反馈时发送通知',
  },
  {
    key: 'script_issue_comment',
    description: '关注的反馈有新评论时发送通知',
  },
];

export type LoaderData = {
  config: UserConfigItem;
};

export const loader: LoaderFunction = async ({ request }) => {
  const resp = await UserConfig(request);
  if (resp.code != 0) {
    throw new Response('没有权限访问', {
      status: 403,
      statusText: 'Forbidden',
    });
  }
  return json({
    config: resp.data,
  } as LoaderData);
};

export default function Notify() {
  const data = useLoaderData<LoaderData>();
  const [notifyChecked, setNotifyChecked] = useState(data.config.notify);
  const [loading, setLoading] = useState(false);

  return (
    <Card>
      <Space direction="vertical">
        <span>当发送下面事件时,系统将会通过邮箱发送给您</span>
        {notifyItem.map((item, index) => (
          <Checkbox
            key={item.key}
            onChange={async (checked) => {
              setLoading(true);
              notifyChecked[item.key] = checked.target.checked;
              let resp = await SetUsetNotify(notifyChecked);
              setLoading(false);
              if (resp.code == 0) {
                setLoading(false);
                setNotifyChecked(notifyChecked);
              } else {
                message.error(resp.msg);
              }
            }}
            checked={notifyChecked[item.key]}
          >
            {item.description}
          </Checkbox>
        ))}
      </Space>
    </Card>
  );
}
