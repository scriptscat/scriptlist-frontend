import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Card } from 'antd';
import { getScript } from '~/services/scripts/api';
import type { LoaderData } from '../$id';
import CodeEditor from '~/components/CodeEditor';
import UpdateScript from '~/components/UpdateScript';

export const loader: LoaderFunction = async ({ params, request }) => {
  const script = await getScript(parseInt(params.id as string), true);
  if (!script) {
    throw new Response('脚本不存在', { status: 404, statusText: 'Not Found' });
  }
  return json({ script } as LoaderData);
};

export default function Update() {
  const data = useLoaderData<LoaderData>();

  return (
    <Card>
      <UpdateScript code={data.script.script.code || ''}></UpdateScript>
    </Card>
  );
}
