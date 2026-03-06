import React from 'react';
import ScriptCreateWrapper from '@/components/ScriptEditor/ScriptCreateWrapper';
import { PageIntlProvider } from '@/components/PageIntlProvider';

export default function ScriptCreatePage() {
  return (
    <PageIntlProvider namespaces={['script']}>
      <ScriptCreateWrapper />
    </PageIntlProvider>
  );
}
