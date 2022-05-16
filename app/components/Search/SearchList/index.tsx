import { useSearchParams } from '@remix-run/react';
import { Pagination } from 'antd';
import { useLocation, useNavigate } from 'react-router';
import type { Script } from '~/services/scripts/types';
import { replaceSearchParam } from '~/services/utils';
import SearchItem from './item';

const SearchList: React.FC<{
  list: Script[];
  total: number;
}> = ({ list, total }) => {
  const params = useSearchParams();
  const location = useLocation();
  const page = parseInt(params[0].get('page') || '1');

  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col gap-3">
        {list.map((script) => (
          <SearchItem key={script.id} script={script} />
        ))}
        <Pagination
          showSizeChanger={false}
          showQuickJumper
          defaultCurrent={page}
          current={page}
          pageSize={20}
          total={total}
          onChange={(page) => {
            let search = replaceSearchParam(location.search, {
              page: page.toString(),
            });
            navigate({ search: search }, { replace: true });
          }}
        />
      </div>
    </>
  );
};

export default SearchList;
