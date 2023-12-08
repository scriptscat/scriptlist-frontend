import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { V2_MetaFunction } from '@remix-run/react';
import { useLoaderData } from '@remix-run/react';
import SearchList from '~/components/Search/SearchList';
import i18next from '~/i18next.server';
import type { ScriptType, SortType } from '~/services/scripts/api';
import { search } from '~/services/scripts/api';
import type { SearchResponse } from '~/services/scripts/types';
import { getLocale } from '~/utils/i18n';

export type LoaderData = {
  resp: SearchResponse;
  page: number;
  title: string;
};

export const meta: V2_MetaFunction = ({ data }: { data: LoaderData }) => {
  return [
    {
      title: data.title,
    },
  ];
};

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
  const t = await i18next.getFixedT(getLocale(request, 'en') ?? 'en');
  return json({
    resp: resp,
    title: t('userscript_list') + ' - ScriptCat',
    page: page,
  } as LoaderData);
};

export default function Index() {
  const loader = useLoaderData<LoaderData>();

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
