'use client';

import React from 'react';
import { StreakStatus } from '@/lib/streak';

interface StatusBadgeProps {
  status: StreakStatus;
}

const STATUS_CONFIG: Record<
  StreakStatus,
  { label: string; dotColor: string }
> = {
  SAFE: { label: 'Safe', dotColor: 'var(--status-safe)' },
  AT_RISK: { label: 'At Risk', dotColor: 'var(--status-at-risk)' },
  CRITICAL: { label: 'Critical', dotColor: 'var(--status-critical)' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];

  return (
    <span className="inline-flex items-center gap-2 rounded-pill bg-surface-raised border border-line px-3 py-1.5 text-sm text-text-primary">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: cfg.dotColor }}
        aria-hidden
      />
      {cfg.label}
    </span>
  );
};
