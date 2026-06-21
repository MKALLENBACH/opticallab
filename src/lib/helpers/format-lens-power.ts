export function formatLensPower(params: {
  sphere?: number | null;
  cylinder?: number | null;
  axis?: number | null;
  addition?: number | null;
}): string {
  const parts: string[] = [];
  
  if (params.sphere != null) {
    const sign = params.sphere > 0 ? '+' : '';
    parts.push(`ESF ${sign}${params.sphere.toFixed(2)}`);
  }
  
  if (params.cylinder != null) {
    const sign = params.cylinder > 0 ? '+' : '';
    parts.push(`CIL ${sign}${params.cylinder.toFixed(2)}`);
  }
  
  if (params.axis != null) {
    parts.push(`Eixo ${params.axis}°`);
  }
  
  if (params.addition != null) {
    const sign = params.addition > 0 ? '+' : '';
    parts.push(`ADD ${sign}${params.addition.toFixed(2)}`);
  }
  
  return parts.join(' | ');
}
