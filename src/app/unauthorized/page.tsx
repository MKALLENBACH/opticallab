import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--color-bg-base)]">
      <div className="bg-[var(--color-bg-surface)] p-8 rounded-lg shadow-lg max-w-md w-full text-center border border-[var(--color-border)]">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-error-bg)] text-[var(--color-error)] mb-6">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text-base)] mb-2">Acesso Negado</h1>
        <p className="text-[var(--color-text-muted)] mb-8">
          Você não tem permissão para acessar esta página ou sua conta está inativa.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button variant="primary" className="w-full">Voltar para o Início</Button>
          </Link>
          <Link href="/api/auth/logout" prefetch={false}>
            <Button variant="outline" className="w-full">Sair do Sistema</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
