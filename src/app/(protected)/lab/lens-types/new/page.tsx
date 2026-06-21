import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LensTypeForm } from './LensTypeForm';

export default function NewLensTypePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/lab/lens-types" 
          className="p-2 rounded-full hover:bg-[var(--color-bg-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Nova Lente Base</h2>
          <p className="text-[var(--color-text-muted)]">Adicione um novo tipo de lente ao catálogo do laboratório (sem especificar o grau ainda).</p>
        </div>
      </div>

      <LensTypeForm />
    </div>
  );
}
