'use client';

import React, { useState, useEffect } from 'react';

interface NotificationControlProps {
  timezone: string;
  firstReminderHour: number;
  lastReminderHour: number;
  privateContributionsEnabled: boolean;
  onUpdateSettings: (updated: {
    firstReminderHour?: number;
    lastReminderHour?: number;
    timezone?: string;
    privateContributionsEnabled?: boolean;
  }) => void;
}

export const NotificationControl: React.FC<NotificationControlProps> = ({
  firstReminderHour,
  lastReminderHour,
  privateContributionsEnabled,
  onUpdateSettings,
}) => {
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testStatusMessage, setTestStatusMessage] = useState<string | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setPermissionState(Notification.permission);
      }
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));
      setIsStandalone(
        window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as Navigator & { standalone?: boolean }).standalone === true
      );
    }
  }, []);

  const handleEnablePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Web Push is not supported in this browser.');
      return;
    }

    setIsSubscribing(true);
    setTestStatusMessage(null);

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      if (permission !== 'granted') {
        throw new Error('Notification permission was denied.');
      }

      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('VAPID public key is missing.');
      }

      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to register subscription on server');
      }

      setTestStatusMessage('Push notifications enabled.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Push registration failed';
      setTestStatusMessage(message);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleTestPush = async () => {
    setIsSendingTest(true);
    setTestStatusMessage(null);
    try {
      const res = await fetch('/api/push/test', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Test push failed');
      }
      setTestStatusMessage(`Test push sent to ${data.sentCount} device(s).`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not send test push';
      setTestStatusMessage(message);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div className="lg:col-span-2 rounded-md border border-line bg-surface p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Push notifications</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Permission: {permissionState}
            </p>
          </div>
        </div>

        {isIOS && !isStandalone && (
          <p className="text-xs text-text-muted rounded-md border border-line bg-surface-raised p-3">
            On iPhone, add this app to your Home Screen first, then enable push.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleEnablePush}
            disabled={isSubscribing}
            className="rounded-pill border border-line px-3.5 py-1.5 text-xs text-text-primary hover:bg-surface-raised disabled:opacity-50"
          >
            {isSubscribing
              ? 'Enabling...'
              : permissionState === 'granted'
                ? 'Re-sync subscription'
                : 'Enable push'}
          </button>

          <button
            type="button"
            onClick={handleTestPush}
            disabled={isSendingTest}
            className="rounded-pill border border-line px-3.5 py-1.5 text-xs text-text-muted hover:text-text-primary disabled:opacity-50"
          >
            {isSendingTest ? 'Sending...' : 'Send test'}
          </button>
        </div>

        {testStatusMessage && (
          <p className="text-xs text-text-muted rounded-md border border-line bg-surface-raised p-2.5">
            {testStatusMessage}
          </p>
        )}
      </div>

      <div className="rounded-md border border-line bg-surface p-4 space-y-3">
        <h3 className="text-sm font-semibold text-text-primary border-b border-line pb-2">
          Reminder hours
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between text-text-muted mb-1">
              <span>First reminder</span>
              <span className="font-mono text-text-primary">{firstReminderHour}:00</span>
            </div>
            <input
              type="range"
              min={12}
              max={21}
              value={firstReminderHour}
              onChange={(e) =>
                onUpdateSettings({ firstReminderHour: parseInt(e.target.value) })
              }
              className="w-full accent-status-safe"
            />
          </div>

          <div>
            <div className="flex justify-between text-text-muted mb-1">
              <span>Last reminder</span>
              <span className="font-mono text-status-critical">{lastReminderHour}:00</span>
            </div>
            <input
              type="range"
              min={20}
              max={23}
              value={lastReminderHour}
              onChange={(e) =>
                onUpdateSettings({ lastReminderHour: parseInt(e.target.value) })
              }
              className="w-full accent-status-critical"
            />
          </div>

          <label className="flex items-center justify-between pt-2 border-t border-line cursor-pointer">
            <span className="text-text-muted">Private contributions on GitHub</span>
            <input
              type="checkbox"
              checked={privateContributionsEnabled}
              onChange={(e) =>
                onUpdateSettings({ privateContributionsEnabled: e.target.checked })
              }
              className="rounded accent-status-safe"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
