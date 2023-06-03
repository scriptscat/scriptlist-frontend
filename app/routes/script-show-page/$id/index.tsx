import { LoaderFunction, json } from '@remix-run/node';
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
import type { TextAreaRef } from 'antd/lib/input/TextArea';
import TextArea from 'antd/lib/input/TextArea';
import { useEffect, useRef } from 'react';
import { useContext, useState } from 'react';
import ActionMenu from '~/components/ActionMenu';
import MarkdownView from '~/components/MarkdownView';
import SearchItem from '~/components/Search/SearchList/item';
import { ScriptContext, UserContext } from '~/context-manager';
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
import { formatDate, useDark } from '~/utils/utils';

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

  useEffect(() => {
    if (script.script) {
      ScriptState(script.script.id).then((resp) => {
        setWatch(resp.data.watch);
      });
    }
  }, [script.script]);
  if (!script.script) {
    return <div>脚本不存在</div>;
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
      <Card title="脚本评分">
        <Space className="w-full" direction="vertical">
          <ConfigProvider
            renderEmpty={() => (
              <Empty
                description={
                  <Space direction="vertical">
                    <span>还没有人来给脚本打分，快来成为第一个打分的人吧</span>
                    <Button
                      type="link"
                      href={'./' + script.script?.id + '/comment'}
                    >
                      前往评分
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
                            message.success('删除成功');
                            scoreData.splice(index, 1);
                            setScoreData([...scoreData]);
                          } else {
                            message.error(resp.msg);
                          }
                        }}
                      >
                        <Button type="link">操作</Button>
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
                查看更多
              </Button>
            </div>
          )}
        </Space>
      </Card>
    </>
  );
}
