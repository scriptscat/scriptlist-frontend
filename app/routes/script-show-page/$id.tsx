import type { LoaderFunction } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { i18nRedirect } from '~/utils/i18n';

export const loader: LoaderFunction = i18nRedirect;

export default function Index() {
  return <Outlet />;
}
