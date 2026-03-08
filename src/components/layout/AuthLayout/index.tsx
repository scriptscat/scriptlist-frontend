'use client';

import { Dropdown } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { languageMap, Link, usePathname } from '@/i18n/routing';
import { ThemeToggle } from '@/components/layout/MainLayout/ThemeToggle';
import Image from 'next/image';
import { useCallback, useMemo } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const switchLocale = useCallback(
    (newLocale: string) => {
      window.location.assign(`/${newLocale}${pathname}`);
    },
    [pathname],
  );

  const languageMenuProps = useMemo(
    () => ({
      items: Object.keys(languageMap).map((key) => ({
        key: key,
        label: `${languageMap[key].label} (${key})`,
        onClick: () => switchLocale(key),
      })),
      forceSubMenuRender: true,
    }),
    [switchLocale],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[rgb(var(--bg-primary))]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--text-primary)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--text-primary)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            style={{ textDecoration: 'none' }}
            className="flex items-center space-x-2.5 group"
          >
            <Image
              height={28}
              width={28}
              src="/assets/logo.png"
              alt="logo"
              className="transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-lg font-bold text-[#1296DB]">
              {'ScriptCat'}
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Dropdown
              menu={languageMenuProps}
              trigger={['click']}
              placement="bottomLeft"
            >
              <button className="flex items-center justify-center w-8 h-8 rounded-lg text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] transition-all duration-200 cursor-pointer border-0 bg-transparent">
                <GlobalOutlined />
              </button>
            </Dropdown>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-8 pt-4 min-h-[calc(100vh-80px)]">
        {children}
      </main>

      <style jsx>{`
        .auth-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          animation: auth-float 20s ease-in-out infinite;
        }
        :global([data-theme='dark']) .auth-blob {
          opacity: 0.08;
        }
        .auth-blob-1 {
          width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #1296db, #6366f1);
          top: -200px;
          right: -100px;
          animation-delay: 0s;
        }
        .auth-blob-2 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          bottom: -150px;
          left: -100px;
          animation-delay: -7s;
        }
        .auth-blob-3 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #06b6d4, #1296db);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -14s;
        }
        @keyframes auth-float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -30px) scale(1.05);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.95);
          }
          75% {
            transform: translate(20px, 10px) scale(1.02);
          }
        }
        .auth-blob-3 {
          animation-name: auth-float-center;
        }
        @keyframes auth-float-center {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
          25% {
            transform: translate(-50%, -50%) translate(30px, -30px) scale(1.05);
          }
          50% {
            transform: translate(-50%, -50%) translate(-20px, 20px) scale(0.95);
          }
          75% {
            transform: translate(-50%, -50%) translate(20px, 10px) scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}
