import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login — LenteLink',
  description: 'Acesse a plataforma de gestão óptica LenteLink.',
};

function LogoMark({ gradientId }: { gradientId: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="32" r="14" stroke={`url(#${gradientId})`} strokeWidth="4" fill="none" />
      <circle cx="42" cy="32" r="14" stroke={`url(#${gradientId})`} strokeWidth="4" fill="none" />
      <circle cx="32" cy="32" r="5" fill={`url(#${gradientId})`} />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="relative z-20 w-full">
      <style dangerouslySetInnerHTML={{ __html: `
        .login-mobile-brand {
          margin-bottom: 2rem;
        }
        .login-card {
          border-radius: 28px;
        }
        .login-card-inner {
          padding: 2.25rem 1.75rem;
        }
        .login-icon-row {
          margin-bottom: 1.75rem;
        }
        .login-heading {
          margin-bottom: 2.25rem;
        }
        .login-heading p {
          margin-top: 0.5rem;
        }
        .login-title {
          font-size: clamp(1.85rem, 2.2vw, 2.15rem) !important;
          line-height: 1.18 !important;
          font-weight: 800;
          letter-spacing: -0.025em;
        }
        .login-mobile-footer {
          margin-top: 1.75rem;
        }
        @media (min-width: 640px) {
          .login-card {
            border-radius: 34px;
          }
          .login-card-inner {
            padding: 2.75rem 2.5rem;
          }
        }
        @media (min-width: 1280px) {
          .login-card-inner {
            padding: 3rem;
          }
        }
        @media (min-width: 1024px) {
          .login-mobile-brand,
          .login-mobile-footer {
            display: none;
          }
        }
      ` }} />

      <div className="login-mobile-brand flex items-center justify-center gap-3">
        <LogoMark gradientId="ll-mobile-login" />
        <span className="text-[1.75rem] font-bold tracking-tight">
          <span className="text-white">Lente</span>
          <span className="bg-[linear-gradient(135deg,#818cf8,#c084fc)] bg-clip-text text-transparent">Link</span>
        </span>
      </div>

      <div className="login-card relative w-full overflow-hidden border border-white/10 bg-slate-950/55 shadow-[0_26px_90px_-28px_rgba(99,102,241,0.55),0_28px_80px_-26px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">
        <div className="absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(139,92,246,0.7),rgba(96,165,250,0.55),transparent)]" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-8 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="login-card-inner relative z-10">
          <div className="login-icon-row flex justify-center">
            <div className="relative flex h-[86px] w-[86px] items-center justify-center rounded-full border border-violet-300/25 bg-indigo-500/10 shadow-[0_0_38px_rgba(124,58,237,0.22)]">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.42)_0%,transparent_64%)] blur-md" />
              <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 64 64" fill="none" className="relative z-10 drop-shadow-[0_2px_10px_rgba(139,92,246,0.7)]" aria-hidden="true">
                <defs>
                  <linearGradient id="ll-card-icon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c4b5fd" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
                <circle cx="22" cy="32" r="13" stroke="url(#ll-card-icon)" strokeWidth="3" fill="none" />
                <circle cx="42" cy="32" r="13" stroke="url(#ll-card-icon)" strokeWidth="3" fill="none" />
                <circle cx="32" cy="32" r="5" fill="url(#ll-card-icon)" />
              </svg>
            </div>
          </div>

          <div className="login-heading text-center">
            <h2 className="login-title text-white">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-[1.02rem] font-medium text-white/60">
              Acesse sua conta para continuar
            </p>
          </div>

          <LoginForm />
        </div>
      </div>

      <div className="login-mobile-footer text-center lg:hidden">
        <p className="text-[0.85rem] font-medium tracking-wide text-white/35">
          © {new Date().getFullYear()} LenteLink.<br />Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
