import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useCatch, useLoaderData } from '@remix-run/react';
import { Avatar, Button, Card, Tag } from 'antd';
import { useContext } from 'react';
import { UserContext } from '~/context-manager';
import { GetUserInfo } from '~/services/users/api';
import type { Follow, User } from '~/services/users/types';

type LoaderData = {
  user?: User;
  follow?: Follow;
};

export const meta: MetaFunction = ({ data, location }) => {
  if (!data || !data.user) {
    return {
      title: '用户不存在 - ScriptCat',
      description: 'Not Found',
    };
  }
  return {
    title: data.user.username + ' - ScriptCat',
  };
};

export function CatchBoundary() {
  const caught = useCatch();
  return <span className="text-2xl">{caught.data}</span>;
}

export const loader: LoaderFunction = async ({ params, request }) => {
  if (params.id) {
    const user = await GetUserInfo(parseInt(params.id as string));
    if (!user) {
      throw new Response('用户不存在', {
        status: 404,
        statusText: 'Not Found',
      });
    }
    return json({
      user: user.user,
      follow: user.follow,
    } as LoaderData);
  }
  return json({});
};

export default function Users() {
  const currentUser = useContext(UserContext);
  const data = useLoaderData<LoaderData>();
  const user = data.user || (currentUser.user && currentUser.user);
  const follow = data.follow || (currentUser.follow && currentUser.follow);
  if (!user || !follow) {
    return (
      <>
        <Card>
          <h2 className="text-2xl">未登录，请先登录</h2>
        </Card>
      </>
    );
  }
  return (
    <>
      <div>
        {currentUser.user && user.uid === currentUser.user.uid && (
          <Card title={<span>个人中心</span>} className="!mb-3">
            <Button.Group>
              <Button type="primary" href="/post-script">
                发布编写的脚本
              </Button>
              <Button href="/users/webhook">设置WEBHOOK</Button>
              <Button href="/users/notify">通知设置</Button>
            </Button.Group>
          </Card>
        )}
        <Card className="!mb-3">
          <div className="flex flex-col items-center">
            <div className="flex flex-row">
              <Avatar size={36} src={user.avatar} />
              <a
                type="link"
                href={'https://bbs.tampermonkey.net.cn?' + user.uid}
                className="!text-3xl"
              >
                {user.username}
              </a>
              <span className="text-3xl ml-2">编写的脚本</span>
            </div>
            <Tag color={'#f50'}>管理员</Tag>
            <span>
              {follow.following} 关注 {follow.followers} 粉丝
            </span>
          </div>
        </Card>
        <Outlet />
      </div>
    </>
  );
}
