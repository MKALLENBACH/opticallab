import React from 'react';

interface AppShellProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, topbar, children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg-base)' }}>

      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden md:flex md:flex-col w-60 lg:w-64 flex-shrink-0">
        {sidebar}
      </aside>

      {/* ── Main Column ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Topbar ── */}
        <header
          className="h-14 flex-shrink-0 flex items-center z-10"
          style={{
            background: 'var(--color-bg-surface)',
            borderBottom: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {topbar}
        </header>

        {/* ── Scrollable Content ── */}
        <main className="flex-1 overflow-y-auto animate-fade-in">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
