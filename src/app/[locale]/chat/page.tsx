'use client';

import React, { useCallback, useMemo } from 'react';
import { Avatar, Button, Card, Space, Tag, Tooltip, Typography } from 'antd';
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
} from '@cago/agents-client';
import { marked } from 'marked';
import '@/components/MarkdownView/markdown.css';
import '@/components/MarkdownView/github-markdown-css.css';
import './chat.css';

const { Text, Title } = Typography;

// Configure OpenAI-compatible adapter
const adapter = createOpenAIAdapter({
  baseUrl: 'https://api.hodlai.fun/v1',
  apiKey: 'sk-fLnPP7iUjS5dWKP4AZxFQZwTGeoEXlQlmA9w1nHGpmE1FimE',
  model: 'gpt-4o-mini',
});

// System message
const initialMessages: Message[] = [
  {
    id: generateId(),
    role: 'system',
    content:
      'You are a helpful assistant for ScriptCat user scripts platform. You can help users write, debug, and understand userscripts. Reply concisely and use markdown formatting when appropriate.',
    createdAt: new Date(),
  },
];

// 示例提示
const suggestions = [
  {
    icon: <CodeOutlined className="text-blue-500" />,
    title: '编写脚本',
    desc: '帮我写一个自动签到的油猴脚本',
  },
  {
    icon: <BulbOutlined className="text-amber-500" />,
    title: '调试帮助',
    desc: '我的脚本在某些页面上不生效，怎么排查？',
  },
  {
    icon: <QuestionCircleOutlined className="text-green-500" />,
    title: '使用指南',
    desc: 'GM_xmlhttpRequest 和 fetch 有什么区别？',
  },
  {
    icon: <ThunderboltOutlined className="text-purple-500" />,
    title: '优化脚本',
    desc: '如何让脚本在页面加载完成前执行？',
  },
];

// Markdown parser using marked
const markdownParser = (md: string): string => {
  return marked(md, { gfm: true, breaks: true }) as string;
};

// Format time
function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 状态标签颜色映射
const statusConfig: Record<string, { color: string; text: string }> = {
  idle: { color: 'processing', text: '就绪' },
  loading: { color: 'warning', text: '加载中' },
  streaming: { color: 'success', text: '回复中' },
  error: { color: 'error', text: '错误' },
};

// Clear button component (needs to be inside ChatProvider)
function ClearButton() {
  const { setMessages } = useMessages();

  const handleClear = useCallback(() => {
    setMessages(initialMessages);
  }, [setMessages]);

  return (
    <Tooltip title="清空对话">
      <Button
        type="text"
        icon={<DeleteOutlined />}
        onClick={handleClear}
        aria-label="清空对话"
      />
    </Tooltip>
  );
}

// Single message bubble component
function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <MessageItem message={message} markdownParser={markdownParser}>
      {({ isStreaming, content }) => (
        <div
          className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse ml-auto' : 'flex-row mr-auto'}`}
        >
          {/* Avatar */}
          <div className="flex-shrink-0 pt-0.5">
            {isUser ? (
              <Avatar
                size={36}
                icon={<UserOutlined />}
                className="!bg-[rgb(var(--primary-500))]"
              />
            ) : (
              <Avatar
                size={36}
                icon={<RobotOutlined />}
                className="!bg-emerald-500 dark:!bg-emerald-600"
              />
            )}
          </div>

          {/* Message content */}
          <div
            className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words relative ${
                isUser
                  ? 'bg-[rgb(var(--primary-500))] text-white rounded-br-sm'
                  : 'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] rounded-bl-sm border border-[rgb(var(--border-secondary))]'
              }`}
            >
              {isUser ? (
                <p className="whitespace-pre-wrap break-words m-0">{content}</p>
              ) : (
                <div
                  className="markdown-body !bg-transparent !text-inherit !text-sm !leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: markdownParser(content || ''),
                  }}
                />
              )}
              {isStreaming && <span className="chat-cursor" />}
            </div>
            <Text type="secondary" className="!text-[11px] px-1">
              {formatTime(message.createdAt)}
            </Text>
          </div>
        </div>
      )}
    </MessageItem>
  );
}

// Welcome message component
function WelcomeMessage() {
  const { sendMessage } = useChat();

  const handleSuggestionClick = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage],
  );

  return (
    <div className="flex flex-col items-center justify-center h-full px-5 py-12">
      <div className="w-[72px] h-[72px] flex items-center justify-center bg-[rgba(var(--primary-500),0.08)] rounded-2xl mb-5">
        <RobotOutlined className="text-4xl text-[rgb(var(--primary-500))]" />
      </div>
      <Title level={4} className="!mb-2">
        {'ScriptCat AI 助手'}
      </Title>
      <Text type="secondary" className="text-center mb-8 max-w-[420px]">
        {'我可以帮你编写、调试和理解油猴用户脚本，有什么可以帮你的？'}
      </Text>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[560px]">
        {suggestions.map((item) => (
          <Card
            key={item.title}
            size="small"
            hoverable
            className="!cursor-pointer transition-all"
            onClick={() => handleSuggestionClick(item.desc)}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <Text strong className="block !text-sm">
                  {item.title}
                </Text>
                <Text
                  type="secondary"
                  className="!text-xs block mt-0.5 truncate"
                >
                  {item.desc}
                </Text>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const memoAdapter = useMemo(() => adapter, []);

  return (
    <ChatProvider
      adapter={memoAdapter}
      initialMessages={initialMessages}
      onFinish={(msg) => console.log('[onFinish]', msg)}
      onError={(err) => console.error('[onError]', err)}
    >
      <ChatRoot
        as="div"
        className="flex flex-col h-[calc(100vh-130px)] max-w-[900px] mx-auto bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border-primary))] rounded-xl overflow-hidden shadow-sm"
      >
        {({ status }) => (
          <>
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-3 border-b border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-elevated))] flex-shrink-0">
              <Space align="center" size="middle">
                <Avatar
                  size={32}
                  icon={<RobotOutlined />}
                  className="!bg-[rgb(var(--primary-500))]"
                />
                <Title level={5} className="!m-0">
                  {'AI 助手'}
                </Title>
                <Tag color={statusConfig[status]?.color ?? 'default'}>
                  {statusConfig[status]?.text ?? status}
                </Tag>
              </Space>
              <Space size={4}>
                <ClearButton />
                <StreamControl>
                  {({ isStreaming, isError, abort, retry }) => (
                    <>
                      {isStreaming && (
                        <Tooltip title="停止生成">
                          <Button
                            type="text"
                            danger
                            icon={<StopOutlined />}
                            onClick={abort}
                            aria-label="停止生成"
                          />
                        </Tooltip>
                      )}
                      {isError && (
                        <Tooltip title="重试">
                          <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            onClick={retry}
                            className="!text-amber-500 hover:!text-amber-600"
                            aria-label="重试"
                          />
                        </Tooltip>
                      )}
                    </>
                  )}
                </StreamControl>
              </Space>
            </header>

            {/* Messages area */}
            <MessageList
              filter={(msg) => msg.role !== 'system'}
              empty={<WelcomeMessage />}
            >
              {({ messages, scrollRef, bottomRef, isEmpty }) => (
                <div ref={scrollRef} className="chat-messages flex-1">
                  {isEmpty ? (
                    <WelcomeMessage />
                  ) : (
                    <div className="flex flex-col gap-5 p-5">
                      {messages.map((msg) => (
                        <ChatBubble key={msg.id} message={msg} />
                      ))}
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </MessageList>

            {/* Input area */}
            <div className="px-5 pt-3 pb-4 border-t border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-elevated))] flex-shrink-0">
              <MessageInput placeholder="输入你的问题...">
                {({ textareaProps, formProps, canSend, isDisabled }) => (
                  <form
                    {...(formProps as React.FormHTMLAttributes<HTMLFormElement>)}
                    className="flex flex-col gap-1.5"
                  >
                    <div className="flex items-end gap-2.5 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-xl px-4 py-2 transition-all focus-within:border-[rgb(var(--primary-500))] focus-within:shadow-[0_0_0_2px_rgba(var(--primary-500),0.12)]">
                      <textarea
                        {...(textareaProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                        className="flex-1 border-none outline-none bg-transparent text-[rgb(var(--text-primary))] text-sm leading-relaxed resize-none py-1 min-h-[24px] max-h-[200px] font-[inherit] placeholder:text-[rgb(var(--text-tertiary))]"
                        rows={1}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                          textareaProps.onInput?.(e);
                        }}
                      />
                      <Tooltip title={canSend ? '发送消息' : '请输入内容'}>
                        <Button
                          type="primary"
                          shape="circle"
                          htmlType="submit"
                          disabled={!canSend}
                          size="small"
                          className="flex-shrink-0 !w-9 !h-9"
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
                    </div>
                    <Text type="secondary" className="!text-[11px] px-1">
                      {'按 Enter 发送，Shift + Enter 换行。AI 回复仅供参考。'}
                    </Text>
                  </form>
                )}
              </MessageInput>
            </div>
          </>
        )}
      </ChatRoot>
    </ChatProvider>
  );
}
