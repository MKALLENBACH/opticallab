import { CalendarClock, ClipboardList, FileText, Glasses, History, Store } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  EmptyState,
  InfoRow,
  PageHeader,
  PriorityBadge,
  SectionCard,
  StatusBadge,
  TimelineStep,
} from '@/components/ui/Premium';
import { formatDateOnly } from '@/lib/format/date';

interface OpticalStoreSummary {
  name: string | null;
  document: string | null;
  responsible_name: string | null;
  email: string | null;
  phone: string | null;
}

export interface OrderDetailData {
  id: string;
  order_number: string;
  status: string;
  priority: string;
  desired_delivery_date: string | null;
  notes: string | null;
  internal_notes: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  optical_store: OpticalStoreSummary | null;
}

export interface OrderItemDetail {
  id: string;
  quantity: number;
  sphere_esf: number | null;
  cylinder_cil: number | null;
  axis: number | null;
  addition_add: number | null;
  side: string | null;
  item_notes: string | null;
  lens_type: {
    name: string | null;
    brand: string | null;
    category: string | null;
    material: string | null;
  } | null;
  lens_variant: {
    sku: string | null;
    quantity_available: number | null;
  } | null;
}

export interface OrderHistoryDetail {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_by_profile_id: string;
  changed_by_name?: string | null;
  notes: string | null;
  created_at: string;
}

interface OrderDetailViewProps {
  order: OrderDetailData;
  items: OrderItemDetail[];
  history: OrderHistoryDetail[];
  backHref: string;
  eyebrow: string;
  description: string;
  showInternalNotes?: boolean;
  sideActions?: ReactNode;
}

const ORDER_STEPS = [
  { value: 'aguardando_confirmacao', label: 'Aguardando' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'em_producao', label: 'Producao' },
  { value: 'em_entrega', label: 'Entrega' },
  { value: 'finalizado', label: 'Finalizado' },
];

function formatDate(value: string | null | undefined) {
  return formatDateOnly(value);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPower(value: number | null, prefix: string) {
  if (value === null) return '';
  return `${prefix} ${value > 0 ? '+' : ''}${Number(value).toFixed(2)}`;
}

function formatGrade(item: OrderItemDetail) {
  return [
    formatPower(item.sphere_esf, 'ESF'),
    item.cylinder_cil !== null && item.cylinder_cil !== 0 ? formatPower(item.cylinder_cil, 'CIL') : '',
    item.axis !== null ? `Eixo ${item.axis}` : '',
    item.addition_add !== null ? formatPower(item.addition_add, 'ADD') : '',
  ].filter(Boolean).join(' / ') || 'Plano';
}

function formatSide(side: string | null) {
  const map: Record<string, string> = {
    right: 'OD',
    left: 'OE',
    pair: 'Par',
    not_applicable: 'Ambos',
  };
  return side ? map[side] || side : '-';
}

function statusText(status: string | null) {
  const map: Record<string, string> = {
    aguardando_confirmacao: 'Aguardando confirmacao',
    confirmado: 'Confirmado',
    em_producao: 'Em producao',
    em_entrega: 'Em entrega',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
  };
  return status ? map[status] || status : '-';
}

export function OrderDetailView({
  order,
  items,
  history,
  backHref,
  eyebrow,
  description,
  showInternalNotes = false,
  sideActions,
}: OrderDetailViewProps) {
  const currentStepIndex = ORDER_STEPS.findIndex((step) => step.value === order.status);
  const isCanceled = order.status === 'cancelado';

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        backHref={backHref}
        eyebrow={eyebrow}
        title={`Pedido ${order.order_number}`}
        description={description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} />
            <PriorityBadge priority={order.priority} />
          </div>
        }
      />

      {sideActions}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard icon={ClipboardList} title="Resumo do pedido" description="Principais dados operacionais do pedido.">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoRow label="Numero" value={<span className="font-mono">{order.order_number}</span>} />
            <InfoRow label="Status" value={<StatusBadge status={order.status} />} />
            <InfoRow label="Prioridade" value={<PriorityBadge priority={order.priority} />} />
            <InfoRow label="Criado em" value={formatDateTime(order.created_at)} />
            <InfoRow label="Entrega desejada" value={formatDate(order.desired_delivery_date)} />
            <InfoRow label="Confirmado em" value={formatDateTime(order.confirmed_at)} />
          </div>
        </SectionCard>

        <SectionCard icon={CalendarClock} title="Progresso" description={isCanceled ? 'Pedido cancelado.' : 'Etapas previstas para conclusao.'}>
          <div className="flex flex-col gap-4">
            {isCanceled ? (
              <TimelineStep label="Cancelado" active />
            ) : (
              ORDER_STEPS.map((step, index) => (
                <TimelineStep
                  key={step.value}
                  label={step.label}
                  active={index === currentStepIndex}
                  complete={currentStepIndex > index || order.status === 'finalizado'}
                />
              ))
            )}
          </div>
        </SectionCard>
      </section>

      <SectionCard icon={Store} title="Otica solicitante" description="Contato e dados cadastrais da unidade.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <InfoRow label="Otica" value={order.optical_store?.name || 'Nao informado'} />
          <InfoRow label="Documento" value={order.optical_store?.document || 'Nao informado'} />
          <InfoRow label="Responsavel" value={order.optical_store?.responsible_name || 'Nao informado'} />
          <InfoRow label="Contato" value={order.optical_store?.email || order.optical_store?.phone || 'Nao informado'} />
        </div>
      </SectionCard>

      <SectionCard icon={Glasses} title="Itens do pedido" description="Lentes, quantidades, graus e observacoes por item.">
        {!items.length ? (
          <EmptyState
            icon={Glasses}
            title="Nenhum item encontrado"
            description="O pedido existe, mas nao ha itens visiveis para o seu usuario."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-[1rem] font-extrabold text-white">
                      {item.lens_type?.name || 'Lente nao informada'}
                    </p>
                    <p className="mt-1 text-[0.82rem] font-semibold text-slate-500">
                      {item.lens_type?.brand || 'Sem marca'} · SKU {item.lens_variant?.sku || '-'}
                    </p>
                  </div>
                  <span className="rounded-full border border-violet-300/20 bg-violet-500/12 px-3 py-1 text-[0.78rem] font-extrabold text-violet-100">
                    {item.quantity} un
                  </span>
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/58 px-4 py-3 font-mono text-[0.9rem] font-bold text-white">
                  {formatGrade(item)}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[0.82rem] font-semibold text-slate-400">
                  <span>Lado: {formatSide(item.side)}</span>
                  <span>Estoque: {item.lens_variant?.quantity_available ?? '-'} un</span>
                </div>
                {item.item_notes && (
                  <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.025] px-3 py-2 text-[0.85rem] font-medium text-slate-300">
                    {item.item_notes}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard icon={FileText} title="Observacoes" description="Mensagens registradas no pedido.">
          <div className="grid grid-cols-1 gap-3">
            <InfoRow label="Observacao da otica" value={order.notes || 'Nao informado'} />
            {showInternalNotes && (
              <InfoRow label="Observacao interna" value={order.internal_notes || 'Nao informado'} />
            )}
          </div>
        </SectionCard>

        <SectionCard icon={History} title="Historico de status" description="Linha do tempo das movimentacoes do pedido.">
          {!history.length ? (
            <EmptyState
              icon={History}
              title="Sem historico registrado"
              description="As movimentacoes de status aparecerao aqui."
            />
          ) : (
            <div className="divide-y divide-white/10">
              {history.map((entry) => (
                <div key={entry.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[0.95rem] font-extrabold text-white">
                      {statusText(entry.old_status)} → {statusText(entry.new_status)}
                    </p>
                    <p className="mt-1 text-[0.82rem] font-medium text-slate-500">
                      {entry.changed_by_name || 'Usuario'} · {formatDateTime(entry.created_at)}
                    </p>
                    {entry.notes && (
                      <p className="mt-2 text-[0.86rem] font-medium text-slate-300">{entry.notes}</p>
                    )}
                  </div>
                  <StatusBadge status={entry.new_status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </section>
    </div>
  );
}
