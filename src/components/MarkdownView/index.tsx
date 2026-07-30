'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Prism from 'prismjs';
import 'prismjs/plugins/toolbar/prism-toolbar.min.css';
import 'prismjs/plugins/toolbar/prism-toolbar.min';
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min';
import './markdown.css';
import './github-markdown-css.css';
import './prism.css';
import { parseMarkdown } from './parseMarkdown';

interface MarkdownViewProps {
  id?: string;
  content: string;
  /** 内容同步自远端 README 时，其中相对路径的解析基准：文档所在目录。 */
  resourceBaseUrl?: string;
  /** 同上，仓库 + ref 根，用于解析 `/x` 这类根相对路径。 */
  resourceRootUrl?: string;
}

const MarkdownView: React.FC<MarkdownViewProps> = React.memo(
  ({ content, resourceBaseUrl, resourceRootUrl }) => {
    const pathname = usePathname();
    const currentBaseUrl = pathname;

    // 使用 useMemo 来确保服务器端和客户端渲染一致的内容
    const html = React.useMemo(() => {
      return parseMarkdown(
        content,
        currentBaseUrl,
        resourceBaseUrl
          ? { base: resourceBaseUrl, root: resourceRootUrl }
          : undefined,
      );
    }, [content, currentBaseUrl, resourceBaseUrl, resourceRootUrl]);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // 在客户端挂载后且内容变化时进行高亮
      if (ref.current && html) {
        requestAnimationFrame(() => {
          if (ref.current) {
            Prism.highlightAllUnder(ref.current, false);
          }
        });
      }
    }, [html]);

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
  },
);

MarkdownView.displayName = 'MarkdownView';

export default MarkdownView;
