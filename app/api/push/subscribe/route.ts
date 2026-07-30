import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth/get-user';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { subscription, userAgent } = await request.json();

    if (!subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json({ error: 'Invalid push subscription payload' }, { status: 400 });
    }

    const { endpoint, keys } = subscription;

    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    let savedSub;
    if (existing) {
      savedSub = await prisma.pushSubscription.update({
        where: { endpoint },
        data: {
          userId: user.id,
          p256dhKey: keys.p256dh,
          authKey: keys.auth,
          userAgent,
        },
      });
    } else {
      savedSub = await prisma.pushSubscription.create({
        data: {
          userId: user.id,
          endpoint,
          p256dhKey: keys.p256dh,
          authKey: keys.auth,
          userAgent,
        },
      });
    }

    return NextResponse.json({ success: true, subscriptionId: savedSub.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save push subscription';
    console.error('[Push Subscribe API Error]:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
