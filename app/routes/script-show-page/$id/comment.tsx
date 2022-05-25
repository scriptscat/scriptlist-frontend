import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  Avatar,
  Button,
  Card,
  ConfigProvider,
  Divider,
  Empty,
  List,
  Rate,
  Skeleton,
  Space,
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link } from 'react-router-dom';
import { formatDate } from 'utils/utils';
import MarkdownView from '~/components/MarkdownView';
import { GetMyScore, ScoreList } from '~/services/scripts/api';
import type { ScoreItem } from '~/services/scripts/types';

type LoaderData = {
  id: number;
  list: ScoreItem[];
  total: number;
  myScore: ScoreItem;
};

export const loader: LoaderFunction = async ({ params }) => {
  const id = parseInt(params.id as string);
  const list = await ScoreList(id);
  const my = await GetMyScore(id);
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
          <TextArea
            showCount
            maxLength={100}
            style={{ height: 120 }}
            className="bg-transparent"
            placeholder="填写您的评论并在下方进行评分，问题反馈请前往反馈区（友善的反馈是交流的起点）"
          />
          <Card.Meta
            className="!mt-2 justify-end"
            title={
              <Rate
                allowHalf
                defaultValue={5}
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
            title={<Button type="primary">评分</Button>}
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
