'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  ClipboardList,
  Settings,
  ShieldCheck,
  Glasses,
  ChevronRight,
} from 'lucide-react';
import { UserRole } from '@/lib/types/enums';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface AppSidebarProps {
  role: UserRole;
  labLogoUrl?: string | null;
  labName?: string;
  onNavClick?: () => void;
}

export function AppSidebar({ role, labLogoUrl, labName, onNavClick }: AppSidebarProps) {
  const pathname = usePathname();

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case UserRole.PLATFORM_ADMIN:
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Laboratórios', href: '/admin/labs', icon: ShieldCheck },
          { name: 'Usuários Globais', href: '/admin/users', icon: Users },
        ];
      case UserRole.LAB_ADMIN:
      case UserRole.LAB_USER:
        return [
          { name: 'Dashboard', href: '/lab/dashboard', icon: LayoutDashboard },
          { name: 'Óticas', href: '/lab/optical-stores', icon: Store },
          { name: 'Pedidos', href: '/lab/orders', icon: ClipboardList },
          { name: 'Catálogo de Lentes', href: '/lab/lens-types', icon: Glasses },
          { name: 'Estoque (SKUs)', href: '/lab/stock', icon: Package },
          ...(role === UserRole.LAB_ADMIN
            ? [{ name: 'Configurações', href: '/lab/settings', icon: Settings }]
            : []),
        ];
      case UserRole.OPTICAL_ADMIN:
      case UserRole.OPTICAL_USER:
        return [
          { name: 'Dashboard', href: '/store/dashboard', icon: LayoutDashboard },
          { name: 'Buscar Lentes', href: '/store/search', icon: Package },
          { name: 'Meus Pedidos', href: '/store/orders', icon: ClipboardList },
          ...(role === UserRole.OPTICAL_ADMIN
            ? [{ name: 'Configurações', href: '/store/settings', icon: Settings }]
            : []),
        ];
      default:
        return [];
    }
  };

  const items = getNavItems();

  const roleLabel: Record<string, string> = {
    platform_admin: 'Plataforma Global',
    lab_admin: 'Laboratório',
    lab_user: 'Laboratório',
    optical_admin: 'Ótica',
    optical_user: 'Ótica',
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      {/* ── Brand ── */}
      <div
        className="h-16 flex items-center px-5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
      >
        {labLogoUrl ? (
          <img src={labLogoUrl} alt="Logo" className="h-8 max-w-[160px] object-contain" />
        ) : (
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Glasses size={16} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-[0.9375rem] tracking-tight">
                OpticaLab
              </span>
              <p className="text-[0.65rem] font-medium leading-none mt-0.5" style={{ color: 'var(--sidebar-text)' }}>
                {labName || roleLabel[role] || 'Sistema'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150 relative"
              style={{
                color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                borderLeft: isActive
                  ? '2px solid var(--sidebar-active-border)'
                  : '2px solid transparent',
              }}
            >
              <Icon
                size={17}
                className="flex-shrink-0 transition-transform duration-150 group-hover:scale-110"
                style={{
                  color: isActive ? 'var(--color-primary)' : 'var(--sidebar-text)',
                }}
              />
              <span className="truncate flex-1">{item.name}</span>
              {isActive && (
                <ChevronRight size={14} style={{ color: 'var(--color-primary)', opacity: 0.7 }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer badge ── */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--sidebar-border)' }}
      >
        <div
          className="rounded-[var(--radius-md)] px-3 py-2"
          style={{ background: 'var(--sidebar-surface)' }}
        >
          <p className="text-[0.6875rem] font-semibold uppercase tracking-widest" style={{ color: 'var(--sidebar-text)', opacity: 0.5 }}>
            Perfil ativo
          </p>
          <p className="text-[0.8125rem] font-medium mt-0.5" style={{ color: 'var(--sidebar-text)' }}>
            {roleLabel[role] || role}
          </p>
        </div>
      </div>
    </div>
  );
}
