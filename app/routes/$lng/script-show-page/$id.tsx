import type { V2_MetaFunction } from '@remix-run/react';
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
import type { LoaderFunction } from '@remix-run/node';
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
import { useTranslation } from 'react-i18next';
import { useLocale } from 'remix-i18next';

export type LoaderData = {
  script: Script & { issue_num: number };
};

export const meta: V2_MetaFunction = ({ data, location }) => {
  const { t } = useTranslation();
  if (!data) {
    return [
      { title: t('script_not_found') + ' - ScriptCat' },
      { description: 'Not Found' },
    ];
  }
  const match = /\d+\/(\w+)(\/|$)/g.exec(location.pathname);
  const current = match ? match[1] : 'home';
  const map: { [key: string]: string } = {
    code: t('code'),
    issue: t('issue'),
    comment: t('comment'),
    version: t('version_list'),
    update: t('update_script'),
    statistic: t('script_statistic'),
    manage: t('script_manage'),
  };
  return [
    { title: data.script.name + (map[current] ? ' - ' + map[current] : '') },
    { description: data.script.description },
  ];
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
  const { t } = useTranslation();
  const locale = '/' + useLocale();

  useEffect(() => {
    const clipboard = new ClipboardJS('.copy-script-link', {
      text: (target) => {
        message.success(t('copy_success'));
        return (
          target.getAttribute('script-name') +
          '\n' +
          window.location.origin +
          locale +
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
        message.success(t('copy_success'));
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
      label: <Link to={'./'}>{t('home')}</Link>,
    },
    {
      key: 'code',
      label: <Link to={'./code'}>{t('code')}</Link>,
    },
    {
      key: 'issue',
      label: (
        <Link to={'./issue'}>
          <Space>
            {t('issue')}
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
      label: <Link to={'./comment'}>{t('comment')}</Link>,
    },
    {
      key: 'version',
      label: <Link to={'./version'}>{t('version')}</Link>,
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
          label: <Link to={'./update'}>{t('update')}</Link>,
        },
        {
          key: 'statistic',
          label: <Link to={'./statistic'}>{t('statistic')}</Link>,
        },
        {
          key: 'manage',
          label: <Link to={'./manage'}>{t('manage')}</Link>,
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
            message={t('script_archived')}
            description={t('script_archived_description')}
            type="warning"
            showIcon
            closable
          />
        )}
        {data.script.danger == 1 && (
          <Alert
            message={t('script_code_obfuscated')}
            description={t('script_code_obfuscated_description')}
            type="error"
            showIcon
            closable
          />
        )}
        <Link
          to={locale + '/script-show-page/' + data.script.id}
          className="text-2xl text-black dark:text-white"
        >
          {scriptName(data.script)}
        </Link>
        <Menu selectedKeys={[current]} mode="horizontal" items={items}></Menu>

        <ScriptContext.Provider value={{ script: data.script }}>
          {forbidden ? (
            <span className="text-2xl dark:text-white">
              {t('no_permission')}
            </span>
          ) : (
            <Outlet />
          )}
        </ScriptContext.Provider>
      </div>
    </>
  );
}
