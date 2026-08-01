import React from 'react';
import Image from 'next/image';
import logoImg from '@/public/logo.png';
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
    <span className="inline-flex items-center gap-2 rounded-pill bg-surface-raised border border-line px-3.5 py-1.5 text-sm font-semibold text-text-primary">
      {status === 'SAFE' ? (
        <Image src={logoImg} alt="Ember Flame" width={16} height={16} className="h-4 w-4 object-contain animate-pulse" />
      ) : (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: cfg.dotColor }}
          aria-hidden
        />
      )}
      {cfg.label}
    </span>
  );
};
