'use client';

import React from 'react';

interface MetricsGridProps {
  currentStreak: number;
  longestStreak: number;
  totalLogs: number;
  daysProtected: number;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  currentStreak,
  longestStreak,
  totalLogs,
  daysProtected,
}) => {
  const metrics = [
    { label: 'Longest streak', val: `${longestStreak}` },
    { label: 'Total logs written', val: `${totalLogs}` },
    { label: 'Days protected', val: `${daysProtected}` },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Current streak</p>
        <p className="font-mono text-[56px] font-semibold leading-none text-text-primary">
          {currentStreak}
          <span className="text-2xl font-medium text-text-muted ml-2">days</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {metrics.map((item) => (
          <div
            key={item.label}
            className="rounded-md border border-line bg-surface px-4 py-3"
          >
            <p className="text-xs text-text-muted mb-1">{item.label}</p>
            <p className="font-mono text-xl font-semibold text-text-primary">{item.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
