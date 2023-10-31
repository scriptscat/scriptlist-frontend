import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import { useLocation } from '@remix-run/react';
import githubCss from '~/styles/github-markdown-css.css';
import Prism from 'prismjs';
import prismCss from 'prismjs/themes/prism.min.css'
import xss, { whiteList } from 'xss';
import { LinksFunction } from '@remix-run/node';

// toolbar
import prismToolbarCss from 'prismjs/plugins/toolbar/prism-toolbar.min.css';
import 'prismjs/plugins/toolbar/prism-toolbar.min';

// plugin
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min';

export const markdownViewLinks: LinksFunction = () => [
  { rel: 'stylesheet', href: githubCss },
  { rel: 'stylesheet', href: prismCss },
  { rel: 'stylesheet', href: prismToolbarCss },
];

class MarkdownRenderer extends marked.Renderer {
  link(href: string, title: string, text: string) {
    const baseUrl = this.options.baseUrl || '';
    if (!(href.startsWith('http://') || href.startsWith('https://'))) {
      if (href.startsWith('.')) {
        href = baseUrl + href.substring(1);
      } else if (
        href.startsWith('/') ||
        href.startsWith('#') ||
        href.startsWith('?')
      ) {
        href = baseUrl + href;
      } else {
        href = baseUrl + '/' + href;
      }
    }
    return (
      '<a href="' +
      href +
      '"' +
      (title ? ' title="' + title + '"' : '') +
      '>' +
      text +
      '</a>'
    );
  }

  html(html: string): string {
    // 判断是否为html标签，并加上controls="controls"属性
    if (html.startsWith('<video') && !html.includes('controls="controls"')) {
      html = html.replace('<video', '<video controls="controls"');
    }
    return html;
  }
}

const MarkdownView: React.FC<{ id: string; content: string }> = ({
  id,
  content,
}) => {
  const location = useLocation();
  const html = marked(content, {
    baseUrl: location.pathname,
    mangle: true,
    gfm: true,
    renderer: new MarkdownRenderer(),
    breaks: true,
  });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current && Prism.highlightAllUnder(ref.current, true);
  }, []);
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
      className="viewer markdown-body"
      data-prismjs-copy="copy"
      data-prismjs-copy-error="error"
      data-prismjs-copy-success="success"
      dangerouslySetInnerHTML={{
        __html: xss(html, {
          whiteList: l,
        }),
      }}
      ref={ref}
    ></div>
  );
};

export default MarkdownView;
