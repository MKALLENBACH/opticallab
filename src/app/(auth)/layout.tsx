import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#05060A] lg:flex-row">
      <style dangerouslySetInnerHTML={{ __html: `
        .auth-left-panel {
          display: none;
        }
        .auth-left-inner {
          min-height: calc(100vh - 6rem);
          width: 100%;
          max-width: 620px;
        }
        .auth-main-copy {
          max-width: 560px;
          padding-top: 2.5rem;
          padding-bottom: 2rem;
        }
        .auth-hero-title {
          max-width: 34rem;
          font-size: clamp(3.4rem, 5vw, 4.85rem) !important;
          font-weight: 800;
          line-height: 1.05 !important;
          letter-spacing: -0.035em;
        }
        .auth-copy-subtitle {
          margin-top: 2rem;
        }
        .auth-benefits {
          margin-top: 2.5rem;
        }
        .auth-copyright {
          padding-bottom: 0.25rem;
        }
        .auth-right-panel {
          min-height: 100vh;
          padding: 2.5rem 1.25rem;
        }
        .auth-right-inner {
          width: 100%;
          max-width: 500px;
        }
        @media (min-width: 640px) {
          .auth-right-panel {
            padding-left: 2.5rem;
            padding-right: 2.5rem;
          }
        }
        @media (min-width: 1024px) {
          .auth-left-panel {
            display: flex;
            width: 52%;
            min-height: 100vh;
            padding: 2.5rem 4rem;
          }
          .auth-right-panel {
            min-height: 0;
            padding-left: 3rem;
            padding-right: 3rem;
          }
        }
        @media (min-width: 1280px) {
          .auth-left-panel {
            width: 55%;
            padding: 3rem 5rem;
          }
          .auth-main-copy {
            padding-bottom: 2.5rem;
          }
        }
        @media (min-width: 1536px) {
          .auth-left-panel {
            padding-left: 6rem;
            padding-right: 6rem;
          }
        }
      ` }} />

      <div className="pointer-events-none fixed inset-0 z-0">
        <Image
          src="/bg-login.png"
          alt="Background"
          fill
          className="object-cover object-[58%_center] opacity-95 mix-blend-screen lg:object-[34%_center]"
          priority
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_48%,rgba(89,99,255,0.14)_0%,rgba(5,6,10,0.36)_38%,rgba(5,6,10,0.86)_78%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/28 to-black/88" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/70 lg:to-black/25" />
      </div>

      <div className="auth-left-panel relative z-10 flex-shrink-0">
        <div className="auth-left-inner flex h-full flex-col justify-between">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="ll-g1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <circle cx="22" cy="32" r="14" stroke="url(#ll-g1)" strokeWidth="4" fill="none" />
              <circle cx="42" cy="32" r="14" stroke="url(#ll-g1)" strokeWidth="4" fill="none" />
              <circle cx="32" cy="32" r="5" fill="url(#ll-g1)" />
            </svg>
            <span className="text-[1.65rem] font-bold tracking-tight">
              <span className="text-white">Lente</span>
              <span className="bg-[linear-gradient(135deg,#818cf8,#c084fc)] bg-clip-text text-transparent">Link</span>
            </span>
          </div>

          <div className="auth-main-copy">
            <h1 className="auth-hero-title text-white drop-shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
              Gestão óptica<br />
              <span className="bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_42%,#c084fc_100%)] bg-clip-text text-transparent">
                de alto nível
              </span>
            </h1>
            <p className="auth-copy-subtitle max-w-[31rem] text-[1.08rem] font-medium leading-8 text-white/70">
              Plataforma para laboratórios ópticos gerenciarem óticas, estoque e pedidos em tempo real.
            </p>

            <ul className="auth-benefits flex flex-col gap-5">
              {[
                { title: 'Pedidos em tempo real', detail: 'Entre óticas e laboratórios', icon: 'M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3' },
                { title: 'Controle de estoque', detail: 'Com busca avançada por grau', icon: 'M12 2l8 4-8 4-8-4 8-4zM4 10l8 4 8-4M4 14l8 4 8-4M4 18l8 4 8-4' },
                { title: 'Relatórios e auditoria', detail: 'Completos em tempo real', icon: 'M4 19V9M10 19V5M16 19v-8M22 19V3' },
              ].map((feat) => (
                <li key={feat.title} className="group flex items-center gap-4">
                  <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-indigo-500/10 shadow-[0_0_24px_rgba(99,102,241,0.12)] transition-all duration-300 group-hover:scale-105 group-hover:border-violet-400/30 group-hover:shadow-[0_0_28px_rgba(99,102,241,0.24)]">
                    <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10" aria-hidden="true">
                      <path d={feat.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[1rem] font-bold leading-6 text-white">{feat.title}</p>
                    <p className="text-[0.98rem] font-medium leading-6 text-white/65">{feat.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="auth-copyright text-[0.88rem] font-medium tracking-wide text-white/35">
            © {new Date().getFullYear()} LenteLink. Todos os direitos reservados.
          </p>
        </div>
      </div>

      <div className="auth-right-panel relative z-10 flex w-full flex-1 flex-col items-center justify-center">
        <div className="auth-right-inner relative">
          {children}
        </div>
      </div>
    </div>
  );
}
