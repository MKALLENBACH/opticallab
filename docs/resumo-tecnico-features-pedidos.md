# Documento tecnico - evolucao dos fluxos de pedidos, estoque e catalogo

Data da analise: 30/06/2026  
Projeto analisado: `opticalab`  
Branch analisada: `main`

## 1. Visao geral

Este documento consolida o estado atual do projeto a partir das funcionalidades implementadas em torno de pedido especial, pedido sob demanda, retrabalho, receita obrigatoria, opcoes dinamicas por laboratorio, motivo de retrabalho customizado, paginacao e ajustes associados em pedidos normais, estoque, SKUs, busca da otica e dashboard do laboratorio.

A arquitetura atual usa Next.js App Router, Server Actions, Supabase Auth, Supabase Database, Supabase Storage e RLS no Postgres. A modelagem segue um desenho multi-tenant por laboratorio, com usuarios de laboratorio vinculados diretamente a `profiles.lab_id` e usuarios de otica vinculados a `profiles.optical_store_id`, resolvendo o laboratorio via `optical_stores.lab_id`.

Arquivos principais analisados:

- `src/actions/orders.ts`
- `src/actions/lens-types.ts`
- `src/actions/lens-variants.ts`
- `src/actions/lab-custom-options.ts`
- `src/components/orders/OrderBuilder.tsx`
- `src/components/orders/StoreSearchClient.tsx`
- `src/app/(protected)/store/orders/special/new/SpecialOrderForm.tsx`
- `src/components/orders/ReworkOrderForm.tsx`
- `src/components/orders/OrderDetailView.tsx`
- `src/components/orders/OrderDetailActions.tsx`
- `src/components/orders/OrdersTable.tsx`
- `src/components/orders/PrescriptionAttachmentUpload.tsx`
- `src/components/orders/OrderAttachmentsSection.tsx`
- `src/components/ui/LabOptionSelect.tsx`
- `src/components/ui/PaginationControls.tsx`
- `src/lib/data/lab-custom-options.ts`
- `src/lib/data/order-attachments.ts`
- `src/lib/constants/lab-options.ts`
- `src/lib/constants/order-flow.ts`
- `src/lib/format/date.ts`
- `supabase/migrations/20260624000000_special_orders.sql`
- `supabase/migrations/20260624000001_rework_orders.sql`
- `supabase/migrations/20260625000000_prescriptions_custom_options.sql`

Resumo de resultado:

- Pedido especial esta implementado como `orders.order_type = 'special'`, com status proprio em `special_status`.
- Pedido normal por SKU continua com fluxo proprio via `OrderBuilder` e `createStoreOrderAction`.
- Busca da otica e criacao de pedido normal agora carregam catalogo automaticamente e permitem filtro `Todos`, `Em estoque` e `Sob encomenda`.
- Retrabalho esta implementado como novo pedido vinculado a um pedido finalizado por `parent_order_id`, com `order_type = 'rework'`.
- Receita e obrigatoria para pedidos criados pela otica e anexada em bucket privado do Supabase.
- Opcoes dinamicas por laboratorio estao centralizadas em `lab_custom_options`.
- Motivo de retrabalho customizado existe para laboratorio; otica consome a lista ja cadastrada.
- Paginacao server-side existe nas principais listagens administrativas/operacionais.
- Acoes de dashboard incluem botao `Acessar Pedido` nos pedidos pendentes do laboratorio e a visao da otica usa `OrdersTable`, que tambem mostra o botao.

## 2. Pedido Especial / Pedido Sob Demanda

O pedido especial foi adicionado ao modelo de `orders` pela migration `20260624000000_special_orders.sql`.

Campos adicionados em `orders`:

- `order_type`: diferencia `normal`, `special` e, apos migration posterior, `rework`.
- `special_status`: controla o ciclo proprio do pedido especial.
- `estimated_delivery_date`: prazo estimado definido pelo laboratorio.
- `lab_estimated_delivery_notes`: mensagem do laboratorio para a otica.
- `special_rejection_reason`: motivo de rejeicao.
- `matched_lens_variant_id`: SKU compativel encontrado antes da abertura do especial.
- `created_lens_variant_id`: SKU criado a partir do pedido especial aprovado.

Campos adicionados em `lens_variants`:

- `source_special_order_id`: vincula SKU criado automaticamente ao pedido especial que originou o cadastro.

Fluxo implementado:

1. A otica acessa `/store/orders/special/new`.
2. A pagina carrega lentes base e SKUs ativos do laboratorio vinculado.
3. O componente `SpecialOrderForm` permite filtrar por marca, categoria, material, indice e tratamento.
4. A otica informa lado, quantidade, grau, observacoes, data desejada e receita.
5. A Server Action `createSpecialOrderAction` valida lente, tratamentos, grau e receita.
6. Antes de criar o pedido especial, o sistema executa double check buscando SKUs compativeis.
7. Se houver SKU compativel e `force_special` nao estiver marcado, a action retorna `requiresConfirmation`.
8. A UI exibe modal com SKUs encontrados, permitindo usar o SKU normal ou continuar com o pedido especial.
9. Se confirmado como especial, o pedido e criado com `order_type = 'special'`, `special_status = 'aguardando_analise'` e `status = 'aguardando_confirmacao'`.
10. O laboratorio aprova ou rejeita o pedido no detalhe via `LabOrderDetailActions`.
11. Na aprovacao, o laboratorio informa prazo estimado e pode criar SKU automaticamente.
12. Se `create_sku = true`, `approveSpecialOrderAction` cria registros em `lens_variants` com `source_special_order_id`, atualiza os `order_items` e confirma o pedido.

Status especificos do pedido especial:

- `aguardando_analise`
- `aprovado`
- `rejeitado`
- `em_producao`
- `em_entrega`
- `finalizado`
- `cancelado`

Observacao tecnica: embora o enum de `special_status` aceite varios estados, a acao de aprovacao encontrada no codigo atual muda o pedido para `special_status = 'aprovado'` e `orders.status = 'confirmado'`. A evolucao operacional posterior usa o `orders.status` normal. Transicoes dedicadas de `special_status` para `em_producao`, `em_entrega` e `finalizado` nao foram encontradas no codigo atual.

## 3. Double check de SKU compativel

O double check aparece em `src/actions/orders.ts`, principalmente em:

- `sameTreatmentSet`
- `findCompatibleSpecialVariants`
- `createSpecialOrderAction`
- `createReworkOrderAction`

Criterios usados para encontrar SKU compativel:

- mesmo `lab_id`;
- mesma `lens_type_id`;
- SKU ativo;
- lente base ativa;
- mesmo lado (`side`);
- mesmo `sphere_esf`;
- mesmo `cylinder_cil`, com comparacao nula segura;
- mesmo `axis`, com comparacao nula segura;
- mesmo `addition_add`, com comparacao nula segura;
- tratamentos compativeis pela lente base.

Onde aparece na UI:

- `SpecialOrderForm`: modal "Encontramos uma lente compativel".
- `ReworkOrderForm`: modal equivalente quando a acao do item e `special`.

Resultado funcional:

- O sistema evita que a otica abra pedido especial quando ja existe SKU tecnico equivalente.
- A otica pode escolher `Usar este SKU`, transformando a solicitacao em pedido normal por SKU.
- A otica pode forcar a continuidade como pedido especial quando a regra de negocio permitir.

Risco atual:

- A comparacao e exata para grau e lado. Pode haver falso negativo se houver diferencas de arredondamento, representacao decimal ou convencoes de lado.
- O limite de retorno e pequeno, pensado para decisao operacional, nao para busca completa.

## 4. Retrabalho

O retrabalho foi adicionado pela migration `20260624000001_rework_orders.sql` e consolidado pelas actions e componentes atuais.

Campos adicionados em `orders`:

- `parent_order_id`: pedido original finalizado.
- `rework_reason`: motivo do retrabalho.
- `rework_status`: estado especifico do aceite/rejeicao.
- `rework_opened_by_profile_id`: usuario que abriu.
- `rework_opened_by_role`: origem `lab` ou `optical`.
- `rework_rejected_reason`: motivo de rejeicao.
- `rework_accepted_at`: data/hora de aceite.
- `rework_accepted_by_profile_id`: usuario que aceitou.

Campos adicionados em `order_items`:

- `source_order_item_id`: item original que originou o retrabalho.
- `rework_action`: `same_lens`, `replace_sku` ou `special`.

Regras encontradas:

- Retrabalho so pode ser aberto a partir de pedido com `status = 'finalizado'`.
- Nao e permitido abrir retrabalho sobre outro retrabalho (`order_type = 'rework'`).
- A otica so pode abrir retrabalho de pedido da propria otica.
- O laboratorio so pode abrir retrabalho de pedido do proprio laboratorio.
- A otica precisa anexar receita.
- Para a otica, observacoes sao obrigatorias no schema de entrada.
- Para o laboratorio, receita e opcional.
- Retrabalho aberto pelo laboratorio nasce aceito (`rework_status = 'aceito'`) e com `orders.status = 'confirmado'`.
- Retrabalho aberto pela otica nasce aguardando aceite (`rework_status = 'aguardando_aceite'`) e com `orders.status = 'aguardando_confirmacao'`.
- O laboratorio pode aceitar ou rejeitar retrabalho aberto pela otica.
- Ao aceitar, o sistema valida e baixa estoque quando aplicavel.
- Ao rejeitar, o pedido de retrabalho passa para `status = 'cancelado'` e `rework_status = 'rejeitado'`.

Acoes por item:

- `same_lens`: copia dados do item original.
- `replace_sku`: troca por outro SKU ativo do mesmo laboratorio.
- `special`: cria item sem SKU direto, usando dados tecnicos informados e double check de SKU compativel.

Componentes e rotas:

- `/store/orders/[id]/rework`
- `/lab/orders/[id]/rework`
- `ReworkOrderForm`
- `StoreOrderDetailActions`
- `LabOrderDetailActions`
- `OrderDetailView`

Resultado funcional:

- O retrabalho preserva historico do pedido original.
- O novo pedido fica rastreavel por `parent_order_id`.
- Os itens de retrabalho ficam rastreaveis por `source_order_item_id`.
- O detalhe do pedido mostra dados especificos de retrabalho e pedidos vinculados.

## 5. Receita obrigatoria

A obrigatoriedade de receita foi implementada em frontend, Server Actions, banco e Storage.

Migration relacionada:

- `20260625000000_prescriptions_custom_options.sql`

Alteracoes em `order_attachments`:

- `attachment_type text NOT NULL DEFAULT 'prescription'`
- `file_path text`
- migracao de `file_url` para `file_path`
- CHECK de `attachment_type IN ('prescription', 'general')`
- indices para `attachment_type` e `file_path`

Bucket:

- `order-attachments`
- privado
- assinado sob demanda por `getOrderAttachmentViews`

Componente de upload:

- `PrescriptionAttachmentUpload`

Validacoes client-side:

- tipos aceitos: JPG, PNG, WEBP e PDF;
- tamanho maximo: 10 MB;
- caminho gerado em `${labId}/pending/${profileId}/...`;
- opcao de anexar arquivo ou tirar foto em dispositivos compativeis.

Validacoes server-side:

- `validatePendingPrescription` valida tipo, extensao, tamanho, path esperado e previne path traversal.
- `attachPrescriptionToOrder` grava metadados em `order_attachments`.
- Em caso de falha apos criar pedido, `rollbackCreatedOrder` remove o pedido e tenta remover o arquivo pendente.

Obrigatoriedade por fluxo:

- Pedido normal pela otica: obrigatoria.
- Pedido especial pela otica: obrigatoria.
- Retrabalho pela otica: obrigatoria.
- Retrabalho pelo laboratorio: opcional.
- Edicao de pedido normal ja criado: nao exige novo upload no codigo atual.

Visualizacao:

- `OrderAttachmentsSection` filtra anexos `prescription`, mostra thumbnail para imagens, icone para PDF/arquivo, botao de visualizar imagem e botao abrir/baixar via signed URL.
- `getOrderAttachmentViews` gera URL assinada por 10 minutos.

## 6. Enums e opcoes dinamicas por laboratorio

A migration `20260625000000_prescriptions_custom_options.sql` flexibilizou campos antes presos a enums:

- `lens_types.category`
- `lens_types.material`
- `lens_types.refractive_index`

Esses campos passaram a aceitar `text`, permitindo opcoes customizadas por laboratorio.

Tabela nova:

- `lab_custom_options`

Campos principais:

- `lab_id`
- `option_type`
- `name`
- `normalized_name`
- `status`
- `created_by_profile_id`
- `created_at`
- `updated_at`

Tipos suportados:

- `brand`
- `lens_category`
- `lens_material`
- `refractive_index`
- `lens_treatment`
- `rework_reason`

Unicidade:

- `UNIQUE (lab_id, option_type, normalized_name)`

Fontes de opcoes:

- Defaults em `src/lib/constants/lab-options.ts`
- Opcoes customizadas em `lab_custom_options`
- Valores ja existentes em `lens_types`, mesclados por `getLabCustomOptions`

Componentes:

- `LabOptionSelect`: campo unico com opcao `Outro`.
- `LabOptionMultiSelect`: selecao multipla, usada para tratamentos.
- `createLabCustomOption`: cria ou reativa opcao customizada.

Uso atual:

- Cadastro/edicao de lente base (`LensTypeForm`):
  - marca;
  - categoria;
  - material;
  - indice de refracao;
  - tratamentos inclusos.
- Retrabalho (`ReworkOrderForm`):
  - motivo de retrabalho customizavel para laboratorio.

Resultado funcional:

- Cada laboratorio pode manter seu vocabulário proprio de catalogo sem migration para cada novo valor.
- O sistema reaproveita valores ja existentes no catalogo para preencher opcoes.
- O cadastro de `Outro` fica no fluxo de trabalho, reduzindo atrito operacional.

Risco atual:

- `src/lib/types/enums.ts` ainda possui enums historicos de categoria/material/indice. Isso nao quebra diretamente porque validadores aceitam `string`, mas cria risco de divergencia se algum trecho futuro voltar a depender de enum estrito.

## 7. Motivo de retrabalho customizado

O motivo de retrabalho foi migrado de CHECK restritivo para validacao dinamica.

Antes:

- `orders.rework_reason` tinha CHECK limitado a `erro_de_medico`.

Depois:

- A migration removeu o CHECK antigo.
- Foi adicionado CHECK apenas para exigir motivo nao vazio quando `order_type = 'rework'`.
- A validade semantica passa a ser feita em `validateReworkReason`.

Comportamento de `validateReworkReason`:

- Aceita o default `erro_de_medico`.
- Aceita tambem o label default normalizado.
- Busca opcoes ativas em `lab_custom_options` com `option_type = 'rework_reason'`.
- Retorna erro quando o motivo nao pertence ao laboratorio.

UI:

- No fluxo do laboratorio, `ReworkOrderForm` usa `LabOptionSelect`, permitindo cadastrar novo motivo.
- No fluxo da otica, o componente usa `<select>` simples com motivos disponiveis. A otica nao cria novos motivos no codigo atual.

Resultado funcional:

- O laboratorio controla a taxonomia de retrabalho.
- A otica consome motivos permitidos pelo laboratorio.
- O banco garante que retrabalho tenha motivo preenchido.

## 8. Paginacao global

Componente central:

- `src/components/ui/PaginationControls.tsx`

Funcao auxiliar:

- `paginationRange(page, pageSize)`

Listagens com paginacao server-side encontrada:

- `/store/orders`
- `/lab/orders`
- `/lab/stock`
- `/lab/lens-types`
- `/admin/labs`
- `/admin/users`
- `/lab/optical-stores`

Comportamento:

- `page` vem de `searchParams`.
- `pageSize` padrao usado nas paginas analisadas: 10.
- Queries usam `.range(from, to)` com `count: 'exact'`.
- `PaginationControls` mostra intervalo atual, total e links `Anterior`/`Proxima`.

Busca paginada na otica:

- `StoreSearchClient` usa paginacao client-driven contra Supabase com `.range`.
- `OrderBuilder` tambem carrega catalogo automaticamente com paginação interna.
- Ambos possuem filtros `Todos`, `Em estoque` e `Sob encomenda`.

Limitacao atual:

- `ResponsiveDataTable` faz busca apenas sobre os registros da pagina atual. Para listagens server-side, a busca nao consulta todas as paginas no banco.

## 9. Banco de dados e migrations

Migrations diretamente relacionadas:

- `20260624000000_special_orders.sql`
- `20260624000001_rework_orders.sql`
- `20260625000000_prescriptions_custom_options.sql`

Migrations base relevantes:

- `20260621000000_initial_schema.sql`
- `20260621000002_functions_and_triggers.sql`
- `20260621000003_rls_policies.sql`
- `20260621000004_storage.sql`
- `20260621000006_rls_tests.sql`

Principais impactos:

- `orders` ganhou tipos operacionais (`normal`, `special`, `rework`).
- `orders` ganhou metadados de pedido especial.
- `orders` ganhou vinculo e metadados de retrabalho.
- `order_items` ganhou rastreabilidade de retrabalho.
- `lens_variants` ganhou vinculo com pedido especial de origem.
- `order_attachments` ganhou tipagem e path de Storage.
- `lab_custom_options` foi criada para opcoes dinamicas multi-tenant.
- Storage privado para receitas foi reforcado com politicas por path e relacao de pedido.

Triggers/funcoes relevantes:

- `get_current_profile`
- `get_current_lab_id`
- `get_current_optical_store_id`
- `get_current_role`
- `get_next_order_number`
- `validate_order_status_transition`
- `update_updated_at`
- `build_searchable_text`

Observacao sobre busca:

- `build_searchable_text` monta texto pesquisavel dos SKUs a partir da lente base, tratamentos, SKU, grau e dados tecnicos.
- Ao atualizar uma lente base, `updateLensTypeAction` faz um `touch` nos `lens_variants` para disparar trigger e atualizar busca dos SKUs relacionados.

## 10. Permissoes e multi-tenant

Modelo de tenant:

- Laboratorio: `profiles.lab_id`.
- Otica: `profiles.optical_store_id`, com laboratorio derivado por `optical_stores.lab_id`.
- Platform admin: acesso administrativo amplo.

RLS encontrada:

- `orders`: lab acessa pedidos do proprio lab; otica acessa pedidos da propria otica; platform admin acessa tudo.
- `order_items`: lab acessa itens do proprio lab; otica acessa itens dos proprios pedidos; insert/update/delete da otica limitado a pedido aguardando confirmacao.
- `order_attachments`: lab acessa anexos do proprio lab; otica acessa anexos dos proprios pedidos.
- `lens_types` e `lens_variants`: leitura de ativos do mesmo lab; escrita por roles de laboratorio.
- `lab_custom_options`: select por platform admin ou mesmo lab; insert/update por lab_admin/lab_user do mesmo lab.
- Storage `order-attachments`: leitura condicionada a anexo vinculado e visibilidade do pedido; upload pendente limitado ao path do proprio usuario; delete permitido para pendentes proprios ou anexos vinculados conforme regra.

Checks adicionais nas Server Actions:

- `getProfileContext` valida usuario ativo e resolve `lab_id`.
- Criacao de pedido normal/especial exige role de otica.
- Acoes operacionais de laboratorio exigem role de laboratorio.
- Queries de detalhe de pedido sempre filtram por `lab_id` e, na otica, por `optical_store_id`.

Resultado:

- A separacao multi-tenant esta aplicada em banco e reforcada em actions.
- As actions nao dependem apenas da UI para proteger fluxo.

Risco atual:

- Algumas paginas resolvem `lab_id` da otica de maneiras diferentes. `getProfileContext` ja trata o caso corretamente; consolidar esse padrao reduziria duplicacao e risco de divergencia.

## 11. Componentes principais

Pedidos normais:

- `OrderBuilder`
  - cria e edita pedidos normais;
  - busca SKUs automaticamente;
  - filtros de disponibilidade;
  - rascunho em localStorage;
  - anexo de receita obrigatório na criacao;
  - mantém fluxo SKU sem alteracao estrutural de negocio.

Busca de catalogo para otica:

- `StoreSearchClient`
  - lista SKUs ativos;
  - busca por `searchable_text`;
  - filtros `Todos`, `Em estoque`, `Sob encomenda`;
  - adiciona item ao rascunho e redireciona para pedido normal.

Pedido especial:

- `SpecialOrderForm`
  - filtros de lente base;
  - selecao por lado/grau;
  - upload de receita;
  - modal de double check;
  - fluxo para usar SKU existente ou continuar especial.

Retrabalho:

- `ReworkOrderForm`
  - seleciona itens do pedido original;
  - define acao por item;
  - permite trocar SKU;
  - permite gerar item especial;
  - exige receita para otica;
  - usa motivo customizado para laboratorio.

Detalhe e acoes:

- `OrderDetailView`
  - renderiza pedido normal, especial e retrabalho;
  - mostra anexos;
  - mostra historico;
  - mostra pedido pai e retrabalhos vinculados.
- `StoreOrderDetailActions`
  - edicao de pedido normal aguardando confirmacao;
  - abertura de retrabalho em pedido finalizado.
- `LabOrderDetailActions`
  - observacao interna;
  - transicoes de status;
  - aprovacao/rejeicao de especial;
  - aceite/rejeicao de retrabalho;
  - abertura de retrabalho pelo laboratorio.

Anexos:

- `PrescriptionAttachmentUpload`
- `OrderAttachmentsSection`

Opcoes dinamicas:

- `LabOptionSelect`
- `LabOptionMultiSelect`

Listagens:

- `OrdersTable`
- `StockTable`
- `LensTypesTable`
- `ResponsiveDataTable`
- `PaginationControls`

## 12. Server Actions, services e queries

`src/actions/orders.ts` concentra a maior parte da regra de negocio.

Actions de pedido:

- `createStoreOrderAction`
- `updateStoreOrderAction`
- `createSpecialOrderAction`
- `approveSpecialOrderAction`
- `rejectSpecialOrderAction`
- `createReworkOrderAction`
- `acceptReworkOrderAction`
- `rejectReworkOrderAction`
- `updateLabOrderStatusAction`
- `updateLabOrderNotesAction`

Funcoes internas relevantes:

- `getProfileContext`
- `validateStoreOrderItems`
- `specialItemsFromPayload`
- `sameTreatmentSet`
- `validateSpecialLensType`
- `findCompatibleSpecialVariants`
- `buildSpecialSku`
- `daysUntil`
- `validatePendingPrescription`
- `attachPrescriptionToOrder`
- `rollbackCreatedOrder`
- `validateReworkReason`
- `validateStockForItems`
- `deductStockForOrder`
- `restoreStockForCanceledOrder`
- `revalidateOrderRoutes`

Catalogo e SKUs:

- `createLensTypeAction`
- `updateLensTypeAction`
- `createLensVariantAction`
- `updateLensVariantAction`

Opcoes dinamicas:

- `createLabCustomOption`
- `getLabCustomOptions`

Anexos:

- `getOrderAttachmentViews`

Datas:

- `formatDateOnly`
- `formatDateTime`
- `formatTimestampDate`

## 13. Fluxos passo a passo

### 13.1 Pedido normal por SKU

1. Otica abre `/store/search` ou `/store/orders/new`.
2. Catalogo carrega SKUs ativos automaticamente.
3. Usuario filtra por termo e disponibilidade.
4. Usuario adiciona SKU.
5. `OrderBuilder` monta itens, quantidade, prioridade, entrega desejada e receita.
6. `createStoreOrderAction` valida role, loja, lab, receita e itens.
7. Pedido nasce em `aguardando_confirmacao`.
8. Laboratorio confirma e o estoque e baixado.
9. Pedido segue transicoes normais ate finalizacao.

### 13.2 Pedido especial

1. Otica abre `/store/orders/special/new`.
2. Escolhe lente base e atributos.
3. Informa grau, quantidade, data desejada, observacoes e receita.
4. Action busca SKUs compativeis.
5. Se encontrar, UI exige decisao entre usar SKU ou continuar especial.
6. Pedido especial nasce aguardando analise.
7. Laboratorio aprova com prazo ou rejeita com motivo.
8. Se aprovado com `Criar SKU`, o sistema cria SKU e vincula itens.

### 13.3 Retrabalho aberto pela otica

1. Pedido original precisa estar finalizado.
2. Otica acessa detalhe e clica em `Abrir Retrabalho`.
3. Seleciona itens.
4. Escolhe motivo, descreve observacoes e anexa receita.
5. Para cada item, escolhe refazer igual, trocar SKU ou criar especial.
6. Pedido de retrabalho nasce aguardando aceite do laboratorio.
7. Laboratorio aceita ou rejeita.
8. Se aceita, estoque e validado/baixado quando aplicavel e o pedido segue fluxo operacional.

### 13.4 Retrabalho aberto pelo laboratorio

1. Pedido original precisa estar finalizado.
2. Laboratorio acessa detalhe e clica em `Abrir Retrabalho`.
3. Seleciona itens e motivo.
4. Pode criar motivo customizado no proprio formulario.
5. Receita e opcional.
6. Pedido nasce aceito e confirmado.
7. Estoque e validado/baixado imediatamente quando aplicavel.

### 13.5 Cadastro de lente e SKU

1. Laboratorio cadastra lente base em `/lab/lens-types/new`.
2. Seleciona ou cria marca, categoria, material, indice e tratamentos.
3. Define se permite pedido sob encomenda.
4. Define prazos padrao.
5. Cadastra SKU em `/lab/stock/new`.
6. SKU passa a aparecer na busca da otica e em pedido normal, respeitando status e disponibilidade.

## 14. Testes executados e recomendados

### 14.1 Testes encontrados no codigo atual

- Migration `supabase/migrations/20260621000006_rls_tests.sql`.
- Endpoint/script de seed:
  - `src/app/api/seed-test/route.ts`
  - scripts de seed existentes no projeto.

### 14.2 Suítes automatizadas nao encontradas

Não encontrado no código atual:

- testes unitarios com Vitest/Jest;
- testes de componentes;
- testes E2E com Playwright/Cypress;
- pipeline de teste alem de lint/build nos scripts do `package.json`;
- testes automatizados especificos para pedido especial;
- testes automatizados especificos para retrabalho;
- testes automatizados especificos para receita obrigatoria;
- testes automatizados especificos para opcoes dinamicas.

Scripts disponiveis:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

### 14.3 Testes funcionais recomendados

Pedido normal:

- Criar pedido normal com SKU em estoque.
- Criar pedido normal com SKU sem estoque e lente permitindo sob encomenda.
- Bloquear pedido normal com SKU sem estoque e lente que nao permite sob encomenda.
- Editar pedido normal enquanto aguardando confirmacao.
- Confirmar pedido pelo laboratorio e validar baixa de estoque.
- Cancelar pedido e validar restauracao de estoque quando aplicavel.

Pedido especial:

- Criar pedido especial sem SKU compativel.
- Criar tentativa de especial com SKU compativel e validar modal.
- Usar SKU compativel em vez de especial.
- Forcar pedido especial apos double check.
- Aprovar especial sem criar SKU.
- Aprovar especial criando SKU.
- Rejeitar especial com motivo.

Receita:

- Bloquear pedido normal sem receita.
- Bloquear pedido especial sem receita.
- Bloquear retrabalho da otica sem receita.
- Permitir retrabalho do laboratorio sem receita.
- Validar tipo invalido, extensao invalida, arquivo > 10 MB e path fora do padrao.
- Validar visualizacao e download por lab e otica autorizada.

Retrabalho:

- Bloquear retrabalho de pedido nao finalizado.
- Bloquear retrabalho sobre retrabalho.
- Abrir retrabalho pela otica e aceitar pelo lab.
- Abrir retrabalho pela otica e rejeitar pelo lab.
- Abrir retrabalho pelo lab e validar que nasce confirmado.
- Retrabalho com item `same_lens`.
- Retrabalho com item `replace_sku`.
- Retrabalho com item `special` e double check.

Opcoes dinamicas:

- Criar marca customizada.
- Criar categoria/material/indice customizado.
- Criar tratamento customizado.
- Criar motivo de retrabalho customizado.
- Validar isolamento entre laboratorios.
- Validar reativacao de opcao inativa.

Paginacao e busca:

- Validar pagina 1, pagina intermediaria e ultima pagina.
- Validar busca local em pagina atual.
- Validar busca de catalogo sem termo exibindo todos os SKUs ativos.
- Validar filtros `Em estoque` e `Sob encomenda`.

Datas:

- Criar pedido em `America/Sao_Paulo` e validar exibicao em listagem e detalhe.
- Validar `created_at` com `formatTimestampDate` e `formatDateTime`.
- Validar datas `date` com `formatDateOnly`, sem deslocamento por UTC.

## 15. Riscos tecnicos

1. Busca local em listagens paginadas

`ResponsiveDataTable` filtra apenas os dados da pagina atual. Para usuarios, isso pode parecer que a busca e global, mas ela nao varre todo o banco.

2. Duplicacao de resolucao de contexto

Varias paginas resolvem `lab_id` e `optical_store_id` manualmente. Consolidar helper reduziria risco de divergencia.

3. Ausencia de testes automatizados

As regras atuais sao ricas e envolvem estoque, RLS, anexos privados e transicoes de status. Sem suite automatizada, regressao fica provavel em mudancas futuras.

4. Enums historicos no TypeScript

Campos de lente foram flexibilizados para `text`, mas ainda existem enums de categoria/material/indice. Isso pode induzir implementacoes futuras a restringir novamente valores customizados.

5. Double check exato

Comparacao exata de graus pode gerar falso negativo por arredondamento ou convencao de digitacao.

6. Status especial parcialmente duplicado

`orders.status` e `special_status` convivem. O fluxo operacional usa principalmente `orders.status` apos aprovacao. Isso precisa ficar documentado para evitar UI ou relatorios divergentes.

7. Receita pendente em Storage

Existe rollback tentando remover arquivo pendente, mas fluxos abandonados pelo usuario podem deixar arquivos em `${labId}/pending/${profileId}`. Pode ser necessario job de limpeza.

8. Estoque e concorrencia

Acoes validam estoque e atualizam quantidades, mas nao foi encontrado lock transacional explicito de linha no codigo de Server Action. Em alto volume, pode haver corrida se dois pedidos forem confirmados simultaneamente para o mesmo SKU.

9. Encoding/mojibake em alguns textos

Foram encontrados textos com caracteres corrompidos em alguns arquivos (`â`, `Ã`, `Â`). Isso pode ser efeito de terminal/encoding, mas merece revisao visual no app e nos arquivos.

## 16. Pendencias e melhorias recomendadas

Prioridade alta:

- Criar testes automatizados para `orders.ts`.
- Criar testes E2E para pedido normal, especial, retrabalho e receita.
- Criar busca server-side nas listagens paginadas ou deixar claro que a busca e apenas na pagina atual.
- Centralizar resolucao de contexto de usuario/lab/otica.
- Validar concorrencia de baixa/restauracao de estoque com RPC transacional no banco.

Prioridade media:

- Criar job de limpeza para anexos pendentes nao vinculados.
- Expor gerenciamento de `lab_custom_options` fora do fluxo de formulario.
- Padronizar labels de opcoes customizadas em relatorios e detalhes.
- Rever convivencia de `special_status` com `orders.status`.
- Ampliar double check para tolerancia controlada de decimais, se fizer sentido para a regra optica.

Prioridade baixa:

- Remover ou reduzir enums TypeScript obsoletos de categoria/material/indice.
- Corrigir textos com possivel mojibake.
- Adicionar filtros server-side por tipo/status em `/lab/orders` e `/store/orders`.
- Adicionar auditoria explicita para aceite/rejeicao de retrabalho e aprovacao/rejeicao de especial, alem do historico de status.

## 17. Resumo executivo final

O projeto evoluiu de um fluxo basico de pedidos por SKU para uma plataforma operacional mais completa, com tres caminhos principais:

- pedido normal por SKU;
- pedido especial/sob demanda;
- retrabalho vinculado a pedido finalizado.

As mudancas foram implementadas de forma consistente entre banco, Server Actions, UI e RLS. O modelo multi-tenant esta preservado, as receitas foram movidas para fluxo obrigatorio com Storage privado, e o catalogo ganhou flexibilidade por laboratorio com opcoes dinamicas.

O fluxo de pedido normal pelo menu SKU continua separado e preservado. As novas funcionalidades entram como extensoes laterais: pedido especial quando nao ha SKU adequado, retrabalho quando um pedido finalizado precisa ser refeito, e filtros de disponibilidade para melhorar a busca da otica.

Os principais pontos de atencao agora sao qualidade e robustez: falta uma suite automatizada cobrindo os fluxos criticos, a busca nas tabelas paginadas nao e global, e a movimentacao de estoque deveria ser fortalecida contra concorrencia. Ainda assim, a base funcional encontrada no codigo atual esta bem encaminhada e ja cobre os principais cenarios operacionais esperados para laboratorio e otica.
