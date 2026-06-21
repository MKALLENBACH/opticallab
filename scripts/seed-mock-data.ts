import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente serão injetadas pelo node --env-file=.env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes no .env.local");
  process.exit(1);
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

async function seed() {
  console.log("🚀 Iniciando geração de dados de teste...");

  try {
    // 1. Criar Laboratório
    console.log("🏭 Criando Laboratório...");
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
    console.log("🏬 Criando Ótica parceira...");
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
    console.log("👤 Criando usuário Auth para o Lab Admin...");
    const { data: labAuth, error: labAuthError } = await supabase.auth.admin.createUser({
      email: LAB_EMAIL,
      password: LAB_PASS,
      email_confirm: true,
      user_metadata: { full_name: 'Admin do LenteLab' }
    });

    if (labAuthError) throw new Error("Erro ao criar Auth Lab Admin: " + labAuthError.message);

    // 4. Criar Profile do Lab Admin
    console.log("📝 Criando perfil para o Lab Admin...");
    await supabase.from('profiles').insert({
      auth_user_id: labAuth.user.id,
      full_name: 'Admin do LenteLab',
      email: LAB_EMAIL,
      role: 'lab_admin',
      lab_id: labId,
      status: 'active'
    });

    // 5. Criar Usuário Store Admin no Auth
    console.log("👤 Criando usuário Auth para o Store Admin...");
    const { data: storeAuth, error: storeAuthError } = await supabase.auth.admin.createUser({
      email: STORE_EMAIL,
      password: STORE_PASS,
      email_confirm: true,
      user_metadata: { full_name: 'Admin da Ótica Visão Lente' }
    });

    if (storeAuthError) throw new Error("Erro ao criar Auth Store Admin: " + storeAuthError.message);

    // 6. Criar Profile do Store Admin
    console.log("📝 Criando perfil para o Store Admin...");
    await supabase.from('profiles').insert({
      auth_user_id: storeAuth.user.id,
      full_name: 'Admin da Ótica Visão Lente',
      email: STORE_EMAIL,
      role: 'optical_admin',
      optical_store_id: storeId,
      status: 'active'
    });

    // 7. Criar Produtos (Lens Types)
    console.log("👓 Criando catálogo de lentes...");
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
    console.log("📦 Adicionando estoque...");
    const vsId = lensTypes.find((l: any) => l.name.includes('Visão Simples'))?.id;
    const mfId = lensTypes.find((l: any) => l.name.includes('Multifocal'))?.id;

    await supabase.from('lens_variants').insert([
      { lab_id: labId, lens_type_id: vsId, sku: 'LL-VS-AR-001', sphere_esf: -2.00, cylinder_cil: 0, quantity_available: 50 },
      { lab_id: labId, lens_type_id: vsId, sku: 'LL-VS-AR-002', sphere_esf: -2.25, cylinder_cil: -0.50, quantity_available: 20 },
      { lab_id: labId, lens_type_id: mfId, sku: 'LL-MF-DIG-001', sphere_esf: 1.00, cylinder_cil: 0, quantity_available: 15 },
      { lab_id: labId, lens_type_id: mfId, sku: 'LL-MF-DIG-002', sphere_esf: 1.50, cylinder_cil: -1.00, quantity_available: 0 } // Sem estoque para teste
    ]);

    // 9. Criar alguns Pedidos de Exemplo
    console.log("📋 Criando pedidos de exemplo...");
    await supabase.from('orders').insert([
      {
        lab_id: labId,
        optical_store_id: storeId,
        order_number: 'PED-' + Math.floor(100000 + Math.random() * 900000),
        status: 'aguardando_confirmacao',
        priority: 'normal',
        patient_name: 'Maria da Silva',
        notes: 'Pedido de teste gerado automaticamente.'
      },
      {
        lab_id: labId,
        optical_store_id: storeId,
        order_number: 'PED-' + Math.floor(100000 + Math.random() * 900000),
        status: 'em_producao',
        priority: 'urgente',
        patient_name: 'José Carlos',
        notes: 'Cliente precisa com urgência.'
      }
    ]);

    console.log("\n✅ Dados de teste gerados com sucesso!\n");
    console.log("=========================================");
    console.log("🔑 LOGINS GERADOS:");
    console.log("-----------------------------------------");
    console.log("Laboratório Admin (Visão do Lab):");
    console.log(`Email: ${LAB_EMAIL}`);
    console.log(`Senha: ${LAB_PASS}`);
    console.log("-----------------------------------------");
    console.log("Ótica Admin (Visão da Ótica):");
    console.log(`Email: ${STORE_EMAIL}`);
    console.log(`Senha: ${STORE_PASS}`);
    console.log("=========================================\n");

  } catch (error) {
    console.error("❌ Ocorreu um erro:", error);
  }
}

seed();
