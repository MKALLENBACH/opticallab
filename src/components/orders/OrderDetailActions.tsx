'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Edit3, FileText, RefreshCw, Send, XCircle } from 'lucide-react';
import {
  acceptReworkOrderAction,
  approveSpecialOrderAction,
  rejectReworkOrderAction,
  rejectSpecialOrderAction,
  updateLabOrderNotesAction,
  updateLabOrderStatusAction,
} from '@/actions/orders';
import { getAvailableTransitions } from '@/lib/constants/order-flow';
import { OrderStatus } from '@/lib/types/enums';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/Premium';

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.AGUARDANDO_CONFIRMACAO]: 'Aguardando confirmacao',
  [OrderStatus.CONFIRMADO]: 'Confirmar pedido',
  [OrderStatus.EM_PRODUCAO]: 'Enviar para producao',
  [OrderStatus.EM_ENTREGA]: 'Enviar para entrega',
  [OrderStatus.FINALIZADO]: 'Finalizar pedido',
  [OrderStatus.CANCELADO]: 'Cancelar pedido',
};

function statusIcon(status: OrderStatus) {
  if (status === OrderStatus.CANCELADO) return <XCircle size={16} />;
  if (status === OrderStatus.CONFIRMADO) return <CheckCircle2 size={16} />;
  return <Send size={16} />;
}

export function StoreOrderDetailActions({
  orderId,
  status,
  orderType = 'normal',
}: {
  orderId: string;
  status: string;
  orderType?: string | null;
}) {
  const router = useRouter();
  const canEdit = status === OrderStatus.AGUARDANDO_CONFIRMACAO && orderType !== 'special' && orderType !== 'rework';
  const canOpenRework = status === OrderStatus.FINALIZADO && orderType !== 'rework';

  return (
    <SectionCard
      icon={Edit3}
      title="Acoes do pedido"
      description={canEdit
        ? 'Este pedido ainda pode ser ajustado antes da confirmacao do laboratorio.'
        : orderType === 'special' || orderType === 'rework'
          ? 'Este pedido usa um fluxo operacional especifico e nao usa a edicao normal por SKU.'
        : 'Depois da confirmacao, alteracoes precisam ser combinadas com o laboratorio.'}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.9rem] font-medium text-slate-400">
          {canEdit
            ? 'Edite itens, quantidades, prioridade e observacoes.'
            : canOpenRework
              ? 'Pedido finalizado pode gerar um novo pedido de retrabalho vinculado.'
              : 'Edicao bloqueada para manter o historico operacional consistente.'}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          {canOpenRework && (
            <Button
              type="button"
              variant="secondary"
              leftIcon={<RefreshCw size={16} />}
              onClick={() => router.push(`/store/orders/${orderId}/rework`)}
            >
              Abrir Retrabalho
            </Button>
          )}
          <Button
            type="button"
            disabled={!canEdit}
            leftIcon={<Edit3 size={16} />}
            onClick={() => router.push(`/store/orders/new?editId=${orderId}`)}
          >
            Editar pedido
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

export function LabOrderDetailActions({
  orderId,
  status,
  orderType = 'normal',
  specialStatus,
  reworkStatus,
  reworkOpenedByRole,
  internalNotes,
}: {
  orderId: string;
  status: string;
  orderType?: string | null;
  specialStatus?: string | null;
  reworkStatus?: string | null;
  reworkOpenedByRole?: string | null;
  internalNotes: string | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(internalNotes || '');
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [confirmingStatus, setConfirmingStatus] = useState<OrderStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [estimatedDate, setEstimatedDate] = useState('');
  const [estimatedNotes, setEstimatedNotes] = useState('');
  const [createSku, setCreateSku] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [reworkRejectReason, setReworkRejectReason] = useState('');
  const currentStatus = status as OrderStatus;
  const isSpecialPending = orderType === 'special' && specialStatus === 'aguardando_analise';
  const isReworkPending = orderType === 'rework' && reworkStatus === 'aguardando_aceite';
  const canOpenRework = status === OrderStatus.FINALIZADO && orderType !== 'rework';
  const transitions = isSpecialPending || isReworkPending ? [] : getAvailableTransitions(currentStatus, true);

  const saveNotes = async () => {
    setPendingAction('notes');
    setConfirmingStatus(null);
    setError(null);
    setMessage(null);

    const result = await updateLabOrderNotesAction(orderId, notes);
    setPendingAction(null);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setMessage('Observacao interna salva.');
    router.refresh();
  };

  const advanceStatus = async (nextStatus: OrderStatus) => {
    if (confirmingStatus !== nextStatus) {
      setConfirmingStatus(nextStatus);
      setError(null);
      setMessage(`Clique novamente para confirmar: ${STATUS_LABELS[nextStatus].toLowerCase()}.`);
      return;
    }

    setPendingAction(nextStatus);
    setConfirmingStatus(null);
    setError(null);
    setMessage(null);

    const result = await updateLabOrderStatusAction({
      orderId,
      nextStatus,
      internalNotes: notes || null,
    });
    setPendingAction(null);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setMessage('Status atualizado com sucesso.');
    router.refresh();
  };

  const approveSpecial = async () => {
    setPendingAction('approve-special');
    setError(null);
    setMessage(null);

    const result = await approveSpecialOrderAction({
      orderId,
      estimated_delivery_date: estimatedDate,
      lab_estimated_delivery_notes: estimatedNotes,
      create_sku: createSku,
    });
    setPendingAction(null);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setMessage(createSku ? 'Pedido especial aprovado e SKU criado.' : 'Pedido especial aprovado.');
    router.refresh();
  };

  const rejectSpecial = async () => {
    setPendingAction('reject-special');
    setError(null);
    setMessage(null);

    const result = await rejectSpecialOrderAction({ orderId, reason: rejectReason });
    setPendingAction(null);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setMessage('Pedido especial rejeitado.');
    router.refresh();
  };

  const acceptRework = async () => {
    setPendingAction('accept-rework');
    setError(null);
    setMessage(null);

    const result = await acceptReworkOrderAction(orderId);
    setPendingAction(null);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setMessage('Retrabalho aceito com sucesso.');
    router.refresh();
  };

  const rejectRework = async () => {
    setPendingAction('reject-rework');
    setError(null);
    setMessage(null);

    const result = await rejectReworkOrderAction({ orderId, reason: reworkRejectReason });
    setPendingAction(null);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setMessage('Retrabalho rejeitado.');
    router.refresh();
  };

  return (
    <SectionCard
      icon={FileText}
      title="Controle do laboratorio"
      description="Registre observacoes internas e avance o status operacional do pedido."
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-2">
          <label className="ml-1 text-[0.86rem] font-bold text-slate-200">Observacao interna</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/62 px-4 py-3 text-[0.95rem] font-medium text-white outline-none transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-400/15"
            placeholder="Informacoes visiveis apenas para o laboratorio."
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              isLoading={pendingAction === 'notes'}
              onClick={saveNotes}
              leftIcon={<FileText size={16} />}
            >
              Salvar observacao
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <p className="text-[0.78rem] font-extrabold uppercase tracking-[0.14em] text-slate-500">Proximas acoes</p>
          {isReworkPending ? (
            <div className="mt-4 flex flex-col gap-3">
              <p className="rounded-2xl border border-amber-300/20 bg-amber-500/10 px-3 py-3 text-[0.84rem] font-semibold text-amber-100">
                Retrabalho aberto pela {reworkOpenedByRole === 'optical' ? 'otica' : 'equipe do laboratorio'} aguardando aceite.
              </p>
              <Button
                type="button"
                variant="success"
                isLoading={pendingAction === 'accept-rework'}
                disabled={Boolean(pendingAction)}
                onClick={acceptRework}
                leftIcon={<CheckCircle2 size={16} />}
                className="w-full"
              >
                Aceitar Retrabalho
              </Button>
              <label className="flex flex-col gap-2 text-[0.82rem] font-bold text-slate-200">
                Motivo da rejeicao
                <textarea
                  value={reworkRejectReason}
                  onChange={(event) => setReworkRejectReason(event.target.value)}
                  rows={3}
                  className="resize-y rounded-2xl border border-white/10 bg-slate-950/62 px-3 py-2 text-white outline-none"
                  placeholder="Ex: Solicitacao nao aprovada pelo laboratorio."
                />
              </label>
              <Button
                type="button"
                variant="danger"
                isLoading={pendingAction === 'reject-rework'}
                disabled={Boolean(pendingAction)}
                onClick={rejectRework}
                leftIcon={<XCircle size={16} />}
                className="w-full"
              >
                Rejeitar Retrabalho
              </Button>
            </div>
          ) : isSpecialPending ? (
            <div className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-2 text-[0.82rem] font-bold text-slate-200">
                Prazo estimado
                <input
                  type="date"
                  value={estimatedDate}
                  onChange={(event) => setEstimatedDate(event.target.value)}
                  className="min-h-11 rounded-2xl border border-white/10 bg-slate-950/62 px-3 text-white outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-[0.82rem] font-bold text-slate-200">
                Mensagem para a otica
                <textarea
                  value={estimatedNotes}
                  onChange={(event) => setEstimatedNotes(event.target.value)}
                  rows={3}
                  className="resize-y rounded-2xl border border-white/10 bg-slate-950/62 px-3 py-2 text-white outline-none"
                  placeholder="Ex: Entrega estimada em 7 dias uteis."
                />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-3 py-3 text-[0.84rem] font-bold text-slate-200">
                <input type="checkbox" checked={createSku} onChange={(event) => setCreateSku(event.target.checked)} />
                Criar SKU a partir deste pedido
              </label>
              <Button
                type="button"
                variant="success"
                isLoading={pendingAction === 'approve-special'}
                disabled={Boolean(pendingAction)}
                onClick={approveSpecial}
                leftIcon={<CheckCircle2 size={16} />}
                className="w-full"
              >
                Aprovar pedido especial
              </Button>
              <label className="flex flex-col gap-2 text-[0.82rem] font-bold text-slate-200">
                Motivo da rejeicao
                <textarea
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  rows={3}
                  className="resize-y rounded-2xl border border-white/10 bg-slate-950/62 px-3 py-2 text-white outline-none"
                  placeholder="Ex: Material indisponivel no momento."
                />
              </label>
              <Button
                type="button"
                variant="danger"
                isLoading={pendingAction === 'reject-special'}
                disabled={Boolean(pendingAction)}
                onClick={rejectSpecial}
                leftIcon={<XCircle size={16} />}
                className="w-full"
              >
                Rejeitar pedido especial
              </Button>
            </div>
          ) : canOpenRework ? (
            <div className="mt-4 flex flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/lab/orders/${orderId}/rework`)}
                leftIcon={<RefreshCw size={16} />}
                className="w-full"
              >
                Abrir Retrabalho
              </Button>
            </div>
          ) : transitions.length ? (
            <div className="mt-4 flex flex-col gap-2">
              {transitions.map((nextStatus) => (
                <Button
                  key={nextStatus}
                  type="button"
                  variant={nextStatus === OrderStatus.CANCELADO ? 'danger' : nextStatus === OrderStatus.CONFIRMADO ? 'success' : 'primary'}
                  isLoading={pendingAction === nextStatus}
                  disabled={Boolean(pendingAction)}
                  onClick={() => advanceStatus(nextStatus)}
                  leftIcon={statusIcon(nextStatus)}
                  className="w-full"
                >
                  {confirmingStatus === nextStatus ? `Confirmar: ${STATUS_LABELS[nextStatus]}` : STATUS_LABELS[nextStatus]}
                </Button>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[0.9rem] font-medium text-slate-400">Nao ha transicoes disponiveis para este status.</p>
          )}
        </div>
      </div>

      {(error || message) && (
        <div className={`mt-4 flex items-center gap-2 rounded-2xl border px-4 py-3 text-[0.9rem] font-semibold ${error ? 'border-red-400/25 bg-red-500/12 text-red-100' : 'border-emerald-400/25 bg-emerald-500/12 text-emerald-100'}`}>
          {error ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{error || message}</span>
        </div>
      )}
    </SectionCard>
  );
}
