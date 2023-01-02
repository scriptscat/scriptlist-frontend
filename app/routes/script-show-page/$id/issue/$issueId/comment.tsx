import {
  InfoCircleTwoTone,
  CheckCircleTwoTone,
  UserOutlined,
  InfoCircleFilled,
  CheckCircleFilled,
  MessageOutlined,
  TagFilled,
  EllipsisOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData, useNavigate } from '@remix-run/react';
import {
  Avatar,
  Button,
  Card,
  ConfigProvider,
  Divider,
  Empty,
  List,
  message,
  Select,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import { formatDate } from '~/utils/utils';
import type { MarkdownEditorRef } from '~/components/MarkdownEditor/index.client';
import MarkdownEditor from '~/components/MarkdownEditor/index.client';
import MarkdownView from '~/components/MarkdownView';
import {
  CloseIssue,
  DeleteIssue,
  DeleteIssueComment,
  GetIssue,
  IssueCommentList,
  IsWatchIssue,
  OpenIssue,
  PostComment,
  UnwatchIssue,
  UpdateLabels,
  WatchIssue,
} from '~/services/scripts/issues/api';
import type { Issue, IssueComment } from '~/services/scripts/issues/types';
import { ClientOnly } from 'remix-utils';
import { useContext, useEffect, useRef, useState } from 'react';
import { ScriptContext, UserContext } from '~/context-manager';
import type { APIResponse } from '~/services/http';
import IssueLabel from '~/components/IssueLabel';
import ActionMenu from '~/components/ActionMenu';
import ClipboardJS from 'clipboard';

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

export const loader: LoaderFunction = async ({ params, request }) => {
  const scriptId = parseInt(params.id as string);
  const issueId = parseInt(params.issueId as string);
  const issue = await GetIssue(scriptId, issueId);
  if (!issue) {
    throw new Response('反馈不存在', { status: 404, statusText: 'Not Found' });
  }
  const commentList = await IssueCommentList(scriptId, issueId);
  return json({
    issue: issue,
    comments: commentList,
  } as LoaderData);
};

export default function Comment() {
  const data = useLoaderData<LoaderData>();
  const [status, setStatus] = useState(data.issue.status);
  const [list, setList] = useState(data.comments);
  const navigate = useNavigate();
  const script = useContext(ScriptContext);
  const user = useContext(UserContext);
  const editor = useRef<MarkdownEditorRef>();
  const [loading, setLoading] = useState(false);
  const [isWatch, setIsWatch] = useState(0);
  const [labels, setLabels] = useState(data.issue.labels || []);
  useEffect(() => {
    if (user.user) {
      IsWatchIssue(script.script!.id, data.issue.id).then((res) => {
        setIsWatch(res.watch);
      });
    }
  });
  const joinMember: { [key: number]: number } = {};
  joinMember[data.issue.uid] = 1;
  list.forEach((item) => {
    joinMember[item.user_id] = 1;
  });

  const LabelsStatus: React.FC<{ content: string }> = ({ content }) => {
    let json = JSON.parse(content);
    return (
      <div>
        {json['add'].length > 0 && (
          <span>
            添加标签:{' '}
            {json['add'].map((label: string) => (
              <IssueLabel key={label} label={label} />
            ))}
          </span>
        )}
        {json['del'].length > 0 && (
          <span>
            删除标签:{' '}
            {json['del'].map((label: string) => (
              <IssueLabel key={label} label={label} />
            ))}
          </span>
        )}
      </div>
    );
  };

  useEffect(() => {
    new ClipboardJS('.copy-comment-link', {
      text: (target) => {
        message.success('复制成功');
        return (
          location.origin + location.pathname + target.getAttribute('copy-link')
        );
      },
    });
  });

  return (
    <Card>
      <div className="flex flex-row gap-3">
        <div className="flex flex-col gap-2 basis-3/4">
          <div className="flex flex-row justify-between">
            <span className="text-2xl">{data.issue.title}</span>
            <ActionMenu
              uid={[data.issue.uid, script.script?.uid || -1]}
              deleteLevel="moderator"
              allowSelfDelete
              onDeleteClick={async () => {
                const resp = await DeleteIssue(
                  script.script!.id,
                  data.issue.id
                );
                if (resp.code === 0) {
                  message.success('删除成功');
                  navigate({
                    pathname: '../../issue',
                  });
                } else {
                  message.error(resp.msg);
                }
              }}
            >
              <Button
                type="default"
                size="small"
                className="!p-0"
                icon={<EllipsisOutlined />}
              ></Button>
            </ActionMenu>
          </div>
          <div className="flex flex-row items-center">
            {status === 1 ? (
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
              dataSource={list}
              className="!border-t !mt-2"
              renderItem={(item: IssueComment) => {
                return (
                  <>
                    {item.type == 1 && (
                      <List.Item key={item.id} className="!px-0">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-row justify-between">
                            <div className="flex flex-row items-center gap-2">
                              <Link
                                to={'/users/' + item.user_id}
                                target="_blank"
                              >
                                <Avatar src={item.avatar} />
                              </Link>
                              <div className="flex flex-col">
                                <Link
                                  to={'/users/' + item.user_id}
                                  target="_blank"
                                >
                                  {item.username}
                                </Link>
                                <a
                                  id={'comment-' + item.id}
                                  href={'#comment-' + item.id}
                                  className="text-xs text-gray-400"
                                >
                                  {formatDate(item.createtime)}
                                </a>
                              </div>
                            </div>
                            <ActionMenu
                              uid={[data.issue.uid, script.script?.uid || -1]}
                              deleteLevel="moderator"
                              allowSelfDelete
                              onDeleteClick={async () => {
                                const resp = await DeleteIssueComment(
                                  script.script!.id,
                                  data.issue.id,
                                  item.id
                                );
                                if (resp.code === 0) {
                                  message.success('删除成功');
                                  setList(list.filter((i) => i.id !== item.id));
                                } else {
                                  message.error(resp.msg);
                                }
                              }}
                            >
                              <Button
                                type="default"
                                size="small"
                                className="!p-0"
                                icon={<EllipsisOutlined />}
                              ></Button>
                            </ActionMenu>
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
                                editor.current?.editor &&
                                  editor.current?.editor.setMarkdown(
                                    lines.join('\n') + '\n\n'
                                  );
                              }}
                            >
                              回复
                            </Button>
                            <Button
                              size="small"
                              type="text"
                              icon={<LinkOutlined />}
                              className="!text-gray-400 anticon-middle copy-comment-link"
                              copy-link={`#comment-${item.id}`}
                            >
                              链接
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
                            {item.type == 3 && (
                              <TagFilled className="text-xl !text-blue-400" />
                            )}
                            {item.type == 4 && (
                              <InfoCircleFilled className="text-xl !text-orange-500" />
                            )}
                            {item.type == 5 && (
                              <CheckCircleFilled className="text-xl !text-green-500" />
                            )}
                            <Link to={'/users/' + item.user_id} target="_blank">
                              <Space>
                                <Avatar src={item.avatar} />
                                <span>{item.username}</span>
                              </Space>
                            </Link>
                            <span className="text-xs text-gray-400">
                              {formatDate(item.createtime)}
                              {item.type == 3 && (
                                <LabelsStatus content={item.content} />
                              )}
                              {item.type == 4 && '打开反馈'}
                              {item.type == 5 && '关闭反馈'}
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
          {user.user ? (
            <div className="flex flex-col gap-2">
              <ClientOnly fallback={<div></div>}>
                {() => <MarkdownEditor id="reply" ref={editor} />}
              </ClientOnly>
              <Space className="justify-end">
                {(user.user.uid == data.issue.uid ||
                  user.user.is_admin >= 1 ||
                  script.script?.uid == user.user.uid) && (
                  <Button
                    loading={loading}
                    onClick={async () => {
                      setLoading(true);
                      let resp: APIResponse;
                      if (status == 1) {
                        resp = await CloseIssue(
                          script.script!.id,
                          data.issue.id
                        );
                      } else {
                        resp = await OpenIssue(
                          script.script!.id,
                          data.issue.id
                        );
                      }
                      setLoading(false);
                      if (resp.code == 0) {
                        setStatus(status == 1 ? 3 : 1);
                        setList([...list, resp.data]);
                      } else {
                        message.error(resp.msg);
                      }
                      return 1;
                    }}
                  >
                    {status == 1 ? '关闭反馈' : '开启反馈'}
                  </Button>
                )}
                <Button
                  type="primary"
                  loading={loading}
                  onClick={() => {
                    if (!editor.current || !editor.current.editor) {
                      message.error('系统错误!未发现编辑器数据!');
                      return;
                    }
                    setLoading(true);
                    PostComment(
                      script.script!.id,
                      data.issue.id,
                      editor.current.editor.getMarkdown()
                    ).then((resp) => {
                      setLoading(false);
                      if (resp.code == 0) {
                        message.success('回复成功!');
                        editor.current!.setMarkdown('');
                        setList([...list, resp.data]);
                      } else {
                        message.error(resp.msg);
                      }
                    });
                  }}
                >
                  评论
                </Button>
              </Space>
            </div>
          ) : (
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
        </div>
        <div className="flex flex-col basis-1/4">
          <Space direction="vertical">
            <span className="text-lg font-bold">标签</span>
            <Select
              mode="multiple"
              showArrow
              tagRender={({ value, closable, onClose }) => {
                const onPreventMouseDown = (event: any) => {
                  event.preventDefault();
                  event.stopPropagation();
                };
                return (
                  <IssueLabel
                    label={value}
                    className="anticon-middle"
                    onMouseDown={onPreventMouseDown}
                    closable={closable}
                    onClose={onClose}
                    style={{ marginRight: 3 }}
                  />
                );
              }}
              style={{ width: '100%' }}
              options={[
                { value: 'feature' },
                { value: 'question' },
                { value: 'bug' },
              ]}
              value={labels}
              loading={loading}
              onChange={(value) => setLabels(value)}
              onBlur={async (value) => {
                setLoading(true);
                const resp = await UpdateLabels(
                  script.script!.id,
                  data.issue.id,
                  labels
                );
                setLoading(false);
                if (resp.code !== 0) {
                  message.error(resp.msg);
                } else {
                  setList([...list, resp.data]);
                }
              }}
            />
          </Space>
          <Divider />
          <Space direction="vertical">
            <span className="text-lg font-bold">关注</span>
            <div className="flex justify-center">
              <Tooltip title="关注本反馈,当有新消息时会自动发送邮件通知">
                <Button
                  type="primary"
                  size="small"
                  loading={loading}
                  onClick={async () => {
                    setLoading(true);
                    let resp: APIResponse;
                    if (isWatch) {
                      resp = await UnwatchIssue(
                        script.script!.id,
                        data.issue.id
                      );
                    } else {
                      resp = await WatchIssue(script.script!.id, data.issue.id);
                    }
                    setLoading(false);
                    if (resp.code == 0) {
                      setIsWatch(isWatch ? 0 : 1);
                    } else {
                      message.error(resp.msg);
                    }
                  }}
                >
                  {isWatch ? '已关注' : '关注'}
                </Button>
              </Tooltip>
            </div>
          </Space>
          <Divider />
          <Space direction="vertical">
            <span className="text-lg font-bold">参与人</span>
            <Space>
              {Object.keys(joinMember).map((key) => (
                <Link key={key} to={`/users/${key}`} target="_blank">
                  <Avatar src={'/api/v1/user/avatar/' + key} />
                </Link>
              ))}
            </Space>
          </Space>
        </div>
      </div>
    </Card>
  );
}
