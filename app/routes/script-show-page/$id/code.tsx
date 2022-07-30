import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Card } from 'antd';
import { getScript } from '~/services/scripts/api';
import type { LoaderData } from '../$id';
import CodeEditor from '~/components/CodeEditor';

export const loader: LoaderFunction = async ({ params, request }) => {
  const script = await getScript(parseInt(params.id as string), request, true);
  if (script.data.code != 0) {
    throw new Response('脚本不存在', { status: 404, statusText: 'Not Found' });
  }
  return json({ script: script.data.data } as LoaderData);
};

export default function Code() {
  const data = useLoaderData<LoaderData>();
  return (
    <Card>
      <div id="code" className="code w-full h-[500px]">
        <CodeEditor
          id="view-code"
          code={data.script.script.code || ''}
          readOnly={true}
        />
      </div>
    </Card>
  );
}
