import { useLocation, useNavigate, useSearchParams } from '@remix-run/react';
import { ConfigProvider, Empty, List, Pagination } from 'antd';
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
        <ConfigProvider
          renderEmpty={() => (
            <Empty description="未搜索到结果,换个姿势试试吧" />
          )}
        >
          <List
            dataSource={list}
            renderItem={(script, index) => (
              <div className="mb-3">
                <SearchItem key={script.id} script={script} />
              </div>
            )}
            pagination={{
              showSizeChanger: false,
              showQuickJumper: true,
              hideOnSinglePage: true,
              defaultCurrent: page,
              current: page,
              pageSize: 20,
              total: total,
              onChange: (page) => {
                let search = replaceSearchParam(location.search, {
                  page: page.toString(),
                });
                navigate({ search: search }, { replace: true });
              },
            }}
          ></List>
        </ConfigProvider>
      </div>
    </>
  );
};

export default SearchList;
