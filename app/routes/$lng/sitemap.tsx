import type { LoaderFunction } from '@remix-run/node';
import { search } from '~/services/scripts/api';
import { json } from '@remix-run/node';
import { useLoaderData, useLocation } from '@remix-run/react';
import type { SearchResponse } from '~/services/scripts/types';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'remix-i18next';
import { Card, theme } from 'antd';
import type { Script } from '~/services/scripts/types';
import { Flex } from 'antd';
import { lngMap } from '~/utils/i18n';
export type LoaderData = {
  resp: SearchResponse;
};
// 搜索结果列表
const SitemapList: React.FC<{
  list: Script[];
}> = (props) => {
  const { token } = theme.useToken();
  const locale = '/' + useLocale();
  return (
    <>
      <Flex className="-mt-3 -ml-3" wrap="wrap">
        {props.list.map((item) => (
          <div
            className="basis-1/1 xl:basis-1/4 lg:basis-1/3 md:basis-1/2 overflow-hidden truncate pt-3 pl-3"
            style={{ color: token.colorLink }}
            key={item.id}
          >
            <a href={locale + '/script-show-page/' + item.id}>{item.name}</a>
          </div>
        ))}
      </Flex>
    </>
  );
};

const getAllLanguageList = function () {
  let localeList = [];
  for (const [, lng] of Object.entries(lngMap)) {
    for (const [key, value] of Object.entries(lng)) {
      if (!value.hide) {
        localeList.push({
          key: key,
          ...value,
        });
      }
    }
  }
  return localeList;
};

const LanguageList: React.FC<{}> = () => {
  const location = useLocation();
  const uLocale = '/' + useLocale();
  const languageList = getAllLanguageList().map((item) => {
    return {
      ...item,
      url: location.pathname.replace(uLocale, '/' + item.key),
    };
  });
  return (
    <>
      <Flex className="-mt-3 -ml-3" wrap="wrap">
        {languageList.map((languageObj) => (
          <div
            className="basis-1/4 overflow-hidden truncate pt-3 pl-3"
            key={languageObj.key}
          >
            <a href={languageObj.url}>
              {languageObj.name + '(' + languageObj.key + ')'}
            </a>
          </div>
        ))}
      </Flex>
    </>
  );
};

// 脚本列表使用嵌套路由实现
export const loader: LoaderFunction = async ({ request }) => {
  const resp = await search(
    {
      page: 1,
      keyword: '',
      size: 100,
      sort: 'today_download',
      script_type: '',
      domain: '',
    },
    request
  );
  return json({
    resp: resp,
  } as LoaderData);
};

export default function Sitemap() {
  const loader = useLoaderData<LoaderData>();
  const { t } = useTranslation();
  return (
    <>
      <Card className='!mb-5' title={t('language_title')}>
        <div>
          <LanguageList></LanguageList>
        </div>
      </Card>
      <Card title={t('sitemap_title')}>
        <div>
          <SitemapList list={loader.resp.data.list}></SitemapList>
        </div>
      </Card>
    </>
  );
}
