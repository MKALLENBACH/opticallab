import { createClient } from '@/lib/supabase/server';
import { Package, Clock, CheckCircle, ArrowUpRight, ClipboardList } from 'lucide-react';
import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export const metadata = { title: 'Painel da Ótica | LenteLink' };

export default async function StoreDashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('optical_store_id')
    .eq('auth_user_id', userData.user.id)
    .single();

  const storeId = profile?.optical_store_id;

  if (!storeId) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-[var(--color-text-muted)]">Ótica não encontrada para o seu usuário.</p>
      </div>
    );
  }

  const [
    { count: totalOrdersCount },
    { count: pendingOrdersCount },
    { count: finishedOrdersCount },
    { data: recentOrders }
  ] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('optical_store_id', storeId),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('optical_store_id', storeId).eq('status', 'aguardando_confirmacao'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('optical_store_id', storeId).eq('status', 'finalizado'),
    supabase.from('orders').select('id, order_number, status, created_at').eq('optical_store_id', storeId).order('created_at', { ascending: false }).limit(5)
  ]);

  const metrics = [
    {
      title: 'Pedidos em Aberto',
      value: pendingOrdersCount ?? 0,
      icon: Clock,
      gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
      accent: 'accent-warning',
      urgent: (pendingOrdersCount ?? 0) > 0,
    },
    {
      title: 'Pedidos Finalizados',
      value: finishedOrdersCount ?? 0,
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg,#10b981,#059669)',
      accent: 'accent-success',
    },
    {
      title: 'Total de Pedidos',
      value: totalOrdersCount ?? 0,
      icon: Package,
      gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      accent: 'accent-primary',
    },
  ];

  const formatStatus = (status: string) => {
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
            <h2>Painel da Ótica</h2>
            <p>Acompanhe o status dos seus pedidos com o laboratório.</p>
          </div>
          <Link
            href="/store/search"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)]
                       text-sm font-semibold text-white transition-all hover:opacity-90
                       active:scale-[0.97] flex-shrink-0"
            style={{ background: 'var(--gradient-primary)' }}
          >
            Buscar lentes <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
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

      {/* ── Recent orders ── */}
      <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <ClipboardList size={14} className="text-white" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--color-text-base)]">
              Últimos pedidos
            </h3>
          </div>
          <Link href="/store/orders" className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
            Ver todos
          </Link>
        </div>
        <ResponsiveDataTable
          data={recentOrders || []}
          keyExtractor={(row) => row.id}
          columns={[
            { header: 'Nº Pedido', accessor: 'order_number', className: 'font-semibold font-mono' },
            { header: 'Status', accessor: (row) => formatStatus(row.status) },
            { header: 'Data', accessor: (row) => new Date(row.created_at).toLocaleDateString('pt-BR'), align: 'right' },
          ]}
          emptyMessage="Você ainda não possui pedidos registrados."
        />
      </div>
    </div>
  );
}
