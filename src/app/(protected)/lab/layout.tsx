import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/lib/types/enums';

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.LAB_ADMIN, UserRole.LAB_USER]}>
      {children}
    </RoleGuard>
  );
}
