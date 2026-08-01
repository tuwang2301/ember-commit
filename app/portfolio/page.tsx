'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PublicPortfolioView } from '@/components/PublicPortfolioView';
import { DayContribution } from '@/lib/streak';

interface PortfolioData {
  user: {
    username: string;
    repoName: string;
    timezone: string;
  };
  metrics: {
    currentStreak: number;
    longestStreak: number;
    totalLogs: number;
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

export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user')
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center gap-2">
        <div className="h-3 w-3 rounded-sm bg-status-safe animate-pulse" />
        <p className="text-xs text-text-muted">Loading portfolio...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-sm text-text-muted">Public portfolio not available.</p>
        <Link href="/" className="rounded-pill bg-status-safe px-4 py-2 text-xs font-semibold text-ink">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <PublicPortfolioView
      username={data.user.username}
      repoName={data.user.repoName}
      timezone={data.user.timezone}
      currentStreak={data.metrics.currentStreak}
      longestStreak={data.metrics.longestStreak}
      totalLogs={data.metrics.totalLogs}
      contributions={data.contributions}
      recentLogs={data.recentLogs}
      onSwitchToApp={() => {
        window.location.href = '/';
      }}
    />
  );
}
