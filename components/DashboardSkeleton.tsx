'use client';

import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-ink text-text-primary flex flex-col animate-pulse">
      {/* Header Skeleton */}
      <header className="border-b border-line bg-surface px-4 sm:px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded bg-surface-raised" />
            <div className="h-4 w-32 rounded bg-surface-raised" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 rounded-pill bg-surface-raised" />
            <div className="h-8 w-24 rounded-pill bg-surface-raised" />
          </div>
        </div>
      </header>

      {/* Main Body Skeleton */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Card Skeleton */}
        <div className="rounded-md border border-line bg-surface p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-28 rounded-pill bg-surface-raised" />
            <div className="h-6 w-36 rounded-sm bg-surface-raised" />
          </div>
          <div className="h-4 w-3/4 rounded bg-surface-raised" />
        </div>

        {/* Heatmap Skeleton */}
        <div className="rounded-md border border-line bg-surface p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 rounded bg-surface-raised" />
            <div className="h-4 w-24 rounded bg-surface-raised" />
          </div>
          <div className="h-32 w-full rounded bg-surface-raised" />
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-md border border-line bg-surface p-4 space-y-2 text-center">
              <div className="h-4 w-12 mx-auto rounded bg-surface-raised" />
              <div className="h-8 w-16 mx-auto rounded bg-surface-raised" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
