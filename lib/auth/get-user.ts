import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUserId } from './session';
import type { User } from '@prisma/client';

export async function getAuthenticatedUser(): Promise<User | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export function unauthorizedResponse() {
  return NextResponse.json({ authenticated: false, error: 'Unauthorized' }, { status: 401 });
}

export function needsInstallResponse(user: User) {
  return NextResponse.json(
    {
      authenticated: true,
      needsInstall: true,
      user: sanitizeUser(user),
    },
    { status: 200 }
  );
}

export function sanitizeUser(user: User) {
  return {
    id: user.id,
    githubId: user.githubId,
    username: user.username,
    avatarUrl: user.avatarUrl,
    githubInstallationId: user.githubInstallationId,
    repoOwner: user.repoOwner,
    repoName: user.repoName,
    timezone: user.timezone,
    firstReminderHour: user.firstReminderHour,
    lastReminderHour: user.lastReminderHour,
    privateContributionsEnabled: user.privateContributionsEnabled,
    createdAt: user.createdAt,
  };
}
