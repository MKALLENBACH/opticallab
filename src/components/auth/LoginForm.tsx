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
        .auth-theme input {
          backdrop-filter: blur(12px);
          color: white !important;
          transition: all 0.2s ease;
        }
        .auth-theme input::placeholder {
          color: rgba(255,255,255,0.3) !important;
        }
        .auth-theme input:hover:not(:disabled) {
          border-color: rgba(255,255,255,0.2);
          background: rgba(30, 32, 48, 0.6);
        }
        .auth-btn-gradient {
          background: linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%) !important;
          border: none !important;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3) !important;
          transition: all 0.2s ease !important;
        }
        .auth-btn-gradient:hover {
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4) !important;
          transform: translateY(-1px);
        }
      `}} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
        {/* Error banner */}
        {error && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-[var(--radius-lg)] border text-sm animate-slide-up"
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

        {/* Email */}
        <Input
          label="Email"
          name="email"
          type="email"
          required
          placeholder="seu@email.com"
          autoComplete="email"
          disabled={isLoading}
          leftIcon={<Mail size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />}
        />

        {/* Password */}
        <Input
          label="Senha"
          name="password"
          type={showPassword ? 'text' : 'password'}
          required
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isLoading}
          leftIcon={<Lock size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="p-1 hover:text-white transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        {/* Forgot password */}
        <div className="flex justify-end -mt-1">
          <a
            href="#"
            className="text-sm font-medium hover:underline"
            style={{ color: '#818cf8' }}
          >
            Esqueceu a senha?
          </a>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-2 auth-btn-gradient text-white rounded-[var(--radius-md)] h-[46px] font-semibold text-[0.9375rem] flex items-center justify-center gap-2"
        >
          {isLoading ? 'Entrando...' : (
            <>
              Entrar na plataforma
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 opacity-80">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
