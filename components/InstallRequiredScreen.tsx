'use client';

import React from 'react';

interface InstallRequiredScreenProps {
  username: string;
}

export const InstallRequiredScreen: React.FC<InstallRequiredScreenProps> = ({
  username,
}) => {
  return (
    <div className="min-h-[100dvh] bg-ink flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-text-primary">
            Install on your log repo
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Signed in as <span className="text-text-primary font-mono">@{username}</span>.
            Install the GitHub App on your daily-log repository to start committing logs.
          </p>
        </div>

        <a
          href="/api/auth/install"
          className="inline-flex w-full items-center justify-center rounded-pill bg-status-critical px-5 py-3 text-sm font-semibold text-ink transition-transform active:scale-[0.98] hover:brightness-110"
        >
          Install GitHub App
        </a>

        <form action="/api/auth/logout" method="GET">
          <button
            type="submit"
            className="text-xs text-text-muted hover:text-text-primary underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
};
