'use client';

import { Menu, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { logoutAction } from '@/actions/auth';

interface AppTopbarProps {
  onMenuClick?: () => void;
  title?: string;
  userName?: string;
  labName?: string;
}

export function AppTopbar({ onMenuClick, title = 'OpticaLab', userName, labName }: AppTopbarProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] rounded-md hover:bg-[var(--color-bg-surface-hover)] transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
        
        <h1 className="text-xl font-semibold text-[var(--color-text-base)] truncate">
          {title}
        </h1>
        
        {labName && (
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[var(--color-bg-base)] text-sm font-medium text-[var(--color-text-muted)] ml-2">
            {labName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <User size={16} />
          <span>{userName || 'Usuário'}</span>
        </div>
        
        <form action={logoutAction}>
          <Button variant="ghost" size="sm" type="submit" title="Sair do sistema">
            <LogOut size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
