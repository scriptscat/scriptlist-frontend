import { getLocale } from 'next-intl/server';
import { PageIntlProvider } from '@/components/PageIntlProvider';
import { prefetchAd } from '@/lib/api/services/advertise';
import HomeClient from './components/HomeClient';

export default async function HomePage() {
  const locale = await getLocale();
  const bannerAd = await prefetchAd('home-banner', locale);

  return (
    <PageIntlProvider namespaces={['home', 'script', 'ads']}>
      <HomeClient bannerAd={bannerAd} />
    </PageIntlProvider>
  );
}
