import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { OpticalStoreForm } from './OpticalStoreForm';

export default function NewOpticalStorePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/lab/optical-stores" 
          className="p-2 rounded-full hover:bg-[var(--color-bg-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Nova Ótica</h2>
          <p className="text-[var(--color-text-muted)]">Cadastre uma nova ótica parceira para o seu laboratório.</p>
        </div>
      </div>

      <OpticalStoreForm />
    </div>
  );
}
