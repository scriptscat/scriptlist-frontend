'use client';

import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import { usePathname } from 'next/navigation';
import Prism from 'prismjs';
import xss, { whiteList } from 'xss';
import 'prismjs/plugins/toolbar/prism-toolbar.min.css';
import 'prismjs/plugins/toolbar/prism-toolbar.min';
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min';
import './markdown.css';
import './github-markdown-css.css';
import './prism.css';

interface MarkdownViewProps {
  id?: string;
  content: string;
}

// Custom renderer configuration
const createRenderer = (baseUrl = '') => {
  const renderer = new marked.Renderer();

  // Override link rendering
  renderer.link = ({ href, title, tokens }) => {
    let url = href || '';

    if (!(url.startsWith('http://') || url.startsWith('https://'))) {
      if (url.startsWith('.')) {
        url = baseUrl + url.substring(1);
      } else if (
        url.startsWith('/') ||
        url.startsWith('#') ||
        url.startsWith('?')
      ) {
        url = baseUrl + url;
      } else {
        url = baseUrl + '/' + url;
      }
    }

    const text = tokens?.[0]?.raw || '';
    return (
      '<a href="' +
      url +
      '"' +
      (title ? ' title="' + title + '"' : '') +
      ' target="_blank">' +
      text +
      '</a>'
    );
  };

  // Override HTML rendering
  renderer.html = ({ text }) => {
    let html = text || '';
    // 判断是否为video标签，并加上controls="controls"属性
    if (html.startsWith('<video') && !html.includes('controls="controls"')) {
      html = html.replace('<video', '<video controls="controls"');
    }
    return html;
  };

  return renderer;
};

const MarkdownView: React.FC<MarkdownViewProps> = React.memo(({ content }) => {
  const pathname = usePathname();
  const currentBaseUrl = pathname;
  const [isClient, setIsClient] = useState(false);

  const l = whiteList;
  l.input = ['type', 'checked', 'disabled'];
  l.code = ['class'];
  l.h1 = ['id'];
  l.h2 = ['id'];
  l.h3 = ['id'];
  l.h4 = ['id'];
  l.h5 = ['id'];
  l.h6 = ['id'];

  // 使用 useMemo 来确保服务器端和客户端渲染一致的内容
  const html = React.useMemo(() => {
    return xss(
      marked(content, {
        gfm: true,
        renderer: createRenderer(currentBaseUrl),
        breaks: true,
      }) as string,
      { whiteList: l },
    );
  }, [content, currentBaseUrl, l]);

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
