export function formatDateOnly(value: string | null | undefined) {
  if (!value) return '-';

  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);

  if (!year || !month || !day) return '-';

  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day));
}
