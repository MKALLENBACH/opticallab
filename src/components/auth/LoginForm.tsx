'use client';

import { useState } from 'react';
import { loginAction } from '@/actions/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

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
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
          border: 1px solid rgba(139, 92, 246, 0.3) !important;
          box-shadow: 0 8px 32px -8px rgba(99, 102, 241, 0.6), inset 0 1px 1px rgba(255,255,255,0.2) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .auth-btn-gradient:hover:not(:disabled) {
          box-shadow: 0 12px 36px -8px rgba(99, 102, 241, 0.8), inset 0 1px 1px rgba(255,255,255,0.3) !important;
          transform: translateY(-2px);
          filter: brightness(1.05);
        }
      `}} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-7 w-full">
        {/* Error banner */}
        {error && (
          <div
            className="flex items-start gap-3 px-4 py-3.5 rounded-[12px] border text-sm animate-slide-up"
            style={{
              background: 'rgba(239,68,68,0.15)',
              borderColor: 'rgba(239,68,68,0.3)',
              color: '#fca5a5',
            }}
          >
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
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
            leftIcon={<Mail size={20} />}
          />

          {/* Password */}
          <div className="flex flex-col gap-2.5">
            <Input
              label="Senha"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
              leftIcon={<Lock size={20} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="p-2 hover:text-white transition-colors text-white/60 hover:bg-white/10 rounded-xl"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
            />
            {/* Forgot password */}
            <div className="flex justify-end">
              <a
                href="#"
                className="text-[0.85rem] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors py-1 px-1 rounded-md hover:bg-white/5"
              >
                Esqueceu a senha?
              </a>
            </div>
          </div>
        </div>

        {/* Submit Area */}
        <div className="flex flex-col gap-5 mt-2">
          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full auth-btn-gradient text-white rounded-[14px] h-[56px] font-bold text-[1.05rem] flex items-center justify-center gap-2.5 group"
          >
            {isLoading ? 'Entrando...' : (
              <>
                Entrar na plataforma
                <ArrowRight size={18} className="opacity-90 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          {/* Footer info */}
          <div className="flex items-center justify-center gap-2 text-white/30 pt-1">
            <Lock size={14} className="opacity-80" />
            <p className="text-[0.85rem] font-medium tracking-wide">
              Acesso restrito a usuários autorizados
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
