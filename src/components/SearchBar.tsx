'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Input } from 'antd';
import type { InputRef } from 'antd';
import {
  SearchOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { getScriptSearchPath } from '@/lib/utils/search-command';

interface SearchBarProps {
  initialKeyword?: string;
}

interface SearchSubmitButtonProps {
  /** 跳转事务是否还在进行中。 */
  pending: boolean;
  onClick: () => void;
  /** 已翻译好的无障碍名称。 */
  label: string;
}

/**
 * 搜索提交按钮。
 *
 * 单独导出是为了让「等待中长什么样」可以被单测直接钉住：提交走的是
 * `router.push`（编程式导航），而 `NavigationProgress` 里的 `nextjs-toploader`
 * 只在 document 上监听 `<a>` 点击，编程式跳转不会有任何全局进度条。
 * 没有这里的转圈 + 禁用，用户在慢网络下只会反复回车。
 */
export function SearchSubmitButton({
  pending,
  onClick,
  label,
}: SearchSubmitButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
      aria-label={label}
      className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-transform hover:scale-105 active:scale-95 disabled:cursor-wait disabled:hover:scale-100"
      style={{ background: 'rgb(var(--primary-500))' }}
    >
      {pending ? (
        <LoadingOutlined className="text-base" />
      ) : (
        <ArrowRightOutlined className="text-base" />
      )}
    </button>
  );
}

interface QuickChip {
  icon: string;
  label: string;
  href: string;
  iconClassName: string;
}

export default function SearchBar({ initialKeyword = '' }: SearchBarProps) {
  const router = useRouter();
  const t = useTranslations('script');
  const [value, setValue] = useState(initialKeyword);
  const [focused, setFocused] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearch = () => {
    if (isPending) return;
    // 包在 transition 里，isPending 会一直保持到新路由渲染完成，
    // 期间按钮转圈且不可再次点击。
    startTransition(() => {
      router.push(getScriptSearchPath(value));
    });
  };

  const chips: QuickChip[] = [
    {
      icon: 'mdi:fire',
      label: t('section.hot.title'),
      href: '/search?sort=today_download',
      iconClassName: 'text-amber-500 dark:text-amber-400',
    },
    {
      icon: 'mdi:new-box',
      label: t('section.new.title'),
      href: '/search?sort=createtime',
      iconClassName: 'text-emerald-500 dark:text-emerald-400',
    },
    {
      icon: 'mdi:library',
      label: t('types.library'),
      href: '/search?script_type=2',
      iconClassName: 'text-blue-500 dark:text-blue-400',
    },
    {
      icon: 'mdi:cog',
      label: t('types.background_script'),
      href: '/search?script_type=3',
      iconClassName: 'text-indigo-500 dark:text-indigo-400',
    },
  ];

  const wrapperClasses = [
    'flex items-center gap-3 h-14 pl-5 pr-2 bg-app-elevated rounded-full transition-all duration-150 border',
    focused
      ? 'border-[rgb(var(--primary-500))] shadow-[0_0_0_4px_rgba(13,110,253,0.12)]'
      : 'border-app-primary hover:border-app-secondary',
  ].join(' ');

  return (
    <div
      className="w-full max-w-2xl mx-auto"
      data-testid="search-bar"
      aria-busy={isPending}
    >
      <div className={wrapperClasses}>
        <SearchOutlined className="text-app-tertiary text-lg flex-shrink-0" />
        <Input
          ref={inputRef}
          variant="borderless"
          size="large"
          placeholder={t('search.placeholder')}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPressEnter={handleSearch}
          className="flex-1 !text-base !bg-transparent !px-0 !shadow-none !outline-none"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              setValue('');
              inputRef.current?.focus();
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-[rgb(var(--bg-primary))] hover:bg-[rgb(var(--bg-tertiary))] text-app-tertiary flex-shrink-0 transition-colors"
            aria-label="Clear"
          >
            <CloseOutlined className="text-xs" />
          </button>
        ) : (
          <kbd
            className="hidden md:inline-flex items-center justify-center px-2 h-6 rounded-md text-[11px] font-semibold tracking-wide text-app-tertiary bg-[rgb(var(--bg-primary))] border border-app-secondary flex-shrink-0 select-none"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
          >
            {'⌘ K'}
          </kbd>
        )}
        <SearchSubmitButton
          pending={isPending}
          onClick={handleSearch}
          label={t('search.button')}
        />
      </div>

      <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
        {chips.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group inline-flex items-center gap-1.5 h-8 pl-2.5 pr-3.5 rounded-full text-xs font-medium border transition-all duration-150 !bg-[rgb(var(--bg-tertiary))] !border-[rgb(var(--border-primary))] !text-[rgb(var(--text-primary))] hover:!bg-[rgb(var(--bg-secondary))] dark:hover:!bg-[#2d333b] hover:!border-[#bac4cf] dark:hover:!border-[#484f58] hover:-translate-y-px hover:shadow-sm"
          >
            <Icon
              icon={c.icon}
              className={`text-base transition-transform duration-150 group-hover:scale-110 ${c.iconClassName}`}
            />
            <span>{c.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
