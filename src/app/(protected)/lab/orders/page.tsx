import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/Badge';
import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';

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
    return <div>Erro: Laboratório não encontrado.</div>;
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      priority,
      created_at,
      optical_store:optical_stores(name)
    `)
    .eq('lab_id', labId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
  }

  const typedOrders = (orders || []).map(order => ({
    ...order,
    optical_store: Array.isArray(order.optical_store) ? order.optical_store[0] : order.optical_store
  }));

  const formatStatus = (status: string) => {
    switch (status) {
      case 'aguardando_confirmacao': return <Badge variant="warning">Aguardando Confirmação</Badge>;
      case 'confirmado': return <Badge variant="info">Confirmado</Badge>;
      case 'em_producao': return <Badge variant="info">Em Produção</Badge>;
      case 'em_entrega': return <Badge variant="default">Em Entrega</Badge>;
      case 'finalizado': return <Badge variant="success">Finalizado</Badge>;
      case 'cancelado': return <Badge variant="error">Cancelado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <h2>Gerenciamento de Pedidos</h2>
        <p>Acompanhe todos os pedidos recebidos das óticas parceiras.</p>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card)]">
        <ResponsiveDataTable
          data={typedOrders}
          keyExtractor={(row) => row.id}
          columns={[
            { header: 'Nº Pedido', accessor: 'order_number', className: 'font-semibold font-mono' },
            { header: 'Ótica', accessor: (row) => row.optical_store?.name || '—' },
            {
              header: 'Prioridade',
              accessor: (row) => (
                <Badge variant={row.priority === 'urgente' ? 'urgent' : 'default'} dot>
                  {row.priority === 'urgente' ? 'Urgente' : 'Normal'}
                </Badge>
              )
            },
            { header: 'Status', accessor: (row) => formatStatus(row.status) },
            { header: 'Data', accessor: (row) => new Date(row.created_at).toLocaleDateString('pt-BR'), align: 'right' },
          ]}
          emptyMessage="Nenhum pedido recebido ainda. Quando uma ótica fizer um pedido, ele aparecerá aqui."
        />
      </div>
    </div>
  );
}
