'use client';

import { useState } from 'react';
import { AppShell } from './AppShell';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { UserRole } from '@/lib/types/enums';
import { X } from 'lucide-react';
import { Glasses } from 'lucide-react';

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

  return (
    <>
      <AppShell
        sidebar={
          <AppSidebar
            role={role}
            labLogoUrl={labLogoUrl}
            labName={labName}
          />
        }
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

      {/* ── Mobile Sidebar Drawer ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer panel */}
          <div
            className="relative flex w-72 max-w-[85vw] flex-col shadow-2xl animate-slide-left"
            style={{ background: 'var(--sidebar-bg)' }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full
                         text-white/50 hover:text-white hover:bg-white/10
                         transition-colors"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>

            {/* Sidebar reused */}
            <div className="flex-1 overflow-y-auto">
              <AppSidebar
                role={role}
                labLogoUrl={labLogoUrl}
                labName={labName}
                onNavClick={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
