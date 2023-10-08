import { LoaderFunction } from '@remix-run/node';
import { i18nRedirect } from '~/utils/i18n';

// 脚本列表使用嵌套路由实现
export const loader: LoaderFunction = i18nRedirect;

export default function Index() {
  return <div>Redirect</div>;
}
