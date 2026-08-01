'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logoImg from '@/public/logo.png';
import { NotificationControl } from '@/components/NotificationControl';

interface UserSettings {
  username: string;
  repoName: string;
  timezone: string;
  firstReminderHour: number;
  lastReminderHour: number;
  privateContributionsEnabled: boolean;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to load user settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdateSettings = async (updatedFields: Record<string, unknown>) => {
    setSaveStatus('Saving...');
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        await fetchUserData();
        setSaveStatus('Settings saved successfully.');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      setSaveStatus('Failed to save settings.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center gap-2">
        <div className="h-3 w-3 rounded-sm bg-status-safe animate-pulse" />
        <p className="text-xs text-text-muted">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-text-primary flex flex-col">
      {/* Header */}
      <header className="border-b border-line bg-surface px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src={logoImg} alt="Ember Commit" width={24} height={24} className="h-6 w-6 object-contain" priority />
            <h1 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
              Ember Commit Settings
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-pill border border-line bg-surface-raised px-4 py-1.5 text-xs text-text-primary hover:bg-line transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Settings Body */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="space-y-2 border-b border-line pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Settings & Notifications</h2>
            <p className="text-xs text-text-muted">
              Manage your timezone, Web Push notifications, reminder hours, and GitHub preferences.
            </p>
          </div>
          {saveStatus && (
            <span className="text-xs font-mono text-status-safe bg-status-safe/10 border border-status-safe/30 px-3 py-1 rounded-pill">
              {saveStatus}
            </span>
          )}
        </div>

        {/* User Account Card */}
        <div className="rounded-md border border-line bg-surface p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-status-safe/20 border border-status-safe flex items-center justify-center text-status-safe font-mono font-bold text-base uppercase">
              {user?.username.slice(0, 2) || 'EC'}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">@{user?.username}</p>
              <p className="text-xs text-text-muted font-mono">
                Log Repo: <span className="text-text-primary font-medium">{user?.repoName}</span>
              </p>
            </div>
          </div>
          <a
            href="/api/auth/install"
            className="rounded-pill border border-line px-3.5 py-1.5 text-xs text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
          >
            Change Repo / Re-install
          </a>
        </div>

        {/* Notification Control Component */}
        <NotificationControl
          timezone={user?.timezone || 'Australia/Sydney'}
          firstReminderHour={user?.firstReminderHour || 18}
          lastReminderHour={user?.lastReminderHour || 22}
          privateContributionsEnabled={user?.privateContributionsEnabled ?? true}
          onUpdateSettings={handleUpdateSettings}
        />
      </main>

      <footer className="border-t border-line py-4 text-center text-xs text-text-muted">
        Ember Commit Settings · {user?.repoName || 'daily-log'}
      </footer>
    </div>
  );
}
