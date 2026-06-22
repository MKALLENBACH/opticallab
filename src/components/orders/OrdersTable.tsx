'use client';

import Link from 'next/link';
import { ResponsiveDataTable } from '@/components/data/ResponsiveDataTable';
import { PriorityBadge, StatusBadge } from '@/components/ui/Premium';
import { formatDateOnly } from '@/lib/format/date';

export interface OrderTableRow {
  id: string;
  order_number: string;
  status: string;
  priority: string;
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

export function OrdersTable({ data, variant, showSearch = true }: OrdersTableProps) {
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
    { header: 'Status', accessor: (row: OrderTableRow) => <StatusBadge status={row.status} /> },
    { header: 'Prioridade', accessor: (row: OrderTableRow) => <PriorityBadge priority={row.priority} /> },
    { header: 'Itens', accessor: (row: OrderTableRow) => row.item_count ?? '-', align: 'right' as const },
    { header: 'Criado em', accessor: (row: OrderTableRow) => new Date(row.created_at).toLocaleDateString('pt-BR') },
    {
      header: 'Entrega desejada',
      accessor: (row: OrderTableRow) => formatDateOnly(row.desired_delivery_date),
      align: 'right' as const,
    },
  ];

  return (
    <ResponsiveDataTable
      data={data}
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
  );
}
