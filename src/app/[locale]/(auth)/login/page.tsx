import { oidcService } from '@/lib/api/services/oidc';
import LoginClient from './components/LoginClient';

export default async function LoginPage() {
  let oidcProviders: Awaited<
    ReturnType<typeof oidcService.getProviders>
  >['providers'] = [];
  try {
    const resp = await oidcService.getProviders();
    oidcProviders = resp.providers || [];
  } catch {
    oidcProviders = [];
  }

  return <LoginClient oidcProviders={oidcProviders} />;
}
