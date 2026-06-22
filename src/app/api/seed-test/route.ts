import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type LensTypeSeedRow = {
  id: string;
  name: string;
};

type LensVariantSeedRow = {
  id: string;
  lens_type_id: string;
  sku: string;
  sphere_esf: number | null;
  cylinder_cil: number | null;
  addition_add: number | null;
};

export async function GET() {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Variáveis de ambiente do Supabase ausentes no servidor." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const LAB_EMAIL = 'admin@lentelab.com';
  const LAB_PASS = 'LenteLab123!';

  const STORE_EMAIL = 'admin@oticavisaolente.com';
  const STORE_PASS = 'VisaoLente123!';

  try {
    // 1. Criar Laboratório
    const { data: lab, error: labError } = await supabase
      .from('labs')
      .insert({
        name: 'LenteLab Master',
        slug: 'lentelab-master-' + Date.now(),
        email: 'contato@lentelab.com',
        status: 'active'
      })
      .select('id')
      .single();

    if (labError) throw new Error("Erro ao criar Lab: " + labError.message);
    const labId = lab.id;

    // 2. Criar Ótica vinculada ao Lab
    const { data: store, error: storeError } = await supabase
      .from('optical_stores')
      .insert({
        lab_id: labId,
        name: 'Ótica Visão Lente',
        email: 'contato@oticavisaolente.com',
        status: 'active'
      })
      .select('id')
      .single();

    if (storeError) throw new Error("Erro ao criar Ótica: " + storeError.message);
    const storeId = store.id;

    // 3. Criar Usuário Lab Admin no Auth
    const { data: labAuth, error: labAuthError } = await supabase.auth.admin.createUser({
      email: LAB_EMAIL,
      password: LAB_PASS,
      email_confirm: true,
      user_metadata: { full_name: 'Admin do LenteLab' }
    });

    if (labAuthError) throw new Error("Erro ao criar Auth Lab Admin: " + labAuthError.message);

    // 4. Criar Profile do Lab Admin
    const { data: labProfile, error: labProfileError } = await supabase.from('profiles').insert({
      auth_user_id: labAuth.user.id,
      full_name: 'Admin do LenteLab',
      email: LAB_EMAIL,
      role: 'lab_admin',
      lab_id: labId,
      status: 'active'
    }).select('id').single();

    if (labProfileError) throw new Error("Erro ao criar perfil Lab Admin: " + labProfileError.message);

    // 5. Criar Usuário Store Admin no Auth
    const { data: storeAuth, error: storeAuthError } = await supabase.auth.admin.createUser({
      email: STORE_EMAIL,
      password: STORE_PASS,
      email_confirm: true,
      user_metadata: { full_name: 'Admin da Ótica Visão Lente' }
    });

    if (storeAuthError) throw new Error("Erro ao criar Auth Store Admin: " + storeAuthError.message);

    // 6. Criar Profile do Store Admin
    const { data: storeProfile, error: storeProfileError } = await supabase.from('profiles').insert({
      auth_user_id: storeAuth.user.id,
      full_name: 'Admin da Ótica Visão Lente',
      email: STORE_EMAIL,
      role: 'optical_admin',
      lab_id: labId,
      optical_store_id: storeId,
      status: 'active'
    }).select('id').single();

    if (storeProfileError) throw new Error("Erro ao criar perfil Store Admin: " + storeProfileError.message);

    // 7. Criar Produtos (Lens Types)
    const { data: lensTypes, error: lensError } = await supabase
      .from('lens_types')
      .insert([
        {
          lab_id: labId,
          name: 'Visão Simples AR Premium',
          brand: 'LenteLink',
          category: 'monofocal',
          material: 'resina',
          treatments: ['antirreflexo', 'antirrisco'],
          allow_order_when_out_of_stock: true,
          default_delivery_time_in_stock_days: 1,
          default_production_time_out_of_stock_days: 3
        },
        {
          lab_id: labId,
          name: 'Multifocal Progressiva Digital',
          brand: 'LenteLink',
          category: 'multifocal_progressiva',
          material: 'policarbonato',
          treatments: ['antirreflexo', 'blue_cut'],
          allow_order_when_out_of_stock: false,
          default_delivery_time_in_stock_days: 2,
          default_production_time_out_of_stock_days: 5
        }
      ])
      .select('id, name');

    if (lensError) throw new Error("Erro ao criar Lens Types: " + lensError.message);

    // 8. Criar Estoque (Lens Variants)
    const typedLensTypes = (lensTypes ?? []) as LensTypeSeedRow[];
    const vsId = typedLensTypes.find((lens) => lens.name.includes('Visão Simples'))?.id;
    const mfId = typedLensTypes.find((lens) => lens.name.includes('Multifocal'))?.id;
    let variants: LensVariantSeedRow[] = [];

    if (vsId && mfId) {
      const { data: insertedVariants, error: variantsError } = await supabase.from('lens_variants').insert([
        { lab_id: labId, lens_type_id: vsId, sku: 'LL-VS-AR-001', sphere_esf: -2.00, cylinder_cil: 0, quantity_available: 50 },
        { lab_id: labId, lens_type_id: vsId, sku: 'LL-VS-AR-002', sphere_esf: -2.25, cylinder_cil: -0.50, quantity_available: 20 },
        { lab_id: labId, lens_type_id: mfId, sku: 'LL-MF-DIG-001', sphere_esf: 1.00, cylinder_cil: 0, quantity_available: 15 },
        { lab_id: labId, lens_type_id: mfId, sku: 'LL-MF-DIG-002', sphere_esf: 1.50, cylinder_cil: -1.00, quantity_available: 0 }
      ]).select('id, lens_type_id, sku, sphere_esf, cylinder_cil, addition_add');

      if (variantsError) throw new Error("Erro ao criar variantes: " + variantsError.message);
      variants = (insertedVariants ?? []) as LensVariantSeedRow[];
    }

    // 9. Criar alguns Pedidos de Exemplo
    const { data: orders, error: ordersError } = await supabase.from('orders').insert([
      {
        lab_id: labId,
        optical_store_id: storeId,
        order_number: 'PED-' + Math.floor(100000 + Math.random() * 900000),
        status: 'aguardando_confirmacao',
        priority: 'normal',
        requested_by_profile_id: storeProfile.id,
        notes: 'Pedido de teste gerado automaticamente.'
      },
      {
        lab_id: labId,
        optical_store_id: storeId,
        order_number: 'PED-' + Math.floor(100000 + Math.random() * 900000),
        status: 'em_producao',
        priority: 'urgente',
        requested_by_profile_id: storeProfile.id,
        confirmed_by_profile_id: labProfile.id,
        confirmed_at: new Date().toISOString(),
        notes: 'Cliente precisa com urgência.'
      }
    ]).select('id, status');

    if (ordersError) throw new Error("Erro ao criar pedidos: " + ordersError.message);

    const firstVariant = variants[0];
    const secondVariant = variants[2] ?? variants[1];

    if (orders?.length && firstVariant && secondVariant) {
      await supabase.from('order_items').insert([
        {
          order_id: orders[0].id,
          lab_id: labId,
          lens_type_id: firstVariant.lens_type_id,
          lens_variant_id: firstVariant.id,
          quantity: 1,
          sphere_esf: firstVariant.sphere_esf,
          cylinder_cil: firstVariant.cylinder_cil,
          addition_add: firstVariant.addition_add,
          item_notes: 'Item de teste gerado pelo seed.'
        },
        {
          order_id: orders[1].id,
          lab_id: labId,
          lens_type_id: secondVariant.lens_type_id,
          lens_variant_id: secondVariant.id,
          quantity: 1,
          sphere_esf: secondVariant.sphere_esf,
          cylinder_cil: secondVariant.cylinder_cil,
          addition_add: secondVariant.addition_add,
          item_notes: 'Item urgente de teste.'
        }
      ]);

      await supabase.from('order_status_history').insert(orders.map((order) => ({
        order_id: order.id,
        lab_id: labId,
        old_status: null,
        new_status: order.status,
        changed_by_profile_id: order.status === 'aguardando_confirmacao' ? storeProfile.id : labProfile.id,
        notes: 'Status inicial gerado pelo seed.'
      })));
    }

    return NextResponse.json({
      success: true,
      message: "Dados de teste gerados com sucesso!",
      logins: {
        lab_admin: {
          email: LAB_EMAIL,
          password: LAB_PASS
        },
        store_admin: {
          email: STORE_EMAIL,
          password: STORE_PASS
        }
      }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido ao gerar seed.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
