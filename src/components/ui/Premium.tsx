import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './Card';
import { EntityStatus, OrderPriority, OrderStatus, UserRole } from '@/lib/types/enums';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'urgent';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  backHref,
  backLabel = 'Voltar',
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-2 text-[0.86rem] font-bold text-slate-400 transition-colors hover:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-300">
              <ArrowLeft size={17} />
            </span>
            {backLabel}
          </Link>
        )}
        {eyebrow && (
          <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-500/12 px-3 py-1 text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-violet-300 shadow-[0_0_24px_rgba(139,92,246,0.12)]">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-3 text-[clamp(2rem,3vw,2.75rem)] font-extrabold leading-[1.08] tracking-tight text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-3xl text-[1rem] font-medium leading-7 text-slate-400">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          {actions}
        </div>
      )}
    </header>
  );
}

interface HeaderActionProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function HeaderAction({ href, children, icon }: HeaderActionProps) {
  return (
    <Link href={href} className="w-full sm:w-auto">
      <Button className="w-full" rightIcon={icon ?? <ArrowUpRight size={17} />}>
        {children}
      </Button>
    </Link>
  );
}

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  actions,
  className = '',
  contentClassName = '',
}: SectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-500/16 text-violet-200 shadow-[0_0_30px_rgba(139,92,246,0.18)]">
                <Icon size={19} />
              </span>
            )}
            <div className="min-w-0">
              <CardTitle className="text-white">{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
          {actions}
        </div>
      </CardHeader>
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  );
}

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function FormSection({ title, description, icon: Icon, children }: FormSectionProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.022] p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        {Icon && (
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-500/12 text-indigo-200">
            <Icon size={18} />
          </span>
        )}
        <div>
          <h2 className="text-[1.05rem] font-extrabold text-white">{title}</h2>
          {description && <p className="mt-1 text-[0.88rem] font-medium text-slate-400">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = CircleAlert, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-violet-400/20 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-violet-300/15 bg-violet-400/10 text-violet-200">
          <Icon size={30} />
        </div>
      </div>
      <p className="text-[1.05rem] font-extrabold text-white">{title}</p>
      <p className="mt-2 max-w-sm text-[0.92rem] font-medium text-slate-400">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  tone?: 'violet' | 'blue' | 'emerald' | 'amber' | 'fuchsia';
  helper?: string;
}

const metricTone = {
  violet: ['linear-gradient(135deg,#4f46e5,#8b5cf6)', 'border-violet-400/25', 'bg-violet-500/16'],
  blue: ['linear-gradient(135deg,#2563eb,#3b82f6)', 'border-blue-400/25', 'bg-blue-500/16'],
  emerald: ['linear-gradient(135deg,#059669,#10b981)', 'border-emerald-400/25', 'bg-emerald-500/16'],
  amber: ['linear-gradient(135deg,#f59e0b,#f97316)', 'border-amber-400/25', 'bg-amber-500/16'],
  fuchsia: ['linear-gradient(135deg,#a855f7,#d946ef)', 'border-fuchsia-400/25', 'bg-fuchsia-500/16'],
} as const;

export function MetricCard({ title, value, icon: Icon, href, tone = 'violet', helper }: MetricCardProps) {
  const [gradient, border, glow] = metricTone[tone];
  const content = (
    <div className={`group relative flex min-h-[150px] overflow-hidden rounded-3xl border ${border} bg-slate-950/52 p-5 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.95)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:bg-slate-950/68`}>
      <div className={`pointer-events-none absolute -right-14 -top-16 h-36 w-36 rounded-full blur-3xl ${glow}`} />
      <div className="relative z-10 flex w-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <span className="text-[0.88rem] font-bold text-slate-300">{title}</span>
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_18px_34px_-18px_rgba(99,102,241,0.9)]" style={{ background: gradient }}>
            <Icon size={22} />
          </span>
        </div>
        <div>
          <p className="text-[2.25rem] font-extrabold leading-none tracking-tight text-white">{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</p>
          {helper && <p className="mt-3 text-[0.82rem] font-semibold text-slate-500">{helper}</p>}
          {href && <span className="mt-4 inline-flex items-center gap-1.5 text-[0.86rem] font-bold text-indigo-300 transition-colors group-hover:text-white">Ver detalhes <ArrowUpRight size={14} /></span>}
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function StatusBadge({ status }: { status: string | EntityStatus | OrderStatus }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    active: { label: 'Ativo', variant: 'success' },
    inactive: { label: 'Inativo', variant: 'default' },
    suspended: { label: 'Suspenso', variant: 'warning' },
    aguardando_confirmacao: { label: 'Aguardando', variant: 'warning' },
    confirmado: { label: 'Confirmado', variant: 'info' },
    em_producao: { label: 'Em producao', variant: 'info' },
    em_entrega: { label: 'Em entrega', variant: 'default' },
    finalizado: { label: 'Finalizado', variant: 'success' },
    cancelado: { label: 'Cancelado', variant: 'error' },
  };
  const item = map[String(status)] ?? { label: String(status), variant: 'default' as BadgeVariant };
  return <Badge variant={item.variant} dot>{item.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string | OrderPriority }) {
  return (
    <Badge variant={priority === OrderPriority.URGENTE || priority === 'urgente' ? 'urgent' : 'default'} dot>
      {priority === OrderPriority.URGENTE || priority === 'urgente' ? 'Urgente' : 'Normal'}
    </Badge>
  );
}

export function AvailabilityBadge({ quantity, minimumStock = 0 }: { quantity: number; minimumStock?: number | null }) {
  if (quantity <= 0) return <Badge variant="warning" dot>Sob encomenda</Badge>;
  if (minimumStock !== null && quantity <= minimumStock) return <Badge variant="urgent" dot>Estoque baixo</Badge>;
  return <Badge variant="success" dot>Disponivel</Badge>;
}

export function RoleBadge({ role }: { role: UserRole | string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    platform_admin: { label: 'Admin Global', variant: 'urgent' },
    lab_admin: { label: 'Admin Lab', variant: 'info' },
    lab_user: { label: 'Usuario Lab', variant: 'default' },
    optical_admin: { label: 'Admin Otica', variant: 'warning' },
    optical_user: { label: 'Usuario Otica', variant: 'default' },
  };
  const item = map[String(role)] ?? { label: String(role), variant: 'default' as BadgeVariant };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function FormActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
      {children}
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <div className="mt-2 text-[0.95rem] font-semibold text-slate-100">{value || '-'}</div>
    </div>
  );
}

export function TimelineStep({
  label,
  active,
  complete,
}: {
  label: string;
  active?: boolean;
  complete?: boolean;
}) {
  const Icon = complete ? CheckCircle2 : Clock3;
  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-9 w-9 items-center justify-center rounded-full border ${complete ? 'border-emerald-400/25 bg-emerald-500/14 text-emerald-200' : active ? 'border-violet-300/30 bg-violet-500/16 text-violet-200' : 'border-white/10 bg-white/[0.035] text-slate-500'}`}>
        <Icon size={17} />
      </span>
      <span className={`text-[0.9rem] font-bold ${active || complete ? 'text-white' : 'text-slate-500'}`}>{label}</span>
    </div>
  );
}
