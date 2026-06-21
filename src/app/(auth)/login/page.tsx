import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/ui/Logo';

export const metadata = {
  title: 'Login — LenteLink',
  description: 'Acesse a plataforma de gestão óptica LenteLink.',
};

export default function LoginPage() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        {/* Mobile logo (hidden on lg+ since it's on the left panel) */}
        <div className="mb-8 lg:hidden">
          <Logo variant="full" size="md" light={false} />
        </div>

        <h2
          className="font-bold text-[var(--color-text-base)]"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', letterSpacing: '-0.03em' }}
        >
          Bem-vindo de volta
        </h2>
        <p className="text-[var(--color-text-muted)] mt-1.5 text-[0.9375rem]">
          Acesse sua conta para continuar
        </p>
      </div>

      {/* Form card */}
      <div
        className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-7 sm:p-8"
        style={{
          background: 'var(--color-bg-surface)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <LoginForm />
      </div>

      <p className="text-center text-[0.8125rem] text-[var(--color-text-subtle)] mt-6">
        Acesso restrito a usuários autorizados
      </p>
    </div>
  );
}
