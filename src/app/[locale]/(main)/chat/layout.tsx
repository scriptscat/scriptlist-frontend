import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageIntlProvider } from '@/components/PageIntlProvider';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('chat.metadata');

  return {
    title: t('title') + ' | ScriptCat',
    description: t('description'),
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageIntlProvider namespaces={['chat']}>{children}</PageIntlProvider>;
}
