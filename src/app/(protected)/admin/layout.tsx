import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/lib/types/enums';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.PLATFORM_ADMIN]}>
      {children}
    </RoleGuard>
  );
}
