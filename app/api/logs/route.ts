import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { commitDailyLogToGitHub } from '@/lib/github';
import { buildMarkdownLogTemplate } from '@/lib/streak';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth/get-user';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const logs = await prisma.dailyLog.findMany({
      where: { userId: user.id },
      orderBy: { logDate: 'desc' },
    });

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    if (!user.githubInstallationId || !user.repoOwner) {
      return NextResponse.json(
        { error: 'GitHub App is not installed on a repository yet.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { today, learned, tomorrow, logDate } = body;

    if (!today || !today.trim()) {
      return NextResponse.json({ error: '"Today" field is required.' }, { status: 400 });
    }

    const targetDate = logDate || new Date().toISOString().split('T')[0];
    const markdownContent = buildMarkdownLogTemplate(
      targetDate,
      today,
      learned || '',
      tomorrow || ''
    );
    const filePath = `logs/${targetDate}.md`;
    const commitMessage = `docs(log): record daily log for ${targetDate} [via EmberCommit]`;

    const existingLog = await prisma.dailyLog.findUnique({
      where: {
        userId_logDate: {
          userId: user.id,
          logDate: targetDate,
        },
      },
    });

    let logEntry;
    if (existingLog) {
      logEntry = await prisma.dailyLog.update({
        where: { id: existingLog.id },
        data: {
          content: markdownContent,
          todayContent: today,
          learnedContent: learned || '',
          tomorrowContent: tomorrow || '',
          commitStatus: 'pending',
        },
      });
    } else {
      logEntry = await prisma.dailyLog.create({
        data: {
          userId: user.id,
          logDate: targetDate,
          content: markdownContent,
          todayContent: today,
          learnedContent: learned || '',
          tomorrowContent: tomorrow || '',
          commitStatus: 'pending',
        },
      });
    }

    let commitResult;
    try {
      commitResult = await commitDailyLogToGitHub({
        repoOwner: user.repoOwner,
        repoName: user.repoName || 'daily-log',
        installationId: user.githubInstallationId,
        filePath,
        content: markdownContent,
        message: commitMessage,
      });

      logEntry = await prisma.dailyLog.update({
        where: { id: logEntry.id },
        data: {
          commitSha: commitResult.sha,
          commitStatus: 'success',
        },
      });
    } catch (err) {
      console.error('[Commit Error]:', err);
      logEntry = await prisma.dailyLog.update({
        where: { id: logEntry.id },
        data: { commitStatus: 'failed' },
      });
    }

    return NextResponse.json({
      success: true,
      log: logEntry,
      commitSha: commitResult?.sha,
      commitUrl: commitResult?.url,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit log';
    console.error('[Logs POST Error]:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
