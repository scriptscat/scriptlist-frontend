'use client';

import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import { usePathname } from 'next/navigation';
import Prism from 'prismjs';
import xss, { whiteList } from 'xss';
import { useTheme } from '@/contexts/ThemeClientContext';
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

const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  const pathname = usePathname();
  const currentBaseUrl = pathname;
  const { themeMode } = useTheme();

  const html = marked(content, {
    gfm: true,
    renderer: createRenderer(currentBaseUrl),
    breaks: true,
  });

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 只在内容变化时进行高亮，主题变化时会在主题加载完成后自动高亮
    if (ref.current && html) {
      Prism.highlightAllUnder(ref.current, false);
    }
  }, [html, themeMode]);

  const l = whiteList;
  l.input = ['type', 'checked', 'disabled'];
  l.code = ['class'];
  l.h1 = ['id'];
  l.h2 = ['id'];
  l.h3 = ['id'];
  l.h4 = ['id'];
  l.h5 = ['id'];
  l.h6 = ['id'];
  return (
    <div
      className="markdown-body"
      data-prismjs-copy="copy"
      data-prismjs-copy-error="error"
      data-prismjs-copy-success="success"
      dangerouslySetInnerHTML={{
        __html: xss(html as string, {
          whiteList: l,
        }),
      }}
      ref={ref}
    ></div>
  );
};

export default MarkdownView;
