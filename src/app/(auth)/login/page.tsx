import { LoginForm } from '@/components/auth/LoginForm';
import { Glasses } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="bg-[var(--color-primary)] text-white p-3 rounded-full mb-4 shadow-md">
          <Glasses size={40} />
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-text-base)]">OpticaLab</h1>
        <p className="text-[var(--color-text-muted)] text-center mt-2">
          Bem-vindo de volta! Entre com suas credenciais.
        </p>
      </div>
      
      <div className="glass-panel p-8 w-full relative z-10">
        <LoginForm />
      </div>
      
      <p className="text-center text-sm text-[var(--color-text-muted)] mt-8">
        Acesso restrito a usuários autorizados.
      </p>
    </div>
  );
}
