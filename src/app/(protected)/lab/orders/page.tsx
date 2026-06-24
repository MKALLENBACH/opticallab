import { createClient } from '@/lib/supabase/server';
import { OrdersTable, type OrderTableRow } from '@/components/orders/OrdersTable';
import { PageHeader, SectionCard } from '@/components/ui/Premium';
import { ClipboardList } from 'lucide-react';

export const metadata = { title: 'Pedidos | LenteLink' };

export default async function LabOrdersPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('lab_id')
    .eq('auth_user_id', userData.user.id)
    .single();

  const labId = profile?.lab_id;

  if (!labId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Laboratorio nao encontrado.</p>
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
      priority,
      desired_delivery_date,
      created_at,
      optical_store:optical_stores(name),
      items:order_items(id)
    `)
    .eq('lab_id', labId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
  }

  const typedOrders = (orders || []).map((order) => ({
    ...order,
    optical_store: Array.isArray(order.optical_store) ? order.optical_store[0] : order.optical_store,
    item_count: Array.isArray(order.items) ? order.items.length : 0,
  })) as OrderTableRow[];

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        eyebrow="Fila do laboratorio"
        title="Pedidos recebidos"
        description="Acompanhe pedidos das oticas parceiras, priorize urgencias e avance o status operacional."
      />

      <SectionCard
        icon={ClipboardList}
        title="Fila operacional"
        description="Use a busca para filtrar por numero, otica, status ou prioridade."
        contentClassName="p-0"
      >
        <OrdersTable data={typedOrders} variant="lab" />
      </SectionCard>
    </div>
  );
}
