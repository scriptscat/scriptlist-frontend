'use client';

import { Tooltip, theme } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useBanTime } from '@/lib/utils/banTime';

interface BanStatusBarProps {
  /** 封禁到期时间（unix 秒），0 表示永久 */
  expireAt: number;
  /** 管理员可悬停查看完整解除时间与剩余时长 */
  showDetail: boolean;
}

/** 资料卡顶部的封禁状态栏，贴合 Card 的上边缘与圆角 */
export default function BanStatusBar({
  expireAt,
  showDetail,
}: BanStatusBarProps) {
  const t = useTranslations('components.ban');
  const { token } = theme.useToken();
  const banTime = useBanTime();
  const permanent = !expireAt;
  const untilText = permanent
    ? ''
    : t('until', { time: banTime.until(expireAt) });

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-2.5 gap-y-1 px-4 py-2.5 text-[13px] text-left"
      style={{
        margin: `-${token.paddingLG}px -${token.paddingLG}px ${token.paddingLG}px`,
        borderTopLeftRadius: token.borderRadiusLG,
        borderTopRightRadius: token.borderRadiusLG,
        background: token.colorErrorBg,
        borderBottom: `1px solid ${token.colorErrorBorder}`,
      }}
    >
      <StopOutlined style={{ color: token.colorError }} />
      <span className="font-semibold" style={{ color: token.colorErrorText }}>
        {permanent ? t('permanent') : t('banned')}
      </span>
      {!permanent && (
        <>
          <span
            aria-hidden
            className="h-3 w-px"
            style={{ background: token.colorErrorBorder }}
          />
          {showDetail ? (
            <Tooltip
              title={
                <div>
                  <div>
                    <span className="opacity-60 mr-1.5">
                      {t('tooltip_until')}
                    </span>
                    {banTime.full(expireAt)}
                  </div>
                  <div>
                    <span className="opacity-60 mr-1.5">
                      {t('tooltip_remaining')}
                    </span>
                    {banTime.remaining(expireAt)}
                  </div>
                </div>
              }
            >
              <span
                className="cursor-help underline decoration-dotted underline-offset-4"
                style={{ color: token.colorText }}
              >
                {untilText}
              </span>
            </Tooltip>
          ) : (
            <span style={{ color: token.colorText }}>{untilText}</span>
          )}
        </>
      )}
    </div>
  );
}
