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
import {
  Avatar,
  Card,
  Collapse,
  ConfigProvider,
  Radio,
  Space,
  Tag,
} from 'antd';
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
            className="text-sm !block !truncate !text-black dark:!text-white"
          >
            {item.script.meta_json['icon'] ? (
              <img
                style={{
                  display: 'inline-block',
                  width: 24,
                  height: 24,
                  borderRadius: '2px',
                }}
                src={item.script.meta_json['icon'][0]}
              />
            ) : (
              <Tag
                className="!m-0"
                color={rankColor[index]}
                style={index === 9 ? { padding: '0 3px' } : {}}
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
        <div className="flex flex-col !gap-3 basis-full min-[900px]:basis-3/4">
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
                    <Radio.Button value="">{t('all')}</Radio.Button>
                    <Radio.Button value="1">{t('user_script')}</Radio.Button>
                    <Radio.Button value="2">{t('library')}</Radio.Button>
                    <Radio.Button value="3">
                      {t('background_script')}
                    </Radio.Button>
                    <Radio.Button value="4">
                      {t('scheduled_script')}
                    </Radio.Button>
                  </Radio.Group>
                </Space>
              </div>
              <div>
                <Space>
                  <RiseOutlined />
                  <span>{t('sort')}</span>
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
                    <Radio.Button value="today_download">
                      {t('daily_install')}
                    </Radio.Button>
                    <Radio.Button value="total_download">
                      {t('total_install')}
                    </Radio.Button>
                    <Radio.Button value="score">{t('rating')}</Radio.Button>
                    <Radio.Button value="createtime">
                      {t('latest_release')}
                    </Radio.Button>
                    <Radio.Button value="updatetime">
                      {t('recent_update')}
                    </Radio.Button>
                  </Radio.Group>
                </Space>
              </div>
            </div>
          </Card>
          <Outlet />
        </div>
        <div className="flex-col gap-3 hidden basis-1/4 min-[900px]:flex overflow-hidden">
          <Card>
            <Card.Meta
              title={
                <div className="flex flex-row justify-between items-center">
                  <span>{t('learn_scripts')}</span>
                  <span className="text-xs">
                    <a
                      href="https://bbs.tampermonkey.net.cn/forum-75-1.html"
                      className="text-gray-400"
                      target="_blank"
                    >
                      {t('suggestions_complaints_reports')}
                    </a>
                  </span>
                </div>
              }
              description={
                <span
                  className="text-gray-400"
                  dangerouslySetInnerHTML={{
                    __html: t('learn_scripts_slogan'),
                  }}
                ></span>
              }
            ></Card.Meta>
          </Card>
          <ConfigProvider
            theme={{
              components: {
                Collapse: {
                  contentPadding: '6px 6px',
                },
              },
            }}
          >
            <Collapse
              defaultActiveKey={['1', '2', '3']}
              className="rank-collapse"
            >
              <Collapse.Panel header={t('latest_scripts')} key="3">
                <RankList list={loader.rank.update} />
              </Collapse.Panel>
              <Collapse.Panel header={t('latest_ratings')} key="2">
                <RankList list={loader.rank.score} />
              </Collapse.Panel>
            </Collapse>
          </ConfigProvider>
        </div>
      </div>
    </>
  );
}
