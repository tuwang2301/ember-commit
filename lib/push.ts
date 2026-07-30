import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@githubstreak.local';

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (err) {
    console.error('[WebPush VAPID Config Error]:', err);
  }
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  badge?: string;
  icon?: string;
  urgency?: 'high' | 'normal' | 'low';
}

export async function sendWebPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: PushNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return { success: false, error: 'VAPID keys not configured in environment.' };
  }

  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/badge-72x72.png',
    url: payload.url || '/?action=open-log-modal',
    tag: payload.tag || 'github-streak-reminder',
    timestamp: Date.now(),
  });

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      pushPayload,
      {
        TTL: 60 * 60 * 2, // 2 hours
        urgency: payload.urgency || 'high',
      }
    );
    return { success: true };
  } catch (error: any) {
    console.error('[WebPush Dispatch Failed]:', error);
    return { success: false, error: error?.message || 'Push dispatch failed' };
  }
}
