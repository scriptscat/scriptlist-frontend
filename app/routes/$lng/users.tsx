import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { V2_MetaFunction } from '@remix-run/react';
import { Outlet, useRouteError, useLoaderData, isRouteErrorResponse } from '@remix-run/react';
import { Avatar, Button, Card, Tag, Input } from 'antd';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from '@remix-run/react';
import { UserContext } from '~/context-manager';
import i18next from '~/i18next.server';
import { GetFollow, GetUserInfo } from '~/services/users/api';
import type { Follow, User } from '~/services/users/types';
import { getLocale } from '~/utils/i18n';

type LoaderData = {
  user: User;
  follow: Follow;
  title: string;
};

export const meta: V2_MetaFunction = ({ data }) => {
  const ret = [{ title: 'Unknown - ScriptCat' }, { description: 'Not Found' }, {
    name: "viewport",
    content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
  }];
  if (data && data.user) ret[0] = { title: data.user.username + ' - ScriptCat' };
  return ret;
};

export function ErrorBoundary() {
  const caught = useRouteError();
  return <span className="text-2xl">{isRouteErrorResponse(caught) ? caught.data : 'Unknown Error'}</span>;
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const lng = getLocale(request, 'en')!;
  let t = await i18next.getFixedT(lng);
  if (params.id) {
    const user = await GetUserInfo(parseInt(params.id as string));
    if (!user) {
      throw new Response(t('user_not_found'), {
        status: 404,
        statusText: 'Not Found',
      });
    }
    const follow = await GetFollow(parseInt(params.id as string));
    return json({
      user: user,
      follow: follow,
      title: t('user_not_found') + ' - ScriptCat',
    } as LoaderData);
  }
  throw new Response(t('user_not_found'), {
    status: 404,
    statusText: 'Not Found',
  });
};

export default function Users() {
  const currentUser = useContext(UserContext);
  const data = useLoaderData<LoaderData>();
  const user = data.user;
  const follow = data.follow;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      navigate(`?keyword=${encodeURIComponent(searchKeyword)}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };
  return (
    <>
      <div>
        {currentUser.user && user.user_id === currentUser.user.user_id && (
          <Card title={<span>{t('personal_center')}</span>} className="!mb-3">
            <Button.Group>
              <Button type="primary" href="/post-script">
                {t('user_publish_script')}
              </Button>
              <Button href="/users/webhook">{t('set_webhook')}</Button>
              <Button href="/users/notify">{t('notification_settings')}</Button>
            </Button.Group>
          </Card>
        )}
        <Card className="!mb-3">
          <div className="flex flex-col items-center">
            <div className="flex flex-row flex-wrap justify-center">
              <Avatar size={36} src={user.avatar} />
              <Button
                type="link"
                href={'https://bbs.tampermonkey.net.cn?' + user.user_id}
                className="!text-3xl"
                style={{
                  padding: 0,
                  border: 0,
                  margin: 0,
                }}
              >
                {user.username}
              </Button>
              <span className="text-3xl ml-2">{t('script_written')}</span>
            </div>
            {user.is_admin == 1 && <Tag color={'#f50'}>{t('admin')}</Tag>}
            {user.is_admin == 2 && (
              <Tag color={'#2db7f5'}>{t('super_moderator')}</Tag>
            )}
            {user.is_admin == 3 && (
              <Tag color={'#87d068'}>{t('moderator')}</Tag>
            )}
            <span>
              {follow.following} {t('following')} {follow.followers}{' '}
              {t('followers')}
            </span>
          </div>
        </Card>
        
        {/* 搜索框 */}
        <div className="mb-3 flex justify-end">
          <Input
            placeholder={t('search_user_scripts', { username: user.username })}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ width: '200px' }}
            suffix={
              <SearchOutlined 
                className="cursor-pointer text-gray-400 hover:text-blue-500" 
                onClick={handleSearch}
              />
            }
          />
        </div>
        
        <Outlet />
      </div>
    </>
  );
}
