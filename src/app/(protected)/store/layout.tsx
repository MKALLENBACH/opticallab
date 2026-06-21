import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/lib/types/enums';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.OPTICAL_ADMIN, UserRole.OPTICAL_USER]}>
      {children}
    </RoleGuard>
  );
}
