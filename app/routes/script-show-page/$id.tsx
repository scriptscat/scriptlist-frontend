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
import { ScriptContext } from '~/context-manager';

export type LoaderData = {
  script: Script;
};

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  if (!data) {
    return {
      title: '未找到脚本 - ScriptCat',
      description: 'Not Found',
    };
  }
  return {
    title: data.script.name,
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
];

export default function ScriptShowPage() {
  const data = useLoaderData<LoaderData>();
  const location = useLocation();
  const match = /\d+\/(\w+)(\/|$)/g.exec(location.pathname);
  const current = match ? match[1] : 'home';

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
