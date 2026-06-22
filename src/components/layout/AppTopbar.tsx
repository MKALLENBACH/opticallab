'use client';

import { Bell, LogOut, Menu, Search, ChevronDown } from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import { useState } from 'react';

interface AppTopbarProps {
  onMenuClick?: () => void;
  userName?: string;
  userEmail?: string;
  labName?: string;
}

function getInitials(name?: string) {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function AppTopbar({ onMenuClick, userName, userEmail, labName }: AppTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const initials = getInitials(userName);

  return (
    <div className="flex h-full w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-300 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.8)] transition-all hover:border-violet-300/30 hover:bg-white/[0.07] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 md:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={21} />
        </button>

        <div className="hidden min-w-0 flex-1 items-center sm:flex">
          <div className="group flex h-11 w-full max-w-[520px] items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/58 px-4 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all hover:border-violet-300/25 hover:bg-slate-950/72">
            <Search size={19} className="flex-shrink-0 text-slate-500 transition-colors group-hover:text-violet-200" />
            <span className="min-w-0 flex-1 truncate text-[0.92rem] font-medium">
              Buscar no sistema...
            </span>
            <span className="hidden rounded-lg border border-white/10 bg-white/[0.035] px-2 py-1 text-[0.72rem] font-semibold text-slate-400 lg:inline">
              Ctrl + K
            </span>
          </div>
        </div>

        {labName && (
          <span className="hidden rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-violet-300 xl:inline-flex">
            {labName}
          </span>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
        <button
          className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-transparent text-slate-300 transition-all hover:border-white/10 hover:bg-white/[0.055] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
          aria-label="Notificações"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[0.65rem] font-bold leading-none text-white shadow-[0_0_18px_rgba(139,92,246,0.85)]">
            3
          </span>
        </button>

        <div className="hidden h-8 w-px bg-white/10 sm:block" />

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((current) => !current)}
            className="flex items-center gap-3 rounded-2xl px-1.5 py-1.5 transition-all hover:bg-white/[0.055] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 sm:pr-3"
            aria-expanded={dropdownOpen}
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f46e5,#8b5cf6)] text-[0.86rem] font-bold text-white shadow-[0_12px_26px_-14px_rgba(139,92,246,1)]">
              {initials}
            </div>
            <div className="hidden min-w-0 flex-col items-start text-left sm:flex">
              <span className="max-w-[180px] truncate text-[0.9rem] font-bold leading-5 text-white">
                {userName || 'Usuário'}
              </span>
              {userEmail && (
                <span className="max-w-[180px] truncate text-[0.76rem] font-medium leading-4 text-slate-400">
                  {userEmail}
                </span>
              )}
            </div>
            <ChevronDown
              size={16}
              className={`hidden text-slate-400 transition-transform duration-200 sm:block ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-[0_24px_80px_-32px_rgba(0,0,0,1)] backdrop-blur-2xl animate-slide-up">
                <div className="border-b border-white/10 px-4 py-4">
                  <p className="truncate text-[0.92rem] font-bold text-white">
                    {userName || 'Usuário'}
                  </p>
                  {userEmail && (
                    <p className="mt-1 truncate text-[0.78rem] font-medium text-slate-400">
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
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-[0.9rem] font-semibold text-red-200 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut size={17} />
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
