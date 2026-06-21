import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';

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
    return <div>Erro: Ótica não encontrada.</div>;
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
      case 'aguardando_confirmacao': return <Badge variant="warning">Aguardando Confirmação</Badge>;
      case 'confirmado': return <Badge variant="info">Confirmado pelo Lab</Badge>;
      case 'em_producao': return <Badge variant="primary">Em Produção</Badge>;
      case 'em_entrega': return <Badge variant="secondary">Em Entrega</Badge>;
      case 'finalizado': return <Badge variant="success">Finalizado</Badge>;
      case 'cancelado': return <Badge variant="error">Cancelado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Meus Pedidos</h2>
          <p className="text-[var(--color-text-muted)]">Histórico de todos os seus pedidos de lentes para o laboratório.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <ResponsiveDataTable
            data={orders || []}
            keyExtractor={(row) => row.id}
            columns={[
              { header: 'Nº Pedido', accessor: 'order_number', className: 'font-medium font-mono' },
              { 
                header: 'Prioridade', 
                accessor: (row) => (
                  <Badge variant={row.priority === 'urgente' ? 'urgent' : 'default'}>
                    {row.priority === 'urgente' ? 'Urgente' : 'Normal'}
                  </Badge>
                ) 
              },
              { header: 'Status', accessor: (row) => formatStatus(row.status) },
              { header: 'Data do Pedido', accessor: (row) => new Date(row.created_at).toLocaleDateString('pt-BR') },
            ]}
            emptyMessage="Você não fez nenhum pedido ainda."
          />
        </CardContent>
      </Card>
    </div>
  );
}
