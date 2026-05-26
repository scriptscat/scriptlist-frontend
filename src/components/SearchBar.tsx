'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from 'antd';
import type { InputRef } from 'antd';
import {
  SearchOutlined,
  ArrowRightOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface SearchBarProps {
  initialKeyword?: string;
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
    const trimmed = value.trim();
    router.push(
      trimmed ? `/search?keyword=${encodeURIComponent(trimmed)}` : '/search',
    );
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
    <div className="w-full max-w-2xl mx-auto">
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
          className="flex-1 !text-base !bg-transparent !px-0 !shadow-none"
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
        <button
          type="button"
          onClick={handleSearch}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
          style={{ background: 'rgb(var(--primary-500))' }}
          aria-label="Search"
        >
          <ArrowRightOutlined className="text-base" />
        </button>
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
