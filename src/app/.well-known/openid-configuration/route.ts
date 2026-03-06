import { NextResponse } from 'next/server';

const issuer = process.env.NEXT_PUBLIC_APP_URL || '';

export function GET() {
  return NextResponse.json({
    issuer,
    authorization_endpoint: `${issuer}/api/v2/oauth/authorize`,
    token_endpoint: `${issuer}/api/v2/oauth/token`,
    userinfo_endpoint: `${issuer}/api/v2/oauth/userinfo`,
    jwks_uri: `${issuer}/api/v2/oauth/jwks`,
    scopes_supported: ['openid', 'profile', 'email'],
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
  });
}
