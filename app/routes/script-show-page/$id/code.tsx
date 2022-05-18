import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Card } from 'antd';
import { getScript } from '~/services/scripts/api';
import type { LoaderData } from '../$id';
import { lazy, Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { tr } from 'date-fns/locale';
import CodeEditor from '~/components/CodeEditor';

export const loader: LoaderFunction = async ({ params, request }) => {
  const script = await getScript(parseInt(params.id as string), true);
  if (!script) {
    throw new Response('脚本不存在', { status: 404, statusText: 'Not Found' });
  }
  return json({ script } as LoaderData);
};

// let CodeEditor = lazy(() => import('~/components/CodeEditor/index'));

export function ClientOnly({ children }: { children: ReactNode }) {
  let [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted ? <>{children}</> : null;
}

export default function Code() {
  const data = useLoaderData<LoaderData>();

  return (
    <Card>
      <div id="code" className="code w-full h-[500px]">
        <CodeEditor id='view-code' code={data.script.script.code || ''} readOnly={true} />
      </div>
    </Card>
  );
}
