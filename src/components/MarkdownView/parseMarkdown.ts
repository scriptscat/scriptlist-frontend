import { marked } from 'marked';
import xss, { whiteList } from 'xss';

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

    return (
      '<a href="' +
      url +
      '"' +
      (title ? ' title="' + title + '"' : '') +
      ' target="_blank">' +
      renderer.parser.parseInline(tokens) +
      '</a>'
    );
  };

  // Override HTML rendering
  renderer.html = ({ text }) => {
    let html = text || '';
    if (html.startsWith('<video') && !html.includes('controls="controls"')) {
      html = html.replace('<video', '<video controls="controls"');
    }
    return html;
  };

  return renderer;
};

// XSS whitelist
const xssWhiteList = { ...whiteList };
xssWhiteList.input = ['type', 'checked', 'disabled'];
xssWhiteList.code = ['class'];
xssWhiteList.h1 = ['id'];
xssWhiteList.h2 = ['id'];
xssWhiteList.h3 = ['id'];
xssWhiteList.h4 = ['id'];
xssWhiteList.h5 = ['id'];
xssWhiteList.h6 = ['id'];
xssWhiteList.video = [
  'src',
  'controls',
  'width',
  'height',
  'preload',
  'poster',
];
xssWhiteList.source = ['src', 'type'];

/**
 * Parse markdown to sanitized HTML.
 *
 * @param content  Raw markdown string
 * @param baseUrl  Base URL for resolving relative links (optional)
 * @returns        Sanitized HTML string
 */
export function parseMarkdown(content: string, baseUrl = ''): string {
  return xss(
    marked(content, {
      gfm: true,
      renderer: createRenderer(baseUrl),
      breaks: true,
    }) as string,
    { whiteList: xssWhiteList },
  );
}
