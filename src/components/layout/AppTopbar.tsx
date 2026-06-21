'use client';

import { Bell, LogOut, Menu, User, ChevronDown } from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import { useState } from 'react';

interface AppTopbarProps {
  onMenuClick?: () => void;
  userName?: string;
  userEmail?: string;
  labName?: string;
}

export function AppTopbar({ onMenuClick, userName, userEmail, labName }: AppTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div className="flex items-center justify-between w-full h-full px-4 sm:px-6">
      {/* ── Left: Hamburger + Breadcrumb ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-1 rounded-[var(--radius-md)] text-[var(--color-text-muted)]
                     hover:text-[var(--color-text-base)] hover:bg-[var(--color-bg-surface-2)]
                     transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        {labName && (
          <div className="hidden sm:flex items-center gap-2">
            <span
              className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
              }}
            >
              {labName}
            </span>
          </div>
        )}
      </div>

      {/* ── Right: Actions + User ── */}
      <div className="flex items-center gap-2">
        {/* Notification bell (visual only for now) */}
        <button
          className="relative p-2 rounded-[var(--radius-md)] text-[var(--color-text-muted)]
                     hover:text-[var(--color-text-base)] hover:bg-[var(--color-bg-surface-2)]
                     transition-colors"
          aria-label="Notificações"
        >
          <Bell size={18} />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[var(--color-border)] mx-1" />

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-[var(--radius-lg)]
                       hover:bg-[var(--color-bg-surface-2)] transition-colors"
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                         text-white text-xs font-bold"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {initials}
            </div>
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-[0.8125rem] font-semibold text-[var(--color-text-base)] leading-tight">
                {userName || 'Usuário'}
              </span>
              {userEmail && (
                <span className="text-[0.7rem] text-[var(--color-text-muted)] leading-tight">
                  {userEmail}
                </span>
              )}
            </div>
            <ChevronDown
              size={14}
              className={`hidden sm:block text-[var(--color-text-muted)] transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div
                className="absolute right-0 top-full mt-1.5 w-52 z-20 rounded-[var(--radius-xl)]
                           border border-[var(--color-border)] shadow-[var(--shadow-xl)] overflow-hidden
                           animate-slide-up"
                style={{ background: 'var(--color-bg-surface)' }}
              >
                <div className="px-4 py-3 border-b border-[var(--color-border)]">
                  <p className="text-[0.8125rem] font-semibold text-[var(--color-text-base)] truncate">
                    {userName}
                  </p>
                  {userEmail && (
                    <p className="text-[0.75rem] text-[var(--color-text-muted)] truncate mt-0.5">
                      {userEmail}
                    </p>
                  )}
                </div>
                <form
                  action={logoutAction}
                  onSubmit={() => setDropdownOpen(false)}
                >
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-4 py-3 text-[0.875rem] font-medium
                               text-[var(--color-error)] hover:bg-[var(--color-error-bg)]
                               transition-colors"
                  >
                    <LogOut size={15} />
                    Sair da conta
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
