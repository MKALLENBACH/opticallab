import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, Beaker, Users, ClipboardList } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Busca métricas agregadas (em um MVP simples podemos fazer count() nas tabelas)
  // Em produção, isso seria uma query consolidada ou cache.
  
  const [
    { count: labsCount },
    { count: usersCount },
    { count: ordersCount }
  ] = await Promise.all([
    supabase.from('labs').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true })
  ]);

  const metrics = [
    { 
      title: 'Laboratórios Ativos', 
      value: labsCount || 0, 
      icon: Beaker, 
      color: 'text-[var(--color-primary)]' 
    },
    { 
      title: 'Usuários na Plataforma', 
      value: usersCount || 0, 
      icon: Users, 
      color: 'text-[var(--color-secondary)]' 
    },
    { 
      title: 'Pedidos Transacionados', 
      value: ordersCount || 0, 
      icon: ClipboardList, 
      color: 'text-[var(--color-info)]' 
    },
    { 
      title: 'Status do Sistema', 
      value: 'Online', 
      icon: Activity, 
      color: 'text-[var(--color-success)]' 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Dashboard Administrativo</h2>
        <p className="text-[var(--color-text-muted)]">Visão global da plataforma OpticaLab.</p>
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
            <CardTitle>Avisos do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-text-muted)] text-sm">
              Nenhum alerta crítico no momento. Os serviços do Supabase e rotinas de backup estão operando normalmente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
