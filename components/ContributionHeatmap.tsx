'use client';

import React, { useMemo, useState } from 'react';
import { DayContribution } from '@/lib/streak';

interface ContributionHeatmapProps {
  contributions: DayContribution[];
  todayDateStr: string;
  animateToday?: boolean;
}

const LEVEL_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-grid-l0 border border-[#272b3c]',
  1: 'bg-grid-l1 border border-[#6b252b]',
  2: 'bg-grid-l2 border border-[#9e343c]',
  3: 'bg-grid-l3 border border-[#d94852]',
  4: 'bg-grid-l4 border border-[#ff6666]',
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfWeekSunday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({
  contributions,
  todayDateStr,
  animateToday = false,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DayContribution | null>(null);

  const contribMap = useMemo(() => {
    const map = new Map<string, DayContribution>();
    contributions.forEach((c) => map.set(c.date, c));
    return map;
  }, [contributions]);

  const weeks = useMemo(() => {
    const today = new Date();
    // Ensure end date covers the end of the current week so today is included
    const endSunday = startOfWeekSunday(today);
    // Include the current week by setting cursor to endSunday + 7 days
    const currentWeekEnd = new Date(endSunday);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);

    const startDate = new Date(endSunday);
    startDate.setDate(startDate.getDate() - 7 * 52);

    const columns: { date: Date; day: DayContribution | null }[][] = [];
    let cursor = new Date(startDate);

    while (cursor < currentWeekEnd) {
      const week: { date: Date; day: DayContribution | null }[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(cursor);
        date.setDate(cursor.getDate() + i);
        const key = formatDateKey(date);
        week.push({ date, day: contribMap.get(key) ?? null });
      }
      columns.push(week);
      cursor.setDate(cursor.getDate() + 7);
    }

    return columns;
  }, [contribMap]);

  const monthMarkers = useMemo(() => {
    return weeks.map((week, idx) => {
      const first = week[0]?.date;
      if (!first) return { idx, label: '' };
      const prev = idx > 0 ? weeks[idx - 1][0]?.date : null;
      if (!prev || first.getMonth() !== prev.getMonth()) {
        return { idx, label: MONTH_LABELS[first.getMonth()] };
      }
      return { idx, label: '' };
    });
  }, [weeks]);

  const totalContributions = contributions.reduce((acc, c) => acc + c.count, 0);

  return (
    <div className="rounded-md border border-line bg-surface p-5 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Contributions</h2>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            {totalContributions} contributions in the last year
          </p>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-text-muted font-mono">
          <span>Less</span>
          {([0, 1, 2, 3, 4] as const).map((level) => (
            <span key={level} className={`h-2.5 w-2.5 rounded-sm ${LEVEL_CLASS[level]}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col gap-1 min-w-max">
          <div className="flex gap-[3px] pl-8">
            {monthMarkers.map(({ idx, label }) => (
              <div
                key={idx}
                className="text-[11px] font-mono font-medium text-text-muted"
                style={{ width: 13, minWidth: 13 }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-[3px] pt-[2px]">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={label}
                  className="h-[13px] text-[11px] font-mono font-medium text-text-muted leading-[13px]"
                  style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map(({ date, day }) => {
                    const key = formatDateKey(date);
                    const level = day?.level ?? 0;
                    const isToday = key === todayDateStr;
                    const isFuture = key > todayDateStr;

                    if (isFuture) {
                      return (
                        <div
                          key={key}
                          className="h-[13px] w-[13px] rounded-sm bg-transparent"
                          aria-hidden
                        />
                      );
                    }

                    return (
                      <div
                        key={key}
                        role="gridcell"
                        tabIndex={0}
                        aria-label={`${key}: ${day?.count ?? 0} contributions`}
                        onMouseEnter={() => day && setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onFocus={() => day && setHoveredDay(day)}
                        onBlur={() => setHoveredDay(null)}
                        className={`h-[13px] w-[13px] rounded-sm cursor-pointer transition-colors duration-200 ease-out ${LEVEL_CLASS[level]} ${isToday && animateToday ? 'animate-cell-fill' : ''
                          }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-6 flex items-center text-xs text-text-muted font-mono border-t border-line pt-3">
        {hoveredDay ? (
          <span>
            <span className="text-text-primary font-medium">{hoveredDay.date}</span>
            {' · '}
            {hoveredDay.count} contribution{hoveredDay.count === 1 ? '' : 's'}
            {hoveredDay.hasAppLog && (
              <span className="text-status-safe ml-2">Saved via app</span>
            )}
          </span>
        ) : (
          <span>Hover a cell to see that day&apos;s count</span>
        )}
      </div>

      <style jsx>{`
        @keyframes cellFill {
          from {
            background-color: var(--grid-l0);
          }
        }
        .animate-cell-fill {
          animation: cellFill 180ms ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-cell-fill {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};
