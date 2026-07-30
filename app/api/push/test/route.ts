import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendWebPushNotification } from '@/lib/push';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth/get-user';

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: user.id },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No push subscriptions found. Enable push notifications first.' },
        { status: 404 }
      );
    }

    let successCount = 0;
    const errors: string[] = [];

    for (const sub of subscriptions) {
      const result = await sendWebPushNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dhKey, auth: sub.authKey },
        },
        {
          title: '🔥 Live Push Test: Ember Commit',
          body: 'Push notifications are working. Tap to write a log.',
          url: '/?action=open-log-modal',
          urgency: 'high',
        }
      );

      if (result.success) {
        successCount += 1;
      } else if (result.error) {
        errors.push(result.error);
      }
    }

    return NextResponse.json({
      success: true,
      sentCount: successCount,
      totalSubscriptions: subscriptions.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send test push';
    console.error('[Test Push Error]:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
