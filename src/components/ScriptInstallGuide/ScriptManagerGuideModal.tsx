'use client';

import { useState } from 'react';
import { Modal, theme } from 'antd';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { BrowserStoreKey } from '@/lib/constants/browserStores';
import {
  BROWSER_STORE_LABELS,
  detectBrowserStore,
  getBrowserStores,
  SCRIPTCAT_INSTALL_GUIDE_URL,
} from '@/lib/constants/browserStores';

interface ScriptManagerGuideModalProps {
  open: boolean;
  /** 用户坚持继续时打开的链接（脚本 .user.js 或订阅 .user.sub.js） */
  installUrl: string;
  onClose: () => void;
  /** 覆盖默认说明文案（如订阅场景） */
  description?: string;
  /** 覆盖默认「仍要继续安装」文案（如订阅场景的「仍要继续订阅」） */
  proceedLabel?: string;
}

// chips 中展示的其它渠道（default 仅用于检测兜底，不出现在 chips）
const CHIP_CHANNELS: Exclude<BrowserStoreKey, 'default'>[] = [
  'chrome',
  'edge',
  'firefox',
  'crx',
];

/**
 * 「未检测到脚本猫」二次引导弹窗：
 * 复用 browserStores 的浏览器检测与渠道配置，按当前浏览器推荐安装入口，
 * 并保留「仍要继续安装」逃生通道。颜色全部取自 AntD token，自动适配明 / 暗主题。
 */
export default function ScriptManagerGuideModal({
  open,
  installUrl,
  onClose,
  description,
  proceedLabel,
}: ScriptManagerGuideModalProps) {
  const t = useTranslations('script.detail.installGuide');
  const { token } = theme.useToken();

  // 惰性初始化：服务端返回 'default'，客户端首渲染即为真实浏览器。
  // 弹窗关闭时不渲染内容（destroyOnHidden），用户点开时 navigator 必然可用，故无水合问题。
  const [currentKey] = useState<BrowserStoreKey>(() => detectBrowserStore());
  const stores = getBrowserStores();

  const isKnown = currentKey !== 'default';
  const primaryStore = isKnown ? stores[currentKey] : null;
  const primaryUrl = primaryStore
    ? primaryStore.url
    : SCRIPTCAT_INSTALL_GUIDE_URL;
  const primaryTitle = isKnown
    ? t(`primary_${currentKey}`)
    : t('primary_other');
  const primarySubtitle = isKnown
    ? t(`subtitle_${currentKey}`)
    : t('subtitle_other');

  const otherChannels = CHIP_CHANNELS.filter((k) => k !== currentKey);

  const handleProceed = () => {
    onClose();
    window.open(installUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={460}
      centered
      destroyOnHidden
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              flex: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: token.colorPrimaryBg,
            }}
          >
            <Image
              src="/assets/logo.png"
              alt="ScriptCat"
              width={26}
              height={26}
            />
          </span>
          <span style={{ fontSize: 17, fontWeight: 600 }}>{t('title')}</span>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: 14,
            lineHeight: 1.6,
            color: token.colorTextSecondary,
          }}
        >
          {description ?? t('description')}
        </p>

        {/* 主推荐入口（按浏览器自动识别） */}
        <a
          href={primaryUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 16px',
            borderRadius: 10,
            background: token.colorPrimary,
            color: token.colorWhite ?? '#fff',
            textDecoration: 'none',
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              flex: 'none',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {primaryStore ? (
              <Icon icon={primaryStore.icon} width={22} height={22} />
            ) : (
              <Image
                src="/assets/logo.png"
                alt="ScriptCat"
                width={22}
                height={22}
              />
            )}
          </span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>
              {primaryTitle}
            </span>
            <span style={{ display: 'block', fontSize: 12, opacity: 0.85 }}>
              {primarySubtitle}
            </span>
          </span>
          <span style={{ fontSize: 18, opacity: 0.9 }}>{'→'}</span>
        </a>

        {/* 其它浏览器 / 方式 */}
        <div>
          <div
            style={{
              fontSize: 12,
              marginBottom: 8,
              color: token.colorTextTertiary,
            }}
          >
            {t('other_channels')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {otherChannels.map((key) => (
              <a
                key={key}
                href={stores[key].url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: `1px solid ${token.colorBorder}`,
                  fontSize: 13,
                  color: token.colorText,
                  textDecoration: 'none',
                }}
              >
                <Icon icon={stores[key].icon} width={16} height={16} />
                <span>{BROWSER_STORE_LABELS[key]}</span>
              </a>
            ))}
          </div>
        </div>

        {/* 了解更多 */}
        <div style={{ fontSize: 12.5, color: token.colorTextTertiary }}>
          {t('learn_more')}{' '}
          <a
            href={SCRIPTCAT_INSTALL_GUIDE_URL}
            target="_blank"
            rel="noreferrer"
            style={{ color: token.colorPrimary }}
          >
            {t('learn_more_link')} {'→'}
          </a>
        </div>

        {/* 逃生通道：仍要继续安装 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginTop: 4,
            paddingTop: 16,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <button
            type="button"
            onClick={handleProceed}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: 13,
              color: token.colorTextSecondary,
            }}
          >
            {proceedLabel ?? t('proceed')} {'→'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: 13,
              color: token.colorTextSecondary,
            }}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
