'use client';

/**
 * 聊天页的两处首屏骨架。
 *
 * 两个原始缺陷：
 * 1. 侧边栏在会话列表还在飞的时候就渲染「暂无历史」，用户以为记录被清空了；
 * 2. 点开一段历史对话时，`initialMessages` 会先回落到 systemMessages，
 *    于是 `WelcomeMessage` 的 4 张建议卡片闪一下再被真实消息替换，同样像被清空。
 *
 * 因此这里画的是**将要出现的形状**（`docs/design.md`：首屏用骨架、刷新才用 spin），
 * 尺寸对齐真实条目，数据到达时不会跳动。
 */

/** 侧边栏骨架的行数，接近一屏能放下的历史条目数。 */
const SIDEBAR_ROWS = 6;
/** 消息骨架的气泡数。 */
const MESSAGE_BUBBLES = 3;
/** 每个气泡里文本块的宽度，模拟长短不一的真实消息。 */
const BUBBLE_LINE_WIDTHS = ['60%', '40%', '75%'];

/** 骨架块的底色，跟随主题。 */
const BLOCK = 'animate-pulse rounded bg-[rgb(var(--bg-tertiary))]';

export function ChatSidebarSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      data-testid="chat-sidebar-skeleton"
    >
      {Array.from({ length: SIDEBAR_ROWS }, (_, i) => (
        <div
          key={i}
          data-testid="chat-sidebar-skeleton-row"
          className="flex items-center gap-2.5 px-3 py-2.5 my-0.5"
        >
          {/* 与 `.chat-history-item` 里的 MessageOutlined 同尺寸 */}
          <span
            className={`${BLOCK} flex-shrink-0`}
            style={{ width: 14, height: 14 }}
          />
          <span className={`${BLOCK} h-3.5`} style={{ width: '60%' }} />
        </div>
      ))}
    </div>
  );
}

export function ChatMessagesSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      data-testid="chat-messages-skeleton"
      className="flex flex-col gap-6 py-6 mx-auto w-full"
      style={{ maxWidth: 800, paddingLeft: 20, paddingRight: 20 }}
    >
      {Array.from({ length: MESSAGE_BUBBLES }, (_, i) => {
        // 与真实对话一样左右交替，避免数据到达时整列消息横向跳动。
        const isUser = i % 2 === 1;
        return (
          <div
            key={i}
            data-testid="chat-messages-skeleton-bubble"
            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            style={{ maxWidth: '80%', marginLeft: isUser ? 'auto' : 0 }}
          >
            {/* 与 ChatBubble 的 Avatar size={34} 对齐 */}
            <span
              className={`${BLOCK} !rounded-full flex-shrink-0 mt-0.5`}
              style={{ width: 34, height: 34 }}
            />
            <span
              className={`${BLOCK} px-4 py-3`}
              style={{
                width: BUBBLE_LINE_WIDTHS[i % BUBBLE_LINE_WIDTHS.length],
                height: 44,
                borderRadius: isUser
                  ? '18px 18px 4px 18px'
                  : '18px 18px 18px 4px',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
