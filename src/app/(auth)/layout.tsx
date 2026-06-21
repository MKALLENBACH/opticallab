import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#030305]">
      {/* ─── Full Background Image ─── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Image 
          src="/bg-login.png" 
          alt="Background" 
          fill 
          className="object-cover object-[70%_center] lg:object-[25%_center] opacity-90 mix-blend-screen" 
          quality={100}
          priority 
        />
        {/* Soft overlay to guarantee contrast and blending */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,3,5,0.6)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(3,3,5,0.4)] to-[#030305] lg:to-[#030305]" />
        
        {/* Extra dark gradient from bottom for footer legibility */}
        <div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t from-[#030305] to-transparent opacity-80" />
      </div>

      {/* ─── Left Panel: Content ─── */}
      <div className="hidden lg:flex lg:flex-col lg:w-[50%] xl:w-[55%] flex-shrink-0 relative z-10 px-12 xl:px-20 py-14 justify-between">
        
        {/* Logo top-left */}
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 64 64" fill="none">
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
          <span className="font-bold text-2xl tracking-tight">
            <span style={{ color: '#fff' }}>Lente</span>
            <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Link</span>
          </span>
        </div>

        {/* Text Content */}
        <div className="max-w-[500px] mt-auto mb-[12vh]">
          <h1 
            className="text-white font-extrabold leading-[1.05] mb-6 tracking-tight drop-shadow-md"
            style={{ fontSize: 'clamp(2.5rem, 4vw, 3.8rem)' }}
          >
            Gestão óptica<br />
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 40%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              de alto nível
            </span>
          </h1>
          <p className="text-white/60 text-[1.05rem] leading-relaxed mb-10 max-w-[420px] font-medium">
            Plataforma white-label para laboratórios ópticos gerenciarem óticas, estoque e pedidos em tempo real.
          </p>

          <ul className="space-y-6">
            {[
              { text: 'Pedidos em tempo real entre óticas e laboratórios', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
              { text: 'Controle de estoque com busca avançada por grau', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
              { text: 'Relatórios e auditoria completos em tempo real', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            ].map((feat, i) => (
              <li key={i} className="flex items-center gap-4 group">
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={feat.icon}/>
                  </svg>
                </div>
                <span className="text-white/80 text-[0.95rem] font-medium leading-tight">{feat.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-white/40 text-[0.8rem] font-medium tracking-wide">
          © {new Date().getFullYear()} LenteLink. Todos os direitos reservados.
        </p>
      </div>

      {/* ─── Right Panel: Form ─── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12 relative z-10 animate-fade-in">
        <div className="w-full max-w-[460px]">
          {children}
        </div>
      </div>
    </div>
  );
}
