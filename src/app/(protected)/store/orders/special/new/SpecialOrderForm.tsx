'use client';

import { useMemo, useState } from 'react';
import type { ChangeEvent, Dispatch, ReactNode, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, PackageSearch, Search, Sparkles, X } from 'lucide-react';
import { createSpecialOrderAction, createStoreOrderAction } from '@/actions/orders';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { EmptyState, PageHeader, SectionCard } from '@/components/ui/Premium';
import { LensSide, OrderPriority } from '@/lib/types/enums';
import { getTreatmentLabel } from '@/lib/constants/treatments';
import { availabilityFor, formatGrade, type OrderDraftVariant, variantFromRow } from '@/components/orders/orderDraft';

interface LensTypeOption {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  material: string | null;
  refractive_index: string | null;
  treatments: string[];
}

interface SpecialOrderFormProps {
  lensTypes: LensTypeOption[];
  variants: Record<string, unknown>[];
}

interface PowerFields {
  sphere_esf: string;
  cylinder_cil: string;
  axis: string;
  addition_add: string;
}

const emptyPower: PowerFields = {
  sphere_esf: '',
  cylinder_cil: '',
  axis: '',
  addition_add: '',
};

const sideLabels: Record<LensSide, string> = {
  [LensSide.RIGHT]: 'OD',
  [LensSide.LEFT]: 'OE',
  [LensSide.PAIR]: 'Par',
  [LensSide.NOT_APPLICABLE]: 'Nao aplicavel',
};

function uniqueOptions(values: Array<string | null>) {
  return [...new Set(values.filter(Boolean).map(String))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRequiredNumber(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function toPowerPayload(power: PowerFields) {
  return {
    sphere_esf: parseRequiredNumber(power.sphere_esf),
    cylinder_cil: parseOptionalNumber(power.cylinder_cil),
    axis: power.axis.trim() ? Number(power.axis) : null,
    addition_add: parseOptionalNumber(power.addition_add),
  };
}

function availabilityBadge(variant: OrderDraftVariant) {
  const availability = availabilityFor(variant);
  if (availability.state === 'available') return <Badge variant="success" dot>Em estoque</Badge>;
  if (availability.state === 'backorder') return <Badge variant="warning" dot>Sob encomenda</Badge>;
  return <Badge variant="error" dot>Indisponivel</Badge>;
}

function VariantCard({
  variant,
  action,
}: {
  variant: OrderDraftVariant;
  action: ReactNode;
}) {
  const availability = availabilityFor(variant);

  return (
    <Card hover className="min-h-[300px]">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[1rem] font-extrabold text-white">{variant.name}</p>
            <p className="mt-1 text-[0.82rem] font-semibold text-slate-500">
              {variant.brand || 'Sem marca'} - {variant.material || 'Material nao informado'} - {variant.refractive_index || 'Indice nao informado'}
            </p>
          </div>
          {availabilityBadge(variant)}
        </div>

        <div className="rounded-2xl border border-violet-300/18 bg-violet-500/10 px-4 py-4 text-center font-mono text-[1rem] font-extrabold text-white">
          {formatGrade(variant)}
        </div>

        <div className="grid grid-cols-2 gap-2 text-[0.82rem] font-semibold text-slate-400">
          <span>SKU: <strong className="font-mono text-slate-200">{variant.sku}</strong></span>
          <span>Lado: <strong className="text-slate-200">{sideLabels[(variant.side as LensSide | null) || LensSide.NOT_APPLICABLE]}</strong></span>
          <span>Estoque: <strong className="text-slate-200">{variant.quantity_available} un</strong></span>
          <span>Prazo: <strong className="text-slate-200">{availability.leadTime ? `${availability.leadTime} dias` : 'sob confirmacao'}</strong></span>
        </div>

        <div className="flex flex-wrap gap-2">
          {variant.treatments.length ? variant.treatments.map((treatment) => (
            <Badge key={treatment} variant="info" size="sm">{getTreatmentLabel(treatment)}</Badge>
          )) : <Badge size="sm">Sem tratamento</Badge>}
        </div>

        <div className="mt-auto">{action}</div>
      </CardContent>
    </Card>
  );
}

export function SpecialOrderForm({ lensTypes, variants }: SpecialOrderFormProps) {
  const router = useRouter();
  const allVariants = useMemo(() => variants.map((row) => variantFromRow(row)), [variants]);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');
  const [refractiveIndex, setRefractiveIndex] = useState('');
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [selectedLensTypeId, setSelectedLensTypeId] = useState('');
  const [showSpecialForm, setShowSpecialForm] = useState(false);
  const [side, setSide] = useState<LensSide>(LensSide.RIGHT);
  const [quantity, setQuantity] = useState(1);
  const [desiredDate, setDesiredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [singlePower, setSinglePower] = useState<PowerFields>(emptyPower);
  const [rightPower, setRightPower] = useState<PowerFields>(emptyPower);
  const [leftPower, setLeftPower] = useState<PowerFields>(emptyPower);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matches, setMatches] = useState<OrderDraftVariant[]>([]);

  const brands = useMemo(() => uniqueOptions(lensTypes.map((item) => item.brand)), [lensTypes]);
  const categories = useMemo(() => uniqueOptions(lensTypes.map((item) => item.category)), [lensTypes]);
  const materials = useMemo(() => uniqueOptions(lensTypes.map((item) => item.material)), [lensTypes]);
  const indices = useMemo(() => uniqueOptions(lensTypes.map((item) => item.refractive_index)), [lensTypes]);
  const treatments = useMemo(() => uniqueOptions(lensTypes.flatMap((item) => item.treatments)), [lensTypes]);

  const matchingLensTypes = useMemo(() => lensTypes.filter((lensType) => (
    (!brand || lensType.brand === brand)
    && (!category || lensType.category === category)
    && (!material || lensType.material === material)
    && (!refractiveIndex || lensType.refractive_index === refractiveIndex)
    && selectedTreatments.every((treatment) => lensType.treatments.includes(treatment))
  )), [brand, category, lensTypes, material, refractiveIndex, selectedTreatments]);

  const selectedLensType = lensTypes.find((lensType) => lensType.id === selectedLensTypeId) || matchingLensTypes[0] || null;
  const relatedVariants = selectedLensType
    ? allVariants.filter((variant) => variant.lens_type_id === selectedLensType.id)
    : [];

  const selectFilter = (setter: (value: string) => void) => (event: ChangeEvent<HTMLSelectElement>) => {
    setter(event.target.value);
    setSelectedLensTypeId('');
    setShowSpecialForm(false);
  };

  const toggleTreatment = (treatment: string) => {
    setSelectedTreatments((current) => (
      current.includes(treatment) ? current.filter((item) => item !== treatment) : [...current, treatment]
    ));
    setSelectedLensTypeId('');
    setShowSpecialForm(false);
  };

  const selectSku = async (variantId: string) => {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    const result = await createStoreOrderAction({
      priority: OrderPriority.NORMAL,
      desired_delivery_date: desiredDate || null,
      notes: notes || null,
      items: [{ lens_variant_id: variantId, quantity, item_notes: notes || null }],
    });
    setIsSubmitting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push(`/store/orders/${result.orderId}`);
  };

  const specialPayload = (forceSpecial: boolean) => ({
    lens_type_id: selectedLensType?.id || '',
    treatments: selectedLensType?.treatments || [],
    side,
    quantity,
    desired_delivery_date: desiredDate || null,
    optical_notes: notes || null,
    single_power: side === LensSide.PAIR ? null : toPowerPayload(singlePower),
    right_power: side === LensSide.PAIR ? toPowerPayload(rightPower) : null,
    left_power: side === LensSide.PAIR ? toPowerPayload(leftPower) : null,
    force_special: forceSpecial,
  });

  const submitSpecial = async (forceSpecial = false) => {
    if (!selectedLensType) {
      setError('Selecione uma lente do catalogo antes de criar o pedido especial.');
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    const result = await createSpecialOrderAction(specialPayload(forceSpecial));
    setIsSubmitting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    if (result?.requiresConfirmation) {
      setMatches((result.matches || []).map((row) => variantFromRow(row as Record<string, unknown>)));
      return;
    }

    router.push(`/store/orders/${result.orderId}`);
  };

  const updatePower = (
    setter: Dispatch<SetStateAction<PowerFields>>,
    field: keyof PowerFields,
    value: string
  ) => {
    setter((current) => ({ ...current, [field]: value }));
  };

  const renderPowerFields = (title: string, power: PowerFields, setter: Dispatch<SetStateAction<PowerFields>>) => (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <p className="mb-3 text-[0.86rem] font-extrabold text-white">{title}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Input label="ESF" value={power.sphere_esf} onChange={(event) => updatePower(setter, 'sphere_esf', event.target.value)} placeholder="-2,00" />
        <Input label="CIL" value={power.cylinder_cil} onChange={(event) => updatePower(setter, 'cylinder_cil', event.target.value)} placeholder="-0,50" />
        <Input label="Eixo" value={power.axis} onChange={(event) => updatePower(setter, 'axis', event.target.value)} placeholder="180" />
        <Input label="ADD" value={power.addition_add} onChange={(event) => updatePower(setter, 'addition_add', event.target.value)} placeholder="+2,00" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        backHref="/store/orders"
        eyebrow="Pedido sob demanda"
        title="Pedido Especial"
        description="Solicite uma lente a partir do catalogo do laboratorio quando nao encontrar exatamente o grau necessario."
      />

      {(error || message) && (
        <div className={`rounded-2xl border px-4 py-3 text-[0.9rem] font-semibold ${error ? 'border-red-400/25 bg-red-500/12 text-red-100' : 'border-emerald-400/25 bg-emerald-500/12 text-emerald-100'}`}>
          {error || message}
        </div>
      )}

      <SectionCard icon={Search} title="1. Escolha a lente-base" description="As opcoes abaixo vêm do catalogo real do laboratorio.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="flex flex-col gap-2 text-[0.84rem] font-bold text-slate-200">
            Marca
            <select value={brand} onChange={selectFilter(setBrand)} className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/62 px-3 text-white outline-none">
              <option value="">Todas</option>
              {brands.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-[0.84rem] font-bold text-slate-200">
            Categoria
            <select value={category} onChange={selectFilter(setCategory)} className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/62 px-3 text-white outline-none">
              <option value="">Todas</option>
              {categories.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-[0.84rem] font-bold text-slate-200">
            Material
            <select value={material} onChange={selectFilter(setMaterial)} className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/62 px-3 text-white outline-none">
              <option value="">Todos</option>
              {materials.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-[0.84rem] font-bold text-slate-200">
            Indice
            <select value={refractiveIndex} onChange={selectFilter(setRefractiveIndex)} className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/62 px-3 text-white outline-none">
              <option value="">Todos</option>
              {indices.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {treatments.map((treatment) => {
            const active = selectedTreatments.includes(treatment);
            return (
              <button
                key={treatment}
                type="button"
                onClick={() => toggleTreatment(treatment)}
                className={`min-h-10 rounded-2xl border px-4 text-[0.8rem] font-extrabold transition-all ${active ? 'border-blue-300/40 bg-blue-500/18 text-white' : 'border-white/10 bg-slate-950/35 text-slate-400 hover:text-white'}`}
              >
                {getTreatmentLabel(treatment)}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {matchingLensTypes.map((lensType) => (
            <button
              key={lensType.id}
              type="button"
              onClick={() => {
                setSelectedLensTypeId(lensType.id);
                setShowSpecialForm(false);
              }}
              className={`rounded-2xl border p-4 text-left transition-all ${selectedLensType?.id === lensType.id ? 'border-violet-300/45 bg-violet-500/14' : 'border-white/10 bg-white/[0.025] hover:border-violet-300/25'}`}
            >
              <p className="font-extrabold text-white">{lensType.name}</p>
              <p className="mt-1 text-[0.82rem] font-semibold text-slate-400">
                {lensType.brand || 'Sem marca'} - {lensType.material || 'Material nao informado'} - {lensType.refractive_index || 'Indice nao informado'}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {lensType.treatments.map((treatment) => (
                  <Badge key={treatment} variant="info" size="sm">{getTreatmentLabel(treatment)}</Badge>
                ))}
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={PackageSearch} title="2. Confira SKUs relacionados" description="Se encontrar o grau correto, use o fluxo normal por SKU.">
        {selectedLensType ? (
          <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[0.88rem] font-semibold text-slate-400">
                {relatedVariants.length} {relatedVariants.length === 1 ? 'SKU encontrado' : 'SKUs encontrados'} para {selectedLensType.name}.
              </p>
              <Button type="button" variant="secondary" leftIcon={<Sparkles size={16} />} onClick={() => setShowSpecialForm(true)}>
                Pedido Especial
              </Button>
            </div>
            {relatedVariants.length ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {relatedVariants.map((variant) => (
                  <VariantCard
                    key={variant.id}
                    variant={variant}
                    action={(
                      <Button type="button" className="w-full" disabled={isSubmitting} onClick={() => selectSku(variant.id)}>
                        Selecionar este SKU
                      </Button>
                    )}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={AlertTriangle}
                title="Nenhum SKU encontrado"
                description="Voce ainda pode solicitar uma lente sob demanda usando Pedido Especial."
                action={<Button type="button" onClick={() => setShowSpecialForm(true)}>Criar Pedido Especial</Button>}
              />
            )}
          </>
        ) : (
          <EmptyState icon={PackageSearch} title="Selecione uma lente-base" description="Escolha uma opcao do catalogo para carregar os SKUs relacionados." />
        )}
      </SectionCard>

      {showSpecialForm && selectedLensType && (
        <SectionCard icon={Sparkles} title="3. Dados do Pedido Especial" description="Informe o grau desejado. Antes de criar, vamos verificar se ja existe SKU compativel.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_160px_1fr]">
            <label className="flex flex-col gap-2 text-[0.84rem] font-bold text-slate-200">
              Lado
              <select value={side} onChange={(event) => setSide(event.target.value as LensSide)} className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/62 px-3 text-white outline-none">
                <option value={LensSide.RIGHT}>OD</option>
                <option value={LensSide.LEFT}>OE</option>
                <option value={LensSide.PAIR}>Par</option>
                <option value={LensSide.NOT_APPLICABLE}>Nao aplicavel</option>
              </select>
            </label>
            <Input label="Quantidade" type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
            <Input label="Prazo desejado" type="date" value={desiredDate} onChange={(event) => setDesiredDate(event.target.value)} />
          </div>

          <div className="mt-5 space-y-3">
            {side === LensSide.PAIR ? (
              <>
                {renderPowerFields('Olho direito - OD', rightPower, setRightPower)}
                {renderPowerFields('Olho esquerdo - OE', leftPower, setLeftPower)}
              </>
            ) : renderPowerFields(`Grau solicitado - ${sideLabels[side]}`, singlePower, setSinglePower)}
          </div>

          <label className="mt-5 flex flex-col gap-2 text-[0.84rem] font-bold text-slate-200">
            Observacoes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/62 px-4 py-3 text-[0.95rem] font-medium text-white outline-none transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-400/15"
              placeholder="Ex: cliente precisa para a proxima semana."
            />
          </label>

          <div className="mt-5 flex justify-end">
            <Button type="button" isLoading={isSubmitting} onClick={() => submitSpecial(false)} rightIcon={<Check size={16} />}>
              Criar Pedido Especial
            </Button>
          </div>
        </SectionCard>
      )}

      {matches.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-extrabold text-white">Encontramos uma lente compativel</p>
                <p className="mt-2 text-[0.92rem] font-medium text-slate-400">
                  Antes de criar um Pedido Especial, confira se esta lente atende ao que voce precisa.
                </p>
              </div>
              <button type="button" onClick={() => setMatches([])} className="rounded-xl border border-white/10 p-2 text-slate-300 hover:text-white" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {matches.map((variant) => (
                <VariantCard
                  key={variant.id}
                  variant={variant}
                  action={(
                    <div className="flex flex-col gap-2">
                      <Button type="button" onClick={() => selectSku(variant.id)} disabled={isSubmitting}>Usar este SKU</Button>
                      <Button type="button" variant="outline" onClick={() => submitSpecial(true)} disabled={isSubmitting}>Continuar com Pedido Especial</Button>
                    </div>
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
