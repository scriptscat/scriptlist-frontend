import {
  Link,
  Outlet,
  useCatch,
  useLoaderData,
  useLocation,
} from '@remix-run/react';
import type { MenuProps } from 'antd';
import { Space, Tag } from 'antd';
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
import { forwardHeaders } from '~/utils/cookie';
import { scriptName } from '~/utils/utils';

export type LoaderData = {
  script: Script & { issue_num: number };
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
    statistic: '脚本统计',
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
  if (script.data.code !== 0) {
    throw new Response(script.data.msg, {
      status: 404,
      statusText: 'Not Found',
    });
  }
  return json({ script: script.data.data } as LoaderData, {
    headers: forwardHeaders(script),
  });
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
  }, []);
  useEffect(() => {
    const clipboard = new ClipboardJS('.copy-require-link', {
      text: (target) => {
        message.success('复制成功');
        return target.getAttribute('require-link') || '';
      },
    });
    return () => {
      clipboard.destroy();
    };
  }, []);
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
      label: (
        <Link to={'./issue'}>
          <Space>
            反馈
            {data.script.issue_num > 0 && (
              <Tag
                className="dark:!bg-gray-600 !bg-gray-200"
                style={{
                  border: 0,
                  borderRadius: '50%',
                  fontWeight: '500',
                }}
              >
                {data.script.issue_num > 99 ? '99+' : data.script.issue_num}
              </Tag>
            )}
          </Space>
        </Link>
      ),
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
  if (
    users.user &&
    (users.user.user_id === data.script.user_id || users.user.is_admin === 1)
  ) {
    items.push(
      ...[
        {
          key: 'update',
          label: <Link to={'./update'}>更新脚本</Link>,
        },
        {
          key: 'statistic',
          label: <Link to={'./statistic'}>脚本统计</Link>,
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
      !(
        users.user &&
        (users.user.user_id === data.script.user_id ||
          users.user.is_admin === 1)
      ) &&
      ['update', 'statistic', 'manage'].indexOf(current) !== -1
    ) {
      setForbidden(true);
    } else {
      setForbidden(false);
    }
  }, [users.user, data.script.user_id, current]);

  return (
    <>
      <div className="flex flex-col gap-3">
        {data.script.archive == 1 && (
          <Alert
            message="脚本已归档"
            description="该脚本已经被作者归档,脚本可能失效并且作者不再维护,您无法再进行问题反馈."
            type="warning"
            showIcon
            closable
          />
        )}
        {data.script.danger == 1 && (
          <Alert
            message="脚本代码经过了不可读处理"
            description="该脚本已经被作者经过了不可读处理,虽然脚本站已经经过了一层审查,但还是请不要给予危险权限."
            type="error"
            showIcon
            closable
          />
        )}
        <Link
          to={'/script-show-page/' + data.script.id}
          className="text-2xl text-black dark:text-white"
        >
          {scriptName(data.script)}
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
