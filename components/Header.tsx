'use client';

import React from 'react';

interface HeaderProps {
  username: string;
  repoName: string;
  timezone: string;
  onOpenLogModal: () => void;
  onOpenOnboarding?: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
  onLogout?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  username,
  repoName,
  timezone,
  onOpenLogModal,
  onOpenOnboarding,
  onSync,
  isSyncing = false,
  onLogout,
  onOpenMobileMenu,
}) => {
  return (
    <header className="border-b border-line bg-surface px-4 sm:px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Ember Commit" className="h-6 w-6 object-contain" />
          <div>
            <h1 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
              Ember Commit
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              @{username} · <span className="hidden xs:inline">{repoName} · </span>{timezone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSync && (
            <button
              type="button"
              onClick={onSync}
              disabled={isSyncing}
              className="hidden sm:inline-flex rounded-pill border border-line px-3 py-1.5 text-xs text-text-muted hover:text-text-primary disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : 'Sync'}
            </button>
          )}

          {onOpenOnboarding && (
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="hidden sm:inline-flex rounded-pill border border-line px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              Setup
            </button>
          )}

          <button
            type="button"
            onClick={onOpenLogModal}
            className="rounded-pill border border-line px-3 py-1.5 text-xs text-text-primary hover:bg-surface-raised transition-colors"
          >
            Write log
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="hidden sm:inline-flex rounded-pill border border-line px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              Sign out
            </button>
          )}

          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Open Mobile Menu"
              className="sm:hidden p-1.5 rounded-md border border-line text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
