import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import SearchList from '~/components/Search/SearchList';
import { search } from '~/services/scripts/api';
import type { Script } from '~/services/scripts/types';

type LoaderData = {
  script: {
    list: Script[];
    total: number;
    page: number;
  };
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const resp = await search(
    {
      keyword: url.searchParams.get('keyword') || '',
      user_id: parseInt(params.id as string),
      sort: 'today_download',
      page: page,
      size: 20,
    },
    request
  );
  return json({
    script: {
      list: resp.data.list,
      total: resp.data.total,
      page: page,
    },
  } as LoaderData);
};

export default function User() {
  const data = useLoaderData<LoaderData>();
  return (
    <>
      <SearchList
        list={data.script.list}
        total={data.script.total}
        page={data.script.page}
      />
    </>
  );
}
