import { Logo } from '@/components/ui/Logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      {/* ── Left panel: branding (visible only on lg+) ── */}
      <div className="hidden lg:flex lg:flex-col lg:w-[45%] xl:w-[40%] flex-shrink-0 relative overflow-hidden">
        {/* Gradient orbs */}
        <div
          className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'rgba(99,102,241,0.3)' }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'rgba(139,92,246,0.25)' }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full justify-between p-12">
          {/* Logo */}
          <Logo variant="full" size="lg" light />

          {/* Headline */}
          <div>
            <h1 className="text-white font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.04em' }}>
              Gestão óptica<br />
              <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                de alto nível
              </span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: '1.7', maxWidth: '28rem' }}>
              Plataforma white-label para laboratórios ópticos gerenciarem óticas, estoque e pedidos em tempo real.
            </p>

            {/* Feature bullets */}
            <ul className="mt-8 space-y-3">
              {[
                'Pedidos em tempo real entre óticas e laboratórios',
                'Controle de estoque com busca avançada por grau',
                'Relatórios e auditoria completos',
              ].map((feat) => (
                <li key={feat} className="flex items-start gap-3" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(99,102,241,0.3)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(129,140,248)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} LenteLink. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div
        className="flex-1 flex items-center justify-center px-4 py-10 sm:px-8 lg:px-16 animate-fade-in"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
