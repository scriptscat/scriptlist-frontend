import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { pickMessages } from '@/i18n/pickMessages';

// Base namespaces that are always available from root layout.
// PageIntlProvider creates a nested NextIntlClientProvider which overrides
// (not merges) the parent's messages, so we must always include these.
const BASE_NAMESPACES = ['layout', 'common', 'components', 'error', 'utils'];

export async function PageIntlProvider({
  namespaces,
  children,
}: {
  namespaces: string[];
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const allNamespaces = [...new Set([...BASE_NAMESPACES, ...namespaces])];
  return (
    <NextIntlClientProvider messages={pickMessages(messages, allNamespaces)}>
      {children}
    </NextIntlClientProvider>
  );
}
