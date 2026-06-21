import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, Store, ClipboardList, Glasses } from 'lucide-react';

export default async function LabDashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) return null;

  // Obter lab_id do usuário atual
  const { data: profile } = await supabase
    .from('profiles')
    .select('lab_id')
    .eq('auth_user_id', userData.user.id)
    .single();

  const labId = profile?.lab_id;

  if (!labId) {
    return <div>Erro: Laboratório não encontrado.</div>;
  }

  // Busca métricas do laboratório (MVP count)
  const [
    { count: storesCount },
    { count: ordersCount },
    { count: pendingOrdersCount },
    { count: stockItemsCount }
  ] = await Promise.all([
    supabase.from('optical_stores').select('id', { count: 'exact', head: true }).eq('lab_id', labId),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('lab_id', labId),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('lab_id', labId).eq('status', 'aguardando_confirmacao'),
    supabase.from('lens_variants').select('id', { count: 'exact', head: true }).eq('lab_id', labId)
  ]);

  const metrics = [
    { 
      title: 'Óticas Parceiras', 
      value: storesCount || 0, 
      icon: Store, 
      color: 'text-[var(--color-primary)]' 
    },
    { 
      title: 'Pedidos Pendentes', 
      value: pendingOrdersCount || 0, 
      icon: ClipboardList, 
      color: 'text-[var(--color-urgent)]' 
    },
    { 
      title: 'Total de Pedidos', 
      value: ordersCount || 0, 
      icon: Package, 
      color: 'text-[var(--color-secondary)]' 
    },
    { 
      title: 'Variantes em Estoque', 
      value: stockItemsCount || 0, 
      icon: Glasses, 
      color: 'text-[var(--color-info)]' 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Dashboard do Laboratório</h2>
        <p className="text-[var(--color-text-muted)]">Acompanhe as métricas de produção e pedidos do seu laboratório.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Últimos Pedidos Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-text-muted)] text-sm">
              Listagem de pedidos aguardando confirmação aparecerá aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
