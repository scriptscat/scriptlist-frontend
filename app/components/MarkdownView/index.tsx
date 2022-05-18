import React, { FC } from 'react';
import 'github-markdown-css/github-markdown-light.css';
import { marked } from 'marked';
import { useLocation } from '@remix-run/react';

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
  });
  return (
    <div
      className="viewer markdown-body"
      dangerouslySetInnerHTML={{ __html: html }}
    ></div>
  );
};

export default MarkdownView;
