import EvidencePageClient from './components/EvidencePageClient';

export default async function EvidencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EvidencePageClient pairID={Number(id)} />;
}
