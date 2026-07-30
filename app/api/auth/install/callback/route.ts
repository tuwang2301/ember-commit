import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAppUrl } from '@/lib/auth/config';
import { listInstallationRepositories } from '@/lib/auth/github-app';
import { consumeOAuthState, getSessionUserId } from '@/lib/auth/session';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action');
  const state = searchParams.get('state');
  const appUrl = getAppUrl();

  if (setupAction === 'request') {
    return NextResponse.redirect(`${appUrl}/?auth_error=install_request_pending`);
  }

  if (!installationId) {
    return NextResponse.redirect(`${appUrl}/?auth_error=missing_installation`);
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.redirect(`${appUrl}/?auth_error=session_expired`);
  }

  if (state) {
    const stateValid = await consumeOAuthState(state);
    if (!stateValid) {
      return NextResponse.redirect(`${appUrl}/?auth_error=invalid_state`);
    }
  }

  try {
    // 1. Always update installation ID first
    let targetRepoName = 'daily-log';
    let targetRepoOwner: string | undefined = undefined;

    try {
      const repos = await listInstallationRepositories(installationId);
      const targetRepo = repos.find((r) => r.name === 'daily-log') || repos[0];
      if (targetRepo) {
        targetRepoName = targetRepo.name;
        targetRepoOwner = targetRepo.owner.login;
      }
    } catch (repoErr) {
      console.warn('[Install Callback Repo Fetch Warning]:', repoErr);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        githubInstallationId: installationId,
        ...(targetRepoOwner ? { repoOwner: targetRepoOwner } : {}),
        repoName: targetRepoName,
      },
    });

    return NextResponse.redirect(`${appUrl}/?onboarding=1`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'install_failed';
    console.error('[Install Callback Error]:', err);
    return NextResponse.redirect(`${appUrl}/?auth_error=${encodeURIComponent(message)}`);
  }
}
