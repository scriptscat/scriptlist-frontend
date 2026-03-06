import { PageIntlProvider } from '@/components/PageIntlProvider';
import InviteConfirm from './components/InviteConfirmClient';

export default function InvitePage() {
  return (
    <PageIntlProvider namespaces={['script']}>
      <InviteConfirm />
    </PageIntlProvider>
  );
}
