import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import { Button, ConfigProvider, Empty, List } from 'antd';
import type { Script } from '~/services/scripts/types';
import { replaceSearchParam } from '~/services/utils';
import SearchItem from './item';

// 搜索结果列表
const SearchList: React.FC<{
  list: Script[];
  page: number;
  total: number;
}> = ({ list, page, total }) => {
  const location = useLocation();
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
              hideOnSinglePage: true,
              defaultCurrent: page,
              current: page,
              pageSize: 20,
              total: total,
              itemRender: (current, type, originalElement) => {
                return (
                  <Link
                    to={{
                      search: replaceSearchParam(location.search, {
                        page: current,
                      }),
                    }}
                  >
                    {originalElement}
                  </Link>
                );
              },
            }}
          ></List>
        </ConfigProvider>
      </div>
    </>
  );
};

export default SearchList;
