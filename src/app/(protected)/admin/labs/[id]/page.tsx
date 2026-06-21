import { createClient } from '@/lib/supabase/server';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EditLabForm } from './EditLabForm';
import { EntityStatus } from '@/lib/types/enums';

export default async function EditLabPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: lab, error } = await supabase
    .from('labs')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !lab) {
    notFound();
  }

  // Define explicitly the type
  const typedLab = {
    ...lab,
    status: lab.status as EntityStatus
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/labs" 
          className="p-2 rounded-full hover:bg-[var(--color-bg-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Detalhes do Laboratório</h2>
          <p className="text-[var(--color-text-muted)]">Edite as informações cadastrais do laboratório.</p>
        </div>
      </div>

      <EditLabForm lab={typedLab} />
    </div>
  );
}
