import { Link, useLocation } from '@remix-run/react';
import { ConfigProvider, Empty, List } from 'antd';
import { useState } from 'react';
import type { Script } from '~/services/scripts/types';
import { replaceSearchParam } from '~/services/utils';
import SearchItem from './item';

// 搜索结果列表
const SearchList: React.FC<{
  list: Script[];
  page: number;
  total: number;
}> = (props) => {
  const location = useLocation();
  const [total, setTotal] = useState(props.total);
  const [list, setList] = useState(props.list);

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
                <SearchItem
                  key={script.id}
                  script={script}
                  onDelete={() => {
                    list.splice(index, 1);
                    setList([...list]);
                    setTotal((total) => total - 1);
                  }}
                />
              </div>
            )}
            pagination={{
              showSizeChanger: false,
              hideOnSinglePage: true,
              defaultCurrent: props.page,
              current: props.page,
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
