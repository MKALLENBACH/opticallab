import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: '#08090f' }}>

      {/* ─── Background: grain texture + subtle grid ─── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 20% 50%, rgba(99,102,241,0.12) 0%, transparent 65%),
            radial-gradient(ellipse 60% 80% at 80% 20%, rgba(139,92,246,0.09) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 70% 80%, rgba(59,130,246,0.07) 0%, transparent 55%)
          `,
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ─── Left Panel: Hero ─── */}
      <div className="hidden lg:flex lg:flex-col lg:w-[52%] xl:w-[55%] flex-shrink-0 relative overflow-hidden">

        {/* Glow blobs behind lens */}
        <div
          className="absolute top-[10%] left-[5%] w-[55%] h-[55%] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-[5%] right-[-5%] w-[40%] h-[40%] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col h-full px-12 xl:px-16 py-10">

          {/* Logo top-left */}
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="ll-g1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
              <circle cx="22" cy="32" r="14" stroke="url(#ll-g1)" strokeWidth="4" fill="none"/>
              <circle cx="42" cy="32" r="14" stroke="url(#ll-g1)" strokeWidth="4" fill="none"/>
              <circle cx="32" cy="32" r="5" fill="url(#ll-g1)"/>
            </svg>
            <span className="font-bold text-xl tracking-tight">
              <span style={{ color: 'rgba(255,255,255,0.95)' }}>Lente</span>
              <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Link</span>
            </span>
          </div>

          {/* Lens + headline in center */}
          <div className="flex-1 flex flex-col justify-center -mt-8">

            {/* Lens image with halo effect */}
            <div className="relative w-72 h-72 xl:w-80 xl:h-80 mx-auto mb-10">
              {/* Glow ring behind lens */}
              <div
                className="absolute inset-4 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.15) 50%, transparent 80%)',
                  filter: 'blur(20px)',
                  animation: 'pulse-glow-lens 4s ease-in-out infinite',
                }}
              />
              <Image
                src="/lens-hero.png"
                alt="Lente óptica premium"
                fill
                className="object-contain drop-shadow-[0_0_40px_rgba(99,102,241,0.4)]"
                priority
                sizes="(max-width: 1280px) 288px, 320px"
              />
            </div>

            {/* Headline */}
            <div className="max-w-lg">
              <h1
                className="text-white font-bold leading-[1.1] mb-5"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', letterSpacing: '-0.04em' }}
              >
                Gestão óptica<br />
                <span style={{
                  background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #c084fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  de alto nível
                </span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', lineHeight: '1.75', maxWidth: '30rem' }}>
                Plataforma white-label para laboratórios ópticos gerenciarem óticas, estoque e pedidos em tempo real.
              </p>

              {/* Feature list */}
              <ul className="mt-8 space-y-4">
                {[
                  { text: 'Pedidos em tempo real entre óticas e laboratórios', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
                  { text: 'Controle de estoque com busca avançada por grau', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                  { text: 'Relatórios e auditoria completos em tempo real', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={feat.icon}/>
                      </svg>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{feat.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} LenteLink. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* ─── Right Panel: Form ─── */}
      <div
        className="flex-1 flex items-center justify-center px-5 py-10 sm:px-10 animate-fade-in relative"
        style={{ background: 'rgba(10,11,18,0.6)', backdropFilter: 'blur(2px)' }}
      >
        {/* Vertical divider (desktop only) */}
        <div
          className="absolute left-0 top-[10%] bottom-[10%] w-px hidden lg:block"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.3) 30%, rgba(139,92,246,0.3) 70%, transparent)' }}
        />

        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes pulse-glow-lens {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
