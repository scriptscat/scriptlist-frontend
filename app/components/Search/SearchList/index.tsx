import { Link, useLocation } from '@remix-run/react';
import { ConfigProvider, Empty, List, message } from 'antd';
import { useEffect, useState, isValidElement, cloneElement } from 'react';
import type { Script } from '~/services/scripts/types';
import { replaceSearchParam } from '~/services/utils';
import SearchItem from './item';
import { useTranslation } from 'react-i18next';
import ClipboardJS from 'clipboard';
import { useLocale } from 'remix-i18next';

// 搜索结果列表
const SearchList: React.FC<{
  list: Script[];
  page: number;
  total: number;
}> = (props) => {
  const location = useLocation();
  const [total, setTotal] = useState(props.total);
  const [list, setList] = useState(props.list);
  const locale = '/' + useLocale();
  const { t } = useTranslation();
  useEffect(() => {
    setTotal(props.total);
    setList(props.list);
  }, [props.list, props.total]);

  useEffect(() => {
    const clipboard = new ClipboardJS('.copy-script-link', {
      text: (target) => {
        message.success(t('copy_success'));
        return (
          target.getAttribute('script-name') +
          '\n' +
          window.location.origin +
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
      <div className="flex flex-col gap-3">
        <ConfigProvider
          renderEmpty={() => <Empty description={t('no_search_result')} />}
        >
          <List
            dataSource={list}
            renderItem={(script, index) => (
              <div className="mb-3" key={script.id}>
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
                if (current === 0) return originalElement;
                if (type.startsWith('jump') && isValidElement(originalElement) && originalElement.type === "a") {
                  return cloneElement(originalElement, {
                    href: location.pathname + replaceSearchParam(location.search, {
                      page: current,
                    })
                  } as React.HTMLProps<HTMLAnchorElement>);;
                }
                return (
                  <Link
                    to={{
                      search: replaceSearchParam(location.search, {
                        page: current,
                      }),
                    }}
                  >
                    {type !== 'page' ? originalElement : current}
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
