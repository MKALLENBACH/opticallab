import React from 'react';

interface AppShellProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, topbar, children }: AppShellProps) {
  return (
    <div className="relative flex h-screen overflow-hidden bg-[#050712] text-[var(--color-text-base)]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_34%),radial-gradient(circle_at_78%_8%,rgba(139,92,246,0.13),transparent_30%),linear-gradient(180deg,#050712_0%,#080b18_48%,#050712_100%)]" />

      <aside className="relative z-20 hidden w-[280px] flex-shrink-0 border-r border-white/10 md:flex md:flex-col">
        {sidebar}
      </aside>

      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-[72px] flex-shrink-0 items-center border-b border-white/10 bg-slate-950/72 shadow-[0_12px_42px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
          {topbar}
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto flex min-h-full w-full max-w-[1560px] flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="flex-1 animate-fade-in">
              {children}
            </div>

            <footer className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-5 text-[0.82rem] font-medium text-white/38 sm:flex-row sm:items-center sm:justify-between">
              <span>© {new Date().getFullYear()} LenteLink. Todos os direitos reservados.</span>
              <span>Versão 1.0.0</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
