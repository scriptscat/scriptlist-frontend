import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const appRoot = path.resolve(__dirname, '../../src/app/[locale]');

const segmentFixtures: Record<string, string> = {
  '[id]': '1',
  '[issueId]': '1',
  '[reportId]': '1',
  '[pairId]': '1',
};

const routeQueries: Record<string, string> = {
  '/auth/oidc/bindconfirm': '?bind_token=e2e-bind-token',
  '/reset-password': '?token=e2e-reset-token',
  '/oauth/authorize':
    '?client_id=e2e-client&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&response_type=code&scope=read',
  '/script-show-page/1/diff': '?version1=1.0.0&version2=1.0.1',
  '/script/invite': '?code=e2e-invite',
  '/scripts/invite': '?code=e2e-invite',
};

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    if (statSync(fullPath).isDirectory()) return walk(fullPath);
    return entry === 'page.tsx' ? [fullPath] : [];
  });
}

function toRoute(filePath: string) {
  const relative = path.relative(appRoot, filePath);
  const segments = relative
    .split(path.sep)
    .filter((segment) => segment !== 'page.tsx')
    .filter((segment) => !segment.startsWith('('))
    .map((segment) => segmentFixtures[segment] || segment);

  const route = `/${segments.join('/')}`.replace(/\/$/, '') || '/';
  return `${route}${routeQueries[route] || ''}`;
}

export const pageRoutes = walk(appRoot).map(toRoute).sort();
