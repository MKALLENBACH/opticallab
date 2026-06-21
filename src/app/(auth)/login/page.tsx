import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login — LenteLink',
  description: 'Acesse a plataforma de gestão óptica LenteLink.',
};

export default function LoginPage() {
  return (
    <div className="w-full">

      {/* Mobile-only logo */}
      <div className="lg:hidden mb-8 flex items-center gap-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="ll-mob" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1"/>
              <stop offset="100%" stopColor="#8b5cf6"/>
            </linearGradient>
          </defs>
          <circle cx="22" cy="32" r="14" stroke="url(#ll-mob)" strokeWidth="4" fill="none"/>
          <circle cx="42" cy="32" r="14" stroke="url(#ll-mob)" strokeWidth="4" fill="none"/>
          <circle cx="32" cy="32" r="5" fill="url(#ll-mob)"/>
        </svg>
        <span className="font-bold text-lg tracking-tight">
          <span style={{ color: 'rgba(255,255,255,0.95)' }}>Lente</span>
          <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Link</span>
        </span>
      </div>

      {/* Glass card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Card top accent line */}
        <div
          className="h-px w-full"
          style={{ background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.6), rgba(139,92,246,0.6), transparent)' }}
        />

        <div className="px-8 pt-8 pb-9 sm:px-10 sm:pt-9 sm:pb-10">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.25) 100%)',
                border: '1px solid rgba(99,102,241,0.35)',
                boxShadow: '0 0 24px rgba(99,102,241,0.2)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 64 64" fill="none">
                <defs>
                  <linearGradient id="ll-icon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8"/>
                    <stop offset="100%" stopColor="#a78bfa"/>
                  </linearGradient>
                </defs>
                <circle cx="22" cy="32" r="13" stroke="url(#ll-icon)" strokeWidth="3.5" fill="none"/>
                <circle cx="42" cy="32" r="13" stroke="url(#ll-icon)" strokeWidth="3.5" fill="none"/>
                <circle cx="32" cy="32" r="5" fill="url(#ll-icon)"/>
              </svg>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-8">
            <h2
              className="font-bold leading-tight"
              style={{
                fontSize: 'clamp(1.4rem, 3vw, 1.75rem)',
                letterSpacing: '-0.035em',
                color: 'rgba(255,255,255,0.95)',
              }}
            >
              Bem-vindo de volta
            </h2>
            <p className="mt-2" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9375rem' }}>
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Footer */}
          <div className="mt-7 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8125rem' }}>
              Acesso restrito a usuários autorizados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
