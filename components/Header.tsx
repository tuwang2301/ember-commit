'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutDashboard, Settings, Briefcase, RefreshCw, LogOut, Plus, Menu } from 'lucide-react';

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
        {/* Brand & User Profile Info */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Ember Commit" width={24} height={24} className="h-6 w-6 object-contain" priority />
            <h1 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
              Ember Commit
            </h1>
          </Link>

          {username && (
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-text-muted border-l border-line pl-4">
              <span className="text-text-primary font-medium">@{username}</span>
              <span>·</span>
              <span>{repoName}</span>
              <span>·</span>
              <span>{timezone}</span>
            </div>
          )}
        </div>

        {/* Desktop Navigation Links & Action Controls */}
        <div className="flex items-center gap-2">
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 mr-2 border-r border-line pr-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium text-text-primary hover:bg-surface-raised transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-status-safe" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Link>
            <Link
              href="/portfolio"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Portfolio</span>
            </Link>
          </nav>

          {onSync && (
            <button
              type="button"
              onClick={onSync}
              disabled={isSyncing}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-pill border border-line px-3 py-1.5 text-xs text-text-muted hover:text-text-primary disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing' : 'Sync'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenLogModal}
            className="rounded-pill bg-status-safe px-3.5 py-1.5 text-xs font-semibold text-ink flex items-center gap-1.5 active:scale-[0.98] transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write log</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-pill border border-line px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          )}

          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Open Mobile Menu"
              className="md:hidden p-1.5 rounded-md border border-line text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
