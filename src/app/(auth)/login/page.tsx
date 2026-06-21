import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login — LenteLink',
  description: 'Acesse a plataforma de gestão óptica LenteLink.',
};

export default function LoginPage() {
  return (
    <div className="w-full">

      {/* Mobile-only logo */}
      <div className="lg:hidden mb-10 flex justify-center items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 64 64" fill="none">
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
        <span className="font-bold text-2xl tracking-tight">
          <span style={{ color: '#fff' }}>Lente</span>
          <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Link</span>
        </span>
      </div>

      {/* Premium Glass card */}
      <div
        className="rounded-[28px] overflow-hidden relative"
        style={{
          background: 'rgba(15, 17, 26, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(32px)',
        }}
      >
        {/* Soft top gradient line for depth */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] opacity-60"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.8), rgba(99, 102, 241, 0.8), transparent)' }}
        />

        <div className="px-8 py-10 sm:p-12">

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div
              className="w-[68px] h-[68px] rounded-[22px] flex items-center justify-center relative group"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%)',
                border: '1px solid rgba(139,92,246,0.25)',
              }}
            >
              <div className="absolute inset-0 rounded-[22px] opacity-60 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.3)_0%,transparent_60%)] blur-md transition-opacity duration-500 group-hover:opacity-100" />
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 64 64" fill="none" className="relative z-10">
                <defs>
                  <linearGradient id="ll-icon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa"/>
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
            <h2 className="text-[1.6rem] sm:text-[1.8rem] font-extrabold text-white tracking-tight mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-white/50 text-[1rem] font-medium">
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Form */}
          <LoginForm />

        </div>
      </div>
    </div>
  );
}
