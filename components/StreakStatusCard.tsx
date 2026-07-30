'use client';

import React from 'react';
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
      return `You already contributed today (${todayDateStr}). Your streak is safe.`;
    }
    if (status === 'CRITICAL') {
      return `No contribution yet today. About ${hoursRemainingToday}h left in your timezone before the day ends.`;
    }
    return 'No contribution yet today. Write a short log before your last reminder.';
  };

  const showRescueCta = !hasContributedToday;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <StatusBadge status={status} />
        <p className="text-sm text-text-muted max-w-xl">{getMessage()}</p>
      </div>

      {showRescueCta && (
        <button
          type="button"
          onClick={onOpenLogModal}
          className="shrink-0 rounded-pill bg-status-critical px-5 py-2 text-sm font-semibold text-ink transition-transform active:scale-[0.98] hover:brightness-110"
        >
          Save streak
        </button>
      )}
    </div>
  );
};
