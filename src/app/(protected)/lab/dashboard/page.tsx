import { createClient } from '@/lib/supabase/server';
import {
  Package,
  Store,
  ClipboardList,
  Glasses,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Check,
  ChevronRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { formatTimestampDate } from '@/lib/format/date';

export const metadata = { title: 'Dashboard — Laboratório | LenteLink' };

interface MetricItem {
  title: string;
  value: number;
  icon: LucideIcon;
  href: string;
  gradient: string;
  glow: string;
  border: string;
  urgent?: boolean;
}

interface PendingOrderItem {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  optical_store_name: string;
}

interface QuickActionItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

function normalizeRelation<T>(relation: T | T[] | null | undefined): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation ?? null;
}

function DashboardStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      .lab-dashboard-title {
        font-size: clamp(2rem, 3vw, 2.8rem) !important;
        line-height: 1.08 !important;
        letter-spacing: -0.035em;
      }
      .lab-section-title {
        font-size: 1.25rem !important;
        line-height: 1.25 !important;
        letter-spacing: -0.02em;
      }
      .lab-dashboard-copy {
        margin-top: 0.75rem !important;
        line-height: 1.7 !important;
      }
    ` }} />
  );
}

function KpiCard({ metric }: { metric: MetricItem }) {
  const Icon = metric.icon;

  return (
    <Link
      href={metric.href}
      className={[
        'group relative flex min-h-[156px] overflow-hidden rounded-3xl border bg-slate-950/52 p-5 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl transition-all duration-200',
        'hover:-translate-y-1 hover:border-violet-300/35 hover:bg-slate-950/68 hover:shadow-[0_26px_70px_-40px_rgba(99,102,241,0.65)]',
        metric.border,
      ].join(' ')}
    >
      <div className={`pointer-events-none absolute -right-14 -top-16 h-36 w-36 rounded-full blur-3xl ${metric.glow}`} />
      <div className="relative z-10 flex w-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <span className="text-[0.88rem] font-semibold text-slate-300">
            {metric.title}
          </span>
          <span
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_18px_34px_-18px_rgba(99,102,241,0.9)]"
            style={{ background: metric.gradient }}
          >
            <Icon size={22} />
          </span>
        </div>

        <div>
          <p className={`text-[2.45rem] font-extrabold leading-none tracking-tight ${metric.urgent ? 'text-amber-200' : 'text-white'}`}>
            {metric.value.toLocaleString('pt-BR')}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[0.88rem] font-semibold text-indigo-300 transition-colors group-hover:text-white">
            Ver detalhes
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function SectionPanel({
  icon: Icon,
  title,
  action,
  children,
  tone = 'violet',
}: {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  tone?: 'violet' | 'amber';
}) {
  const toneClasses = tone === 'amber'
    ? 'bg-amber-500/12 text-amber-300 shadow-[0_0_28px_rgba(245,158,11,0.16)]'
    : 'bg-violet-500/16 text-violet-200 shadow-[0_0_30px_rgba(139,92,246,0.18)]';

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${toneClasses}`}>
            <Icon size={19} />
          </span>
          <h2 className="lab-section-title truncate font-extrabold text-white">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyOrdersState() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative mb-7">
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-emerald-300/15 bg-emerald-400/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/16 text-emerald-300">
            <Check size={32} strokeWidth={2.5} />
          </div>
        </div>
        <Sparkles size={15} className="absolute -right-2 top-5 text-cyan-300" />
        <Sparkles size={13} className="absolute -left-3 bottom-5 text-amber-300" />
      </div>
      <p className="text-[1.05rem] font-extrabold text-white">
        Tudo em dia!
      </p>
      <p className="mt-3 max-w-sm text-[0.94rem] font-medium text-slate-400">
        Nenhum pedido aguardando confirmação.
      </p>
    </div>
  );
}

function QuickActionCard({ action }: { action: QuickActionItem }) {
  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      className="group flex min-h-[64px] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] px-4 text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300/30 hover:bg-white/[0.055] hover:shadow-[0_18px_44px_-34px_rgba(139,92,246,0.85)]"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500/12 text-violet-300 transition-colors group-hover:bg-violet-500/18 group-hover:text-violet-100">
        <Icon size={19} />
      </span>
      <span className="min-w-0 flex-1 truncate text-[0.96rem] font-semibold">
        {action.label}
      </span>
      <ChevronRight size={19} className="flex-shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-white" />
    </Link>
  );
}

function statusBadge(status: string) {
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
}

export default async function LabDashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('lab_id, full_name, lab:labs(name)')
    .eq('auth_user_id', userData.user.id)
    .single();

  const labId = profile?.lab_id;
  const lab = normalizeRelation(profile?.lab as { name?: string | null } | { name?: string | null }[] | null);
  const labName = lab?.name || 'LenteLab Master';

  if (!labId) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center rounded-3xl border border-white/10 bg-slate-950/50 p-8 text-center">
        <p className="text-[var(--color-text-muted)]">Laboratório não encontrado.</p>
      </div>
    );
  }

  const [
    { count: storesCount },
    { count: ordersCount },
    { count: pendingCount },
    { count: stockCount },
    { data: pendingOrdersRaw },
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
  ]);

  const pendingOrders: PendingOrderItem[] = (pendingOrdersRaw ?? []).map((order) => {
    const store = normalizeRelation(order.optical_stores as { name?: string | null } | { name?: string | null }[] | null);
    return {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      created_at: order.created_at,
      optical_store_name: store?.name || '—',
    };
  });

  const metrics: MetricItem[] = [
    {
      title: 'Óticas Parceiras',
      value: storesCount ?? 0,
      icon: Store,
      gradient: 'linear-gradient(135deg,#4f46e5,#8b5cf6)',
      glow: 'bg-indigo-500/18',
      border: 'border-indigo-400/30',
      href: '/lab/optical-stores',
    },
    {
      title: 'Pedidos Pendentes',
      value: pendingCount ?? 0,
      icon: AlertTriangle,
      gradient: 'linear-gradient(135deg,#f59e0b,#f97316)',
      glow: 'bg-amber-500/16',
      border: 'border-amber-400/24',
      href: '/lab/orders',
      urgent: (pendingCount ?? 0) > 0,
    },
    {
      title: 'Total de Pedidos',
      value: ordersCount ?? 0,
      icon: ClipboardList,
      gradient: 'linear-gradient(135deg,#a855f7,#d946ef)',
      glow: 'bg-fuchsia-500/14',
      border: 'border-fuchsia-400/25',
      href: '/lab/orders',
    },
    {
      title: 'Itens em Estoque',
      value: stockCount ?? 0,
      icon: Glasses,
      gradient: 'linear-gradient(135deg,#2563eb,#3b82f6)',
      glow: 'bg-blue-500/16',
      border: 'border-blue-400/25',
      href: '/lab/stock',
    },
  ];

  const quickActions: QuickActionItem[] = [
    { label: 'Cadastrar nova ótica', href: '/lab/optical-stores/new', icon: Store },
    { label: 'Adicionar lente ao catálogo', href: '/lab/lens-types/new', icon: Glasses },
    { label: 'Adicionar SKU ao estoque', href: '/lab/stock/new', icon: Package },
    { label: 'Ver todos os pedidos', href: '/lab/orders', icon: ClipboardList },
  ];

  return (
    <>
      <DashboardStyles />
      <div className="flex flex-col gap-6 lg:gap-7">
        <header className="flex flex-col gap-5 rounded-3xl border border-white/0 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-500/12 px-3 py-1 text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-violet-300 shadow-[0_0_24px_rgba(139,92,246,0.12)]">
              {labName}
            </span>
            <h1 className="lab-dashboard-title mt-4 font-extrabold text-white">
              Dashboard do Laboratório
            </h1>
            <p className="lab-dashboard-copy max-w-2xl text-[1rem] font-medium text-slate-400">
              Acompanhe pedidos, estoque e parceiros em tempo real.
            </p>
          </div>

          <Link
            href="/lab/orders"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#4f46e5,#9333ea)] px-5 text-[0.95rem] font-bold text-white shadow-[0_18px_34px_-18px_rgba(139,92,246,1)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-18px_rgba(139,92,246,1)] sm:w-auto"
          >
            Ver pedidos
            <ArrowUpRight size={18} />
          </Link>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {metrics.map((metric) => (
            <KpiCard key={metric.title} metric={metric} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)]">
          <SectionPanel
            icon={ClipboardList}
            title="Pedidos aguardando confirmação"
            tone="amber"
            action={
              <Link href="/lab/orders" className="inline-flex items-center gap-1.5 text-[0.86rem] font-bold text-violet-300 transition-colors hover:text-white">
                Ver todos
                <ArrowUpRight size={14} />
              </Link>
            }
          >
            {!pendingOrders.length ? (
              <EmptyOrdersState />
            ) : (
              <div className="divide-y divide-white/10">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.035] sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[0.95rem] font-bold text-white">
                        {order.order_number}
                      </p>
                      <p className="mt-1 truncate text-[0.8rem] font-medium text-slate-400">
                        {order.optical_store_name} · {formatTimestampDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2">
                      {statusBadge(order.status)}
                      <Link
                        href={`/lab/orders/${order.id}`}
                        className="inline-flex min-h-9 items-center rounded-xl border border-violet-300/25 bg-violet-500/12 px-3 text-[0.76rem] font-extrabold text-violet-100 transition-colors hover:border-violet-200/40 hover:bg-violet-500/20 hover:text-white"
                      >
                        Acessar Pedido
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionPanel>

          <SectionPanel icon={TrendingUp} title="Ações rápidas">
            <div className="grid grid-cols-1 gap-3 px-5 py-5 sm:px-6">
              {quickActions.map((action) => (
                <QuickActionCard key={action.href} action={action} />
              ))}
            </div>
          </SectionPanel>
        </section>
      </div>
    </>
  );
}
