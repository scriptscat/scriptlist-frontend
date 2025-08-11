'use client';

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
import { useRouter } from 'next/navigation';
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
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSemDateTime } from '@/lib/utils/semdate';
import type { MarkdownEditorRef } from '@/components/MarkdownEditor';
import MarkdownEditor from '@/components/MarkdownEditor';
import MarkdownView from '@/components/MarkdownView';
import ActionMenu from '@/components/ActionMenu';
import type { IssueComment } from '@/lib/api/services/scripts/issue';
import {
  scriptIssueService,
  type Issue,
} from '@/lib/api/services/scripts/issue';
import { useRef, useState } from 'react';
import { useScript } from '../../../components/ScriptContext';
import { useUser } from '@/contexts/UserContext';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useIsWatchIssue } from '@/lib/api/hooks/script';
import IssueLabel from '../../components/IssueLabel';

const LabelsStatus: React.FC<{ content: string }> = ({ content }) => {
  const json = JSON.parse(content);

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

interface IssueCommentClientProps {
  issue: Issue;
  comments: IssueComment[];
  scriptId: number;
  issueId: number;
}

export default function IssueCommentClient({
  issue,
  comments,
  scriptId,
  issueId,
}: IssueCommentClientProps) {
  const [status, setStatus] = useState(issue.status);
  const [list, setList] = useState(comments);
  const router = useRouter();
  const script = useScript();
  const user = useUser();
  const editor = useRef<MarkdownEditorRef>(null);
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState(issue.labels || []);
  const locale = useLocale();
  const formatDate = useSemDateTime();

  // 使用 hook 获取关注状态
  const { data: isWatch, mutate: mutateIsWatch } = useIsWatchIssue(
    scriptId,
    issueId,
    !!user.user,
  );

  const joinMember: { [key: number]: string } = {};
  joinMember[issue.user_id] = issue.avatar;
  list.forEach((item) => {
    joinMember[item.user_id] = item.avatar;
  });

  return (
    <Card>
      <div className="flex flex-row gap-3">
        <div className="flex flex-col gap-2 basis-3/4 !w-3/4">
          <div className="flex flex-row justify-between">
            <span className="text-2xl">{issue.title}</span>
            <ActionMenu
              uid={[issue.user_id, script.script?.user_id || -1]}
              deleteLevel="moderator"
              allowSelfDelete
              onDeleteClick={async () => {
                try {
                  await scriptIssueService.deleteIssue(
                    script.script!.id,
                    issue.id,
                  );
                  message.success('删除成功');
                  router.push(
                    `/${locale}/script-show-page/${script.script!.id}/issue`,
                  );
                } catch (error: any) {
                  message.error(error.message || '删除失败');
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
              <Tag icon={<InfoCircleTwoTone />} color="blue">
                待处理
              </Tag>
            ) : (
              <Tag
                icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
                color="green"
              >
                已解决
              </Tag>
            )}
            <CopyToClipboard
              text={`${location.origin}${location.pathname}#issue-${issue.id}`}
              onCopy={() => message.success('复制成功')}
            >
              <Tooltip title="复制链接">
                <Tag className="cursor-pointer">#{issue.id}</Tag>
              </Tooltip>
            </CopyToClipboard>
            <UserOutlined className="mr-1 !text-gray-400 " />
            <Link
              href={`/users/${issue.user_id}`}
              target="_blank"
              className="text-gray-400 hover:text-gray-500 mr-1"
            >
              {issue.username}
            </Link>
            <span className="text-sm text-gray-400">
              创建于 {formatDate(issue.createtime)}
            </span>
          </div>
          <MarkdownView id="issue" content={issue.content}></MarkdownView>

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
                                href={`/users/${item.user_id}`}
                                target="_blank"
                              >
                                <Avatar src={item.avatar} />
                              </Link>
                              <div className="flex flex-col">
                                <Link
                                  href={`/users/${item.user_id}`}
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
                              uid={[
                                item.user_id,
                                issue.user_id,
                                script.script?.user_id || -1,
                              ]}
                              deleteLevel="moderator"
                              allowSelfDelete
                              onDeleteClick={async () => {
                                try {
                                  await scriptIssueService.deleteComment(
                                    scriptId,
                                    issueId,
                                    item.id,
                                  );
                                  message.success('删除成功');
                                  setList(list.filter((i) => i.id !== item.id));
                                } catch (error: any) {
                                  message.error(error.message || '删除失败');
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
                                const lines = item.content.split('\n');
                                for (let i = 0; i < lines.length; i++) {
                                  lines[i] = '> ' + lines[i];
                                }
                                editor.current?.setValue(
                                  lines.join('\n') + '\n\n',
                                );
                              }}
                            >
                              回复
                            </Button>
                            <CopyToClipboard
                              text={`${location.origin}${location.pathname}#comment-${item.id}`}
                              onCopy={() => message.success('复制成功')}
                            >
                              <Button
                                size="small"
                                type="text"
                                icon={<LinkOutlined />}
                                className="!text-gray-400 anticon-middle cursor-pointer"
                              >
                                链接
                              </Button>
                            </CopyToClipboard>
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
                            <Link
                              href={`/${locale}/users/${item.user_id}`}
                              target="_blank"
                            >
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
                              {item.type == 4 && '重新开启了反馈'}
                              {item.type == 5 && '关闭了反馈'}
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
              <MarkdownEditor
                placeholder="请输入评论内容..."
                ref={editor}
                comment="comment"
                linkId={issueId}
              />
              <Space className="justify-end">
                {(user.user.user_id == issue.user_id ||
                  user.user.is_admin >= 1 ||
                  script.script?.user_id == user.user.user_id) && (
                  <Button
                    loading={loading}
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const newStatus = status == 1 ? 3 : 1;
                        if (newStatus === 3) {
                          await scriptIssueService.closeIssue(
                            scriptId,
                            issueId,
                          );
                        } else {
                          await scriptIssueService.openIssue(scriptId, issueId);
                        }
                        setStatus(newStatus);
                        // 添加状态变更的评论项
                        const mockComment: IssueComment = {
                          id: Date.now(),
                          content: '',
                          type: newStatus == 3 ? 5 : 4,
                          user_id: user.user!.user_id,
                          username: user.user!.username,
                          avatar: user.user!.avatar || '',
                          createtime: Date.now() / 1000,
                        };
                        setList([...list, mockComment]);
                        message.success(
                          newStatus === 3 ? '反馈已关闭' : '反馈已重新开启',
                        );
                      } catch (error: any) {
                        message.error(error.message || '操作失败');
                      }
                      setLoading(false);
                    }}
                  >
                    {status == 1 ? '关闭反馈' : '重新开启反馈'}
                  </Button>
                )}
                <Button
                  type="primary"
                  loading={loading}
                  onClick={async () => {
                    if (!editor.current) {
                      message.error('系统错误');
                      return;
                    }
                    setLoading(true);

                    const content = editor.current.getValue();
                    if (!content.trim()) {
                      message.error('请输入评论内容');
                      setLoading(false);
                      return;
                    }

                    try {
                      // 调用发表评论API
                      await scriptIssueService.postComment(
                        scriptId,
                        issueId,
                        content,
                      );

                      // 创建新评论对象（临时显示，实际应该从API响应获取）
                      const newComment: IssueComment = {
                        id: Date.now(),
                        content: content,
                        type: 1,
                        user_id: user.user!.user_id,
                        username: user.user!.username,
                        avatar: user.user!.avatar || '',
                        createtime: Date.now() / 1000,
                      };

                      message.success('回复成功');
                      editor.current.setValue('');
                      setList([...list, newComment]);
                    } catch (error: any) {
                      message.error(error.message || '发表评论失败');
                    }
                    setLoading(false);
                  }}
                >
                  评论
                </Button>
              </Space>
            </div>
          ) : (
            <Empty className="border-t" description="登录后评论">
              <Button
                type="primary"
                onClick={() => {
                  const btn = document.querySelector(
                    '#go-to-login',
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
              tagRender={(args) => {
                const { value, closable, onClose } = args;
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
                { label: '功能', value: 'feature' },
                { label: '问题', value: 'question' },
                { label: '错误', value: 'bug' },
              ]}
              value={labels}
              loading={loading}
              onChange={(value) => setLabels(value)}
              onBlur={async () => {
                setLoading(true);
                try {
                  // 调用更新标签的API
                  await scriptIssueService.updateLabels(
                    scriptId,
                    issueId,
                    labels,
                  );

                  // 创建标签变更的评论项
                  const addedLabels = labels.filter(
                    (l) => !issue.labels.includes(l),
                  );
                  const deletedLabels = issue.labels.filter(
                    (l) => !labels.includes(l),
                  );

                  if (addedLabels.length > 0 || deletedLabels.length > 0) {
                    const mockComment: IssueComment = {
                      id: Date.now(),
                      content: JSON.stringify({
                        add: addedLabels,
                        del: deletedLabels,
                      }),
                      type: 3,
                      user_id: user.user!.user_id,
                      username: user.user!.username,
                      avatar: user.user!.avatar || '',
                      createtime: Date.now() / 1000,
                    };
                    setList([...list, mockComment]);
                  }

                  // 更新issue的labels
                  issue.labels = labels;
                  message.success('标签更新成功');
                } catch (error: any) {
                  message.error(error.message || '更新失败');
                }
                setLoading(false);
              }}
            />
          </Space>
          <Divider />
          <Space direction="vertical">
            <span className="text-lg font-bold">关注</span>
            <div className="flex justify-center">
              <Tooltip title="关注此反馈以接收更新通知">
                <Button
                  type="primary"
                  size="small"
                  loading={loading}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      if (isWatch) {
                        await scriptIssueService.unwatchIssue(
                          scriptId,
                          issueId,
                        );
                      } else {
                        await scriptIssueService.watchIssue(scriptId, issueId);
                      }
                      // 更新本地状态
                      mutateIsWatch(!isWatch);
                      message.success(isWatch ? '已取消关注' : '已关注');
                    } catch (error: any) {
                      message.error(error.message || '操作失败');
                    }
                    setLoading(false);
                  }}
                >
                  {isWatch ? '已关注' : '关注'}
                </Button>
              </Tooltip>
            </div>
          </Space>
          <Divider />
          <Space direction="vertical">
            <span className="text-lg font-bold">参与者</span>
            <Space>
              {Object.keys(joinMember).map((key) => (
                <Link
                  key={key}
                  href={`/${locale}/users/${key}`}
                  target="_blank"
                >
                  <Avatar src={joinMember[key as unknown as number]} />
                </Link>
              ))}
            </Space>
          </Space>
        </div>
      </div>
    </Card>
  );
}
