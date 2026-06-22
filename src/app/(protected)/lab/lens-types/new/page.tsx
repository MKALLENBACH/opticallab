import { PageHeader } from '@/components/ui/Premium';
import { LensTypeForm } from './LensTypeForm';

export default function NewLensTypePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        backHref="/lab/lens-types"
        eyebrow="Catalogo"
        title="Nova lente base"
        description="Cadastre a lente tecnica, materiais, tratamentos e prazos padrao antes de criar SKUs por grau."
      />

      <LensTypeForm />
    </div>
  );
}
