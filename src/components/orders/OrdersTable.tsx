'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';
import { PriorityBadge, StatusBadge } from '@/components/ui/Premium';
import { Badge } from '@/components/ui/Badge';
import { formatDateOnly, formatTimestampDate } from '@/lib/format/date';

export interface OrderTableRow {
  id: string;
  order_number: string;
  status: string;
  priority: string;
  order_type?: 'normal' | 'special' | string | null;
  special_status?: string | null;
  rework_status?: string | null;
  desired_delivery_date: string | null;
  created_at: string;
  item_count?: number;
  optical_store?: {
    name: string | null;
  } | null;
}

interface OrdersTableProps {
  data: OrderTableRow[];
  variant: 'lab' | 'store';
  showSearch?: boolean;
}

function orderLink(variant: OrdersTableProps['variant'], id: string) {
  return variant === 'lab' ? `/lab/orders/${id}` : `/store/orders/${id}`;
}

function specialStatusLabel(status?: string | null) {
  const map: Record<string, string> = {
    aguardando_confirmacao: 'Aguardando confirmacao',
    confirmado: 'Confirmado',
    aguardando_analise: 'Aguardando analise',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado',
    em_producao: 'Em producao',
    em_entrega: 'Em entrega',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
  };
  return status ? map[status] || status : 'Especial';
}

function reworkStatusLabel(status?: string | null) {
  const map: Record<string, string> = {
    aguardando_aceite: 'Aguardando aceite',
    aceito: 'Aceito',
    rejeitado: 'Rejeitado',
  };
  return status ? map[status] || status : 'Retrabalho';
}

export function OrdersTable({ data, variant, showSearch = true }: OrdersTableProps) {
  const [typeFilter, setTypeFilter] = useState<'all' | 'normal' | 'special' | 'rework'>('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const statuses = useMemo(() => (
    [...new Set(data.map((row) => row.rework_status || row.special_status || row.status).filter(Boolean).map(String))]
  ), [data]);

  const filteredData = useMemo(() => data.filter((row) => {
    const rowType = row.order_type === 'special' ? 'special' : row.order_type === 'rework' ? 'rework' : 'normal';
    const rowStatus = row.rework_status || row.special_status || row.status;
    return (typeFilter === 'all' || rowType === typeFilter)
      && (statusFilter === 'all' || rowStatus === statusFilter);
  }), [data, statusFilter, typeFilter]);

  const columns = [
    {
      header: 'Pedido',
      accessor: (row: OrderTableRow) => (
        <Link href={orderLink(variant, row.id)} className="font-mono font-extrabold text-white hover:text-violet-200">
          {row.order_number}
        </Link>
      ),
    },
    ...(variant === 'lab'
      ? [{
        header: 'Otica',
        accessor: (row: OrderTableRow) => row.optical_store?.name || '-',
      }]
      : []),
    {
      header: 'Tipo',
      accessor: (row: OrderTableRow) => {
        if (row.order_type === 'special') return <Badge variant="info" dot>Pedido Especial</Badge>;
        if (row.order_type === 'rework') return <Badge variant="warning" dot>Retrabalho</Badge>;
        return <Badge variant="default">Normal</Badge>;
      },
    },
    {
      header: 'Status',
      accessor: (row: OrderTableRow) => (
        <div className="flex flex-wrap items-center gap-2">
          {row.order_type === 'special' ? (
            <Badge variant={row.special_status === 'rejeitado' ? 'error' : row.special_status === 'aprovado' ? 'success' : 'warning'} dot>{specialStatusLabel(row.special_status)}</Badge>
          ) : row.order_type === 'rework' ? (
            <Badge variant={row.rework_status === 'rejeitado' ? 'error' : row.rework_status === 'aceito' ? 'success' : 'warning'} dot>{reworkStatusLabel(row.rework_status)}</Badge>
          ) : (
            <StatusBadge status={row.status} />
          )}
          <Link
            href={orderLink(variant, row.id)}
            className="inline-flex min-h-8 items-center rounded-xl border border-violet-300/25 bg-violet-500/12 px-3 text-[0.74rem] font-extrabold text-violet-100 transition-colors hover:border-violet-200/40 hover:bg-violet-500/20 hover:text-white"
          >
            Acessar Pedido
          </Link>
        </div>
      ),
    },
    { header: 'Prioridade', accessor: (row: OrderTableRow) => <PriorityBadge priority={row.priority} /> },
    { header: 'Itens', accessor: (row: OrderTableRow) => row.item_count ?? '-', align: 'right' as const },
    { header: 'Criado em', accessor: (row: OrderTableRow) => formatTimestampDate(row.created_at) },
    {
      header: 'Entrega desejada',
      accessor: (row: OrderTableRow) => formatDateOnly(row.desired_delivery_date),
      align: 'right' as const,
    },
  ];

  return (
    <div>
      {showSearch && data.length > 0 && (
        <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.018] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-wrap gap-2">
            {[
              ['all', 'Todos'],
              ['normal', 'Normais'],
              ['special', 'Especiais'],
              ['rework', 'Retrabalhos'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTypeFilter(value as 'all' | 'normal' | 'special' | 'rework')}
                className={`min-h-9 rounded-xl border px-3 text-[0.76rem] font-extrabold transition-colors ${typeFilter === value ? 'border-violet-300/35 bg-violet-500/18 text-white' : 'border-white/10 bg-slate-950/35 text-slate-400 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="min-h-10 rounded-xl border border-white/10 bg-slate-950/62 px-3 text-[0.82rem] font-bold text-white outline-none"
          >
            <option value="all">Todos os status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{reworkStatusLabel(status) !== status ? reworkStatusLabel(status) : specialStatusLabel(status)}</option>
            ))}
          </select>
        </div>
      )}
      <ResponsiveDataTable
        data={filteredData}
        keyExtractor={(row) => row.id}
        showSearch={showSearch}
        searchPlaceholder={variant === 'lab' ? 'Buscar por pedido, otica, status ou prioridade...' : 'Buscar por pedido, status ou prioridade...'}
        emptyTitle={variant === 'lab' ? 'Nenhum pedido recebido' : 'Nenhum pedido enviado'}
        emptyMessage={variant === 'lab'
          ? 'Quando uma otica fizer um pedido, ele aparecera aqui para confirmacao.'
          : 'Use a busca de lentes para iniciar seu primeiro pedido ao laboratorio.'
        }
        columns={columns}
      />
    </div>
  );
}
