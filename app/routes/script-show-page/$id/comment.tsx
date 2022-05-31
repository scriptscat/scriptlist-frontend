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
import { GetMyScore, ScoreList, SubmitScore } from '~/services/scripts/api';
import type { ScoreItem } from '~/services/scripts/types';
import { UserContext } from '~/context-manager';

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
  const [page, setPage] = useState(1);
  const dark = useDark();
  const user = useContext(UserContext);
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
    if (resp.code === 0) {
      message.success('评分成功');
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
        <Card title="撰写评论">
          {user.user && (
            <TextArea
              showCount
              prefixCls={dark ? 'dark-input' : 'light-input'}
              maxLength={100}
              style={{ height: 120 }}
              ref={textEl}
              defaultValue={loaderData.myScore && loaderData.myScore.message}
              placeholder="填写您的评论并在下方进行评分，问题反馈请前往反馈区（友善的反馈是交流的起点）"
            />
          )}
          {!user.user && (
            <Empty className="border-t" description="请登录后再发表评论">
              <Button
                type="primary"
                onClick={() => {
                  const btn = document.querySelector(
                    '#go-to-login'
                  ) as HTMLButtonElement;
                  btn.click();
                }}
              >
                登录
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
                  '👎',
                  '大失所望',
                  '中规中矩',
                  '白壁微瑕',
                  '巧夺天工',
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
                评分
              </Button>
            }
          />
        </Card>
        <Card title="用户评分">
          <InfiniteScroll
            dataLength={data.length}
            next={loadMoreData}
            hasMore={data.length < loaderData.total}
            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
            endMessage={<Divider plain>所有评论加载完毕</Divider>}
            scrollableTarget="scrollableDiv"
          >
            <ConfigProvider
              renderEmpty={() => (
                <Empty description="还没有人来给脚本打分，快来成为第一个打分的人吧" />
              )}
            >
              <List
                dataSource={data}
                renderItem={(item) => (
                  <List.Item key={item.id} className="!px-0">
                    <div className="flex flex-col gap-2">
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
                        <Rate value={item.score / 10} disabled allowHalf></Rate>
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
