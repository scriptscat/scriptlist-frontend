'use client';

import { useSyncExternalStore } from 'react';
import { CloseOutlined, NotificationOutlined } from '@ant-design/icons';
import { useLocale } from 'next-intl';
import { useLatestAnnouncement } from '@/lib/api/hooks/announcement';

const DISMISSED_KEY = 'dismissed_announcement_ids';

function getDismissedIds(): number[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function dismissId(id: number) {
  const ids = getDismissedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    if (ids.length > 50) {
      ids.splice(0, ids.length - 50);
    }
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
  }
}

// Track dismissal changes via a simple counter
let dismissVersion = 0;
const listeners = new Set<() => void>();

function subscribeDismiss(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return dismissVersion;
}

function getServerSnapshot() {
  return 0;
}

function triggerDismissUpdate() {
  dismissVersion++;
  listeners.forEach((cb) => cb());
}

export default function AnnouncementBanner() {
  const locale = useLocale();
  const { data: announcement } = useLatestAnnouncement(locale);

  // Re-render when dismissal state changes
  useSyncExternalStore(subscribeDismiss, getSnapshot, getServerSnapshot);

  // 每次 render 都重新计算（依赖 dismissVersion 触发的 re-render）
  const isDismissed =
    !announcement?.id || getDismissedIds().includes(announcement.id);

  const handleClose = () => {
    if (announcement?.id) {
      dismissId(announcement.id);
      triggerDismissUpdate();
    }
  };

  if (!announcement?.id || isDismissed) {
    return null;
  }

  return (
    <div
      className="w-full py-2 px-4 text-center text-white text-sm relative"
      style={{
        background: 'linear-gradient(135deg, #1890ff, #722ed1)',
      }}
    >
      <NotificationOutlined className="mr-2" />
      <span>{announcement.title}</span>
      <button
        onClick={handleClose}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 text-white cursor-pointer opacity-80 hover:opacity-100 p-1"
        aria-label="Close"
      >
        <CloseOutlined />
      </button>
    </div>
  );
}
