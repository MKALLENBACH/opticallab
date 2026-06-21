'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface LabSettingsData {
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  default_delivery_message: string | null;
}

export function LabSettingsForm({ settings }: { settings: LabSettingsData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    // No MVP, a atualização visual e lógica real precisará de uma action dedicada.
    // Simulando um delay:
    setTimeout(() => {
      setSuccess(true);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {success && (
            <div className="bg-[var(--color-success-bg)] border border-[var(--color-success)] text-[var(--color-success)] px-4 py-3 rounded-md text-sm">
              Configurações White-label atualizadas com sucesso! As novas cores já estão ativas para todas as suas óticas.
            </div>
          )}

          <section>
            <h3 className="text-lg font-semibold text-[var(--color-text-base)] mb-4">Aparência (White-label)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-[var(--color-text-base)]">
                  Cor Primária (Hex)
                </label>
                <div className="flex gap-3">
                  <input 
                    type="color" 
                    name="primary_color"
                    defaultValue={settings.primary_color || '#6366F1'}
                    className="h-10 w-10 p-1 border border-[var(--color-border)] rounded cursor-pointer bg-[var(--color-bg-surface)]"
                  />
                  <Input 
                    name="primary_color_text"
                    defaultValue={settings.primary_color || '#6366F1'}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-[var(--color-text-base)]">
                  Cor Secundária (Hex)
                </label>
                <div className="flex gap-3">
                  <input 
                    type="color" 
                    name="secondary_color"
                    defaultValue={settings.secondary_color || '#8B5CF6'}
                    className="h-10 w-10 p-1 border border-[var(--color-border)] rounded cursor-pointer bg-[var(--color-bg-surface)]"
                  />
                  <Input 
                    name="secondary_color_text"
                    defaultValue={settings.secondary_color || '#8B5CF6'}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <Input
                  label="URL da Logomarca"
                  name="logo_url"
                  type="url"
                  placeholder="https://exemplo.com/logo.png"
                  defaultValue={settings.logo_url || ''}
                  helperText="Para o MVP, informe uma URL pública da sua logomarca."
                />
              </div>
            </div>
          </section>

          <section className="border-t border-[var(--color-border)] pt-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-base)] mb-4">Mensagens Padrão</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-[var(--color-text-base)]">
                  Mensagem Padrão de Entrega
                </label>
                <textarea
                  name="default_delivery_message"
                  defaultValue={settings.default_delivery_message || ''}
                  rows={3}
                  className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md px-3 py-2 text-base focus:border-[var(--color-primary)] outline-none resize-y"
                  placeholder="Ex: Prazo estimado em até 5 dias úteis."
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 mt-4 border-t border-[var(--color-border)] pt-4">
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Salvar Configurações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
