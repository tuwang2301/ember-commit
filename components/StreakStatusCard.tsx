'use client';

import React from 'react';
import { Clock, Plus, ShieldCheck, Flame, AlertCircle } from 'lucide-react';
import { StreakStatus } from '@/lib/streak';
import { StatusBadge } from '@/components/StatusBadge';

interface StreakStatusCardProps {
  status: StreakStatus;
  hasContributedToday: boolean;
  todayDateStr: string;
  hoursRemainingToday: number;
  onOpenLogModal: () => void;
}

export const StreakStatusCard: React.FC<StreakStatusCardProps> = ({
  status,
  hasContributedToday,
  todayDateStr,
  hoursRemainingToday,
  onOpenLogModal,
}) => {
  const getMessage = () => {
    if (hasContributedToday) {
      return `Daily contribution recorded for today (${todayDateStr}). Your streak is protected.`;
    }
    if (status === 'CRITICAL') {
      return `No contribution recorded for today yet. Only ~${hoursRemainingToday} hours remaining in your local timezone!`;
    }
    return 'No contribution recorded for today yet. Write a quick log entry to extend your streak.';
  };

  const borderClass =
    status === 'SAFE'
      ? 'border-status-safe/40'
      : status === 'AT_RISK'
      ? 'border-status-at-risk/40'
      : 'border-status-critical/50';

  return (
    <div className={`rounded-md border ${borderClass} bg-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors`}>
      <div className="space-y-3 max-w-xl">
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {!hasContributedToday && (
            <span className="text-xs font-mono text-text-muted flex items-center gap-1 bg-surface-raised px-2.5 py-1 rounded-sm border border-line">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <span>{hoursRemainingToday}h remaining today</span>
            </span>
          )}
        </div>

        <p className="text-sm text-text-primary leading-relaxed">
          {getMessage()}
        </p>
      </div>

      {!hasContributedToday ? (
        <button
          type="button"
          onClick={onOpenLogModal}
          className="shrink-0 rounded-pill bg-status-safe px-6 py-2.5 text-xs font-semibold text-ink transition-transform active:scale-[0.98] hover:opacity-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Write Daily Log</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenLogModal}
          className="shrink-0 rounded-pill border border-line bg-surface-raised px-5 py-2 text-xs font-medium text-text-primary hover:bg-line transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-3.5 h-3.5 text-text-muted" />
          <span>Add Another Entry</span>
        </button>
      )}
    </div>
  );
};
