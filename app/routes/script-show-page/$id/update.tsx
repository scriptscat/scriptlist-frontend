import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { Card, message } from 'antd';
import { getScript, UpdateCode } from '~/services/scripts/api';
import type { LoaderData } from '../$id';
import UpdateScript from '~/components/UpdateScript';
import { useContext } from 'react';
import { UserContext } from '~/context-manager';
import { useEffect } from 'react';

export const loader: LoaderFunction = async ({ params, request }) => {
  const script = await getScript(parseInt(params.id as string), request, true);
  if (!script.data) {
    throw new Response('脚本不存在', { status: 404, statusText: 'Not Found' });
  }
  return json({ script: script.data } as LoaderData);
};

export default function Update() {
  const data = useLoaderData<LoaderData>();
  const navigate = useNavigate();

  return (
    <Card>
      <UpdateScript
        script={data.script}
        onSubmit={async (params) => {
          console.log(params);
          let resp = await UpdateCode(data.script.id, params);
          if (resp.code === 0) {
            message.success('更新成功');
            navigate({
              pathname: '/script-show-page/' + data.script.id,
            });
            return true;
          }
          message.error(resp.msg);
          return false;
        }}
      ></UpdateScript>
    </Card>
  );
}
