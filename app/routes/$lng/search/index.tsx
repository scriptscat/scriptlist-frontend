import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { V2_MetaFunction } from '@remix-run/react';
import { useLoaderData } from '@remix-run/react';
import { message } from 'antd';
import ClipboardJS from 'clipboard';
import { useEffect } from 'react';
import { useLocale } from 'remix-i18next';
import SearchList from '~/components/Search/SearchList';
import type { ScriptType, SortType } from '~/services/scripts/api';
import { search } from '~/services/scripts/api';
import type { SearchResponse } from '~/services/scripts/types';

export type LoaderData = {
  resp: SearchResponse;
  page: number;
};

export const meta: V2_MetaFunction = ({ data }: { data: LoaderData }) => [
  {
    title: '用户脚本列表 - ScriptCat',
  },
];

// 脚本列表使用嵌套路由实现
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const resp = await search(
    {
      page: page,
      keyword: url.searchParams.get('keyword') || '',
      sort: (url.searchParams.get('sort') as SortType) || 'today_download',
      script_type: (url.searchParams.get('script_type') as ScriptType) || '',
      domain: url.searchParams.get('domain') || '',
    },
    request
  );
  return json({
    resp: resp,
    page: page,
  } as LoaderData);
};

export default function Index() {
  const loader = useLoaderData<LoaderData>();
  const locale = useLocale();
  useEffect(() => {
    const clipboard = new ClipboardJS('.copy-script-link', {
      text: (target) => {
        message.success('复制成功');
        return (
          target.getAttribute('script-name') +
          '\n' +
          window.location.origin +
          '/' +
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
  return (
    <>
      <SearchList
        list={loader.resp.data.list}
        total={loader.resp.data.total}
        page={loader.page}
      />
    </>
  );
}
