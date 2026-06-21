import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login — OpticaLab',
  description: 'Acesse a plataforma de gestão óptica OpticaLab.',
};

export default function LoginPage() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        {/* Mobile logo (hidden on lg+ since it's on the left panel) */}
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div
            className="w-9 h-9 rounded-[9px] flex items-center justify-center"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="12" r="4"/><circle cx="18" cy="12" r="4"/><path d="M2 12h4m12 0h4M6 8c0-2 1-4 3-5m2 1c1 .5 2 1.5 3 2"/>
            </svg>
          </div>
          <span className="text-[var(--color-text-base)] font-bold text-lg tracking-tight">OpticaLab</span>
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
