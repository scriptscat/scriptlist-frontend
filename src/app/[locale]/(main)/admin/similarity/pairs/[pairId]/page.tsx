import PairDetailClient from '@/components/similarity/PairDetailClient';

export default async function PairDetailPage({
  params,
}: {
  params: Promise<{ pairId: string }>;
}) {
  const { pairId } = await params;
  return <PairDetailClient pairID={Number(pairId)} source="admin" />;
}
