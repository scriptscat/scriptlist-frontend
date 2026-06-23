import EvidencePageClient from './components/EvidencePageClient';
import { PageIntlProvider } from '@/components/PageIntlProvider';

export default async function EvidencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PageIntlProvider namespaces={['similarity', 'admin']}>
      <EvidencePageClient pairID={Number(id)} />
    </PageIntlProvider>
  );
}
