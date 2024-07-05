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
import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { V2_MetaFunction } from '@remix-run/react';
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
import MarkdownView, { markdownViewLinks } from '~/components/MarkdownView';
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
import { useTranslation } from 'react-i18next';
import { useLocale } from 'remix-i18next';
import i18next from '~/i18next.server';
import { getLocale } from '~/utils/i18n';
import { markdownEditorLinks } from '~/components/MarkdownEditor';

export const links: LinksFunction = () => {
  return [...markdownViewLinks(), ...markdownEditorLinks()];
};

type LoaderData = {
  issue: Issue;
  comments: IssueComment[];
};

export const meta: V2_MetaFunction = ({ data, matches }) => {
  if (!data) {
    return [
      { title: ' - ScriptCat' },
      { description: 'Not Found' },
      {
        name: 'viewport',
        content:
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
      },
    ];
  }
  console.log('123123', matches);
  return [
    {
      title:
        data.issue.title +
        ' · ' +
        data.i18n_issue +
        ' #' +
        data.issue.id +
        ' · ' +
        (matches[1].data as any).script.name +
        ' - ScriptCat',
    },
    {
      name: 'viewport',
      content:
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
    },
  ];
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const scriptId = parseInt(params.id as string);
  const issueId = parseInt(params.issueId as string);
  const issue = await GetIssue(scriptId, issueId, request);
  const lng = getLocale(request, 'en')!;
  let t = await i18next.getFixedT(lng);
  if (!issue) {
    throw new Response(t('issue_not_found'), {
      status: 404,
      statusText: 'Not Found',
    });
  }
  const commentList = await IssueCommentList(scriptId, issueId, request);
  return json({
    issue: issue,
    comments: commentList,
    i18n_issue: t('issue'),
  } as LoaderData);
};

const LabelsStatus: React.FC<{ content: string }> = ({ content }) => {
  let json = JSON.parse(content);
  const { t } = useTranslation();

  return (
    <div>
      {json['add'].length > 0 && (
        <span>
          {t('add_label')}:{' '}
          {json['add'].map((label: string) => (
            <IssueLabel key={label} label={label} />
          ))}
        </span>
      )}
      {json['del'].length > 0 && (
        <span>
          {t('delete_label')}:{' '}
          {json['del'].map((label: string) => (
            <IssueLabel key={label} label={label} />
          ))}
        </span>
      )}
    </div>
  );
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
  const [isWatch, setIsWatch] = useState(false);
  const [labels, setLabels] = useState(data.issue.labels || []);
  const locale = '/' + useLocale();
  const { t } = useTranslation();

  useEffect(() => {
    if (user.user) {
      IsWatchIssue(script.script!.id, data.issue.id).then((res) => {
        setIsWatch(res.watch);
      });
    }
    new ClipboardJS('.copy-comment-link', {
      text: (target) => {
        message.success(t('copy_success'));
        return (
          location.origin + location.pathname + target.getAttribute('copy-link')
        );
      },
    });
  });
  const joinMember: { [key: number]: string } = {};
  joinMember[data.issue.user_id] = data.issue.avatar;
  list.forEach((item) => {
    joinMember[item.user_id] = item.avatar;
  });

  return (
    <Card>
      <div className="flex flex-row gap-3">
        <div className="flex flex-col gap-2 basis-3/4 !w-3/4">
          <div className="flex flex-row justify-between">
            <span className="text-2xl">{data.issue.title}</span>
            <ActionMenu
              uid={[data.issue.user_id, script.script?.user_id || -1]}
              deleteLevel="moderator"
              allowSelfDelete
              onDeleteClick={async () => {
                const resp = await DeleteIssue(
                  script.script!.id,
                  data.issue.id
                );
                if (resp.code === 0) {
                  message.success(t('delete_success'));
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
              <Tag icon={<InfoCircleTwoTone />} color="blue">
                {t('pending')}
              </Tag>
            ) : (
              <Tag
                icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
                color="green"
              >
                {t('resolved')}
              </Tag>
            )}
            <Tooltip title={t('copy_link')}>
              <Tag>#{data.issue.id}</Tag>
            </Tooltip>
            <UserOutlined className="mr-1 !text-gray-400 " />
            <Link
              to={locale + '/users/' + data.issue.user_id}
              target="_blank"
              className="text-gray-400 hover:text-gray-500 mr-1"
            >
              {data.issue.username}
            </Link>
            <span className="text-sm text-gray-400">
              {t('created_at')} {formatDate(data.issue.createtime)}
            </span>
          </div>
          <MarkdownView id="issue" content={data.issue.content}></MarkdownView>

          <ConfigProvider
            renderEmpty={() => <Empty description={t('no_reply')} />}
          >
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
                                to={locale + '/users/' + item.user_id}
                                target="_blank"
                              >
                                <Avatar src={item.avatar} />
                              </Link>
                              <div className="flex flex-col">
                                <Link
                                  to={locale + '/users/' + item.user_id}
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
                                data.issue.user_id,
                                script.script?.user_id || -1,
                              ]}
                              deleteLevel="moderator"
                              allowSelfDelete
                              onDeleteClick={async () => {
                                const resp = await DeleteIssueComment(
                                  script.script!.id,
                                  data.issue.id,
                                  item.id
                                );
                                if (resp.code === 0) {
                                  message.success(t('delete_success'));
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
                              {t('reply')}
                            </Button>
                            <Button
                              size="small"
                              type="text"
                              icon={<LinkOutlined />}
                              className="!text-gray-400 anticon-middle copy-comment-link"
                              copy-link={`#comment-${item.id}`}
                            >
                              {t('link')}
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
                            <Link
                              to={locale + '/users/' + item.user_id}
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
                              {item.type == 4 && t('open_feedback')}
                              {item.type == 5 && t('close_feedback')}
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
                {() => (
                  <MarkdownEditor
                    id="reply"
                    comment="comment"
                    linkId={data.issue.id}
                    ref={editor}
                  />
                )}
              </ClientOnly>
              <Space className="justify-end">
                {(user.user.user_id == data.issue.user_id ||
                  user.user.is_admin >= 1 ||
                  script.script?.user_id == user.user.user_id) && (
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
                    {status == 1 ? t('close_feedback') : t('open_feedback')}
                  </Button>
                )}
                <Button
                  type="primary"
                  loading={loading}
                  onClick={() => {
                    if (!editor.current || !editor.current.editor) {
                      message.error(t('system_error'));
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
                        message.success(t('reply_success'));
                        editor.current!.setMarkdown('');
                        setList([...list, resp.data]);
                      } else {
                        message.error(resp.msg);
                      }
                    });
                  }}
                >
                  {t('issue_comment')}
                </Button>
              </Space>
            </div>
          ) : (
            <Empty className="border-t" description={t('login_comment')}>
              <Button
                type="primary"
                onClick={() => {
                  const btn = document.querySelector(
                    '#go-to-login'
                  ) as HTMLButtonElement;
                  btn.click();
                }}
              >
                {t('login')}
              </Button>
            </Empty>
          )}
        </div>
        <div className="flex flex-col basis-1/4">
          <Space direction="vertical">
            <span className="text-lg font-bold">{t('labels')}</span>
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
                { label: t('feature'), value: 'feature' },
                { label: t('question'), value: 'question' },
                { label: t('bug'), value: 'bug' },
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
            <span className="text-lg font-bold">{t('watch')}</span>
            <div className="flex justify-center">
              <Tooltip title={t('watch_tooltip')}>
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
                      setIsWatch(isWatch);
                    } else {
                      message.error(resp.msg);
                    }
                  }}
                >
                  {isWatch ? t('watched') : t('watch')}
                </Button>
              </Tooltip>
            </div>
          </Space>
          <Divider />
          <Space direction="vertical">
            <span className="text-lg font-bold">{t('participants')}</span>
            <Space>
              {Object.keys(joinMember).map((key) => (
                <Link key={key} to={locale + `/users/${key}`} target="_blank">
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
