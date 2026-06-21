/**
 * Normaliza uma string de busca para ser usada na pesquisa de lentes.
 * - Converte para minúsculas
 * - Remove acentos
 * - Substitui vírgulas por pontos (para graus decimais)
 * - Separa os termos pelos espaços
 * - Preserva números negativos (ex: -2.00)
 */
export function normalizeSearch(query: string): string[] {
  if (!query) return [];

  return query
    .toLowerCase()
    // Remove acentos
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Substitui vírgula por ponto entre números (ex: -2,00 -> -2.00)
    .replace(/(\d),(\d)/g, '$1.$2')
    // Remove espaços duplicados
    .replace(/\s+/g, ' ')
    .trim()
    // Separa os termos
    .split(' ')
    .filter((term) => term.length > 0);
}
