import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  pathname: string;
  query?: Record<string, string | number | null | undefined>;
}

function pageHref(pathname: string, page: number, query: PaginationControlsProps['query']) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== null && value !== undefined && String(value).trim()) params.set(key, String(value));
  }
  params.set('page', String(page));
  return `${pathname}?${params.toString()}`;
}

export function paginationRange(page: number, pageSize: number) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 10;
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;
  return { page: safePage, pageSize: safePageSize, from, to };
}

export function PaginationControls({ page, pageSize, total, pathname, query }: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(total, safePage * pageSize);
  const previousDisabled = safePage <= 1;
  const nextDisabled = safePage >= totalPages;
  const buttonClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border px-4 text-[0.84rem] font-extrabold transition-all';
  const enabledClass = 'border-white/10 bg-slate-950/42 text-slate-200 hover:border-violet-300/25 hover:bg-white/[0.055] hover:text-white';
  const disabledClass = 'pointer-events-none border-white/5 bg-slate-950/20 text-slate-600';

  return (
    <div className="flex flex-col gap-3 border-t border-white/10 bg-white/[0.018] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="text-[0.84rem] font-semibold text-slate-400">
        Mostrando <strong className="text-slate-200">{start}-{end}</strong> de <strong className="text-slate-200">{total}</strong>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={pageHref(pathname, safePage - 1, query)}
          aria-disabled={previousDisabled}
          className={`${buttonClass} ${previousDisabled ? disabledClass : enabledClass}`}
        >
          <ChevronLeft size={16} /> Anterior
        </Link>
        <span className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-2 text-[0.84rem] font-extrabold text-slate-300">
          Pagina {safePage} de {totalPages}
        </span>
        <Link
          href={pageHref(pathname, safePage + 1, query)}
          aria-disabled={nextDisabled}
          className={`${buttonClass} ${nextDisabled ? disabledClass : enabledClass}`}
        >
          Proxima <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
