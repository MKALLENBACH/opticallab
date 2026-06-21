import { createClient } from '@/lib/supabase/server';
import { Activity, Beaker, Users, ClipboardList, TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Dashboard — Admin Global | OpticaLab' };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: labsCount },
    { count: usersCount },
    { count: ordersCount },
    { count: storesCount },
  ] = await Promise.all([
    supabase.from('labs').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('optical_stores').select('id', { count: 'exact', head: true }),
  ]);

  const metrics = [
    {
      title: 'Laboratórios Ativos',
      value: labsCount ?? 0,
      icon: Beaker,
      gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      accent: 'accent-primary',
      href: '/admin/labs',
      change: null,
    },
    {
      title: 'Usuários na Plataforma',
      value: usersCount ?? 0,
      icon: Users,
      gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
      accent: 'accent-accent',
      href: '/admin/users',
      change: null,
    },
    {
      title: 'Pedidos Transacionados',
      value: ordersCount ?? 0,
      icon: ClipboardList,
      gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)',
      accent: 'accent-info',
      href: null,
      change: null,
    },
    {
      title: 'Óticas Cadastradas',
      value: storesCount ?? 0,
      icon: Activity,
      gradient: 'linear-gradient(135deg,#10b981,#059669)',
      accent: 'accent-success',
      href: null,
      change: null,
    },
  ];

  return (
    <div className="space-y-8 animate-slide-up">

      {/* ── Page header ── */}
      <div className="page-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2>Dashboard Administrativo</h2>
            <p>Visão global de todos os laboratórios e usuários da plataforma.</p>
          </div>
          <Link
            href="/admin/labs/new"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)]
                       text-sm font-semibold text-white transition-all hover:shadow-[var(--shadow-glow)]
                       hover:opacity-90 active:scale-[0.97] flex-shrink-0"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <span>+ Novo laboratório</span>
          </Link>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-children">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={i}
              className={`stat-card-accent ${m.accent} bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)]
                         border border-[var(--color-border)] p-6 flex items-start justify-between gap-4
                         transition-all duration-200 hover:shadow-[var(--shadow-lg)] hover:-translate-y-px
                         animate-slide-up`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[0.8125rem] font-medium text-[var(--color-text-muted)] leading-none mb-3">
                  {m.title}
                </p>
                <p className="text-3xl font-bold tracking-tight text-[var(--color-text-base)]">
                  {m.value.toLocaleString('pt-BR')}
                </p>
                {m.href && (
                  <Link
                    href={m.href}
                    className="inline-flex items-center gap-1 mt-3 text-xs font-semibold"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Ver detalhes <ArrowUpRight size={11} />
                  </Link>
                )}
              </div>
              <div
                className="w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center flex-shrink-0"
                style={{ background: m.gradient }}
              >
                <Icon size={20} className="text-white" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Info row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status */}
        <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
            >
              <Activity size={16} className="text-white" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-text-base)]">Status do Sistema</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Banco de dados', status: 'Operacional' },
              { label: 'Autenticação', status: 'Operacional' },
              { label: 'Storage', status: 'Operacional' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                <span className="text-sm text-[var(--color-text-muted)]">{s.label}</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-success)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] inline-block" />
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <TrendingUp size={16} className="text-white" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-text-base)]">Ações rápidas</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Novo laboratório', href: '/admin/labs/new' },
              { label: 'Novo usuário', href: '/admin/users/new' },
              { label: 'Ver laboratórios', href: '/admin/labs' },
              { label: 'Ver usuários', href: '/admin/users' },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-lg)]
                           border border-[var(--color-border)] text-sm font-medium
                           text-[var(--color-text-base)] transition-all duration-150
                           hover:bg-[var(--color-bg-surface-2)] hover:border-[var(--color-border-hover)]
                           hover:shadow-[var(--shadow-sm)]"
              >
                {action.label}
                <ArrowUpRight size={14} className="text-[var(--color-text-muted)]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
