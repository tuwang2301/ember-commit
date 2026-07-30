import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchGitHubContributionCalendar } from '@/lib/github';
import { calculateStreakStatus, enrichContributionsWithLevels } from '@/lib/streak';
import {
  getAuthenticatedUser,
  sanitizeUser,
  unauthorizedResponse,
  needsInstallResponse,
} from '@/lib/auth/get-user';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();
    if (!user.githubInstallationId) return needsInstallResponse(user);

    const dbLogs = await prisma.dailyLog.findMany({
      where: { userId: user.id },
      orderBy: { logDate: 'desc' },
    });

    const githubContributions = await fetchGitHubContributionCalendar(
      user.username,
      user.githubAccessToken
    );

    const mergedContributions = githubContributions.map((item) => {
      const hasLog = dbLogs.some(
        (l) => l.logDate === item.date && l.commitStatus === 'success'
      );
      return {
        ...item,
        count: hasLog ? Math.max(item.count, 1) : item.count,
        hasAppLog: hasLog,
      };
    });

    const enrichedContributions = enrichContributionsWithLevels(mergedContributions);

    const streakInfo = calculateStreakStatus(
      enrichedContributions,
      user.timezone,
      user.firstReminderHour,
      user.lastReminderHour
    );

    const daysProtected = dbLogs.filter((l) => l.commitStatus === 'success').length;

    return NextResponse.json({
      authenticated: true,
      needsInstall: false,
      user: sanitizeUser(user),
      metrics: {
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
        totalLogs: dbLogs.length,
        daysProtected,
        status: streakInfo.status,
        hasContributedToday: streakInfo.hasContributedToday,
        todayDateStr: streakInfo.todayDateStr,
        hoursRemainingToday: streakInfo.hoursRemainingToday,
      },
      contributions: enrichedContributions,
      recentLogs: dbLogs.slice(0, 10),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    console.error('[User API Error]:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        timezone: body.timezone ?? user.timezone,
        firstReminderHour: body.firstReminderHour ?? user.firstReminderHour,
        lastReminderHour: body.lastReminderHour ?? user.lastReminderHour,
        repoName: body.repoName ?? user.repoName,
        privateContributionsEnabled:
          body.privateContributionsEnabled ?? user.privateContributionsEnabled,
      },
    });

    return NextResponse.json({ user: sanitizeUser(updatedUser) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user settings';
    console.error('[User Update Error]:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
