import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getAppInstallUrl } from '@/lib/auth/github-app';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth/get-user';
import { setOAuthState } from '@/lib/auth/session';
import { isGitHubAppConfigured } from '@/lib/auth/config';

export async function GET() {
  if (!isGitHubAppConfigured()) {
    return NextResponse.json({ error: 'GitHub App is not configured' }, { status: 503 });
  }

  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  const state = randomBytes(24).toString('hex');
  await setOAuthState(state);

  const url = getAppInstallUrl(state);
  return NextResponse.redirect(url);
}
