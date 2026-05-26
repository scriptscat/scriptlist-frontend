import { PageIntlProvider } from '@/components/PageIntlProvider';
import HomeClient from './components/HomeClient';

export default function HomePage() {
  return (
    <PageIntlProvider namespaces={['home', 'script']}>
      <HomeClient />
    </PageIntlProvider>
  );
}
