'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, Flame } from 'lucide-react';
import { StreakStatus } from '@/lib/streak';

interface StatusBadgeProps {
  status: StreakStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (status === 'SAFE') {
    return (
      <span className="inline-flex items-center gap-2 rounded-pill bg-status-safe/10 border border-status-safe/30 px-3.5 py-1.5 text-xs font-semibold text-status-safe font-mono uppercase tracking-wider">
        <ShieldCheck className="w-4 h-4 text-status-safe" />
        <span>Streak Safe</span>
      </span>
    );
  }

  if (status === 'AT_RISK') {
    return (
      <span className="inline-flex items-center gap-2 rounded-pill bg-status-at-risk/10 border border-status-at-risk/30 px-3.5 py-1.5 text-xs font-semibold text-status-at-risk font-mono uppercase tracking-wider">
        <AlertTriangle className="w-4 h-4 text-status-at-risk" />
        <span>Streak At Risk</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-pill bg-status-critical/10 border border-status-critical/30 px-3.5 py-1.5 text-xs font-semibold text-status-critical font-mono uppercase tracking-wider">
      <Flame className="w-4 h-4 text-status-critical" />
      <span>Streak Critical</span>
    </span>
  );
};
