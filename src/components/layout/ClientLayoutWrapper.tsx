'use client';

import { useState } from 'react';
import { AppShell } from './AppShell';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { UserRole } from '@/lib/types/enums';
import { X } from 'lucide-react';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  role: UserRole;
  userName: string;
  userEmail?: string;
  labName?: string;
  labLogoUrl?: string | null;
}

export function ClientLayoutWrapper({
  children,
  role,
  userName,
  userEmail,
  labName,
  labLogoUrl,
}: ClientLayoutWrapperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebar = (
    <AppSidebar
      role={role}
      labLogoUrl={labLogoUrl}
      labName={labName}
      userName={userName}
      userEmail={userEmail}
    />
  );

  return (
    <>
      <AppShell
        sidebar={sidebar}
        topbar={
          <AppTopbar
            userName={userName}
            userEmail={userEmail}
            labName={labName}
            onMenuClick={() => setIsMobileMenuOpen(true)}
          />
        }
      >
        {children}
      </AppShell>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div
            className="relative flex w-[280px] max-w-[88vw] flex-col border-r border-white/10 shadow-2xl animate-slide-left"
            style={{ background: 'rgba(2, 6, 23, 0.96)' }}
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>

            <div className="flex-1 overflow-y-auto">
              <AppSidebar
                role={role}
                labLogoUrl={labLogoUrl}
                labName={labName}
                userName={userName}
                userEmail={userEmail}
                onNavClick={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
