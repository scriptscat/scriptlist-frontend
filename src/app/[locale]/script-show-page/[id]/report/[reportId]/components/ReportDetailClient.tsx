'use client';

import {
  UserOutlined,
  ExclamationCircleFilled,
  CheckCircleFilled,
  MessageOutlined,
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
  Space,
  Tag,
  Tooltip,
} from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSemDateTime } from '@/lib/utils/semdate';
import type { MarkdownEditorRef } from '@/components/MarkdownEditor';
import dynamic from 'next/dynamic';

const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), {
  ssr: false,
  loading: () => <div style={{ height: '200px' }} />,
});
const MarkdownView = dynamic(() => import('@/components/MarkdownView'));
import ActionMenu from '@/components/ActionMenu';
import type { Report, ReportComment } from '@/lib/api/services/scripts/report';
import { scriptReportService } from '@/lib/api/services/scripts/report';
import { useCallback, useRef, useState } from 'react';
import { useScript } from '../../../components/ScriptContext';
import { useUser } from '@/contexts/UserContext';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const REASON_COLORS: Record<string, string> = {
  malware: 'red',
  privacy: 'orange',
  copyright: 'purple',
  spam: 'gold',
  other: 'default',
};

interface ReportDetailClientProps {
  report: Report;
  comments: ReportComment[];
  scriptId: number;
  reportId: number;
}

export default function ReportDetailClient({
  report,
  comments,
  scriptId,
  reportId,
}: ReportDetailClientProps) {
  const [status, setStatus] = useState(report.status);
  const [list, setList] = useState(comments);
  const router = useRouter();
  const script = useScript();
  const user = useUser();
  const editor = useRef<MarkdownEditorRef>(null);
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  const formatDate = useSemDateTime();
  const t = useTranslations('script.report');
  const [commentContent, setCommentContent] = useState('');

  const joinMember: { [key: number]: string } = {};
  joinMember[report.user_id] = report.avatar;
  list.forEach((item) => {
    joinMember[item.user_id] = item.avatar;
  });

  const onCommentChange = useCallback((value: string) => {
    setCommentContent(value);
  }, []);

  const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/${locale}/script-show-page/${scriptId}/report/${reportId}`;

  const isAdmin = user.user && user.user.is_admin === 1;

  return (
    <Card>
      <div className="flex flex-row gap-3">
        <div className="flex flex-col gap-2 basis-3/4 !w-3/4">
          <div className="flex flex-row justify-between">
            <div className="flex items-center gap-2">
              <Tag color={REASON_COLORS[report.reason] || 'default'}>
                {t(`reasons.${report.reason}`)}
              </Tag>
              <Tag color={status === 1 ? 'error' : 'success'}>
                {status === 1 ? t('status_pending') : t('status_resolved')}
              </Tag>
            </div>
            <ActionMenu
              uid={[report.user_id, script.script?.user_id || -1]}
              deleteLevel="admin"
              allowSelfDelete={false}
              onDeleteClick={async () => {
                try {
                  await scriptReportService.deleteReport(scriptId, reportId);
                  message.success(t('delete_success'));
                  router.push(`/${locale}/script-show-page/${scriptId}/report`);
                } catch (error: any) {
                  message.error(error.message || t('delete_failed'));
                }
              }}
            >
              <Button
                type="default"
                size="small"
                className="!p-0"
                icon={<EllipsisOutlined />}
              />
            </ActionMenu>
          </div>
          <div className="flex flex-row items-center gap-1">
            <CopyToClipboard
              text={`${reportUrl}#report-${report.id}`}
              onCopy={() => message.success(t('copy_success'))}
            >
              <Tooltip title={t('copy_link')}>
                <Tag className="cursor-pointer">{'#' + report.id}</Tag>
              </Tooltip>
            </CopyToClipboard>
            <UserOutlined className="mr-1 !text-gray-400" />
            <Link
              href={`/users/${report.user_id}`}
              target="_blank"
              className="text-gray-400 hover:text-gray-500 mr-1"
            >
              {report.username}
            </Link>
            <span className="text-sm text-gray-400">
              {t('created_at', { time: formatDate(report.createtime) })}
            </span>
          </div>
          <MarkdownView id="report" content={report.content || ''} />

          <ConfigProvider
            renderEmpty={() => <Empty description={t('no_comments')} />}
          >
            <List
              itemLayout="vertical"
              size="large"
              dataSource={list}
              className="!border-t !mt-2"
              renderItem={(item: ReportComment) => {
                if (item.type === 1) {
                  return (
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
                              report.user_id,
                              script.script?.user_id || -1,
                            ]}
                            deleteLevel="admin"
                            allowSelfDelete={false}
                            onDeleteClick={async () => {
                              try {
                                await scriptReportService.deleteComment(
                                  scriptId,
                                  reportId,
                                  item.id,
                                );
                                message.success(t('delete_success'));
                                setList(list.filter((i) => i.id !== item.id));
                              } catch (error: any) {
                                message.error(
                                  error.message || t('delete_failed'),
                                );
                              }
                            }}
                          >
                            <Button
                              type="default"
                              size="small"
                              className="!p-0"
                              icon={<EllipsisOutlined />}
                            />
                          </ActionMenu>
                        </div>
                        <MarkdownView
                          id={'comment-' + item.id}
                          content={item.content}
                        />
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
                            {t('reply')}
                          </Button>
                          <CopyToClipboard
                            text={`${reportUrl}#comment-${item.id}`}
                            onCopy={() => message.success(t('copy_success'))}
                          >
                            <Button
                              size="small"
                              type="text"
                              icon={<LinkOutlined />}
                              className="!text-gray-400 anticon-middle cursor-pointer"
                            >
                              {t('link')}
                            </Button>
                          </CopyToClipboard>
                        </div>
                      </div>
                    </List.Item>
                  );
                }

                return (
                  <List.Item key={item.id} className="!p-0">
                    <div className="flex flex-row">
                      <Divider type="vertical" className="!h-16" />
                      <div
                        className="flex items-center gap-2"
                        style={{ position: 'relative', left: '-19px' }}
                      >
                        {item.type === 2 && (
                          <CheckCircleFilled className="text-xl !text-green-500" />
                        )}
                        {item.type === 3 && (
                          <ExclamationCircleFilled className="text-xl !text-orange-500" />
                        )}
                        <Link href={`/users/${item.user_id}`} target="_blank">
                          <Space>
                            <Avatar src={item.avatar} />
                            <span>{item.username}</span>
                          </Space>
                        </Link>
                        <span className="text-xs text-gray-400">
                          {formatDate(item.createtime)}
                          {item.type === 2 && t('resolved_report')}
                          {item.type === 3 && t('reopened_report')}
                        </span>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </ConfigProvider>
          {user.user ? (
            <div className="flex flex-col gap-2">
              <MarkdownEditor
                placeholder={t('comment_placeholder')}
                ref={editor}
                comment="report-comment"
                linkId={reportId}
                onChange={onCommentChange}
              />
              <Space className="justify-end">
                {isAdmin && (
                  <Button
                    loading={loading}
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const closing = status === 1;
                        const resp = await scriptReportService.resolveReport(
                          scriptId,
                          reportId,
                          {
                            close: closing,
                            content: commentContent,
                          },
                        );
                        setStatus(closing ? 3 : 1);
                        if (resp?.comments) {
                          setList([...list, ...resp.comments]);
                        }
                        editor.current?.setValue('');
                        message.success(
                          closing ? t('report_resolved') : t('report_reopened'),
                        );
                      } catch (error: any) {
                        message.error(error.message || t('operation_failed'));
                      }
                      setLoading(false);
                    }}
                  >
                    {status === 1
                      ? t(
                          'resolve' +
                            (commentContent.length ? '_and_reply' : '') +
                            '_report',
                        )
                      : t(
                          'reopen' +
                            (commentContent.length ? '_and_reply' : '') +
                            '_report',
                        )}
                  </Button>
                )}
                <Button
                  type="primary"
                  loading={loading}
                  onClick={async () => {
                    if (!editor.current) {
                      message.error(t('system_error'));
                      return;
                    }
                    setLoading(true);

                    const content = editor.current.getValue();
                    if (!content.trim()) {
                      message.error(t('comment_content_required'));
                      setLoading(false);
                      return;
                    }

                    try {
                      const resp = await scriptReportService.postComment(
                        scriptId,
                        reportId,
                        content,
                      );

                      message.success(t('reply_success'));
                      editor.current.setValue('');
                      if (resp) {
                        setList([...list, resp as ReportComment]);
                      }
                    } catch (error: any) {
                      message.error(error.message || t('comment_failed'));
                    }
                    setLoading(false);
                  }}
                >
                  {t('comment_button')}
                </Button>
              </Space>
            </div>
          ) : (
            <Empty className="border-t" description={t('login_to_comment')}>
              <Button
                type="primary"
                onClick={() => {
                  const btn = document.querySelector(
                    '#go-to-login',
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
            <span className="text-lg font-bold">{t('participants')}</span>
            <Space>
              {Object.keys(joinMember).map((key) => (
                <Link key={key} href={`/users/${key}`} target="_blank">
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
