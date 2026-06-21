/**
 * Normaliza graus para busca, adicionando variações de formatação.
 * Exemplo: -2 retorna "-2 -2.0 -2.00"
 */
function normalizePowerForSearch(power: number | null, prefix: string): string {
  if (power == null) return '';
  
  const formatted2 = power.toFixed(2); // ex: -2.00
  const formatted1 = power.toFixed(1); // ex: -2.0
  const integer = power.toString();    // ex: -2
  
  const parts = [formatted2, formatted1, integer];
  
  // Adiciona a versão com vírgula para tolerância
  parts.push(formatted2.replace('.', ','));
  parts.push(formatted1.replace('.', ','));

  // Adiciona com o prefixo
  const withPrefix = parts.map(p => `${prefix}${p}`);
  
  return [...parts, ...withPrefix].join(' ');
}

export function generateSearchableText(params: {
  // LensType
  name?: string | null;
  brand?: string | null;
  model?: string | null;
  category?: string | null;
  material?: string | null;
  refractive_index?: string | null;
  treatments?: string[];
  description?: string | null;
  technical_notes?: string | null;
  // LensVariant
  sku?: string | null;
  external_code?: string | null;
  barcode?: string | null;
  color?: string | null;
  coating_details?: string | null;
  extra_info?: string | null;
  // Powers
  sphere_esf?: number | null;
  cylinder_cil?: number | null;
  axis?: number | null;
  addition_add?: number | null;
}): string {
  const parts: string[] = [];

  // Dados básicos
  const textFields = [
    params.name, params.brand, params.model, params.category,
    params.material, params.refractive_index, params.description,
    params.technical_notes, params.sku, params.external_code,
    params.barcode, params.color, params.coating_details, params.extra_info
  ];

  for (const field of textFields) {
    if (field) parts.push(field);
  }

  // Tratamentos
  if (params.treatments && params.treatments.length > 0) {
    parts.push(...params.treatments);
  }

  // Graus com variações
  if (params.sphere_esf != null) {
    parts.push(normalizePowerForSearch(params.sphere_esf, 'esf'));
  }
  if (params.cylinder_cil != null) {
    parts.push(normalizePowerForSearch(params.cylinder_cil, 'cil'));
  }
  if (params.axis != null) {
    parts.push(`eixo${params.axis}`);
    parts.push(params.axis.toString());
  }
  if (params.addition_add != null) {
    parts.push(normalizePowerForSearch(params.addition_add, 'add'));
  }

  // Normaliza o texto final (remove acentos, minúsculas)
  const fullText = parts.join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return fullText;
}
