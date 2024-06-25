import type { LoaderFunction } from '@remix-run/node';
import { redirect, Response } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Card } from 'antd';
import { getScriptByVersion } from '~/services/scripts/api';
import CodeEditor from '~/components/CodeEditor';
import type { Script } from '~/services/scripts/types';
import { getLocale } from '~/utils/i18n';
import i18next from '~/i18next.server';

type LoaderData = {
  script1: Script;
  script2: Script;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const lng = getLocale(request, 'en')!;
  let t = await i18next.getFixedT(lng);

  const id = parseInt(params.id as string);
  const url = new URL(request.url);
  const version1 = url.searchParams.get('version1');
  const version2 = url.searchParams.get('version2');
  if (!version1 || !version2) {
    return redirect('/script-show-page/' + id);
  }
  let script1 = await getScriptByVersion(id, version1, true, request);
  if (!script1) {
    throw new Response(t('script_version_not_found'), {
      status: 404,
      statusText: 'Not Found',
    });
  }
  let script2 = await getScriptByVersion(id, version2, true, request);
  if (!script2) {
    throw new Response(t('script_version_not_found'), {
      status: 404,
      statusText: 'Not Found',
    });
  }
  // 如果脚本1大于脚本2，则交换两个脚本
  if (script1.script.id > script2.script.id) {
    const temp = script1;
    script1 = script2;
    script2 = temp;
  }
  return json({ script1, script2 } as LoaderData);
};

export default function Code() {
  const data = useLoaderData<LoaderData>();
  return (
    <Card>
      <div id="code" className="code w-full h-[500px]">
        <CodeEditor
          id="view-code"
          code={data.script1.script.code}
          diffCode={data.script2.script.code}
          readOnly={true}
          diff
        />
      </div>
    </Card>
  );
}
