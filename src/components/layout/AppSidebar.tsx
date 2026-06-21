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
  Glasses
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
}

export function AppSidebar({ role, labLogoUrl }: AppSidebarProps) {
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
          { name: 'Usuários', href: '/lab/users', icon: Users },
          ...(role === UserRole.LAB_ADMIN ? [{ name: 'Configurações', href: '/lab/settings', icon: Settings }] : []),
        ];
      case UserRole.OPTICAL_ADMIN:
      case UserRole.OPTICAL_USER:
        return [
          { name: 'Dashboard', href: '/optical/dashboard', icon: LayoutDashboard },
          { name: 'Fazer Pedido', href: '/optical/search', icon: Package },
          { name: 'Meus Pedidos', href: '/optical/orders', icon: ClipboardList },
          ...(role === UserRole.OPTICAL_ADMIN ? [{ name: 'Configurações', href: '/optical/settings', icon: Settings }] : []),
        ];
      default:
        return [];
    }
  };

  const items = getNavItems();

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-surface)] border-r border-[var(--color-border)]">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)]">
        {labLogoUrl ? (
          <img src={labLogoUrl} alt="Logo" className="h-8 max-w-full object-contain" />
        ) : (
          <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xl">
            <Glasses size={24} />
            <span>OpticaLab</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive 
                  ? 'bg-[var(--color-primary)] text-white' 
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-hover)] hover:text-[var(--color-text-base)]'
                }
              `}
            >
              <Icon 
                className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-base)]'}`} 
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
