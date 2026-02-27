'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Prism from 'prismjs';
import 'prismjs/plugins/toolbar/prism-toolbar.min.css';
import 'prismjs/plugins/toolbar/prism-toolbar.min';
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min';
import { parseMarkdown } from './parseMarkdown';
import './markdown.css';
import './github-markdown-css.css';
import './prism.css';

interface MarkdownViewProps {
  id?: string;
  content: string;
}

const MarkdownView: React.FC<MarkdownViewProps> = React.memo(({ content }) => {
  const pathname = usePathname();
  const currentBaseUrl = pathname;
  const [isClient, setIsClient] = useState(false);

  const html = React.useMemo(() => {
    return parseMarkdown(content, currentBaseUrl);
  }, [content, currentBaseUrl]);

  const ref = useRef<HTMLDivElement>(null);

  // 确保组件已经在客户端挂载
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // 只在客户端挂载后且内容变化时进行高亮
    if (isClient && ref.current && html) {
      // 使用 requestAnimationFrame 确保 DOM 更新完成
      requestAnimationFrame(() => {
        if (ref.current) {
          Prism.highlightAllUnder(ref.current, false);
        }
      });
    }
  }, [isClient, html]);

  // 使用 useMemo 缓存渲染的 div 元素
  const memoizedDiv = React.useMemo(
    () => (
      <div
        key="markdown-container"
        className="markdown-body"
        data-prismjs-copy="copy"
        data-prismjs-copy-error="error"
        data-prismjs-copy-success="success"
        dangerouslySetInnerHTML={{
          __html: html,
        }}
        ref={ref}
        suppressHydrationWarning={true}
      ></div>
    ),
    [html],
  ); // 只有当 html 内容真正改变时才重新渲染

  return memoizedDiv;
});

MarkdownView.displayName = 'MarkdownView';

export default MarkdownView;
