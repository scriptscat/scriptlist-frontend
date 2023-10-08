import { Link, useLocation } from '@remix-run/react';
import { ConfigProvider, Empty, List } from 'antd';
import { useEffect, useState } from 'react';
import type { Script } from '~/services/scripts/types';
import { replaceSearchParam } from '~/services/utils';
import SearchItem from './item';
import { useTranslation } from 'react-i18next';

// 搜索结果列表
const SearchList: React.FC<{
  list: Script[];
  page: number;
  total: number;
}> = (props) => {
  const location = useLocation();
  const [total, setTotal] = useState(props.total);
  const [list, setList] = useState(props.list);
  const { t } = useTranslation();
  useEffect(() => {
    setTotal(props.total);
    setList(props.list);
  }, [props.list, props.total]);

  return (
    <>
      <div className="flex flex-col gap-3">
        <ConfigProvider
          renderEmpty={() => <Empty description={t('no_search_result')} />}
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
                if (type !== 'page') {
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
                }
                return (
                  <Link
                    to={{
                      search: replaceSearchParam(location.search, {
                        page: current,
                      }),
                    }}
                  >
                    {current}
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
