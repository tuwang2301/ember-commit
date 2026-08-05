'use client';

import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

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

export const RecentLogsList: React.FC<RecentLogsListProps> = ({ logs, repoName }) => {
  const [expandedId, setExpandedId] = useState<string | null>(logs[0]?.id ?? null);

  return (
    <div className="rounded-md border border-line bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-status-safe" />
          <h3 className="text-sm font-semibold text-text-primary">Recent Logs Timeline</h3>
        </div>
        <span className="text-xs text-text-muted font-mono bg-surface-raised px-2.5 py-1 rounded-sm border border-line">
          {logs.length} entry{logs.length === 1 ? '' : 's'} in {repoName}/logs/
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-md border border-line bg-surface-raised p-6 text-center text-xs text-text-muted font-mono">
          No log entries recorded yet. Click &quot;Write Daily Log&quot; to extend your streak.
        </div>
      ) : (
        <div className="divide-y divide-line">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            const isSuccess = log.commitStatus === 'success';
            const isFailed = log.commitStatus === 'failed';

            return (
              <div key={log.id} className="py-3.5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="w-full flex items-center justify-between gap-3 text-left hover:bg-surface-raised rounded-md p-2 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-text-primary shrink-0 bg-surface-raised px-2 py-0.5 rounded border border-line">
                      {log.logDate}
                    </span>
                    <span className="text-xs text-text-muted truncate group-hover:text-text-primary transition-colors">
                      {log.todayContent || log.content.slice(0, 60)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs shrink-0">
                    {isSuccess ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-status-safe bg-status-safe/10 border border-status-safe/30 px-2 py-0.5 rounded-pill">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Committed</span>
                      </span>
                    ) : isFailed ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-status-critical bg-status-critical/10 border border-status-critical/30 px-2 py-0.5 rounded-pill">
                        <AlertCircle className="w-3 h-3" />
                        <span>Failed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-status-at-risk bg-status-at-risk/10 border border-status-at-risk/30 px-2 py-0.5 rounded-pill">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    )}

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-text-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-3 ml-2 border-l border-line pl-3.5 space-y-2">
                    {log.commitSha && (
                      <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
                        <span>Commit SHA:</span>
                        <span className="text-text-primary">{log.commitSha.slice(0, 12)}</span>
                      </div>
                    )}
                    <pre className="whitespace-pre-wrap font-mono text-xs text-text-primary leading-relaxed bg-surface-raised p-3 rounded-md border border-line">
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
