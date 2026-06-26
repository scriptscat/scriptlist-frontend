import React from 'react';
import ScriptCreateWrapper from '@/components/ScriptEditor/ScriptCreateWrapper';
import { PageIntlProvider } from '@/components/PageIntlProvider';
export { noindexMetadata as metadata } from '@/lib/seo/robots';

export default function ScriptCreatePage() {
  return (
    <PageIntlProvider namespaces={['script']}>
      <ScriptCreateWrapper />
    </PageIntlProvider>
  );
}
