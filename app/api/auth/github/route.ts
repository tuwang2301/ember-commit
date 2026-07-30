import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getOAuthAuthorizeUrl } from '@/lib/auth/github-app';
import { setOAuthState } from '@/lib/auth/session';
import { isGitHubAppConfigured } from '@/lib/auth/config';

export async function GET() {
  if (!isGitHubAppConfigured()) {
    return NextResponse.json(
      { error: 'GitHub App is not configured. Set GITHUB_APP_* env vars.' },
      { status: 503 }
    );
  }

  const state = randomBytes(24).toString('hex');
  await setOAuthState(state);

  const url = getOAuthAuthorizeUrl(state);
  return NextResponse.redirect(url);
}
