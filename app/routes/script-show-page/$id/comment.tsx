import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  Avatar,
  Button,
  Card,
  ConfigProvider,
  Divider,
  Empty,
  List,
  message,
  Rate,
  Skeleton,
  Space,
} from 'antd';
import type { TextAreaRef } from 'antd/lib/input/TextArea';
import TextArea from 'antd/lib/input/TextArea';
import { useContext, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { formatDate, useDark } from '~/utils/utils';
import MarkdownView from '~/components/MarkdownView';
import {
  DeleteScore,
  GetMyScore,
  ScoreList,
  SubmitScore,
} from '~/services/scripts/api';
import type { ScoreItem } from '~/services/scripts/types';
import { ScriptContext, UserContext } from '~/context-manager';
import ActionMenu from '~/components/ActionMenu';

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
    list: list.list,
    total: list.total,
    myScore: my,
  } as LoaderData);
};

export default function Comment() {
  const loaderData = useLoaderData<LoaderData>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(loaderData.list);
  const [total, setTotal] = useState(loaderData.total);
  const [page, setPage] = useState(1);
  const dark = useDark();
  const user = useContext(UserContext);
  const script = useContext(ScriptContext);
  const [submitLoading, setSubmitLoading] = useState(false);
  const textEl = useRef<TextAreaRef>(null);
  const [score, setScore] = useState(
    (loaderData.myScore && loaderData.myScore.score / 10) || 5
  );
  const onSubmit = async () => {
    setSubmitLoading(true);
    const resp = await SubmitScore(
      loaderData.id,
      textEl!.current!.resizableTextArea?.props.value as string,
      score * 10
    );
    setSubmitLoading(false);
    if (resp.code === 0) {
      message.success('????????????');
      for (let i = 0; i < data.length; i++) {
        if (data[i].uid === user.user?.uid) {
          data[i].score = score * 10;
          data[i].message = textEl!.current!.resizableTextArea?.props
            .value as string;
          setData([...data]);
          return;
        }
      }
      setData([
        {
          id: 0,
          uid: user.user!.uid,
          username: user.user!.username,
          avatar: user.user!.avatar,
          score: score * 10,
          message: textEl!.current!.resizableTextArea?.props.value as string,
          createtime: new Date().getTime() / 1000,
        },
        ...data,
      ]);
    } else {
      message.error(resp.msg);
    }
    setSubmitLoading(false);
  };

  const loadMoreData = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    const list = await ScoreList(loaderData.id, { page: page });
    setData([...data, ...list.list]);
    setLoading(false);
    setPage((page) => page + 1);
  };
  return (
    <Card>
      <Space className="w-full" direction="vertical">
        <Card title="????????????">
          {user.user && (
            <TextArea
              showCount
              prefixCls={dark ? 'dark-input' : 'light-input'}
              maxLength={100}
              style={{ height: 120 }}
              ref={textEl}
              defaultValue={loaderData.myScore && loaderData.myScore.message}
              placeholder="??????????????????????????????????????????????????????????????????????????????????????????????????????????????????"
            />
          )}
          {!user.user && (
            <Empty className="border-t" description="???????????????????????????">
              <Button
                type="primary"
                onClick={() => {
                  const btn = document.querySelector(
                    '#go-to-login'
                  ) as HTMLButtonElement;
                  btn.click();
                }}
              >
                ??????
              </Button>
            </Empty>
          )}
          <Card.Meta
            className="!mt-2 justify-end"
            title={
              <Rate
                defaultValue={score}
                onChange={(value) => setScore(value)}
                tooltips={[
                  '????',
                  '????????????',
                  '????????????',
                  '????????????',
                  '????????????',
                ]}
              />
            }
          />
          <Card.Meta
            className="!mt-2 justify-end"
            title={
              <Button
                type="primary"
                loading={submitLoading}
                onClick={onSubmit}
                disabled={user.user ? false : true}
              >
                ??????
              </Button>
            }
          />
        </Card>
        <Card title="????????????">
          <InfiniteScroll
            dataLength={data.length}
            next={loadMoreData}
            hasMore={data.length < total}
            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
            endMessage={<Divider plain>????????????????????????</Divider>}
            scrollableTarget="scrollableDiv"
          >
            <ConfigProvider
              renderEmpty={() => (
                <Empty description="?????????????????????????????????????????????????????????????????????" />
              )}
            >
              <List
                dataSource={data}
                renderItem={(item, index) => (
                  <List.Item key={item.id} className="!block !px-0">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row justify-between">
                        <div className="flex flex-row items-center gap-2">
                          <Link to={'/users/' + item.uid} target="_blank">
                            <Avatar src={'/api/v1/user/avatar/' + item.uid} />
                          </Link>
                          <div className="flex flex-col">
                            <Link to={'/users/' + item.uid} target="_blank">
                              {item.username}
                            </Link>
                            <span className="text-xs text-gray-400">
                              {formatDate(item.createtime)}
                            </span>
                          </div>
                          <Rate
                            value={item.score / 10}
                            disabled
                            allowHalf
                          ></Rate>
                        </div>
                        <ActionMenu
                          uid={item.uid}
                          deleteLevel="super_moderator"
                          allowSelfDelete={false}
                          onDeleteClick={async () => {
                            const resp = await DeleteScore(
                              script.script!.id,
                              item.id
                            );
                            if (resp.code == 0) {
                              message.success('????????????');
                              data.splice(index, 1);
                              setData([...data]);
                              setTotal((total) => total - 1);
                            } else {
                              message.error(resp.msg);
                            }
                          }}
                        >
                          <Button type="link">??????</Button>
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
          </InfiniteScroll>
        </Card>
      </Space>
    </Card>
  );
}
