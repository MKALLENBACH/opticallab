import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { LabsTable } from './LabsTable';
import { EntityStatus } from '@/lib/types/enums';

export default async function AdminLabsPage() {
  const supabase = await createClient();

  const { data: labs, error } = await supabase
    .from('labs')
    .select('id, name, email, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching labs:', error);
  }

  // Define explicitly the type and ensure no null arrays
  const typedLabs = (labs || []).map(lab => ({
    ...lab,
    status: lab.status as EntityStatus
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h2>Laboratórios</h2>
          <p>Gerencie os laboratórios cadastrados na plataforma.</p>
        </div>
        <Link href="/admin/labs/new">
          <Button
            variant="primary"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            }
          >
            Novo Laboratório
          </Button>
        </Link>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card)]">
        <LabsTable data={typedLabs} />
      </div>
    </div>
  );
}
