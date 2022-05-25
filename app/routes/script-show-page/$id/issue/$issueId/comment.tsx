import {
  InfoCircleTwoTone,
  CheckCircleTwoTone,
  UserOutlined,
  InfoCircleFilled,
  CheckCircleFilled,
  MessageOutlined,
} from '@ant-design/icons';
import type { LoaderFunction, MetaFunction } from '@remix-run/node';
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
  Select,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import { Link } from 'react-router-dom';
import { formatDate } from 'utils/utils';
import MarkdownEditor from '~/components/MarkdownEditor/index.client';
import MarkdownView from '~/components/MarkdownView';
import { GetIssue, IssueCommentList } from '~/services/scripts/issues/api';
import type { Issue, IssueComment } from '~/services/scripts/issues/types';
import { ClientOnly } from 'remix-utils';
import { useState } from 'react';
import { IssueTagMap } from '../index';

type LoaderData = {
  issue: Issue;
  comments: IssueComment[];
};

export const meta: MetaFunction = ({ data, parentsData }) => {
  if (!data) {
    return {
      title: '未找到反馈 - ScriptCat',
      description: 'Not Found',
    };
  }
  return {
    title:
      data.issue.title +
      ' · 反馈 #' +
      data.issue.id +
      ' · ' +
      parentsData['routes/script-show-page/$id'].script.name +
      ' - ScriptCat',
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  const issue = await GetIssue(
    parseInt(params.id as string),
    parseInt(params.issueId as string)
  );
  if (!issue) {
    throw new Response('反馈不存在', { status: 404, statusText: 'Not Found' });
  }
  const commentList = await IssueCommentList(
    parseInt(params.id as string),
    parseInt(params.issueId as string)
  );
  return json({
    issue: issue,
    comments: commentList,
  } as LoaderData);
};

export default function Comment() {
  const data = useLoaderData<LoaderData>();
  const [replyContent, setReplyContent] = useState('');

  return (
    <Card>
      <div className="flex flex-row gap-3">
        <div className="flex flex-col gap-2 basis-3/4">
          <span className="text-2xl">{data.issue.title}</span>
          <div className="flex flex-row items-center">
            {data.issue.status === 1 ? (
              <Tag
                icon={<InfoCircleTwoTone className="!align-baseline" />}
                color="blue"
              >
                待处理
              </Tag>
            ) : (
              <Tag
                icon={
                  <CheckCircleTwoTone
                    className="!align-baseline"
                    twoToneColor="#52c41a"
                  />
                }
                color="green"
              >
                已处理
              </Tag>
            )}
            <Tooltip title="点击复制链接">
              <Tag>#{data.issue.id}</Tag>
            </Tooltip>
            <UserOutlined className="mr-1 !text-gray-400 " />
            <Link
              to={'/users/' + data.issue.uid}
              target="_blank"
              className="text-gray-400 hover:text-gray-500 mr-1"
            >
              {data.issue.username}
            </Link>
            <span className="text-sm text-gray-400">
              创建于 {formatDate(data.issue.createtime)}
            </span>
          </div>
          <MarkdownView id="issue" content={data.issue.content}></MarkdownView>

          <ConfigProvider renderEmpty={() => <Empty description="暂无回复" />}>
            <List
              itemLayout="vertical"
              size="large"
              dataSource={data.comments}
              className="!border-t !mt-2"
              renderItem={(item: IssueComment) => {
                return (
                  <>
                    {item.type == 1 && (
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
                          </div>
                          <MarkdownView
                            id={'comment-' + item.id}
                            content={item.content}
                          ></MarkdownView>
                          <div className="flex flex-row justify-end">
                            <Button
                              size="small"
                              type="text"
                              icon={<MessageOutlined />}
                              className="!text-gray-400 anticon-middle"
                              onClick={() => {
                                let lines = item.content.split('\n');
                                for (let i = 0; i < lines.length; i++) {
                                  lines[i] = '> ' + lines[i];
                                }
                                setReplyContent(lines.join('\n') + '\n\n');
                              }}
                            >
                              回复
                            </Button>
                          </div>
                        </div>
                      </List.Item>
                    )}

                    {item.type != 1 && (
                      <List.Item key={item.id} className="!p-0">
                        <div className="flex flex-row">
                          <Divider
                            type="vertical"
                            className="!h-16"
                            orientation="center"
                            plain
                          />
                          <div
                            className="flex items-center gap-2"
                            style={{ position: 'relative', left: '-19px' }}
                          >
                            {item.type == 4 && (
                              <InfoCircleFilled className="text-xl !text-orange-500" />
                            )}
                            {item.type == 5 && (
                              <CheckCircleFilled className="text-xl !text-green-500" />
                            )}
                            <Link to={'/users/' + item.uid} target="_blank">
                              <Space>
                                <Avatar
                                  src={'/api/v1/user/avatar/' + item.uid}
                                />
                                <span>{item.username}</span>
                              </Space>
                            </Link>
                            <span className="text-xs text-gray-400">
                              {formatDate(item.createtime)}{' '}
                              {item.type == 4 ? '打开反馈' : '关闭反馈'}
                            </span>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  </>
                );
              }}
            ></List>
          </ConfigProvider>
          <ClientOnly fallback={<div></div>}>
            {() => <MarkdownEditor id="reply" content={replyContent} />}
          </ClientOnly>
          <Space className="justify-end">
            <Button>{data.issue.status == 1 ? '关闭反馈' : '开启付款'}</Button>
            <Button type="primary">评论</Button>
          </Space>
        </div>
        <div className="flex flex-col basis-1/4">
          <Space direction="vertical">
            <span className="text-lg font-bold">标签</span>
            <Select
              mode="multiple"
              showArrow
              tagRender={({ label, value, closable, onClose }) => {
                const onPreventMouseDown = (event: any) => {
                  event.preventDefault();
                  event.stopPropagation();
                };
                return (
                  <Tag
                    className="anticon-middle"
                    color={IssueTagMap[value][1]}
                    onMouseDown={onPreventMouseDown}
                    closable={closable}
                    onClose={onClose}
                    style={{ marginRight: 3 }}
                  >
                    {IssueTagMap[value][0]}
                  </Tag>
                );
              }}
              style={{ width: '100%' }}
              options={[
                { value: 'feature' },
                { value: 'question' },
                { value: 'bug' },
              ]}
              value={data.issue.labels}
            />
          </Space>
          <Divider />
        </div>
      </div>
    </Card>
  );
}
