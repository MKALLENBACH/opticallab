export const APP_TIME_ZONE = 'America/Sao_Paulo';

export function formatDateOnly(value: string | null | undefined) {
  if (!value) return '-';

  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);

  if (!year || !month || !day) return '-';

  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: APP_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatTimestampDate(value: string | null | undefined) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: APP_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}
