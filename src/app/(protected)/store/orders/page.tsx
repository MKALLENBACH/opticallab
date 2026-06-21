import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/Badge';
import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';

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
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-[var(--color-text-muted)]">Ótica não encontrada.</p>
      </div>
    );
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      priority,
      created_at,
      total_amount
    `)
    .eq('optical_store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching store orders:', error);
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case 'aguardando_confirmacao': return <Badge variant="warning" dot>Aguardando Confirmação</Badge>;
      case 'confirmado': return <Badge variant="info" dot>Confirmado pelo Lab</Badge>;
      case 'em_producao': return <Badge variant="info" dot>Em Produção</Badge>;
      case 'em_entrega': return <Badge variant="default" dot>Em Entrega</Badge>;
      case 'finalizado': return <Badge variant="success" dot>Finalizado</Badge>;
      case 'cancelado': return <Badge variant="error" dot>Cancelado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <h2>Meus Pedidos</h2>
        <p>Histórico de todos os seus pedidos de lentes para o laboratório.</p>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card)]">
        <ResponsiveDataTable
          data={orders || []}
          keyExtractor={(row) => row.id}
          columns={[
            { header: 'Nº Pedido', accessor: 'order_number', className: 'font-semibold font-mono' },
            {
              header: 'Prioridade',
              accessor: (row) => (
                <Badge variant={row.priority === 'urgente' ? 'urgent' : 'default'} dot>
                  {row.priority === 'urgente' ? 'Urgente' : 'Normal'}
                </Badge>
              )
            },
            { header: 'Status', accessor: (row) => formatStatus(row.status) },
            { header: 'Data do Pedido', accessor: (row) => new Date(row.created_at).toLocaleDateString('pt-BR'), align: 'right' },
          ]}
          emptyMessage="Você não fez nenhum pedido ainda. Use 'Buscar Lentes' para criar seu primeiro pedido."
        />
      </div>
    </div>
  );
}

