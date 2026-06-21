import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, Clock, CheckCircle } from 'lucide-react';
import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';
import { Badge } from '@/components/ui/Badge';

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
    return <div>Erro: Ótica não encontrada para o seu usuário.</div>;
  }

  // Busca métricas da ótica (MVP count)
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
      value: pendingOrdersCount || 0, 
      icon: Clock, 
      color: 'text-[var(--color-urgent)]' 
    },
    { 
      title: 'Pedidos Finalizados', 
      value: finishedOrdersCount || 0, 
      icon: CheckCircle, 
      color: 'text-[var(--color-success)]' 
    },
    { 
      title: 'Total de Pedidos', 
      value: totalOrdersCount || 0, 
      icon: Package, 
      color: 'text-[var(--color-primary)]' 
    },
  ];

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
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Painel da Ótica</h2>
        <p className="text-[var(--color-text-muted)]">Bem-vindo! Acompanhe o status dos seus pedidos com o laboratório.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-muted)] mb-1">
                    {metric.title}
                  </p>
                  <h3 className="text-3xl font-bold text-[var(--color-text-base)]">
                    {metric.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-full bg-[var(--color-bg-base)] ${metric.color}`}>
                  <Icon size={24} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveDataTable
            data={recentOrders || []}
            keyExtractor={(row) => row.id}
            columns={[
              { header: 'Nº Pedido', accessor: 'order_number', className: 'font-medium font-mono' },
              { header: 'Status', accessor: (row) => formatStatus(row.status) },
              { header: 'Data', accessor: (row) => new Date(row.created_at).toLocaleDateString('pt-BR') },
            ]}
            emptyMessage="Você ainda não possui pedidos registrados."
          />
        </CardContent>
      </Card>
    </div>
  );
}
