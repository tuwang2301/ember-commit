'use client';

import React, { useState } from 'react';
import { buildMarkdownLogTemplate } from '@/lib/streak';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  todayDateStr: string;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  todayDateStr,
}) => {
  const [today, setToday] = useState('');
  const [learned, setLearned] = useState('');
  const [tomorrow, setTomorrow] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ sha?: string; url?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!today.trim()) {
      setErrorMessage('Write what you did today.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          today,
          learned,
          tomorrow,
          logDate: todayDateStr,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record daily log');
      }

      setSubmitResult({
        sha: data.commitSha,
        url: data.commitUrl,
      });

      setTimeout(() => {
        onSuccess();
        setToday('');
        setLearned('');
        setTomorrow('');
        setSubmitResult(null);
        setIsSubmitting(false);
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error saving daily log';
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  const previewMarkdown = buildMarkdownLogTemplate(
    todayDateStr,
    today || 'Finished today tasks.',
    learned,
    tomorrow
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/90">
      <div className="relative w-full max-w-xl rounded-md border border-line bg-surface p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h3 className="font-semibold text-text-primary text-base">Daily log</h3>
            <p className="text-xs text-text-muted mt-0.5">
              daily-log/logs/{todayDateStr}.md
            </p>
          </div>

          <div className="flex rounded-sm border border-line p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-2.5 py-0.5 rounded-sm transition-colors ${
                activeTab === 'edit'
                  ? 'bg-surface-raised text-text-primary font-medium'
                  : 'text-text-muted'
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-0.5 rounded-sm transition-colors ${
                activeTab === 'preview'
                  ? 'bg-surface-raised text-text-primary font-medium'
                  : 'text-text-muted'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {submitResult ? (
          <div className="rounded-md border border-line bg-surface-raised p-6 text-center space-y-3">
            <p className="text-status-safe text-sm font-semibold">Log committed</p>
            {submitResult.sha && (
              <p className="text-xs text-text-muted font-mono">{submitResult.sha.slice(0, 12)}</p>
            )}
            {submitResult.url && (
              <a
                href={submitResult.url}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-pill border border-line px-3 py-1.5 text-xs text-text-primary hover:bg-surface"
              >
                View on GitHub
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={handleLogSubmit} className="space-y-4">
            {errorMessage && (
              <div className="rounded-md border border-status-critical bg-surface-raised p-2.5 text-status-critical text-xs">
                {errorMessage}
              </div>
            )}

            {activeTab === 'edit' ? (
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs text-text-muted mb-1">Today (required)</label>
                  <textarea
                    rows={3}
                    value={today}
                    onChange={(e) => setToday(e.target.value)}
                    placeholder="Finished Stripe interview prep."
                    className="w-full rounded-md bg-surface-raised border border-line p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-status-safe"
                  />
                </div>

                <div>
                  <label className="block text-xs text-text-muted mb-1">Learned (optional)</label>
                  <textarea
                    rows={2}
                    value={learned}
                    onChange={(e) => setLearned(e.target.value)}
                    placeholder="Web Push API"
                    className="w-full rounded-md bg-surface-raised border border-line p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-status-safe"
                  />
                </div>

                <div>
                  <label className="block text-xs text-text-muted mb-1">Tomorrow (optional)</label>
                  <input
                    type="text"
                    value={tomorrow}
                    onChange={(e) => setTomorrow(e.target.value)}
                    placeholder="Build notification service"
                    className="w-full rounded-md bg-surface-raised border border-line p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-status-safe"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-line bg-surface-raised p-3 text-xs text-text-primary font-mono whitespace-pre-wrap max-h-56 overflow-y-auto">
                {previewMarkdown}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-line">
              <button
                type="button"
                onClick={onClose}
                className="rounded-pill border border-line px-3 py-1.5 text-xs text-text-muted hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-pill bg-status-critical px-4 py-1.5 text-xs font-semibold text-ink disabled:opacity-50 transition-transform active:scale-[0.98]"
              >
                {isSubmitting ? 'Saving...' : 'Save streak'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
