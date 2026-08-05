'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Send, Clock, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
  timezone,
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

      setTestStatusMessage('Push notifications successfully enabled.');
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
      setTestStatusMessage(`Test push notification sent to ${data.sentCount} device(s).`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not send test push';
      setTestStatusMessage(message);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Web Push Notification Settings */}
      <div className="lg:col-span-2 rounded-md border border-line bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-status-safe" />
            <h3 className="text-sm font-semibold text-text-primary">Web Push Notifications</h3>
          </div>
          <span className="text-xs font-mono text-text-muted bg-surface-raised px-2.5 py-1 rounded-sm border border-line">
            Status: {permissionState}
          </span>
        </div>

        <p className="text-xs text-text-muted leading-relaxed">
          Receive automated browser push alerts when your daily streak is about to break before end-of-day.
        </p>

        {isIOS && !isStandalone && (
          <p className="text-xs text-text-muted rounded-md border border-line bg-surface-raised p-3">
            On iOS Safari, tap Share → &quot;Add to Home Screen&quot; first to enable Web Push notifications.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleEnablePush}
            disabled={isSubscribing}
            className="rounded-pill border border-line bg-surface-raised px-4 py-2 text-xs font-medium text-text-primary hover:bg-line disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-status-safe" />
            <span>
              {isSubscribing
                ? 'Enabling...'
                : permissionState === 'granted'
                  ? 'Re-sync Subscription'
                  : 'Enable Push Alerts'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleTestPush}
            disabled={isSendingTest}
            className="rounded-pill border border-line px-4 py-2 text-xs font-medium text-text-muted hover:text-text-primary disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingTest ? 'Sending...' : 'Send Test Notification'}</span>
          </button>
        </div>

        {testStatusMessage && (
          <div className="text-xs font-mono text-text-muted rounded-md border border-line bg-surface-raised p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-status-safe shrink-0" />
            <span>{testStatusMessage}</span>
          </div>
        )}
      </div>

      {/* Reminder Schedule & Timezone */}
      <div className="rounded-md border border-line bg-surface p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <Clock className="w-4 h-4 text-status-safe" />
          <h3 className="text-sm font-semibold text-text-primary">
            Schedule & Timezone
          </h3>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between text-text-muted mb-1.5 font-mono">
              <span>First reminder</span>
              <span className="text-text-primary font-bold">{firstReminderHour}:00</span>
            </div>
            <input
              type="range"
              min={12}
              max={21}
              value={firstReminderHour}
              onChange={(e) =>
                onUpdateSettings({ firstReminderHour: parseInt(e.target.value) })
              }
              className="w-full accent-status-safe cursor-pointer focus-visible:ring-1 focus-visible:ring-status-safe rounded"
            />
          </div>

          <div>
            <div className="flex justify-between text-text-muted mb-1.5 font-mono">
              <span>Last reminder</span>
              <span className="text-status-critical font-bold">{lastReminderHour}:00</span>
            </div>
            <input
              type="range"
              min={20}
              max={23}
              value={lastReminderHour}
              onChange={(e) =>
                onUpdateSettings({ lastReminderHour: parseInt(e.target.value) })
              }
              className="w-full accent-status-critical cursor-pointer focus-visible:ring-1 focus-visible:ring-status-critical rounded"
            />
          </div>

          <div>
            <div className="flex justify-between text-text-muted mb-1.5 font-mono">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>Timezone</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                  if (browserTz) onUpdateSettings({ timezone: browserTz });
                }}
                className="text-[11px] text-status-safe hover:underline font-mono"
              >
                Auto-detect
              </button>
            </div>
            <select
              value={timezone}
              onChange={(e) => onUpdateSettings({ timezone: e.target.value })}
              className="w-full rounded-md bg-surface-raised border border-line p-2 text-xs text-text-primary font-mono focus:outline-none focus:border-status-safe"
            >
              <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
              <option value="Australia/Melbourne">Australia/Melbourne</option>
              <option value="Australia/Brisbane">Australia/Brisbane</option>
              <option value="Australia/Perth">Australia/Perth</option>
              <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (ICT)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
            </select>
          </div>

          <label className="flex items-center justify-between pt-3 border-t border-line cursor-pointer">
            <span className="text-text-muted flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-text-muted" />
              <span>Include Private Repos</span>
            </span>
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
