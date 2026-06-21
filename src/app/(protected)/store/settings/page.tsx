import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';

export default async function StoreSettingsPage() {
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

  const { data: store } = await supabase
    .from('optical_stores')
    .select('*')
    .eq('id', storeId)
    .single();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Configurações da Ótica</h2>
        <p className="text-[var(--color-text-muted)]">Informações cadastrais da sua ótica.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Nome / Razão Social</p>
              <p className="text-base text-[var(--color-text-base)]">{store?.name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-[var(--color-border)] pt-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-muted)]">CNPJ/Documento</p>
                <p className="text-base text-[var(--color-text-base)]">{store?.document || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Responsável</p>
                <p className="text-base text-[var(--color-text-base)]">{store?.responsible_name || 'Não informado'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-[var(--color-border)] pt-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Email de Contato</p>
                <p className="text-base text-[var(--color-text-base)]">{store?.email || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Telefone</p>
                <p className="text-base text-[var(--color-text-base)]">{store?.phone || 'Não informado'}</p>
              </div>
            </div>

            <div className="border-t border-[var(--color-border)] pt-4">
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Endereço Completo</p>
              <p className="text-base text-[var(--color-text-base)]">
                {store?.address ? `${store.address}, ${store.city || ''} - ${store.state || ''}. CEP: ${store.zip_code || ''}` : 'Não informado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-[var(--color-text-muted)] mt-4">
        Para atualizar esses dados, entre em contato com o administrador do laboratório.
      </p>
    </div>
  );
}
