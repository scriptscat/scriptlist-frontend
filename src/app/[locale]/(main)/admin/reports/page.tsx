import ReportsClient from './components/ReportsClient';

interface ReportsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const { tab } = await searchParams;
  return <ReportsClient initialTab={tab} />;
}
