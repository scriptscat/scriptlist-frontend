import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { pickMessages } from '@/i18n/pickMessages';

export async function PageIntlProvider({
  namespaces,
  children,
}: {
  namespaces: string[];
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={pickMessages(messages, namespaces)}>
      {children}
    </NextIntlClientProvider>
  );
}
