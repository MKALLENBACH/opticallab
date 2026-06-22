import { PageHeader } from '@/components/ui/Premium';
import { LabForm } from './LabForm';

export default function NewLabPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        backHref="/admin/labs"
        eyebrow="Admin Global"
        title="Novo laboratorio"
        description="Cadastre o tenant, contato inicial e identidade basica do laboratorio."
      />

      <LabForm />
    </div>
  );
}
