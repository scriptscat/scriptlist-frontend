import { LoaderFunction } from '@remix-run/node';
import { i18nRedirect } from '~/utils/i18n';

export const loader: LoaderFunction = i18nRedirect;

export default function Webhook() {
  return <div>Redirect</div>;
}
