'use client';

import { useState } from 'react';
import { loginAction } from '@/actions/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await loginAction({ email, password });

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-theme w-full">
      <style dangerouslySetInnerHTML={{__html: `
        .auth-theme {
          --color-bg-surface: rgba(20, 22, 31, 0.4);
          --color-bg-surface-2: rgba(30, 32, 48, 0.6);
          --color-text-base: #ffffff;
          --color-text-secondary: rgba(255,255,255,0.85);
          --color-text-muted: rgba(255,255,255,0.5);
          --color-text-subtle: rgba(255,255,255,0.3);
          --color-border: rgba(255,255,255,0.1);
          --color-border-hover: rgba(255,255,255,0.2);
          --color-border-focus: #818cf8;
          --color-primary-light: rgba(129,140,248,0.2);
        }
        .auth-btn-gradient {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
          border: none !important;
          box-shadow: 0 8px 24px -6px rgba(99, 102, 241, 0.5) !important;
          transition: all 0.3s ease !important;
        }
        .auth-btn-gradient:hover {
          box-shadow: 0 12px 28px -6px rgba(99, 102, 241, 0.65) !important;
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
      `}} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
        {/* Error banner */}
        {error && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-[12px] border text-sm animate-slide-up"
            style={{
              background: 'rgba(239,68,68,0.15)',
              borderColor: 'rgba(239,68,68,0.3)',
              color: '#fca5a5',
            }}
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-5">
          {/* Email */}
          <Input
            label="Email"
            name="email"
            type="email"
            required
            placeholder="seu@email.com"
            autoComplete="email"
            disabled={isLoading}
            leftIcon={<Mail size={18} className="text-white/40" />}
          />

          {/* Password */}
          <div>
            <Input
              label="Senha"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
              leftIcon={<Lock size={18} className="text-white/40" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="p-1 hover:text-white transition-colors text-white/40"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            {/* Forgot password */}
            <div className="flex justify-end mt-3">
              <a
                href="#"
                className="text-[0.85rem] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Esqueceu a senha?
              </a>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-2 auth-btn-gradient text-white rounded-xl h-[54px] font-bold text-[1rem] flex items-center justify-center gap-2"
        >
          {isLoading ? 'Entrando...' : (
            <>
              Entrar na plataforma
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 opacity-90">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-white/[0.08]"></div>
          <span className="flex-shrink-0 mx-4 text-white/30 text-[0.85rem] font-medium">ou</span>
          <div className="flex-grow border-t border-white/[0.08]"></div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-2.5 text-white/40">
          <Lock size={14} className="opacity-70" />
          <p className="text-[0.85rem] font-medium tracking-wide">
            Acesso restrito a usuários autorizados
          </p>
        </div>
      </form>
    </div>
  );
}
