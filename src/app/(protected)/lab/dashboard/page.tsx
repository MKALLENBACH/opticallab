import { createClient } from '@/lib/supabase/server';
import {
  Package, Store, ClipboardList, Glasses,
  AlertTriangle, ArrowUpRight, TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export const metadata = { title: 'Dashboard — Laboratório | LenteLink' };

export default async function LabDashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('lab_id, full_name')
    .eq('auth_user_id', userData.user.id)
    .single();

  const labId = profile?.lab_id;
  if (!labId) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-[var(--color-text-muted)]">Laboratório não encontrado.</p>
      </div>
    );
  }

  const [
    { count: storesCount },
    { count: ordersCount },
    { count: pendingCount },
    { count: stockCount },
    { data: pendingOrders },
    { data: lowStock },
  ] = await Promise.all([
    supabase.from('optical_stores').select('id', { count: 'exact', head: true }).eq('lab_id', labId),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('lab_id', labId),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('lab_id', labId).eq('status', 'aguardando_confirmacao'),
    supabase.from('lens_variants').select('id', { count: 'exact', head: true }).eq('lab_id', labId).gt('quantity_available', 0),
    supabase.from('orders')
      .select('id, order_number, status, created_at, optical_stores(name)')
      .eq('lab_id', labId)
      .eq('status', 'aguardando_confirmacao')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('lens_variants')
      .select('id, sku, quantity_available, minimum_stock, lens_types(name)')
      .eq('lab_id', labId)
      .not('minimum_stock', 'is', null)
      .limit(5),
  ]);

  const metrics = [
    {
      title: 'Óticas Parceiras',
      value: storesCount ?? 0,
      icon: Store,
      gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      accent: 'accent-primary',
      href: '/lab/optical-stores',
    },
    {
      title: 'Pedidos Pendentes',
      value: pendingCount ?? 0,
      icon: AlertTriangle,
      gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
      accent: 'accent-warning',
      href: '/lab/orders',
      urgent: (pendingCount ?? 0) > 0,
    },
    {
      title: 'Total de Pedidos',
      value: ordersCount ?? 0,
      icon: ClipboardList,
      gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
      accent: 'accent-accent',
      href: '/lab/orders',
    },
    {
      title: 'Itens em Estoque',
      value: stockCount ?? 0,
      icon: Glasses,
      gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)',
      accent: 'accent-info',
      href: '/lab/stock',
    },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'error' | 'default' }> = {
      aguardando_confirmacao: { label: 'Aguardando', variant: 'warning' },
      confirmado: { label: 'Confirmado', variant: 'info' },
      em_producao: { label: 'Em produção', variant: 'info' },
      em_entrega: { label: 'Em entrega', variant: 'default' },
      finalizado: { label: 'Finalizado', variant: 'success' },
      cancelado: { label: 'Cancelado', variant: 'error' },
    };
    const { label, variant } = map[status] ?? { label: status, variant: 'default' as const };
    return <Badge variant={variant} dot>{label}</Badge>;
  };

  return (
    <div className="space-y-8 animate-slide-up">

      {/* ── Header ── */}
      <div className="page-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2>Dashboard do Laboratório</h2>
            <p>Acompanhe pedidos, estoque e parceiros em tempo real.</p>
          </div>
          <Link
            href="/lab/orders"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)]
                       text-sm font-semibold text-white transition-all hover:opacity-90
                       active:scale-[0.97] flex-shrink-0"
            style={{ background: 'var(--gradient-primary)' }}
          >
            Ver pedidos <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Metrics ── */}
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
                <p className={`text-3xl font-bold tracking-tight ${m.urgent ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-base)]'}`}>
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

      {/* ── Bottom grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Últimos pedidos pendentes */}
        <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}
              >
                <ClipboardList size={14} className="text-white" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--color-text-base)]">
                Pedidos aguardando confirmação
              </h3>
            </div>
            <Link href="/lab/orders" className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
              Ver todos
            </Link>
          </div>

          {!pendingOrders?.length ? (
            <div className="px-6 py-10 flex flex-col items-center justify-center text-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                style={{ background: 'var(--color-success-bg)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-base)]">Tudo em dia!</p>
              <p className="text-[0.8125rem] text-[var(--color-text-muted)]">Nenhum pedido aguardando confirmação.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {pendingOrders.map((order: any) => (
                <li key={order.id} className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--color-bg-surface-2)] transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text-base)] truncate">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                      {(order.optical_stores as any)?.name ?? '—'}
                    </p>
                  </div>
                  {statusBadge(order.status)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <TrendingUp size={14} className="text-white" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--color-text-base)]">Ações rápidas</h3>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {[
              { label: 'Cadastrar nova ótica', href: '/lab/optical-stores/new', icon: Store },
              { label: 'Adicionar lente ao catálogo', href: '/lab/lens-types/new', icon: Glasses },
              { label: 'Adicionar SKU ao estoque', href: '/lab/stock/new', icon: Package },
              { label: 'Ver todos os pedidos', href: '/lab/orders', icon: ClipboardList },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)]
                             border border-[var(--color-border)] text-sm font-medium
                             text-[var(--color-text-base)] transition-all duration-150
                             hover:bg-[var(--color-bg-surface-2)] hover:border-[var(--color-primary-light)]
                             hover:shadow-[var(--shadow-sm)]"
                >
                  <Icon size={15} className="text-[var(--color-primary)] flex-shrink-0" />
                  <span className="flex-1 truncate">{action.label}</span>
                  <ArrowUpRight size={13} className="text-[var(--color-text-muted)] flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
