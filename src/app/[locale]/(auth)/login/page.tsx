import { oidcService } from '@/lib/api/services/oidc';
import LoginClient from './components/LoginClient';

export default async function LoginPage() {
  let oidcProviders;
  try {
    const resp = await oidcService.getProviders();
    oidcProviders = resp.providers || [];
  } catch {
    oidcProviders = [];
  }

  return <LoginClient oidcProviders={oidcProviders} />;
}
