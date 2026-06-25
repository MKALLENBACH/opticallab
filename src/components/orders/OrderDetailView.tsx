import Link from 'next/link';
import { CalendarClock, ClipboardList, FileText, Glasses, History, RefreshCw, Sparkles, Store } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import {
  EmptyState,
  InfoRow,
  PageHeader,
  PriorityBadge,
  SectionCard,
  StatusBadge,
  TimelineStep,
} from '@/components/ui/Premium';
import { formatDateOnly, formatDateTime } from '@/lib/format/date';

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
  order_type?: string | null;
  special_status?: string | null;
  parent_order_id?: string | null;
  rework_reason?: string | null;
  rework_status?: string | null;
  rework_opened_by_role?: string | null;
  rework_rejected_reason?: string | null;
  rework_accepted_at?: string | null;
  priority: string;
  desired_delivery_date: string | null;
  estimated_delivery_date?: string | null;
  lab_estimated_delivery_notes?: string | null;
  special_rejection_reason?: string | null;
  notes: string | null;
  internal_notes: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  optical_store: OpticalStoreSummary | null;
  parent_order?: {
    id: string;
    order_number: string;
    status: string;
  } | null;
  linked_reworks?: Array<{
    id: string;
    order_number: string;
    status: string;
    rework_status: string | null;
  }>;
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
  source_order_item_id?: string | null;
  rework_action?: string | null;
  lens_type: {
    name: string | null;
    brand: string | null;
    category: string | null;
    material: string | null;
    refractive_index?: string | null;
    treatments?: string[] | null;
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

function specialStatusText(status: string | null | undefined) {
  const map: Record<string, string> = {
    aguardando_analise: 'Aguardando analise',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado',
    em_producao: 'Em producao',
    em_entrega: 'Em entrega',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
  };
  return status ? map[status] || status : '-';
}

function reworkStatusText(status: string | null | undefined) {
  const map: Record<string, string> = {
    aguardando_aceite: 'Aguardando aceite',
    aceito: 'Aceito',
    rejeitado: 'Rejeitado',
  };
  return status ? map[status] || status : '-';
}

function reworkReasonText(reason: string | null | undefined) {
  const map: Record<string, string> = {
    erro_de_medico: 'Erro de Medico',
  };
  return reason ? map[reason] || reason : '-';
}

function reworkActionText(action: string | null | undefined) {
  const map: Record<string, string> = {
    same_lens: 'Refazer com a mesma lente',
    replace_sku: 'Troca por SKU',
    special: 'Pedido Especial',
  };
  return action ? map[action] || action : '-';
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
  const isSpecial = order.order_type === 'special';
  const isRework = order.order_type === 'rework';

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        backHref={backHref}
        eyebrow={eyebrow}
        title={`Pedido ${order.order_number}`}
        description={description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isSpecial && <Badge variant="info" dot>Pedido Especial</Badge>}
            {isRework && <Badge variant="warning" dot>Retrabalho</Badge>}
            <StatusBadge status={order.status} />
            <PriorityBadge priority={order.priority} />
          </div>
        }
      />

      {sideActions}

      {!!order.linked_reworks?.length && (
        <SectionCard icon={RefreshCw} title="Retrabalhos vinculados" description="Este pedido finalizado possui retrabalho criado sem alterar seu historico original.">
          <div className="flex flex-col gap-2">
            {order.linked_reworks.map((rework) => (
              <Link
                key={rework.id}
                href={backHref.startsWith('/lab') ? `/lab/orders/${rework.id}` : `/store/orders/${rework.id}`}
                className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3 transition-colors hover:border-violet-300/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-mono font-extrabold text-white">Retrabalho: {rework.order_number}</span>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={rework.rework_status === 'rejeitado' ? 'error' : rework.rework_status === 'aceito' ? 'success' : 'warning'} dot>
                    {reworkStatusText(rework.rework_status)}
                  </Badge>
                  <StatusBadge status={rework.status} />
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard icon={ClipboardList} title="Resumo do pedido" description="Principais dados operacionais do pedido.">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoRow label="Numero" value={<span className="font-mono">{order.order_number}</span>} />
            <InfoRow label="Status" value={<StatusBadge status={order.status} />} />
            <InfoRow label="Prioridade" value={<PriorityBadge priority={order.priority} />} />
            <InfoRow label="Criado em" value={formatDateTime(order.created_at)} />
            <InfoRow label="Entrega desejada" value={formatDate(order.desired_delivery_date)} />
            {isSpecial && <InfoRow label="Prazo estimado" value={formatDate(order.estimated_delivery_date)} />}
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
                {item.rework_action && (
                  <div className="mt-3">
                    <Badge variant={item.rework_action === 'special' ? 'info' : 'warning'} size="sm">
                      {reworkActionText(item.rework_action)}
                    </Badge>
                  </div>
                )}
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

      {isSpecial && (
        <SectionCard icon={Sparkles} title="Dados do Pedido Especial" description="Solicitacao sob demanda criada a partir do catalogo do laboratorio.">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <InfoRow label="Status especial" value={specialStatusText(order.special_status)} />
            <InfoRow label="Prazo desejado pela otica" value={formatDate(order.desired_delivery_date)} />
            <InfoRow label="Prazo estimado do laboratorio" value={formatDate(order.estimated_delivery_date)} />
            <InfoRow label="Mensagem do laboratorio" value={order.lab_estimated_delivery_notes || 'Ainda nao informado'} />
          </div>
          {order.special_rejection_reason && (
            <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-[0.9rem] font-semibold text-red-100">
              Motivo da rejeicao: {order.special_rejection_reason}
            </div>
          )}
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <p className="font-extrabold text-white">{item.lens_type?.name || 'Lente nao informada'}</p>
                <div className="mt-3 grid grid-cols-1 gap-2 text-[0.84rem] font-semibold text-slate-400 sm:grid-cols-2">
                  <span>Marca: <strong className="text-slate-200">{item.lens_type?.brand || '-'}</strong></span>
                  <span>Categoria: <strong className="text-slate-200">{item.lens_type?.category || '-'}</strong></span>
                  <span>Material: <strong className="text-slate-200">{item.lens_type?.material || '-'}</strong></span>
                  <span>Indice: <strong className="text-slate-200">{item.lens_type?.refractive_index || '-'}</strong></span>
                  <span>Lado: <strong className="text-slate-200">{formatSide(item.side)}</strong></span>
                  <span>Quantidade: <strong className="text-slate-200">{item.quantity} un</strong></span>
                </div>
                <div className="mt-3 rounded-2xl border border-violet-300/18 bg-violet-500/10 px-4 py-3 font-mono text-[0.92rem] font-bold text-white">
                  {formatGrade(item)}
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      )}

      {isRework && (
        <SectionCard icon={RefreshCw} title="Dados do Retrabalho" description="Novo pedido vinculado ao pedido original finalizado.">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <InfoRow
              label="Pedido original"
              value={order.parent_order ? (
                <Link
                  href={backHref.startsWith('/lab') ? `/lab/orders/${order.parent_order.id}` : `/store/orders/${order.parent_order.id}`}
                  className="font-mono font-extrabold text-violet-200 hover:text-white"
                >
                  {order.parent_order.order_number}
                </Link>
              ) : '-'}
            />
            <InfoRow label="Motivo" value={reworkReasonText(order.rework_reason)} />
            <InfoRow label="Status do aceite" value={reworkStatusText(order.rework_status)} />
            <InfoRow label="Aberto por" value={order.rework_opened_by_role === 'lab' ? 'Laboratorio' : 'Otica'} />
            <InfoRow label="Aceito em" value={formatDateTime(order.rework_accepted_at || null)} />
          </div>
          {order.rework_rejected_reason && (
            <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-[0.9rem] font-semibold text-red-100">
              Motivo da rejeicao: {order.rework_rejected_reason}
            </div>
          )}
        </SectionCard>
      )}

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
