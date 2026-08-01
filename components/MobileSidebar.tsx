import React from 'react';
import Image from 'next/image';
import logoImg from '@/public/logo.png';
import { NotificationControl } from './NotificationControl';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  repoName: string;
  timezone: string;
  firstReminderHour: number;
  lastReminderHour: number;
  privateContributionsEnabled: boolean;
  isPublicView: boolean;
  onToggleView: () => void;
  onOpenLogModal: () => void;
  onOpenOnboarding?: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
  onLogout?: () => void;
  onUpdateSettings: (settings: Record<string, unknown>) => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  username,
  repoName,
  timezone,
  firstReminderHour,
  lastReminderHour,
  privateContributionsEnabled,
  isPublicView,
  onToggleView,
  onOpenLogModal,
  onOpenOnboarding,
  onSync,
  isSyncing = false,
  onLogout,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/80 backdrop-blur-sm sm:hidden transition-opacity">
      {/* Backdrop overlay click */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Content */}
      <div className="w-4/5 max-w-sm h-full bg-surface border-l border-line p-5 flex flex-col justify-between overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-2">
              <Image src={logoImg} alt="Ember Commit" width={24} height={24} className="h-6 w-6 object-contain" priority />
              <span className="font-semibold text-text-primary text-sm uppercase tracking-wide">
                Ember Commit
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-raised"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Profile Info */}
          <div className="rounded-md border border-line bg-surface-raised p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-status-safe/20 border border-status-safe flex items-center justify-center text-status-safe font-mono font-bold text-sm uppercase">
              {username.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-primary truncate">@{username}</p>
              <p className="text-[11px] text-text-muted font-mono truncate">
                {repoName} · {timezone}
              </p>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                onOpenLogModal();
                onClose();
              }}
              className="w-full rounded-pill bg-status-safe px-4 py-2.5 text-xs font-semibold text-ink transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Write Daily Log</span>
            </button>

            <a
              href="/"
              onClick={onClose}
              className="w-full rounded-pill border border-line bg-surface-raised px-4 py-2 text-xs font-medium text-text-primary hover:bg-line transition-colors flex items-center gap-2"
            >
              <span>🏠</span>
              <span>Dashboard Home</span>
            </a>

            <a
              href="/settings"
              onClick={onClose}
              className="w-full rounded-pill border border-line bg-surface-raised px-4 py-2 text-xs font-medium text-text-primary hover:bg-line transition-colors flex items-center gap-2"
            >
              <span>⚙️</span>
              <span>Settings & Notifications</span>
            </a>

            <a
              href="/portfolio"
              onClick={onClose}
              className="w-full rounded-pill border border-line bg-surface-raised px-4 py-2 text-xs font-medium text-text-primary hover:bg-line transition-colors flex items-center gap-2"
            >
              <span>💼</span>
              <span>Public Portfolio View</span>
            </a>

            {onSync && (
              <button
                type="button"
                onClick={() => {
                  onSync();
                  onClose();
                }}
                disabled={isSyncing}
                className="w-full rounded-pill border border-line px-4 py-2 text-xs text-text-muted hover:text-text-primary disabled:opacity-50 text-left flex items-center gap-2"
              >
                <span>↻</span>
                <span>{isSyncing ? 'Syncing...' : 'Sync GitHub Data'}</span>
              </button>
            )}
          </div>

          {/* Settings Section */}
          <div className="space-y-3 pt-3 border-t border-line">
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Settings & Reminders
            </h4>
            <NotificationControl
              timezone={timezone}
              firstReminderHour={firstReminderHour}
              lastReminderHour={lastReminderHour}
              privateContributionsEnabled={privateContributionsEnabled}
              onUpdateSettings={onUpdateSettings}
            />
          </div>
        </div>

        {/* Footer / Logout */}
        {onLogout && (
          <div className="pt-4 border-t border-line">
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full rounded-pill border border-status-critical/30 bg-status-critical/10 px-4 py-2 text-xs font-medium text-status-critical hover:bg-status-critical/20 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
