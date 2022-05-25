import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useCatch, useLoaderData } from '@remix-run/react';
import SearchList from '~/components/Search/SearchList';
import { search } from '~/services/scripts/api';
import type { Script } from '~/services/scripts/types';

type LoaderData = {
  script: {
    list: Script[];
    total: number;
  };
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const total = await search({
    uid: parseInt(params.id as string),
    sort: 'today',
    page: page,
    count: 20,
  });
  return json({
    script: {
      list: total.list,
      total: total.total,
    },
  } as LoaderData);
};

export default function User() {
  const data = useLoaderData<LoaderData>();
  return (
    <>
      <SearchList list={data.script.list} total={data.script.total} />
    </>
  );
}
