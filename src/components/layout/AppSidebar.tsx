'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  LogOut,
} from 'lucide-react';
import { UserRole } from '@/lib/types/enums';
import { Logo } from '@/components/ui/Logo';
import { logoutAction } from '@/actions/auth';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface AppSidebarProps {
  role: UserRole;
  labLogoUrl?: string | null;
  labName?: string;
  userName?: string;
  userEmail?: string;
  onNavClick?: () => void;
}

const roleLabel: Record<string, string> = {
  platform_admin: 'Plataforma Global',
  lab_admin: 'Laboratório',
  lab_user: 'Laboratório',
  optical_admin: 'Ótica',
  optical_user: 'Ótica',
};

function getInitials(name?: string) {
  if (!name) return 'LL';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function AppSidebar({
  role,
  labLogoUrl,
  labName,
  userName,
  userEmail,
  onNavClick,
}: AppSidebarProps) {
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
  const workspaceName = labName || roleLabel[role] || 'Sistema';

  return (
    <div className="flex h-full flex-col bg-slate-950/80 shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-2xl">
      <div className="px-7 pb-7 pt-7">
        {labLogoUrl ? (
          <Image
            src={labLogoUrl}
            alt="Logo"
            width={190}
            height={36}
            unoptimized
            className="h-9 max-w-[190px] object-contain"
          />
        ) : (
          <Logo variant="full" size="md" light />
        )}
        <p className="mt-3 truncate text-[0.88rem] font-medium text-slate-400">
          {workspaceName}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-5">
        <div className="flex flex-col gap-1.5">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={[
                  'group relative flex min-h-[50px] items-center gap-3 overflow-hidden rounded-2xl px-4 text-[0.96rem] font-semibold transition-all duration-200',
                  isActive
                    ? 'border border-violet-400/35 bg-[linear-gradient(135deg,rgba(79,70,229,0.72),rgba(124,58,237,0.34))] text-white shadow-[0_18px_36px_-24px_rgba(139,92,246,0.95),inset_0_1px_0_rgba(255,255,255,0.12)]'
                    : 'border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.045] hover:text-white',
                ].join(' ')}
              >
                {isActive && (
                  <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-violet-300 shadow-[0_0_18px_rgba(167,139,250,0.8)]" />
                )}
                <span
                  className={[
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-white/12 text-white'
                      : 'bg-transparent text-slate-400 group-hover:bg-white/8 group-hover:text-violet-200',
                  ].join(' ')}
                >
                  <Icon size={19} />
                </span>
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                <ChevronRight
                  size={16}
                  className={[
                    'flex-shrink-0 transition-all duration-200',
                    isActive ? 'translate-x-0 text-violet-100 opacity-90' : '-translate-x-1 text-slate-500 opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
                  ].join(' ')}
                />
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-4 pb-5 pt-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-[0_18px_46px_-34px_rgba(0,0,0,0.9)]">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Perfil ativo
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f46e5,#8b5cf6)] text-[0.82rem] font-bold text-white shadow-[0_12px_24px_-14px_rgba(139,92,246,1)]">
              {getInitials(userName || workspaceName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.9rem] font-bold text-white">
                {userName || workspaceName}
              </p>
              <p className="truncate text-[0.78rem] font-medium text-slate-400">
                {userEmail || roleLabel[role] || role}
              </p>
            </div>
            <ChevronRight size={15} className="rotate-90 text-slate-500" />
          </div>

          <form action={logoutAction} className="mt-4">
            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950/55 text-[0.86rem] font-semibold text-slate-200 transition-all hover:border-red-400/25 hover:bg-red-500/10 hover:text-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
            >
              <LogOut size={17} />
              Sair da conta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
