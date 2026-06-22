import { PageHeader } from '@/components/ui/Premium';
import { OpticalStoreForm } from './OpticalStoreForm';

export default function NewOpticalStorePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        backHref="/lab/optical-stores"
        eyebrow="Nova parceira"
        title="Cadastrar otica"
        description="Organize dados comerciais, contato e endereco da otica parceira em uma ficha unica."
      />

      <OpticalStoreForm />
    </div>
  );
}
