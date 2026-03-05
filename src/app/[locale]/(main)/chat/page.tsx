'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Popconfirm, Space, Tooltip, Typography } from 'antd';
import {
  RobotOutlined,
  UserOutlined,
  SendOutlined,
  StopOutlined,
  ReloadOutlined,
  DeleteOutlined,
  BulbOutlined,
  CodeOutlined,
  QuestionCircleOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  MessageOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import {
  ChatRoot,
  MessageList,
  MessageItem,
  MessageInput,
  StreamControl,
  ChatProvider,
  createOpenAIAdapter,
  generateId,
  useMessages,
  useChat,
  type Message,
} from '@cago-frame/agents-client';
import { useTranslations } from 'next-intl';
import { parseMarkdown } from '@/components/MarkdownView/parseMarkdown';
import { useChatSessionList, useChatMessages } from '@/lib/api/hooks/chat';
import { chatService } from '@/lib/api/services/chat';
import type { ChatSession as ChatSessionType } from '@/lib/api/services/chat';
import '@/components/MarkdownView/markdown.css';
import '@/components/MarkdownView/github-markdown-css.css';
import './chat.css';

const { Text, Title } = Typography;

// 系统消息（清空时恢复到此状态）
const systemMessages: Message[] = [
  {
    id: generateId(),
    role: 'system',
    content:
      'You are a helpful assistant for ScriptCat user scripts platform. You can help users write, debug, and understand userscripts. Reply concisely and use markdown formatting when appropriate.',
    createdAt: new Date(),
  },
];

// 示例提示配置（不含翻译文本）
const suggestionConfigs = [
  {
    icon: <CodeOutlined />,
    titleKey: 'suggestion_write_title' as const,
    descKey: 'suggestion_write_desc' as const,
    color: '#1677ff',
    bg: 'rgba(22, 119, 255, 0.06)',
  },
  {
    icon: <BulbOutlined />,
    titleKey: 'suggestion_debug_title' as const,
    descKey: 'suggestion_debug_desc' as const,
    color: '#fa8c16',
    bg: 'rgba(250, 140, 22, 0.06)',
  },
  {
    icon: <QuestionCircleOutlined />,
    titleKey: 'suggestion_guide_title' as const,
    descKey: 'suggestion_guide_desc' as const,
    color: '#52c41a',
    bg: 'rgba(82, 196, 26, 0.06)',
  },
  {
    icon: <ThunderboltOutlined />,
    titleKey: 'suggestion_optimize_title' as const,
    descKey: 'suggestion_optimize_desc' as const,
    color: '#722ed1',
    bg: 'rgba(114, 46, 209, 0.06)',
  },
];

// Create adapter factory that optionally includes session ID header
function createAdapter(sessionId?: number) {
  return createOpenAIAdapter({
    baseUrl: '/api/v2',
    model: 'default',
    headers: sessionId ? { 'X-Chat-Session-ID': String(sessionId) } : undefined,
  });
}

// 格式化时间
function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 按日期分组会话
function groupSessionsByDate(
  sessions: ChatSessionType[],
  dateLabels: {
    today: string;
    yesterday: string;
    last7Days: string;
    earlier: string;
  },
): [string, ChatSessionType[]][] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups = new Map<string, ChatSessionType[]>();
  for (const s of sessions) {
    const d = new Date(s.updatetime * 1000);
    let group: string;
    if (d >= today) {
      group = dateLabels.today;
    } else if (d >= yesterday) {
      group = dateLabels.yesterday;
    } else if (d >= weekAgo) {
      group = dateLabels.last7Days;
    } else {
      group = dateLabels.earlier;
    }
    const list = groups.get(group) || [];
    list.push(s);
    groups.set(group, list);
  }
  return Array.from(groups.entries());
}

// 清空对话按钮
function ClearButton() {
  const { setMessages } = useMessages();
  const t = useTranslations('chat');

  const handleClear = useCallback(() => {
    setMessages(systemMessages);
  }, [setMessages]);

  return (
    <Tooltip title={t('clear_chat')}>
      <Button
        type="text"
        icon={<DeleteOutlined />}
        onClick={handleClear}
        size="small"
      />
    </Tooltip>
  );
}

// 聊天气泡组件
function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <MessageItem message={message} markdownParser={parseMarkdown}>
      {({ isStreaming, content }) => (
        <div
          className={`chat-msg flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          style={{
            maxWidth: '80%',
            marginLeft: isUser ? 'auto' : 0,
          }}
        >
          <Avatar
            size={34}
            icon={isUser ? <UserOutlined /> : <RobotOutlined />}
            className="flex-shrink-0 mt-0.5"
            style={{
              backgroundColor: isUser ? 'rgb(var(--primary-500))' : '#52c41a',
              boxShadow: isUser
                ? '0 2px 8px rgb(var(--primary-500) / 0.25)'
                : '0 2px 8px rgba(82, 196, 26, 0.25)',
            }}
          />

          <div
            className={`flex flex-col gap-1 min-w-0 ${isUser ? 'items-end' : 'items-start'}`}
          >
            <div
              className="px-4 py-3 text-sm leading-relaxed break-words"
              style={{
                borderRadius: isUser
                  ? '18px 18px 4px 18px'
                  : '18px 18px 18px 4px',
                ...(isUser
                  ? {
                      background:
                        'linear-gradient(135deg, rgb(var(--primary-500)), rgb(var(--primary-600)))',
                      color: '#fff',
                    }
                  : {
                      background: 'rgb(var(--bg-elevated))',
                      color: 'rgb(var(--text-primary))',
                      border: '1px solid rgb(var(--border-secondary))',
                    }),
              }}
            >
              {isUser ? (
                <p className="whitespace-pre-wrap break-words m-0">{content}</p>
              ) : (
                <div
                  className="markdown-body !bg-transparent !text-inherit !text-sm !leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: parseMarkdown(content || ''),
                  }}
                />
              )}
              {isStreaming && <span className="chat-cursor" />}
            </div>
            <Text
              type="secondary"
              className="!text-[10px] px-2"
              style={{ opacity: 0.5 }}
            >
              {formatTime(message.createdAt)}
            </Text>
          </div>
        </div>
      )}
    </MessageItem>
  );
}

// 欢迎页组件
function WelcomeMessage() {
  const { sendMessage } = useChat();
  const t = useTranslations('chat');

  const handleSuggestionClick = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage],
  );

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12">
      <div
        className="chat-welcome-icon flex items-center justify-center mb-8"
        style={{
          width: 88,
          height: 88,
          borderRadius: 24,
          background:
            'linear-gradient(135deg, rgb(var(--primary-500)) 0%, #6366f1 50%, #a855f7 100%)',
          boxShadow: '0 12px 32px rgb(var(--primary-500) / 0.25)',
        }}
      >
        <RobotOutlined style={{ fontSize: 44, color: '#fff' }} />
      </div>

      <Title level={3} className="!mb-2 !font-bold">
        {t('welcome_title')}
      </Title>
      <Text
        type="secondary"
        className="text-center mb-10 !leading-relaxed"
        style={{ maxWidth: 400, fontSize: 15 }}
      >
        {t('welcome_desc')}
      </Text>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
        style={{ maxWidth: 540 }}
      >
        {suggestionConfigs.map((item) => (
          <div
            key={item.titleKey}
            className="chat-suggestion"
            onClick={() => handleSuggestionClick(t(item.descKey))}
            style={{
              padding: '14px 16px',
              borderRadius: 12,
              border: '1px solid rgb(var(--border-secondary))',
              background: 'rgb(var(--bg-elevated))',
              borderLeft: `3px solid ${item.color}`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: item.bg,
                  color: item.color,
                  fontSize: 18,
                }}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <Text strong className="!text-sm block">
                  {t(item.titleKey)}
                </Text>
                <Text
                  type="secondary"
                  className="!text-xs block mt-1 !leading-snug"
                >
                  {t(item.descKey)}
                </Text>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 对话历史侧边栏
function ChatSidebar({
  activeId,
  sessions,
  onSelect,
  onToggle,
  onNew,
  onDelete,
}: {
  activeId: number | undefined;
  sessions: ChatSessionType[];
  onSelect: (id: number) => void;
  onToggle: () => void;
  onNew: () => void;
  onDelete: (id: number) => void;
}) {
  const t = useTranslations('chat');
  const dateLabels = useMemo(
    () => ({
      today: t('date_today'),
      yesterday: t('date_yesterday'),
      last7Days: t('date_last_7_days'),
      earlier: t('date_earlier'),
    }),
    [t],
  );
  const groups = useMemo(
    () => groupSessionsByDate(sessions, dateLabels),
    [sessions, dateLabels],
  );

  return (
    <aside
      className="chat-sidebar flex flex-col flex-shrink-0"
      style={{
        width: 280,
        borderRight: '1px solid rgb(var(--border-secondary))',
        background: 'rgb(var(--bg-elevated))',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgb(var(--border-secondary))' }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="small"
          className="flex-1 mr-2"
          onClick={onNew}
        >
          {t('new_chat')}
        </Button>
        <Button
          type="text"
          icon={<MenuFoldOutlined />}
          size="small"
          onClick={onToggle}
        />
      </div>

      <div className="flex-1 overflow-y-auto chat-sidebar-scroll px-2 py-2">
        {groups.map(([group, items]) => (
          <div key={group} className="mb-3">
            <Text
              type="secondary"
              className="!text-[11px] px-2 py-1 block font-medium uppercase"
            >
              {group}
            </Text>
            {items.map((item) => (
              <div
                key={item.id}
                className={`chat-history-item px-3 py-2.5 my-0.5 ${activeId === item.id ? 'active' : ''}`}
                onClick={() => onSelect(item.id)}
              >
                <div className="flex items-center gap-2.5">
                  <MessageOutlined
                    className="flex-shrink-0"
                    style={{
                      fontSize: 14,
                      color:
                        activeId === item.id
                          ? 'rgb(var(--primary-500))'
                          : 'rgb(var(--text-tertiary))',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <Text
                      ellipsis
                      className="!text-sm block !leading-tight"
                      style={{
                        fontWeight: activeId === item.id ? 500 : 400,
                        color:
                          activeId === item.id
                            ? 'rgb(var(--primary-500))'
                            : 'rgb(var(--text-primary))',
                      }}
                    >
                      {item.title || t('new_conversation')}
                    </Text>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Popconfirm
                      title={t('delete_confirm')}
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        onDelete(item.id);
                      }}
                      onCancel={(e) => e?.stopPropagation()}
                      okText={t('delete')}
                      cancelText={t('cancel')}
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        className="action-btn !w-6 !h-6 !min-w-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="text-center py-8">
            <Text type="secondary" className="!text-xs">
              {t('no_history')}
            </Text>
          </div>
        )}
      </div>
    </aside>
  );
}

export default function ChatPage() {
  const t = useTranslations('chat');
  const [activeSessionId, setActiveSessionId] = useState<number | undefined>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Key to force re-mount ChatProvider when switching sessions
  const [chatKey, setChatKey] = useState(0);

  // Fetch session list
  const { data: sessionsData, mutate: mutateSessions } = useChatSessionList();
  const sessions = sessionsData?.list || [];

  // Fetch messages for active session
  const { data: messagesData } = useChatMessages(activeSessionId);

  // Build initial messages for ChatProvider from loaded history
  const initialMessages = useMemo(() => {
    if (!activeSessionId || !messagesData?.list?.length) {
      return systemMessages;
    }
    const msgs: Message[] = [...systemMessages];
    for (const m of messagesData.list) {
      msgs.push({
        id: generateId(),
        role: m.role as Message['role'],
        content: m.content,
        createdAt: new Date(m.createtime * 1000),
      });
    }
    return msgs;
  }, [activeSessionId, messagesData]);

  // Build adapter with current session ID
  const adapter = useMemo(
    () => createAdapter(activeSessionId),
    [activeSessionId],
  );

  // Handle new chat
  const handleNewChat = useCallback(async () => {
    try {
      const session = await chatService.createSession();
      await mutateSessions();
      setActiveSessionId(session.id);
      setChatKey((k) => k + 1);
    } catch {
      // If session creation fails, just start a stateless chat
      setActiveSessionId(undefined);
      setChatKey((k) => k + 1);
    }
  }, [mutateSessions]);

  // Handle select session
  const handleSelectSession = useCallback(
    (id: number) => {
      if (id === activeSessionId) return;
      setActiveSessionId(id);
      setChatKey((k) => k + 1);
    },
    [activeSessionId],
  );

  // Handle delete session
  const handleDeleteSession = useCallback(
    async (id: number) => {
      try {
        await chatService.deleteSession(id);
        await mutateSessions();
        if (activeSessionId === id) {
          setActiveSessionId(undefined);
          setChatKey((k) => k + 1);
        }
      } catch {
        // ignore
      }
    },
    [activeSessionId, mutateSessions],
  );

  // Refresh session list after chat completes (to get updated titles)
  const handleFinish = useCallback(() => {
    mutateSessions();
  }, [mutateSessions]);

  // When messages data loads, trigger a re-key to re-mount the ChatProvider with new initial messages
  useEffect(() => {
    if (messagesData) {
      setChatKey((k) => k + 1);
    }
  }, [messagesData]);

  return (
    <>
      <div
        className="flex relative"
        style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        {!sidebarCollapsed && (
          <ChatSidebar
            activeId={activeSessionId}
            sessions={sessions}
            onSelect={handleSelectSession}
            onToggle={() => setSidebarCollapsed(true)}
            onNew={handleNewChat}
            onDelete={handleDeleteSession}
          />
        )}

        <ChatProvider
          key={chatKey}
          adapter={adapter}
          initialMessages={initialMessages}
          onFinish={handleFinish}
          onError={(err) => console.error('[onError]', err)}
        >
          <ChatRoot
            as="div"
            className="flex flex-col overflow-hidden"
            style={{ flex: 1, minHeight: 0 }}
          >
            {() => (
              <>
                {sidebarCollapsed && (
                  <div
                    className="flex items-center px-4 py-2 flex-shrink-0"
                    style={{
                      borderBottom: '1px solid rgb(var(--border-secondary))',
                    }}
                  >
                    <Tooltip title={t('expand_sidebar')}>
                      <Button
                        type="text"
                        icon={<MenuUnfoldOutlined />}
                        size="small"
                        onClick={() => setSidebarCollapsed(false)}
                      />
                    </Tooltip>
                  </div>
                )}

                <div className="flex-1 min-h-0 flex flex-col">
                  <MessageList
                    filter={(msg) => msg.role !== 'system'}
                    empty={<WelcomeMessage />}
                  >
                    {({ messages, scrollRef, bottomRef, isEmpty }) => (
                      <div ref={scrollRef} className="chat-scroll-area flex-1">
                        {isEmpty ? (
                          <WelcomeMessage />
                        ) : (
                          <div
                            className="flex flex-col gap-6 py-6 mx-auto w-full"
                            style={{
                              maxWidth: 800,
                              paddingLeft: 20,
                              paddingRight: 20,
                            }}
                          >
                            {messages.map((msg) => (
                              <ChatBubble key={msg.id} message={msg} />
                            ))}
                          </div>
                        )}
                        <div ref={bottomRef} />
                      </div>
                    )}
                  </MessageList>
                </div>

                <div
                  className="pt-3 pb-4 flex-shrink-0 mx-auto w-full"
                  style={{
                    borderTop: '1px solid rgb(var(--border-secondary))',
                    background: 'rgb(var(--bg-elevated))',
                    maxWidth: 800,
                    paddingLeft: 20,
                    paddingRight: 20,
                  }}
                >
                  <MessageInput placeholder={t('input_placeholder')}>
                    {({ textareaProps, formProps, canSend, isDisabled }) => (
                      <form
                        {...(formProps as React.FormHTMLAttributes<HTMLFormElement>)}
                        className="flex flex-col gap-1.5"
                      >
                        <div
                          className="chat-input-box flex items-end gap-2 px-4 py-2.5 transition-all"
                          style={{
                            borderRadius: 14,
                            border: '1px solid rgb(var(--border-primary))',
                            background: 'rgb(var(--bg-elevated))',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                          }}
                        >
                          <textarea
                            {...(textareaProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                            className="flex-1 border-none outline-none bg-transparent text-sm leading-relaxed resize-none py-0.5"
                            style={{
                              minHeight: 24,
                              maxHeight: 200,
                              color: 'rgb(var(--text-primary))',
                              fontFamily: 'inherit',
                            }}
                            rows={1}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                              textareaProps.onInput?.(e);
                            }}
                          />
                          <Space size={4} className="flex-shrink-0">
                            <StreamControl>
                              {({ isStreaming, isError, abort, retry }) => (
                                <>
                                  {isStreaming && (
                                    <Tooltip title={t('stop_generating')}>
                                      <Button
                                        type="text"
                                        danger
                                        icon={<StopOutlined />}
                                        onClick={abort}
                                        size="small"
                                      />
                                    </Tooltip>
                                  )}
                                  {isError && (
                                    <Tooltip title={t('retry')}>
                                      <Button
                                        type="text"
                                        icon={<ReloadOutlined />}
                                        onClick={retry}
                                        size="small"
                                        style={{ color: '#fa8c16' }}
                                      />
                                    </Tooltip>
                                  )}
                                </>
                              )}
                            </StreamControl>
                            <ClearButton />
                            <Tooltip
                              title={
                                canSend ? t('send_message') : t('enter_content')
                              }
                            >
                              <Button
                                type="primary"
                                shape="circle"
                                htmlType="submit"
                                disabled={!canSend}
                                size="small"
                                className="!w-8 !h-8"
                                icon={
                                  isDisabled ? (
                                    <div className="chat-loading-dots">
                                      <span />
                                      <span />
                                      <span />
                                    </div>
                                  ) : (
                                    <SendOutlined />
                                  )
                                }
                              />
                            </Tooltip>
                          </Space>
                        </div>
                        <Text
                          type="secondary"
                          className="!text-[11px] px-2"
                          style={{ opacity: 0.5 }}
                        >
                          {t('input_hint')}
                        </Text>
                      </form>
                    )}
                  </MessageInput>
                </div>
              </>
            )}
          </ChatRoot>
        </ChatProvider>
      </div>
    </>
  );
}
