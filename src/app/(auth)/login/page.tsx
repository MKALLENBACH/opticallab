import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login — LenteLink',
  description: 'Acesse a plataforma de gestão óptica LenteLink.',
};

export default function LoginPage() {
  return (
    <div className="w-full relative z-20">

      {/* Mobile-only logo */}
      <div className="lg:hidden mb-10 flex justify-center items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 64 64" fill="none">
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
        <span className="font-bold text-[1.75rem] tracking-tight">
          <span style={{ color: '#fff' }}>Lente</span>
          <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Link</span>
        </span>
      </div>

      {/* Premium Glass card */}
      <div
        className="rounded-[32px] overflow-hidden relative w-full"
        style={{
          background: 'rgba(16, 18, 27, 0.55)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 32px 80px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* Soft top gradient line for depth */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] opacity-70"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.8), rgba(99, 102, 241, 0.8), transparent)' }}
        />

        {/* Dynamic Inner Glow */}
        <div 
          className="absolute -top-32 -left-32 w-64 h-64 rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.5) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />

        <div className="px-8 py-10 sm:px-12 sm:py-14 relative z-10">

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div
              className="w-[72px] h-[72px] rounded-[24px] flex items-center justify-center relative group"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.12) 100%)',
                border: '1px solid rgba(139,92,246,0.3)',
                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.15)',
              }}
            >
              <div className="absolute inset-0 rounded-[24px] opacity-70 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.4)_0%,transparent_60%)] blur-md transition-opacity duration-500 group-hover:opacity-100" />
              <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 64 64" fill="none" className="relative z-10 drop-shadow-[0_2px_8px_rgba(139,92,246,0.6)]">
                <defs>
                  <linearGradient id="ll-icon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c4b5fd"/>
                    <stop offset="100%" stopColor="#818cf8"/>
                  </linearGradient>
                </defs>
                <circle cx="22" cy="32" r="13" stroke="url(#ll-icon)" strokeWidth="3" fill="none"/>
                <circle cx="42" cy="32" r="13" stroke="url(#ll-icon)" strokeWidth="3" fill="none"/>
                <circle cx="32" cy="32" r="5" fill="url(#ll-icon)"/>
              </svg>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-10">
            <h2 className="text-[1.75rem] font-extrabold text-white tracking-tight mb-3">
              Bem-vindo de volta
            </h2>
            <p className="text-white/60 text-[1.05rem] font-medium">
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Form */}
          <LoginForm />

        </div>
      </div>
      
      {/* Footer for mobile only, shown outside the card */}
      <div className="lg:hidden mt-8 text-center">
        <p className="text-white/30 text-[0.85rem] font-medium tracking-wide">
          © {new Date().getFullYear()} LenteLink.<br />Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
