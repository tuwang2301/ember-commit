'use client';

import React from 'react';

interface LoginScreenProps {
  authError?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ authError }) => {
  return (
    <div className="min-h-[100dvh] bg-ink flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-text-primary">
            Ember Commit
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Protect your GitHub contribution streak with meaningful daily micro-journal entries.
          </p>
        </div>

        {authError && (
          <div className="rounded-md border border-status-critical bg-surface p-3 text-xs text-status-critical">
            Sign-in failed: {authError.replace(/_/g, ' ')}
          </div>
        )}

        <a
          href="/api/auth/github"
          className="inline-flex w-full items-center justify-center rounded-pill bg-status-critical px-5 py-3 text-sm font-semibold text-ink transition-transform active:scale-[0.98] hover:brightness-110"
        >
          Sign in with GitHub
        </a>

        <p className="text-xs text-text-muted">
          The app only requests access to the repository you choose. It cannot
          read or write your other repos.
        </p>
      </div>
    </div>
  );
};
