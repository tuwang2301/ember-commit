'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
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

  // Handle Escape key dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm transition-opacity">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Body */}
      <div className="relative z-10 w-full max-w-xl rounded-md border border-line bg-surface p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h3 className="font-semibold text-text-primary text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-status-safe" />
              <span>Daily Log Entry</span>
            </h3>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              daily-log/logs/{todayDateStr}.md
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-sm border border-line p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm transition-colors ${
                  activeTab === 'edit'
                    ? 'bg-surface-raised text-text-primary font-medium'
                    : 'text-text-muted'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-surface-raised text-text-primary font-medium'
                    : 'text-text-muted'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {submitResult ? (
          <div className="rounded-md border border-line bg-surface-raised p-6 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-status-safe mx-auto" />
            <p className="text-status-safe text-sm font-semibold">Log Committed Successfully</p>
            {submitResult.sha && (
              <p className="text-xs text-text-muted font-mono">SHA: {submitResult.sha.slice(0, 12)}</p>
            )}
            {submitResult.url && (
              <a
                href={submitResult.url}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-pill border border-line px-4 py-1.5 text-xs text-text-primary hover:bg-surface transition-colors font-mono"
              >
                View commit on GitHub →
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={handleLogSubmit} className="space-y-4">
            {errorMessage && (
              <div className="rounded-md border border-status-critical/50 bg-status-critical/10 p-3 text-status-critical text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {activeTab === 'edit' ? (
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs text-text-muted mb-1 font-mono">Today (required)</label>
                  <textarea
                    rows={3}
                    value={today}
                    onChange={(e) => setToday(e.target.value)}
                    placeholder="What did you build or accomplish today?"
                    className="w-full rounded-md bg-surface-raised border border-line p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-status-safe"
                  />
                </div>

                <div>
                  <label className="block text-xs text-text-muted mb-1 font-mono">Learned (optional)</label>
                  <textarea
                    rows={2}
                    value={learned}
                    onChange={(e) => setLearned(e.target.value)}
                    placeholder="Key concepts or tech stack learned"
                    className="w-full rounded-md bg-surface-raised border border-line p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-status-safe"
                  />
                </div>

                <div>
                  <label className="block text-xs text-text-muted mb-1 font-mono">Tomorrow (optional)</label>
                  <input
                    type="text"
                    value={tomorrow}
                    onChange={(e) => setTomorrow(e.target.value)}
                    placeholder="Goal for tomorrow"
                    className="w-full rounded-md bg-surface-raised border border-line p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-status-safe"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-line bg-surface-raised p-4 text-xs text-text-primary font-mono whitespace-pre-wrap max-h-56 overflow-y-auto">
                {previewMarkdown}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-line">
              <button
                type="button"
                onClick={onClose}
                className="rounded-pill border border-line px-4 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-pill bg-status-safe px-5 py-1.5 text-xs font-semibold text-ink disabled:opacity-50 transition-transform active:scale-[0.98]"
              >
                {isSubmitting ? 'Committing...' : 'Commit log'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
