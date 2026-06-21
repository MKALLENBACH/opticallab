'use client';

import { useState } from 'react';
import { loginAction } from '@/actions/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';

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
    // Se sucesso, a server action faz o redirect, então não precisamos setar isLoading(false) aqui.
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      {error && (
        <div className="bg-[var(--color-error-bg)] border border-[var(--color-error)] text-[var(--color-error)] px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Input
        label="Email"
        name="email"
        type="email"
        required
        placeholder="seu@email.com"
        autoComplete="email"
        disabled={isLoading}
      />

      <div className="relative">
        <Input
          label="Senha"
          name="password"
          type={showPassword ? 'text' : 'password'}
          required
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-[var(--color-text-muted)] hover:text-[var(--color-text-base)]"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="text-sm">
          <a href="#" className="text-[var(--color-primary)] hover:underline">
            Esqueceu a senha?
          </a>
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="mt-2 w-full">
        Entrar
      </Button>
    </form>
  );
}
