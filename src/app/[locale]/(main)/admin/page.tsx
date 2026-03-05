import { redirect } from '@/i18n/routing';
import { getLocale } from 'next-intl/server';

export default async function AdminPage() {
  const locale = await getLocale();
  redirect({ href: '/admin/users', locale });
}
