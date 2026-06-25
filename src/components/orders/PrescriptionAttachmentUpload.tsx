'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Camera, FileText, ImageIcon, Paperclip, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/Premium';

export interface PendingPrescriptionAttachment {
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

interface PrescriptionAttachmentUploadProps {
  labId: string;
  profileId: string;
  value: PendingPrescriptionAttachment | null;
  onChange: (attachment: PendingPrescriptionAttachment | null) => void;
  required?: boolean;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function safeFileName(name: string) {
  const cleaned = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || 'receita';
}

function fileExtension(name: string) {
  const lower = name.toLowerCase();
  return ALLOWED_EXTENSIONS.find((extension) => lower.endsWith(extension)) || '';
}

export function PrescriptionAttachmentUpload({
  labId,
  profileId,
  value,
  onChange,
  required = true,
  disabled,
}: PrescriptionAttachmentUploadProps) {
  const [supabase] = useState(() => createClient());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const validateFile = (file: File) => {
    const extension = fileExtension(file.name);
    if (!ALLOWED_TYPES.has(file.type) || !extension) {
      return 'Formato invalido. Envie uma imagem ou PDF.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Arquivo muito grande. Envie um arquivo de ate 10MB.';
    }
    return null;
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;

    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    const extension = fileExtension(file.name);
    const path = `${labId}/pending/${profileId}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}${extension && !file.name.toLowerCase().endsWith(extension) ? extension : ''}`;

    const { error: uploadError } = await supabase.storage
      .from('order-attachments')
      .upload(path, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      });

    setIsUploading(false);

    if (uploadError) {
      setError('Nao foi possivel anexar a receita. Tente novamente.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    onChange({
      file_path: path,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
    });
  };

  const removeFile = async () => {
    setError(null);
    if (value?.file_path) {
      await supabase.storage.from('order-attachments').remove([value.file_path]);
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <SectionCard
      icon={Paperclip}
      title="Receita obrigatoria"
      description="Anexe a receita do cliente para que o laboratorio possa validar corretamente o pedido."
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(event) => void handleFile(event.target.files?.[0] || null)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(event) => void handleFile(event.target.files?.[0] || null)}
      />

      {!value ? (
        <div className="rounded-2xl border border-dashed border-violet-300/25 bg-violet-500/[0.045] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-extrabold text-white">{required ? 'Anexe a receita para continuar.' : 'Receita opcional'}</p>
              <p className="mt-1 text-[0.86rem] font-medium text-slate-400">Imagens JPG, PNG, WEBP ou PDF ate 10MB.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="secondary" isLoading={isUploading} disabled={disabled} onClick={() => fileInputRef.current?.click()} leftIcon={<FileText size={16} />}>
                Anexar arquivo
              </Button>
              <Button type="button" variant="outline" disabled={disabled || isUploading} onClick={() => cameraInputRef.current?.click()} leftIcon={<Camera size={16} />}>
                Tirar foto
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.055] p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 text-slate-300">
              {previewUrl ? (
                <Image src={previewUrl} alt="Preview da receita" width={80} height={80} className="h-full w-full object-cover" unoptimized />
              ) : (
                <FileText size={28} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-extrabold text-white">{value.file_name}</p>
              <p className="mt-1 text-[0.84rem] font-semibold text-slate-400">
                {value.file_type || 'Arquivo'} - {formatBytes(value.file_size)}
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-[0.82rem] font-bold text-emerald-200">
                <ImageIcon size={15} /> Receita anexada
              </p>
            </div>
            <Button type="button" variant="danger" disabled={disabled || isUploading} onClick={() => void removeFile()} leftIcon={<Trash2 size={16} />}>
              Remover
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-2xl border border-red-400/25 bg-red-500/12 px-4 py-3 text-[0.88rem] font-semibold text-red-100">
          {error}
        </div>
      )}
    </SectionCard>
  );
}
