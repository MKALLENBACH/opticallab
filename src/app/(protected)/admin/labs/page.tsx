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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-base)]">Laboratórios</h2>
          <p className="text-[var(--color-text-muted)]">Gerencie os laboratórios cadastrados na plataforma.</p>
        </div>
        <Link href="/admin/labs/new">
          <Button variant="primary">
            <Plus size={18} className="mr-2" />
            Novo Laboratório
          </Button>
        </Link>
      </div>

      <LabsTable data={typedLabs} />
    </div>
  );
}
