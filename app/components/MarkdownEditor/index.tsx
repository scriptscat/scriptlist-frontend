import tuiEditor from '@toast-ui/editor/dist/toastui-editor.css';
import tuiEditorDark from '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import prismCss from 'prismjs/themes/prism.css';
import { LinksFunction } from '@remix-run/node';

export const markdownEditorLinks: LinksFunction = () => [
  { rel: 'stylesheet', href: tuiEditor },
  { rel: 'stylesheet', href: tuiEditorDark },
  { rel: 'stylesheet', href: prismCss },
];
