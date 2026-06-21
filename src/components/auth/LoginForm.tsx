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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      {/* Error banner */}
      {error && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-[var(--radius-lg)] border text-sm animate-slide-up"
          style={{
            background: 'var(--color-error-bg)',
            borderColor: 'var(--color-error)',
            color: 'var(--color-error-text)',
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
        leftIcon={<Mail size={16} />}
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
        leftIcon={<Lock size={16} />}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="p-0.5 hover:text-[var(--color-text-base)] transition-colors"
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
          className="text-sm font-medium"
          style={{ color: 'var(--color-primary)' }}
        >
          Esqueceu a senha?
        </a>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full mt-1"
      >
        {isLoading ? 'Entrando...' : 'Entrar na plataforma'}
      </Button>
    </form>
  );
}
