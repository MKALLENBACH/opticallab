'use client';

import { useState } from 'react';
import { MessageSquareText, Palette, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormActions, FormSection } from '@/components/ui/Premium';

interface LabSettingsData {
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  default_delivery_message: string | null;
}

export function LabSettingsForm({ settings }: { settings: LabSettingsData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    window.setTimeout(() => {
      setSuccess(true);
      setIsLoading(false);
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5 sm:p-6">
      {success && (
        <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/12 px-4 py-3 text-[0.9rem] font-semibold text-emerald-100">
          Configuracoes atualizadas no fluxo MVP.
        </div>
      )}

      <FormSection
        icon={Palette}
        title="Aparencia white-label"
        description="Configure as cores e a marca exibidas para as oticas."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Cor primaria</label>
            <div className="flex gap-3">
              <input
                type="color"
                name="primary_color"
                defaultValue={settings.primary_color || '#6366F1'}
                className="h-12 w-14 flex-shrink-0 cursor-pointer rounded-2xl border border-white/10 bg-slate-950/62 p-1"
              />
              <Input
                name="primary_color_text"
                defaultValue={settings.primary_color || '#6366F1'}
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Cor secundaria</label>
            <div className="flex gap-3">
              <input
                type="color"
                name="secondary_color"
                defaultValue={settings.secondary_color || '#8B5CF6'}
                className="h-12 w-14 flex-shrink-0 cursor-pointer rounded-2xl border border-white/10 bg-slate-950/62 p-1"
              />
              <Input
                name="secondary_color_text"
                defaultValue={settings.secondary_color || '#8B5CF6'}
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1"
              />
            </div>
          </div>

          <Input
            label="URL da logomarca"
            name="logo_url"
            type="url"
            placeholder="https://exemplo.com/logo.png"
            defaultValue={settings.logo_url || ''}
            helperText="Use uma URL publica para o MVP."
            className="md:col-span-2"
          />
        </div>
      </FormSection>

      <FormSection
        icon={MessageSquareText}
        title="Mensagens padrao"
        description="Defina o texto padrao que orienta prazos e entrega."
      >
        <div className="flex flex-col gap-2">
          <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Mensagem padrao de entrega</label>
          <textarea
            name="default_delivery_message"
            defaultValue={settings.default_delivery_message || ''}
            rows={4}
            className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/62 px-4 py-3 text-[0.95rem] font-medium text-white outline-none transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-400/15"
            placeholder="Ex: Prazo estimado em ate 5 dias uteis."
          />
        </div>
      </FormSection>

      <FormActions>
        <Button type="submit" isLoading={isLoading} rightIcon={<Save size={17} />}>
          Salvar configuracoes
        </Button>
      </FormActions>
    </form>
  );
}
