import { createClient } from '@/lib/supabase/server';
import { OrdersTable, type OrderTableRow } from '@/components/orders/OrdersTable';
import { HeaderAction, PageHeader, SectionCard } from '@/components/ui/Premium';
import { ClipboardList, Plus, Sparkles } from 'lucide-react';

export const metadata = { title: 'Meus Pedidos | LenteLink' };

export default async function StoreOrdersPage() {
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
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Otica nao encontrada.</p>
      </div>
    );
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      order_type,
      special_status,
      rework_status,
      priority,
      desired_delivery_date,
      created_at,
      items:order_items(id)
    `)
    .eq('optical_store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching store orders:', error);
  }

  const typedOrders = (orders || []).map((order) => ({
    ...order,
    item_count: Array.isArray(order.items) ? order.items.length : 0,
  })) as OrderTableRow[];

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        eyebrow="Otica"
        title="Meus pedidos"
        description="Acompanhe o historico e o status de cada pedido enviado ao laboratorio."
        actions={(
          <>
            <HeaderAction href="/store/orders/special/new" icon={<Sparkles size={17} />}>Pedido Especial</HeaderAction>
            <HeaderAction href="/store/orders/new" icon={<Plus size={17} />}>Novo pedido</HeaderAction>
          </>
        )}
      />

      <SectionCard
        icon={ClipboardList}
        title="Historico de pedidos"
        description="Filtre por numero, status ou prioridade para localizar rapidamente um pedido."
        contentClassName="p-0"
      >
        <OrdersTable data={typedOrders} variant="store" />
      </SectionCard>
    </div>
  );
}
