'use client';

import { useState } from 'react';
import { loginAction } from '@/actions/auth';
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
          --color-primary-light: rgba(129,140,248,0.2);
        }
        .auth-form {
          gap: 1.5rem;
        }
        .auth-field-group {
          gap: 1.25rem;
        }
        .auth-control {
          gap: 0.625rem;
        }
        .auth-field {
          padding-left: 3rem !important;
        }
        .auth-field-email {
          padding-right: 1rem !important;
        }
        .auth-field-password {
          padding-right: 4rem !important;
        }
        .auth-forgot-row {
          padding-top: 0.25rem;
        }
        .auth-submit-area {
          gap: 1.5rem;
          padding-top: 0.25rem;
        }
        .auth-btn-gradient {
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 45%, #9333ea 100%) !important;
          border: 1px solid rgba(196, 181, 253, 0.26) !important;
          box-shadow: 0 16px 34px -18px rgba(59,130,246,0.95), 0 16px 38px -18px rgba(147,51,234,0.85), inset 0 1px 1px rgba(255,255,255,0.24) !important;
          transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease !important;
        }
        .auth-btn-gradient:hover:not(:disabled) {
          box-shadow: 0 20px 42px -18px rgba(59,130,246,1), 0 22px 44px -18px rgba(147,51,234,0.95), inset 0 1px 1px rgba(255,255,255,0.32) !important;
          filter: brightness(1.04);
          transform: translateY(-1px);
        }
        .auth-field:-webkit-autofill,
        .auth-field:-webkit-autofill:hover,
        .auth-field:-webkit-autofill:focus {
          -webkit-text-fill-color: #fff;
          box-shadow: 0 0 0 1000px rgba(2,6,23,0.88) inset;
          transition: background-color 9999s ease-in-out 0s;
        }
      `}} />

      <form onSubmit={handleSubmit} className="auth-form flex w-full flex-col">
        {error && (
          <div className="flex animate-slide-up items-start gap-3 rounded-2xl border border-red-400/25 bg-red-500/12 px-4 py-3.5 text-sm text-red-200">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <div className="auth-field-group flex flex-col">
          <div className="auth-control flex flex-col">
            <label htmlFor="login-email" className="block text-sm font-bold text-white/90">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="login-email"
                name="email"
                type="email"
                required
                placeholder="seu@email.com"
                autoComplete="email"
                disabled={isLoading}
                className="auth-field auth-field-email h-14 w-full rounded-2xl border border-white/10 bg-black/25 text-[1rem] font-medium text-white outline-none transition placeholder:text-slate-500 hover:border-white/18 focus:border-violet-300/70 focus:bg-black/32 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div className="auth-control flex flex-col">
            <label htmlFor="login-password" className="block text-sm font-bold text-white/90">
              Senha
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                className="auth-field auth-field-password h-14 w-full rounded-2xl border border-white/10 bg-black/25 text-[1rem] font-medium text-white outline-none transition placeholder:text-slate-500 hover:border-white/18 focus:border-violet-300/70 focus:bg-black/32 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-50"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="auth-forgot-row flex justify-end">
              <a
                href="#"
                className="rounded-md px-1 py-1 text-[0.88rem] font-semibold text-indigo-300 transition hover:bg-white/5 hover:text-white"
              >
                Esqueceu a senha?
              </a>
            </div>
          </div>
        </div>

        <div className="auth-submit-area flex flex-col">
          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="auth-btn-gradient group h-14 w-full rounded-2xl text-[1.04rem] font-bold text-white"
          >
            {isLoading ? 'Entrando...' : (
              <>
                Entrar na plataforma
                <ArrowRight size={19} className="opacity-90 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>

          <div className="flex items-center gap-4 text-white/35">
            <div className="h-px flex-1 bg-white/10" />
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Lock size={14} className="opacity-80" />
              <p className="text-[0.84rem] font-medium tracking-wide">
                Acesso restrito a usuários autorizados
              </p>
            </div>
            <div className="h-px flex-1 bg-white/10" />
          </div>
        </div>
      </form>
    </div>
  );
}
