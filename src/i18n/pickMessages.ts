import type { AbstractIntlMessages } from 'next-intl';

export function pickMessages(
  messages: AbstractIntlMessages,
  namespaces: string[],
): AbstractIntlMessages {
  const picked: AbstractIntlMessages = {};
  for (const ns of namespaces) {
    if (ns in messages) {
      picked[ns] = messages[ns];
    }
  }
  return picked;
}
