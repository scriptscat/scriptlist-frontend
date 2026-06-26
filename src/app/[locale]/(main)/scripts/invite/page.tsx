import { PageIntlProvider } from '@/components/PageIntlProvider';
import InviteConfirm from './components/InviteConfirmClient';
export { noindexMetadata as metadata } from '@/lib/seo/robots';

export default function InvitePage() {
  return (
    <PageIntlProvider namespaces={['script']}>
      <InviteConfirm />
    </PageIntlProvider>
  );
}
