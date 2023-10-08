import { RiseOutlined, TagsOutlined } from '@ant-design/icons';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import { Avatar, Card, Collapse, Radio, Space, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'remix-i18next';
import i18n from '~/i18n';
import { lastScoreScript, search } from '~/services/scripts/api';
import type { Script } from '~/services/scripts/types';
import { replaceSearchParam } from '~/services/utils';
import { scriptName } from '~/utils/utils';

// 加载热门脚本与分类等不希望重新加载的数据
export const unstable_shouldReload = () => false;

interface loaderResponse {
  rank: {
    score: Script[];
    update: Script[];
  };
}

// 脚本列表使用嵌套路由实现
export const loader: LoaderFunction = async ({ request }) => {
  const score = await lastScoreScript();
  const update = await search({
    sort: 'updatetime',
    size: 10,
  });
  return json({
    rank: {
      score: score.data.list,
      update: update.data.list,
    },
  });
};

const rankColor = [
  '#f50',
  '#f50',
  '#87d068',
  '#87d068',
  '#b379dd',
  '#b379dd',
  '#2db7f5',
  '#2db7f5',
  '#dc7884',
  '#dc7884',
];

const RankList: React.FC<{ list: Script[] }> = ({ list }) => {
  const locale = useLocale();
  return (
    <div className="flex flex-col gap-[2px]">
      {list.map((item, index) => (
        <div key={index} className="my-[2px]">
          <Link
            to={'/' + locale + '/script-show-page/' + item.id}
            target="_blank"
            className="text-sm !block !truncate text-black dark:text-white"
          >
            {item.script.meta_json['icon'] ? (
              <Avatar
                className="min-w-[24px]"
                shape="square"
                size="small"
                src={item.script.meta_json['icon'][0]}
              />
            ) : (
              <Tag
                className="!m-0"
                color={rankColor[index]}
                style={{ padding: index == 9 ? '0 3px' : '' }}
              >
                {index + 1}
              </Tag>
            )}
            <span className="ml-1">{scriptName(item)}</span>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default function Search() {
  const loader = useLoaderData<loaderResponse>();
  const params = useSearchParams();
  const sort = params[0].get('sort') || 'today_download';
  const script_type = params[0].get('script_type') || '';
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <div className="flex flex-row gap-3">
        <div className="flex flex-col !gap-3 basis-full md:basis-3/4">
          <Card>
            <div className="flex flex-col !gap-3">
              <div>
                <Space>
                  <TagsOutlined />
                  <span>{t('category')}</span>
                  <Radio.Group
                    defaultValue={script_type}
                    size="small"
                    onChange={(val) => {
                      let search = replaceSearchParam(location.search, {
                        script_type: val.target.value,
                      });
                      navigate({ search }, { replace: true });
                    }}
                  >
                    <Radio.Button value="">全部</Radio.Button>
                    <Radio.Button value="1">用户脚本</Radio.Button>
                    <Radio.Button value="2">库</Radio.Button>
                    <Radio.Button value="3">后台脚本</Radio.Button>
                    <Radio.Button value="4">定时脚本</Radio.Button>
                  </Radio.Group>
                </Space>
              </div>
              <div>
                <Space>
                  <RiseOutlined />
                  <span>排序</span>
                  <Radio.Group
                    defaultValue={sort}
                    size="small"
                    onChange={(val) => {
                      let search = replaceSearchParam(location.search, {
                        sort: val.target.value,
                      });
                      navigate({ search }, { replace: true });
                    }}
                  >
                    <Radio.Button value="today_download">日安装</Radio.Button>
                    <Radio.Button value="total_download">总安装</Radio.Button>
                    <Radio.Button value="score">评分</Radio.Button>
                    <Radio.Button value="createtime">最新发布</Radio.Button>
                    <Radio.Button value="updatetime">最近更新</Radio.Button>
                  </Radio.Group>
                </Space>
              </div>
            </div>
          </Card>
          <Outlet />
        </div>
        <div className="flex-col gap-3 hidden basis-1/4 md:flex overflow-hidden">
          <Card>
            <Card.Meta
              title={
                <div className="flex flex-row justify-between items-center">
                  <span>学油猴脚本</span>
                  <span className="text-xs">
                    <a
                      href="https://bbs.tampermonkey.net.cn/forum-75-1.html"
                      className="text-gray-400"
                      target="_blank"
                    >
                      建议/投诉/举报
                    </a>
                  </span>
                </div>
              }
              description={
                <span className="text-gray-400">
                  就来
                  <a
                    href="https://bbs.tampermonkey.net.cn"
                    className="text-gray-400"
                    target="_blank"
                  >
                    油猴中文网
                  </a>
                </span>
              }
            ></Card.Meta>
          </Card>
          <Collapse
            defaultActiveKey={['1', '2', '3']}
            className="rank-collapse"
          >
            <Collapse.Panel header="最新脚本" key="3">
              <RankList list={loader.rank.update} />
            </Collapse.Panel>
            <Collapse.Panel header="最新评分" key="2">
              <RankList list={loader.rank.score} />
            </Collapse.Panel>
          </Collapse>
        </div>
      </div>
    </>
  );
}
