import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { Card, message } from 'antd';
import { getScript } from '~/services/scripts/api';
import type { LoaderData } from '../$id';
import CodeEditor from '~/components/CodeEditor';
import { useContext } from 'react';
import { UserContext } from '~/context-manager';

export const loader: LoaderFunction = async ({ params, request }) => {
  const script = await getScript(parseInt(params.id as string), request, true);
  if (!script.data) {
    throw new Response('脚本不存在', { status: 404, statusText: 'Not Found' });
  }
  return json({ script: script.data } as LoaderData);
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
