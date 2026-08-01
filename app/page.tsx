'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { ContributionHeatmap } from '@/components/ContributionHeatmap';
import { StreakStatusCard } from '@/components/StreakStatusCard';
import { MetricsGrid } from '@/components/MetricsGrid';
import { NotificationControl } from '@/components/NotificationControl';
import { RecentLogsList } from '@/components/RecentLogsList';
import { QuickLogModal } from '@/components/QuickLogModal';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { MobileSidebar } from '@/components/MobileSidebar';
import { PublicPortfolioView } from '@/components/PublicPortfolioView';
import { LoginScreen } from '@/components/LoginScreen';
import { InstallRequiredScreen } from '@/components/InstallRequiredScreen';
import { DayContribution } from '@/lib/streak';

interface DashboardData {
  authenticated: boolean;
  needsInstall?: boolean;
  user: {
    username: string;
    repoName: string;
    repoOwner?: string | null;
    timezone: string;
    firstReminderHour: number;
    lastReminderHour: number;
    privateContributionsEnabled: boolean;
  };
  metrics: {
    currentStreak: number;
    longestStreak: number;
    totalLogs: number;
    daysProtected: number;
    status: 'SAFE' | 'AT_RISK' | 'CRITICAL';
    hasContributedToday: boolean;
    todayDateStr: string;
    hoursRemainingToday: number;
  };
  contributions: DayContribution[];
  recentLogs: Array<{
    id: string;
    logDate: string;
    content: string;
    todayContent?: string;
    commitSha?: string;
    commitStatus: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<DashboardData | null>(null);
  const [authState, setAuthState] = useState<'loading' | 'guest' | 'needs_install' | 'ready'>(
    'loading'
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const [guestUsername, setGuestUsername] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPublicView, setIsPublicView] = useState(false);
  const [animateTodayCell, setAnimateTodayCell] = useState(false);

  const fetchDashboardData = useCallback(async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    try {
      const res = await fetch('/api/user');
      const data = await res.json();

      if (res.status === 401) {
        setAuthState('guest');
        setUserData(null);
        return;
      }

      if (data.needsInstall) {
        setGuestUsername(data.user?.username ?? null);
        setAuthState('needs_install');
        setUserData(null);
        return;
      }

      if (res.ok) {
        setUserData(data);
        setAuthState('ready');
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsRefreshing(false);
      if (authState === 'loading') {
        // only transition from loading if we didn't set another state
      }
    }
  }, [authState]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const error = searchParams.get('auth_error');
      if (error) setAuthError(error);

      if (searchParams.get('onboarding') === '1') {
        setIsOnboardingOpen(true);
        window.history.replaceState({}, '', '/');
      }

      if (searchParams.get('action') === 'open-log-modal') {
        setIsLogModalOpen(true);
      }
    }

    fetch('/api/user')
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          setAuthState('guest');
          return;
        }
        if (data.needsInstall) {
          setGuestUsername(data.user?.username ?? null);
          setAuthState('needs_install');
          return;
        }
        if (res.ok) {
          setUserData(data);
          setAuthState('ready');
        }
      })
      .catch(console.error);
  }, []);

  const handleUpdateSettings = async (updatedFields: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  const handleLogSuccess = () => {
    setIsLogModalOpen(false);
    setAnimateTodayCell(true);
    fetchDashboardData(true);
    setTimeout(() => setAnimateTodayCell(false), 300);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUserData(null);
    setAuthState('guest');
  };

  if (authState === 'loading') {
    return (
      <div className="min-h-[100dvh] bg-ink flex flex-col items-center justify-center gap-2">
        <div className="h-3 w-3 rounded-sm bg-grid-l2 animate-pulse" />
        <p className="text-xs text-text-muted">Loading...</p>
      </div>
    );
  }

  if (authState === 'guest') {
    return <LoginScreen authError={authError} />;
  }

  if (authState === 'needs_install') {
    return <InstallRequiredScreen username={guestUsername || 'user'} />;
  }

  const { user, metrics, contributions, recentLogs } = userData || {};

  return (
    <div className="min-h-[100dvh] bg-ink text-text-primary flex flex-col">
      <Header
        username={user?.username || ''}
        repoName={user?.repoName || 'daily-log'}
        timezone={user?.timezone || 'Asia/Ho_Chi_Minh'}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onSync={() => fetchDashboardData(true)}
        isSyncing={isRefreshing}
        onLogout={handleLogout}
        onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
      />

      {isPublicView ? (
        <PublicPortfolioView
          username={user?.username || ''}
          repoName={user?.repoName || 'daily-log'}
          timezone={user?.timezone || 'Asia/Ho_Chi_Minh'}
          currentStreak={metrics?.currentStreak || 0}
          longestStreak={metrics?.longestStreak || 0}
          totalLogs={metrics?.totalLogs || 0}
          contributions={contributions || []}
          recentLogs={recentLogs || []}
          onSwitchToApp={() => setIsPublicView(false)}
        />
      ) : (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
          <StreakStatusCard
            status={metrics?.status || 'SAFE'}
            hasContributedToday={metrics?.hasContributedToday || false}
            todayDateStr={metrics?.todayDateStr || new Date().toISOString().split('T')[0]}
            hoursRemainingToday={metrics?.hoursRemainingToday || 6}
            onOpenLogModal={() => setIsLogModalOpen(true)}
          />

          <ContributionHeatmap
            contributions={contributions || []}
            todayDateStr={metrics?.todayDateStr || new Date().toISOString().split('T')[0]}
            animateToday={animateTodayCell}
          />

          <MetricsGrid
            currentStreak={metrics?.currentStreak || 0}
            longestStreak={metrics?.longestStreak || 0}
            totalLogs={metrics?.totalLogs || 0}
            daysProtected={metrics?.daysProtected || 0}
          />

          <NotificationControl
            timezone={user?.timezone || 'Asia/Ho_Chi_Minh'}
            firstReminderHour={user?.firstReminderHour || 18}
            lastReminderHour={user?.lastReminderHour || 22}
            privateContributionsEnabled={user?.privateContributionsEnabled ?? true}
            onUpdateSettings={handleUpdateSettings}
          />

          <RecentLogsList
            logs={recentLogs || []}
            repoName={user?.repoName || 'daily-log'}
          />
        </main>
      )}

      <footer className="border-t border-line py-4 text-center text-xs text-text-muted flex items-center justify-center gap-3">
        <span>Ember Commit · {user?.repoName || 'daily-log'}</span>
        <span>·</span>
        <button
          type="button"
          onClick={() => setIsPublicView(!isPublicView)}
          className="hover:text-text-primary underline"
        >
          {isPublicView ? 'Back to App Workspace' : 'Preview Public Portfolio'}
        </button>
      </footer>

      <QuickLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSuccess={handleLogSuccess}
        todayDateStr={metrics?.todayDateStr || new Date().toISOString().split('T')[0]}
      />

      <OnboardingFlow
        isOpen={isOnboardingOpen}
        onComplete={() => {
          setIsOnboardingOpen(false);
          fetchDashboardData(true);
        }}
        username={user?.username || ''}
        repoName={user?.repoName || 'daily-log'}
        timezone={user?.timezone || 'Asia/Ho_Chi_Minh'}
        privateContributionsEnabled={user?.privateContributionsEnabled ?? true}
        currentStreak={metrics?.currentStreak || 0}
        onUpdateSettings={handleUpdateSettings}
      />

      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        username={user?.username || ''}
        repoName={user?.repoName || 'daily-log'}
        timezone={user?.timezone || 'Asia/Ho_Chi_Minh'}
        firstReminderHour={user?.firstReminderHour || 18}
        lastReminderHour={user?.lastReminderHour || 22}
        privateContributionsEnabled={user?.privateContributionsEnabled ?? true}
        isPublicView={isPublicView}
        onToggleView={() => setIsPublicView(!isPublicView)}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onSync={() => fetchDashboardData(true)}
        isSyncing={isRefreshing}
        onLogout={handleLogout}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
