import Link from 'next/link';
import { CheckCircle2, Clock3, Package, Search, ShoppingCart } from 'lucide-react';
import { OrdersTable, type OrderTableRow } from '@/components/orders/OrdersTable';
import {
  EmptyState,
  HeaderAction,
  MetricCard,
  PageHeader,
  SectionCard,
} from '@/components/ui/Premium';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Painel da Otica | LenteLink' };

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
      <EmptyState
        icon={ShoppingCart}
        title="Otica nao encontrada"
        description="Seu usuario ainda nao esta vinculado a uma otica ativa."
      />
    );
  }

  const [
    { count: totalOrdersCount },
    { count: pendingOrdersCount },
    { count: finishedOrdersCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('optical_store_id', storeId),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('optical_store_id', storeId).eq('status', 'aguardando_confirmacao'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('optical_store_id', storeId).eq('status', 'finalizado'),
    supabase
      .from('orders')
      .select('id, order_number, status, order_type, special_status, priority, desired_delivery_date, created_at, items:order_items(id)')
      .eq('optical_store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const recentOrderRows = (recentOrders || []).map((order) => ({
    ...order,
    item_count: Array.isArray(order.items) ? order.items.length : 0,
  })) as OrderTableRow[];

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        eyebrow="Otica"
        title="Painel da Otica"
        description="Acompanhe pedidos em aberto, entregas finalizadas e o historico recente com o laboratorio."
        actions={<HeaderAction href="/store/search" icon={<Search size={17} />}>Buscar lentes</HeaderAction>}
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title="Pedidos em aberto"
          value={pendingOrdersCount ?? 0}
          icon={Clock3}
          tone="amber"
          href="/store/orders"
        />
        <MetricCard
          title="Pedidos finalizados"
          value={finishedOrdersCount ?? 0}
          icon={CheckCircle2}
          tone="emerald"
          href="/store/orders"
        />
        <MetricCard
          title="Total de pedidos"
          value={totalOrdersCount ?? 0}
          icon={Package}
          tone="violet"
          href="/store/orders"
        />
      </section>

      <SectionCard
        icon={ShoppingCart}
        title="Ultimos pedidos"
        description="Acompanhe rapidamente os pedidos mais recentes enviados ao laboratorio."
        actions={
          <Link href="/store/orders" className="text-[0.86rem] font-bold text-violet-300 transition-colors hover:text-white">
            Ver todos
          </Link>
        }
        contentClassName="p-0"
      >
        <OrdersTable data={recentOrderRows} variant="store" showSearch={false} />
      </SectionCard>
    </div>
  );
}
