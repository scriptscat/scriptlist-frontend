import {
  Link,
  Outlet,
  useCatch,
  useLoaderData,
  useLocation,
} from '@remix-run/react';
import type { MenuProps} from 'antd';
import { Alert, message } from 'antd';
import { Menu } from 'antd';
import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getScript } from '~/services/scripts/api';
import type { Script } from '~/services/scripts/types';
import { ScriptContext, UserContext } from '~/context-manager';
import { useContext } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import ClipboardJS from 'clipboard';

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
  return <span className="text-2xl dark:text-white">{caught.data}</span>;
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const script = await getScript(parseInt(params.id as string), request);
  if (script.code !== 0) {
    throw new Response(script.msg, { status: 404, statusText: 'Not Found' });
  }
  return json({ script: script.data } as LoaderData);
};

export default function ScriptShowPage() {
  const users = useContext(UserContext);
  const data = useLoaderData<LoaderData>();
  const location = useLocation();
  const match = /\d+\/(\w+)(\/|$)/g.exec(location.pathname);
  const current = match ? match[1] : 'home';
  const [forbidden, setForbidden] = useState(false);
  useEffect(() => {
    const clipboard = new ClipboardJS('.copy-script-link', {
      text: (target) => {
        message.success('复制成功');
        return (
          target.getAttribute('script-name') +
          '\n' +
          window.location.origin +
          '/script-show-page/' +
          target.getAttribute('script-id')
        );
      },
    });
    return () => {
      clipboard.destroy();
    };
  });
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
  if (users.user && users.user.uid === data.script.uid) {
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
  useEffect(() => {
    if (
      !(users.user && users.user.uid === data.script.uid) &&
      ['update', 'statistic', 'manage'].indexOf(current) !== -1
    ) {
      setForbidden(true);
    } else {
      setForbidden(false);
    }
  }, [users.user, data.script.uid, current]);

  return (
    <>
      <div className="flex flex-col gap-3">
        {data.script.archive != 0 && (
          <Alert
            message="脚本已归档"
            description="该脚本已经被作者归档,脚本可能失效并且作者不再维护,您无法再进行问题反馈."
            type="warning"
            showIcon
            closable
          />
        )}
        <Link
          to={'/script-show-page/' + data.script.id}
          className="text-2xl text-black dark:text-white"
        >
          {data.script.name}
        </Link>
        <Menu selectedKeys={[current]} mode="horizontal" items={items}></Menu>

        <ScriptContext.Provider value={{ script: data.script }}>
          {forbidden ? (
            <span className="text-2xl dark:text-white">没有权限访问此页面</span>
          ) : (
            <Outlet />
          )}
        </ScriptContext.Provider>
      </div>
    </>
  );
}
