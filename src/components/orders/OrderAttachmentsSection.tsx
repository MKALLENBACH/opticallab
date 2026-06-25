'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Download, Eye, FileText, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, SectionCard } from '@/components/ui/Premium';

export interface OrderAttachmentView {
  id: string;
  attachment_type: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  signed_url: string | null;
  created_at: string;
}

interface OrderAttachmentsSectionProps {
  title: string;
  description: string;
  attachments: OrderAttachmentView[];
}

function formatBytes(bytes: number | null) {
  if (!bytes) return '-';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function isImage(fileType: string | null) {
  return Boolean(fileType?.startsWith('image/'));
}

export function OrderAttachmentsSection({ title, description, attachments }: OrderAttachmentsSectionProps) {
  const [preview, setPreview] = useState<OrderAttachmentView | null>(null);
  const prescriptions = attachments.filter((attachment) => attachment.attachment_type === 'prescription');

  return (
    <>
      <SectionCard icon={Paperclip} title={title} description={description}>
        {!prescriptions.length ? (
          <EmptyState
            icon={Paperclip}
            title="Nenhuma receita anexada"
            description="Quando houver receita vinculada ao pedido, ela aparecera aqui."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {prescriptions.map((attachment) => (
              <article key={attachment.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="flex gap-4">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55 text-slate-300">
                    {isImage(attachment.file_type) && attachment.signed_url ? (
                      <Image src={attachment.signed_url} alt={attachment.file_name} width={64} height={64} className="h-full w-full object-cover" unoptimized />
                    ) : (
                      <FileText size={26} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold text-white">{attachment.file_name}</p>
                    <p className="mt-1 text-[0.82rem] font-semibold text-slate-500">
                      {attachment.file_type || 'Arquivo'} - {formatBytes(attachment.file_size)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {isImage(attachment.file_type) && attachment.signed_url && (
                        <Button type="button" size="sm" variant="secondary" onClick={() => setPreview(attachment)} leftIcon={<Eye size={15} />}>
                          Visualizar
                        </Button>
                      )}
                      {attachment.signed_url && (
                        <a href={attachment.signed_url} target="_blank" rel="noreferrer">
                          <Button type="button" size="sm" variant="outline" leftIcon={<Download size={15} />}>
                            Abrir/baixar
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      {preview?.signed_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/86 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <p className="truncate font-extrabold text-white">{preview.file_name}</p>
              <button type="button" onClick={() => setPreview(null)} className="rounded-xl border border-white/10 p-2 text-slate-300 hover:text-white" aria-label="Fechar preview">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[78vh] overflow-auto p-4">
              <Image src={preview.signed_url} alt={preview.file_name} width={1200} height={900} className="h-auto w-full rounded-2xl object-contain" unoptimized />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
