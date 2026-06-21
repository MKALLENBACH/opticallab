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
  labName?: string;
  labLogoUrl?: string | null;
}

export function ClientLayoutWrapper({
  children,
  role,
  userName,
  labName,
  labLogoUrl,
}: ClientLayoutWrapperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <AppShell
        sidebar={<AppSidebar role={role} labLogoUrl={labLogoUrl} />}
        topbar={
          <AppTopbar
            title="OpticaLab"
            userName={userName}
            labName={labName}
            onMenuClick={() => setIsMobileMenuOpen(true)}
          />
        }
      >
        {children}
      </AppShell>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-[var(--color-bg-surface)] shadow-xl animate-fade-in">
            <div className="absolute right-0 top-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            
            {/* Re-use Sidebar for Mobile (needs to handle click to close on nav, but for now this works) */}
            <div className="flex-1 h-0 overflow-y-auto" onClick={() => setIsMobileMenuOpen(false)}>
              <AppSidebar role={role} labLogoUrl={labLogoUrl} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
