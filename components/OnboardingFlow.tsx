'use client';

import React, { useState } from 'react';

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: () => void;
  username: string;
  repoName: string;
  timezone: string;
  privateContributionsEnabled: boolean;
  currentStreak?: number;
  onUpdateSettings: (settings: Record<string, unknown>) => Promise<void>;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isOpen,
  onComplete,
  username,
  repoName,
  timezone,
  privateContributionsEnabled,
  currentStreak = 0,
  onUpdateSettings,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedRepo, setSelectedRepo] = useState(repoName || 'daily-log');
  const [firstHour, setFirstHour] = useState(18);
  const [lastHour, setLastHour] = useState(22);
  const [incPrivate, setIncPrivate] = useState(privateContributionsEnabled);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleNextStep = async () => {
    if (step < 4) {
      setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
      return;
    }

    setIsSaving(true);
    await onUpdateSettings({
      repoName: selectedRepo,
      firstReminderHour: firstHour,
      lastReminderHour: lastHour,
      privateContributionsEnabled: incPrivate,
    });
    setIsSaving(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/90">
      <div className="relative w-full max-w-lg rounded-md border border-line bg-surface p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h3 className="font-semibold text-text-primary text-sm">Setup ({step}/4)</h3>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <span
                key={s}
                className={`h-1 w-6 rounded-sm transition-colors ${
                  s <= step ? 'bg-status-safe' : 'bg-line'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-3 text-sm">
            <h4 className="text-base font-semibold text-text-primary">Install on your log repo</h4>
            <p className="text-text-muted leading-relaxed">
              The GitHub App writes only to <span className="font-mono text-text-primary">{selectedRepo}/logs/*.md</span>.
              It cannot access your other repositories.
            </p>
            <div>
              <label className="block text-xs text-text-muted mb-1">Repository name</label>
              <input
                type="text"
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full rounded-md bg-surface-raised border border-line p-2.5 text-sm text-text-primary focus:outline-none focus:border-status-safe"
              />
            </div>
            <a
              href="/api/auth/install"
              className="inline-flex rounded-pill border border-line px-3 py-1.5 text-xs text-text-primary hover:bg-surface-raised"
            >
              Re-install or change repo
            </a>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 text-sm">
            <h4 className="text-base font-semibold text-text-primary">Reminder schedule</h4>
            <p className="text-text-muted leading-relaxed">
              Push reminders use your timezone ({timezone}). You get an early check-in and a final
              reminder if you still have zero contributions.
            </p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span>First reminder</span>
                  <span className="font-mono text-text-primary">{firstHour}:00</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={21}
                  value={firstHour}
                  onChange={(e) => setFirstHour(parseInt(e.target.value))}
                  className="w-full accent-status-safe"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span>Last reminder</span>
                  <span className="font-mono text-status-critical">{lastHour}:00</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={23}
                  value={lastHour}
                  onChange={(e) => setLastHour(parseInt(e.target.value))}
                  className="w-full accent-status-critical"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm">
            <h4 className="text-base font-semibold text-text-primary">Private contributions</h4>
            <p className="text-text-muted leading-relaxed">
              If &quot;Include private contributions on profile&quot; is off on GitHub, private
              activity will not show on your graph and the app may think your streak is at risk.
            </p>
            <label className="flex items-center justify-between rounded-md border border-line bg-surface-raised p-3 cursor-pointer">
              <span className="text-text-primary">Private contributions enabled on GitHub</span>
              <input
                type="checkbox"
                checked={incPrivate}
                onChange={(e) => setIncPrivate(e.target.checked)}
                className="rounded accent-status-safe"
              />
            </label>
            {!incPrivate && (
              <p className="text-xs text-status-at-risk rounded-md border border-line bg-surface-raised p-2.5">
                Turn this on in GitHub profile settings to avoid false alerts.
              </p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3 text-sm text-center py-2">
            <p className="text-status-safe text-2xl font-mono font-semibold">{currentStreak} days</p>
            <h4 className="text-base font-semibold text-text-primary">You are set up</h4>
            <p className="text-text-muted leading-relaxed max-w-sm mx-auto">
              Connected to <span className="font-mono text-text-primary">{selectedRepo}</span>.
              Reminders at {firstHour}:00 and {lastHour}:00 if today has no contributions.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-line">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
              className="rounded-pill border border-line px-3 py-1.5 text-xs text-text-muted hover:text-text-primary"
            >
              Back
            </button>
          ) : (
            <span className="text-xs text-text-muted">Under 1 minute</span>
          )}

          <button
            type="button"
            onClick={handleNextStep}
            disabled={isSaving}
            className="rounded-pill bg-status-critical px-4 py-1.5 text-xs font-semibold text-ink disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : step === 4 ? 'Open dashboard' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
