import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-[#05060A]">
      {/* ─── Full Background Image ─── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Image 
          src="/bg-login.png" 
          alt="Background" 
          fill 
          className="object-cover object-[70%_center] lg:object-[25%_center] opacity-80 mix-blend-screen" 
          quality={100}
          priority 
        />
        {/* Soft overlay to guarantee contrast and blending */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,6,10,0.7)_100%)]" />
        
        {/* Gradients to fade out the image on the right for the card and ensure legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(5,6,10,0.4)] via-[rgba(5,6,10,0.3)] to-[#05060A] lg:to-[#05060A]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060A] via-transparent to-[rgba(5,6,10,0.2)] lg:to-transparent" />
      </div>

      {/* ─── Left Panel: Content ─── */}
      {/* Hidden on mobile completely? No, user said "Priorizar o card de login. Reduzir ou ocultar elementos decorativos se necessário." Let's keep it hidden on mobile and let the card take over, or show a simplified logo. The logo is inside the card container on mobile. So hiding left panel on mobile is perfect. */}
      <div className="hidden lg:flex lg:flex-col lg:w-[50%] xl:w-[55%] flex-shrink-0 relative z-10 px-12 xl:px-[72px] py-14 justify-between">
        
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
          <span className="font-bold text-[1.65rem] tracking-tight">
            <span style={{ color: '#fff' }}>Lente</span>
            <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Link</span>
          </span>
        </div>

        {/* Text Content */}
        <div className="w-full max-w-[560px] mt-auto mb-[12vh] flex flex-col">
          <h1 
            className="text-white font-extrabold leading-[1.1] mb-6 tracking-tight drop-shadow-lg"
            style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4rem)' }}
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
          <p className="text-white/70 text-[1.1rem] leading-relaxed mb-12 max-w-[480px] font-medium">
            Plataforma para laboratórios ópticos gerenciarem óticas, estoque e pedidos em tempo real.
          </p>

          <ul className="flex flex-col gap-7">
            {[
              { text: 'Pedidos em tempo real entre óticas e laboratórios', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
              { text: 'Controle de estoque com busca avançada por grau', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
              { text: 'Relatórios e auditoria completos em tempo real', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            ].map((feat, i) => (
              <li key={i} className="flex items-center gap-4 group">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] relative"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
                    <path d={feat.icon}/>
                  </svg>
                </div>
                <span className="text-white/85 text-[1.05rem] font-medium leading-tight group-hover:text-white transition-colors">{feat.text}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ─── Right Panel: Form ─── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12 relative z-10 w-full min-h-screen lg:min-h-0">
        <div className="w-full max-w-[440px] relative">
          {children}
        </div>
      </div>
      
      {/* Absolute positioned Footer to attach to the bottom left properly on desktop */}
      <p className="absolute bottom-6 left-6 lg:bottom-10 lg:left-12 xl:left-[72px] text-white/30 text-[0.85rem] font-medium tracking-wide z-10 hidden lg:block">
        © {new Date().getFullYear()} LenteLink. Todos os direitos reservados.
      </p>
    </div>
  );
}
