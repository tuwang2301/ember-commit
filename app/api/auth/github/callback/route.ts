import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db';
import { getAppUrl } from '@/lib/auth/config';
import {
  exchangeOAuthCode,
  fetchGitHubUserProfile,
  getAppInstallUrl,
} from '@/lib/auth/github-app';
import { consumeOAuthState, createSession, setOAuthState } from '@/lib/auth/session';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const appUrl = getAppUrl();

  if (error) {
    return NextResponse.redirect(`${appUrl}/?auth_error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/?auth_error=missing_code`);
  }

  const stateValid = await consumeOAuthState(state);
  if (!stateValid) {
    return NextResponse.redirect(`${appUrl}/?auth_error=invalid_state`);
  }

  try {
    const accessToken = await exchangeOAuthCode(code);
    const profile = await fetchGitHubUserProfile(accessToken);

    const user = await prisma.user.upsert({
      where: { githubId: String(profile.id) },
      create: {
        githubId: String(profile.id),
        username: profile.login,
        avatarUrl: profile.avatar_url,
        githubAccessToken: accessToken,
      },
      update: {
        username: profile.login,
        avatarUrl: profile.avatar_url,
        githubAccessToken: accessToken,
      },
    });

    await createSession(user.id);

    if (!user.githubInstallationId) {
      const installState = randomBytes(24).toString('hex');
      await setOAuthState(installState);
      const installUrl = getAppInstallUrl(installState);
      return NextResponse.redirect(installUrl);
    }

    return NextResponse.redirect(`${appUrl}/`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'oauth_failed';
    console.error('[GitHub OAuth Callback Error]:', err);
    return NextResponse.redirect(`${appUrl}/?auth_error=${encodeURIComponent(message)}`);
  }
}
