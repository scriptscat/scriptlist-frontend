import { LinksFunction, LoaderFunction, json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  Avatar,
  Button,
  Card,
  ConfigProvider,
  Empty,
  List,
  Rate,
  Space,
  message,
} from 'antd';
import { useEffect } from 'react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ActionMenu from '~/components/ActionMenu';
import MarkdownView, { markdownViewLinks } from '~/components/MarkdownView';
import SearchItem from '~/components/Search/SearchList/item';
import { ScriptContext } from '~/context-manager';
import {
  DeleteScore,
  GetMyScore,
  ScoreList,
  ScriptState,
} from '~/services/scripts/api';
import type {
  ScoreItem,
  WatchLevel as WatchLevelType,
} from '~/services/scripts/types';
import { formatDate } from '~/utils/utils';

export const links: LinksFunction = () => [...markdownViewLinks()];

type LoaderData = {
  id: number;
  list: ScoreItem[];
  total: number;
  myScore: ScoreItem;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const id = parseInt(params.id as string);
  const list = await ScoreList(id);
  const my = await GetMyScore(id, request);
  return json({
    id: id,
    list: list.data.list,
    total: list.data.total,
    myScore: my,
  } as LoaderData);
};

export default function Index() {
  const loaderData = useLoaderData<LoaderData>();
  const [scoreData, setScoreData] = useState<ScoreItem[]>(loaderData.list);
  const script = useContext(ScriptContext);
  const [watch, setWatch] = useState<WatchLevelType>(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (script.script) {
      ScriptState(script.script.id).then((resp) => {
        setWatch(resp.data.watch);
      });
    }
  }, [script.script]);
  if (!script.script) {
    return <div>{t('script_not_exist')}</div>;
  }
  return (
    <>
      <SearchItem
        script={script.script}
        action
        watch={watch}
        onWatch={(level) => {
          setWatch(level);
        }}
      ></SearchItem>
      <Card>
        <MarkdownView content={script.script.content || ''} id={'readme'} />
      </Card>
      <Card title={t('script_score')}>
        <Space className="w-full" direction="vertical">
          <ConfigProvider
            renderEmpty={() => (
              <Empty
                description={
                  <Space direction="vertical">
                    <span>{t('no_score_yet')}</span>
                    <Button
                      type="link"
                      href={'./' + script.script?.id + '/comment'}
                    >
                      {t('go_to_score')}
                    </Button>
                  </Space>
                }
              />
            )}
          >
            <List
              dataSource={scoreData}
              renderItem={(item, index) => (
                <List.Item key={item.id} className="!block !px-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row justify-between">
                      <div className="flex flex-row items-center gap-2">
                        <Link to={'/users/' + item.user_id} target="_blank">
                          <Avatar src={item.avatar} />
                        </Link>
                        <div className="flex flex-col">
                          <Link to={'/users/' + item.user_id} target="_blank">
                            {item.username}
                          </Link>
                          <span className="text-xs text-gray-400">
                            {formatDate(item.createtime)}
                          </span>
                        </div>
                        <Rate value={item.score / 10} disabled allowHalf></Rate>
                      </div>
                      <ActionMenu
                        uid={item.user_id}
                        deleteLevel="super_moderator"
                        allowSelfDelete={false}
                        onDeleteClick={async () => {
                          const resp = await DeleteScore(
                            script.script!.id,
                            item.id
                          );
                          if (resp.code == 0) {
                            message.success(t('delete_success'));
                            scoreData.splice(index, 1);
                            setScoreData([...scoreData]);
                          } else {
                            message.error(resp.msg);
                          }
                        }}
                      >
                        <Button type="link">{t('action')}</Button>
                      </ActionMenu>
                    </div>
                    <MarkdownView
                      id={'score-' + item.id}
                      content={item.message}
                    ></MarkdownView>
                  </div>
                </List.Item>
              )}
            />
          </ConfigProvider>
          {scoreData.length > 0 && (
            <div className="w-full text-center">
              <Button type="link" href="./comment">
                {t('view_more')}
              </Button>
            </div>
          )}
        </Space>
      </Card>
    </>
  );
}
