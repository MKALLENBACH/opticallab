import React from 'react';

interface AppShellProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, topbar, children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-base)]">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        {sidebar}
      </div>

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex-shrink-0 flex items-center bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] px-4 sm:px-6 lg:px-8 z-10 shadow-sm">
          {topbar}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in relative">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
