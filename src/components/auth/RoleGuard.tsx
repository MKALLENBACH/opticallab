import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UserRole } from '@/lib/types/enums';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export async function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('auth_user_id', userData.user.id)
    .single();

  if (!profile || profile.status !== 'active') {
    redirect('/unauthorized');
  }

  if (!allowedRoles.includes(profile.role as UserRole)) {
    redirect('/unauthorized');
  }

  return <>{children}</>;
}
