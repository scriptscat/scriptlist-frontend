import {
  Link,
  Outlet,
  useCatch,
  useLoaderData,
  useLocation,
} from '@remix-run/react';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getScript } from '~/services/scripts/api';
import type { Script } from '~/services/scripts/types';
import { ScriptContext, UserContext } from '~/context-manager';
import { useContext } from 'react';

export type LoaderData = {
  script: Script;
};

export const meta: MetaFunction = ({ data, location }) => {
  if (!data) {
    return {
      title: '未找到脚本 - ScriptCat',
      description: 'Not Found',
    };
  }
  const match = /\d+\/(\w+)(\/|$)/g.exec(location.pathname);
  const current = match ? match[1] : 'home';
  const map: { [key: string]: string } = {
    code: '代码',
    issue: '反馈',
    comment: '评分',
    version: '版本列表',
    update: '更新脚本',
    statistic: '安装统计',
    manage: '脚本管理',
  };
  return {
    title: data.script.name + (map[current] ? ' - ' + map[current] : ''),
    description: data.script.description,
  };
};

export function CatchBoundary() {
  const caught = useCatch();
  return <span className="text-2xl">{caught.data}</span>;
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const script = await getScript(parseInt(params.id as string));
  if (!script) {
    throw new Response('脚本不存在', { status: 404, statusText: 'Not Found' });
  }
  return json({ script } as LoaderData);
};

export default function ScriptShowPage() {
  const users = useContext(UserContext);
  const data = useLoaderData<LoaderData>();
  const location = useLocation();
  const match = /\d+\/(\w+)(\/|$)/g.exec(location.pathname);
  const current = match ? match[1] : 'home';

  const items: MenuProps['items'] = [
    {
      key: 'home',
      label: <Link to={'./'}>首页</Link>,
    },
    {
      key: 'code',
      label: <Link to={'./code'}>代码</Link>,
    },
    {
      key: 'issue',
      label: <Link to={'./issue'}>反馈</Link>,
    },
    {
      key: 'comment',
      label: <Link to={'./comment'}>评分</Link>,
    },
    {
      key: 'version',
      label: <Link to={'./version'}>版本列表</Link>,
    },
  ];
  if (users.user && users.user.user.uid === data.script.uid) {
    items.push(
      ...[
        {
          key: 'update',
          label: <Link to={'./update'}>更新脚本</Link>,
        },
        {
          key: 'statistic',
          label: <Link to={'./statistic'}>安装统计</Link>,
        },
        {
          key: 'manage',
          label: <Link to={'./manage'}>脚本管理</Link>,
        },
      ]
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <Link
          to={'/script-show-page/' + data.script.id}
          className="text-2xl text-black dark:text-white"
        >
          {data.script.name}
        </Link>
        <Menu selectedKeys={[current]} mode="horizontal" items={items}></Menu>

        <ScriptContext.Provider value={{ script: data.script }}>
          <Outlet />
        </ScriptContext.Provider>
      </div>
    </>
  );
}
