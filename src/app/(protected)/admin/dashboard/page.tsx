import Link from 'next/link';
import { Activity, ArrowUpRight, Beaker, ClipboardList, Plus, ShieldCheck, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { HeaderAction, InfoRow, MetricCard, PageHeader, SectionCard } from '@/components/ui/Premium';

export const metadata = { title: 'Dashboard Admin Global | LenteLink' };

const quickActions = [
  { label: 'Novo laboratorio', href: '/admin/labs/new' },
  { label: 'Novo usuario', href: '/admin/users/new' },
  { label: 'Ver laboratorios', href: '/admin/labs' },
  { label: 'Ver usuarios', href: '/admin/users' },
];

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

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        eyebrow="Admin Global"
        title="Dashboard Administrativo"
        description="Visao consolidada de laboratorios, usuarios, oticas e pedidos transacionados na plataforma."
        actions={<HeaderAction href="/admin/labs/new" icon={<Plus size={17} />}>Novo laboratorio</HeaderAction>}
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Laboratorios ativos" value={labsCount ?? 0} icon={Beaker} tone="violet" href="/admin/labs" />
        <MetricCard title="Usuarios na plataforma" value={usersCount ?? 0} icon={Users} tone="fuchsia" href="/admin/users" />
        <MetricCard title="Pedidos transacionados" value={ordersCount ?? 0} icon={ClipboardList} tone="blue" />
        <MetricCard title="Oticas cadastradas" value={storesCount ?? 0} icon={Activity} tone="emerald" />
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard
          icon={ShieldCheck}
          title="Status do sistema"
          description="Sinais operacionais do ambiente conectado ao Supabase."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <InfoRow label="Banco de dados" value={<span className="text-emerald-200">Operacional</span>} />
            <InfoRow label="Autenticacao" value={<span className="text-emerald-200">Operacional</span>} />
            <InfoRow label="Storage" value={<span className="text-emerald-200">Operacional</span>} />
          </div>
        </SectionCard>

        <SectionCard
          icon={ArrowUpRight}
          title="Acoes rapidas"
          description="Atalhos administrativos para configuracao da plataforma."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-4 text-[0.92rem] font-bold text-slate-100 transition-all hover:border-violet-300/30 hover:bg-white/[0.055]"
              >
                <span className="min-w-0 truncate">{action.label}</span>
                <ArrowUpRight size={16} className="flex-shrink-0 text-violet-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
              </Link>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
