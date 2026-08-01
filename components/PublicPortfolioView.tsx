'use client';

import React from 'react';
import { ContributionHeatmap } from './ContributionHeatmap';
import { DayContribution } from '@/lib/streak';

interface PublicPortfolioViewProps {
  username: string;
  repoName: string;
  timezone: string;
  currentStreak: number;
  longestStreak: number;
  totalLogs: number;
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
  onSwitchToApp: () => void;
}

export const PublicPortfolioView: React.FC<PublicPortfolioViewProps> = ({
  username,
  repoName,
  timezone,
  currentStreak,
  longestStreak,
  totalLogs,
  contributions,
  recentLogs,
  onSwitchToApp,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-ink text-text-primary">
      {/* Portfolio Top Bar */}
      <div className="border-b border-line bg-surface/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Ember Commit" className="h-7 w-7 object-contain" />
          <span className="font-semibold text-text-primary text-sm tracking-wide">
            Ember Commit Public Portfolio
          </span>
        </div>
        <button
          type="button"
          onClick={onSwitchToApp}
          className="rounded-pill border border-line bg-surface-raised px-4 py-1.5 text-xs text-text-primary hover:bg-line transition-colors"
        >
          ← Back to App
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Recruiter / Visitor Intro Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-pill border border-status-safe/30 bg-status-safe/10 px-3.5 py-1 text-xs text-status-safe font-mono font-medium">
            🔥 {currentStreak} Day Verified Contribution Streak
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-text-primary tracking-tight">
            @{username}&apos;s Public Engineering Journal
          </h1>
          <p className="text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
            Real daily proof of work logged in <span className="font-mono text-text-primary">{repoName}</span>.
            Timezone: <span className="font-mono text-text-primary">{timezone}</span>.
          </p>
        </div>

        {/* Highlight Metrics Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-md border border-line bg-surface p-5 text-center space-y-1">
            <p className="text-2xl font-bold font-mono text-status-safe">{currentStreak}</p>
            <p className="text-xs text-text-muted font-mono uppercase tracking-wider">Current Streak</p>
          </div>
          <div className="rounded-md border border-line bg-surface p-5 text-center space-y-1">
            <p className="text-2xl font-bold font-mono text-text-primary">{longestStreak}</p>
            <p className="text-xs text-text-muted font-mono uppercase tracking-wider">Longest Streak</p>
          </div>
          <div className="rounded-md border border-line bg-surface p-5 text-center space-y-1">
            <p className="text-2xl font-bold font-mono text-text-primary">{totalLogs}</p>
            <p className="text-xs text-text-muted font-mono uppercase tracking-wider">Total Micro Logs</p>
          </div>
        </div>

        {/* Contribution Heatmap */}
        <ContributionHeatmap contributions={contributions} todayDateStr={todayStr} />

        {/* Micro Logs Timeline */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold font-serif text-text-primary border-b border-line pb-2">
            Verified Daily Log Entries
          </h2>
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div key={log.id} className="rounded-md border border-line bg-surface p-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-status-safe font-semibold">{log.logDate}</span>
                  {log.commitSha && (
                    <span className="text-text-muted font-mono text-[11px]">
                      SHA: {log.commitSha.slice(0, 7)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
                  {log.todayContent || log.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
