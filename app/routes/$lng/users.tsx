import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { V2_MetaFunction } from '@remix-run/react';
import { Outlet, useCatch, useLoaderData } from '@remix-run/react';
import { Avatar, Button, Card, Tag } from 'antd';
import { useContext } from 'react';
import { UserContext } from '~/context-manager';
import { GetFollow, GetUserInfo } from '~/services/users/api';
import type { Follow, User } from '~/services/users/types';

type LoaderData = {
  user: User;
  follow: Follow;
};

export const meta: V2_MetaFunction = ({ data }) => {
  if (!data || !data.user) {
    return [{ title: '用户不存在 - ScriptCat' }, { description: 'Not Found' }];
  }
  return [{ title: data.user.username + ' - ScriptCat' }];
};

export function CatchBoundary() {
  const caught = useCatch();
  return <span className="text-2xl">{caught.data}</span>;
}

export const loader: LoaderFunction = async ({ params }) => {
  if (params.id) {
    const user = await GetUserInfo(parseInt(params.id as string));
    if (!user) {
      throw new Response('用户不存在', {
        status: 404,
        statusText: 'Not Found',
      });
    }
    const follow = await GetFollow(parseInt(params.id as string));
    return json({
      user: user,
      follow: follow,
    } as LoaderData);
  }
  throw new Response('用户不存在', {
    status: 404,
    statusText: 'Not Found',
  });
};

export default function Users() {
  const currentUser = useContext(UserContext);
  const data = useLoaderData<LoaderData>();
  const user = data.user;
  const follow = data.follow;
  return (
    <>
      <div>
        {currentUser.user && user.user_id === currentUser.user.user_id && (
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
              <Button
                type="link"
                href={'https://bbs.tampermonkey.net.cn?' + user.user_id}
                className="!text-3xl"
              >
                {user.username}
              </Button>
              <span className="text-3xl ml-2">编写的脚本</span>
            </div>
            {user.is_admin == 1 && <Tag color={'#f50'}>管理员</Tag>}
            {user.is_admin == 2 && <Tag color={'#2db7f5'}>超级版主</Tag>}
            {user.is_admin == 3 && <Tag color={'#87d068'}>版主</Tag>}
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
