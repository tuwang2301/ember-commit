import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { toZonedTime, format as formatZoned } from 'date-fns-tz';
import { fetchGitHubContributionCalendar } from '@/lib/github';
import { sendWebPushNotification } from '@/lib/push';

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}

async function handleCron(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const users = await prisma.user.findMany({
      include: { pushSubscriptions: true },
    });

    let checkedCount = 0;
    let pushSentCount = 0;
    const logDetails: any[] = [];

    for (const user of users) {
      if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) continue;

      const userTz = user.timezone || 'Asia/Ho_Chi_Minh';
      const zonedNow = toZonedTime(new Date(), userTz);
      const currentHour = zonedNow.getHours();
      const todayDateStr = formatZoned(zonedNow, 'yyyy-MM-dd', { timeZone: userTz });

      const isFirstReminder = currentHour === user.firstReminderHour;
      const isLastReminder = currentHour === user.lastReminderHour;

      if (!isFirstReminder && !isLastReminder) {
        continue;
      }

      checkedCount++;

      // Check today's contributions
      const githubContributions = await fetchGitHubContributionCalendar(
        user.username,
        user.githubAccessToken
      );
      const dbLogs = await prisma.dailyLog.findMany({ where: { userId: user.id } });

      const todayContrib = githubContributions.find((c) => c.date === todayDateStr);
      const todayHasDbLog = dbLogs.some((l) => l.logDate === todayDateStr && l.commitStatus === 'success');
      const hasContributedToday = (todayContrib?.count || 0) > 0 || todayHasDbLog;

      if (hasContributedToday) {
        logDetails.push({ username: user.username, status: 'SAFE', action: 'Skipped - already contributed' });
        continue;
      }

      let notificationTitle = 'Streak check-in';
      let notificationBody = `No contributions yet for ${todayDateStr}. Tap to write a short log.`;
      let urgency: 'high' | 'normal' = 'normal';

      if (isLastReminder) {
        notificationTitle = 'Streak at risk';
        notificationBody = `Only a few hours left today. Write your log now to keep the streak alive.`;
        urgency = 'high';
      }

      // Dispatch Web Push to all active subscriptions of user
      for (const sub of user.pushSubscriptions) {
        const res = await sendWebPushNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dhKey, auth: sub.authKey },
          },
          {
            title: notificationTitle,
            body: notificationBody,
            url: '/?action=open-log-modal',
            urgency,
          }
        );
        if (res.success) pushSentCount++;
      }

      logDetails.push({
        username: user.username,
        hour: currentHour,
        type: isLastReminder ? 'CRITICAL' : 'AT_RISK',
        pushesSent: user.pushSubscriptions.length,
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      checkedUsersCount: checkedCount,
      pushSentCount,
      logDetails,
    });
  } catch (error: any) {
    console.error('[Cron Worker Error]:', error);
    return NextResponse.json({ error: error?.message || 'Cron execution failed' }, { status: 500 });
  }
}
