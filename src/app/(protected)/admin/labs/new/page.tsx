import { LabForm } from './LabForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewLabPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="page-header flex items-start gap-4">
        <Link 
          href="/admin/labs" 
          className="mt-1 p-2 rounded-full hover:bg-[var(--color-bg-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2>Novo Laboratório</h2>
          <p>Cadastre um novo laboratório na plataforma.</p>
        </div>
      </div>

      <LabForm />
    </div>
  );
}
