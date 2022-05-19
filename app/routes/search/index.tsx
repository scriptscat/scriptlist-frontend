import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import SearchList from '~/components/Search/SearchList';
import type { SortType } from '~/services/scripts/api';
import { search } from '~/services/scripts/api';
import type { SearchResponse } from '~/services/scripts/types';

// 脚本列表使用嵌套路由实现
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const resp = await search({
    page: page,
    keyword: url.searchParams.get('keyword') || '',
    sort: (url.searchParams.get('sort') as SortType) || 'today',
  });
  return json({
    resp: resp,
  });
};

export default function Index() {
  const loader = useLoaderData<{ resp: SearchResponse }>();
  return (
    <>
      <SearchList list={loader.resp.list} total={loader.resp.total} />
    </>
  );
}
