'use client';

import React, { useState } from 'react';

interface DailyLogItem {
  id: string;
  logDate: string;
  content: string;
  todayContent?: string;
  commitSha?: string;
  commitStatus: string;
  createdAt: string;
}

interface RecentLogsListProps {
  logs: DailyLogItem[];
  repoName: string;
}

const STATUS_LABEL: Record<string, string> = {
  success: 'Committed',
  pending: 'Pending',
  failed: 'Failed',
};

export const RecentLogsList: React.FC<RecentLogsListProps> = ({ logs, repoName }) => {
  const [expandedId, setExpandedId] = useState<string | null>(logs[0]?.id ?? null);

  return (
    <div className="rounded-md border border-line bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h3 className="text-sm font-semibold text-text-primary">Recent logs</h3>
        <span className="text-xs text-text-muted font-mono">
          {logs.length} in {repoName}/logs/
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-md border border-line bg-surface-raised p-6 text-center text-sm text-text-muted">
          No logs yet. Use &quot;Save streak&quot; to write your first entry.
        </div>
      ) : (
        <div className="divide-y divide-line">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            const statusLabel = STATUS_LABEL[log.commitStatus] ?? log.commitStatus;

            return (
              <div key={log.id} className="py-3 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="w-full flex items-center justify-between gap-3 text-left hover:bg-surface-raised rounded-md p-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-medium text-text-primary shrink-0">
                      {log.logDate}
                    </span>
                    <span className="text-sm text-text-muted truncate">
                      {log.todayContent || log.content.slice(0, 60)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-text-muted shrink-0">
                    <span
                      className={
                        log.commitStatus === 'success'
                          ? 'text-status-safe'
                          : log.commitStatus === 'failed'
                            ? 'text-status-critical'
                            : 'text-status-at-risk'
                      }
                    >
                      {statusLabel}
                    </span>
                    <span>{isExpanded ? '−' : '+'}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-2 ml-2 border-l border-line pl-3">
                    {log.commitSha && (
                      <p className="text-xs text-text-muted font-mono mb-2">
                        {log.commitSha.slice(0, 12)}
                      </p>
                    )}
                    <pre className="whitespace-pre-wrap font-mono text-xs text-text-primary leading-relaxed">
                      {log.content}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
