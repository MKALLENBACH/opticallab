'use client';

import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Copy,
  Eye,
  FileText,
  Glasses,
  Layers3,
  ListChecks,
  Lock,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TestTube2,
  Upload,
  Wand2,
} from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';

type DemoTab = 'access' | 'guide' | 'v2';

interface AccessProfile {
  title: string;
  description: string;
  email: string;
  password: string;
  accent: string;
  icon: ReactNode;
  highlights: string[];
}

interface V2Feature {
  title: string;
  short: string;
  what: string;
  when: string;
  badges: string[];
  icon: ReactNode;
  steps: string[];
  observe: string[];
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.cssText = 'position:fixed;left:-9999px;opacity:0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button type="button" className="demo-copy-button" onClick={handleCopy}>
      {copied ? <Check size={15} /> : <Copy size={15} />}
      <span>{copied ? 'Copiado' : label}</span>
    </button>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="demo-section-heading">
      {eyebrow && <span className="demo-eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

function AccessCard({ profile }: { profile: AccessProfile }) {
  return (
    <article className="demo-access-card" style={{ '--profile-accent': profile.accent } as CSSProperties}>
      <div className="demo-access-card-header">
        <span className="demo-icon-shell">{profile.icon}</span>
        <div>
          <h3>{profile.title}</h3>
          <p>{profile.description}</p>
        </div>
      </div>

      <div className="demo-login-box">
        <div className="demo-login-row">
          <span>E-mail</span>
          <div className="demo-login-value">
            <code>{profile.email}</code>
            <CopyButton text={profile.email} label="Copiar e-mail" />
          </div>
        </div>
        <div className="demo-login-row">
          <span>Senha</span>
          <div className="demo-login-value">
            <code>{profile.password}</code>
            <CopyButton text={profile.password} label="Copiar senha" />
          </div>
        </div>
      </div>

      <a href="/login" className="demo-profile-action">
        Acessar sistema <ArrowRight size={17} />
      </a>

      <div className="demo-highlight-list">
        <span>Use para testar</span>
        {profile.highlights.map((item) => (
          <p key={item}><Check size={16} />{item}</p>
        ))}
      </div>
    </article>
  );
}

function StepList({ items }: { items: string[] }) {
  return (
    <ol className="demo-step-list">
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>
          <span>{index + 1}</span>
          <p>{item}</p>
        </li>
      ))}
    </ol>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <div className="demo-check-list">
      {items.map((item) => (
        <p key={item}><Eye size={16} />{item}</p>
      ))}
    </div>
  );
}

function V2FeatureCard({ feature, isOpen, onToggle }: { feature: V2Feature; isOpen: boolean; onToggle: () => void }) {
  return (
    <article className="demo-v2-card">
      <div className="demo-v2-card-top">
        <span className="demo-v2-icon">{feature.icon}</span>
        <div>
          <div className="demo-badge-row">
            {feature.badges.map((badge) => <span key={badge}>{badge}</span>)}
          </div>
          <h3>{feature.title}</h3>
          <p>{feature.short}</p>
        </div>
      </div>

      <div className="demo-v2-summary">
        <div>
          <strong>O que faz</strong>
          <p>{feature.what}</p>
        </div>
        <div>
          <strong>Quando usar</strong>
          <p>{feature.when}</p>
        </div>
      </div>

      <button type="button" className="demo-expand-button" onClick={onToggle} aria-expanded={isOpen}>
        {isOpen ? 'Ocultar teste' : 'Ver como testar'}
        <ArrowRight size={16} className={isOpen ? 'demo-expand-icon-open' : ''} />
      </button>

      {isOpen && (
        <div className="demo-v2-details">
          <div>
            <h4>Como testar</h4>
            <StepList items={feature.steps} />
          </div>
          <div>
            <h4>O que observar</h4>
            <CheckList items={feature.observe} />
          </div>
        </div>
      )}
    </article>
  );
}

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<DemoTab>('access');
  const [openFeature, setOpenFeature] = useState('Pedido Especial');

  const accessProfiles: AccessProfile[] = useMemo(() => ([
    {
      title: 'Laboratório',
      description: 'Use este acesso para cadastrar lentes, controlar estoque, receber pedidos, aprovar Pedidos Especiais e acompanhar retrabalhos.',
      email: 'alexemetz@admin.com',
      password: '123456',
      accent: '#8b5cf6',
      icon: <TestTube2 size={24} />,
      highlights: [
        'Cadastrar óticas parceiras',
        'Cadastrar lentes e variações da lente',
        'Controlar disponibilidade e prazos',
        'Receber e acompanhar pedidos',
        'Aprovar Pedido Especial',
        'Aceitar ou rejeitar retrabalho',
      ],
    },
    {
      title: 'Ótica Giori & Focari',
      description: 'Use este acesso para consultar lentes disponíveis, criar pedidos, anexar receita, solicitar Pedido Especial e acompanhar status.',
      email: 'giorifocari@admin.com',
      password: '123456',
      accent: '#6366f1',
      icon: <Store size={24} />,
      highlights: [
        'Consultar lentes disponíveis',
        'Ver lentes em estoque e sob encomenda',
        'Criar pedido com receita',
        'Solicitar Pedido Especial',
        'Abrir retrabalho em pedido finalizado',
        'Acompanhar o andamento',
      ],
    },
  ]), []);

  const quickGuide = [
    'Entre como laboratório.',
    'Confira a ótica Giori & Focari cadastrada.',
    'Cadastre uma nova lente ou revise uma lente existente.',
    'Cadastre uma variação da lente no estoque.',
    'Saia da conta do laboratório.',
    'Entre como ótica.',
    'Consulte as lentes disponíveis.',
    'Crie um pedido e anexe a receita.',
    'Volte como laboratório.',
    'Abra o pedido recebido e atualize o andamento.',
    'Volte como ótica e confira se o andamento mudou.',
  ];

  const checklist = [
    'O papel do laboratório ficou claro?',
    'O papel da ótica ficou claro?',
    'A busca de lentes está fácil de usar?',
    'A diferença entre lente em estoque e sob encomenda está clara?',
    'O envio de receita ficou simples?',
    'O pedido é fácil de acompanhar?',
    'O Pedido Especial ajuda quando a lente não é encontrada?',
    'O retrabalho fica fácil de localizar?',
    'O sistema reduziria mensagens manuais no atendimento?',
    'Faltou alguma informação importante para a operação real?',
  ];

  const v2Features: V2Feature[] = [
    {
      title: 'Pedido Especial',
      short: 'Para quando a ótica não encontra exatamente a lente que precisa.',
      what: 'A ótica informa as características da lente e envia a solicitação para o laboratório analisar.',
      when: 'Use quando nenhuma lente disponível atende ao cliente.',
      badges: ['Ótica', 'Laboratório', 'Pedidos'],
      icon: <Sparkles size={24} />,
      steps: [
        'Entre como ótica.',
        'Vá em Pedidos.',
        'Clique em Pedido Especial.',
        'Selecione as características da lente.',
        'Preencha os dados da lente.',
        'Anexe a receita.',
        'Envie para o laboratório.',
        'Entre como laboratório e veja o pedido recebido.',
      ],
      observe: [
        'A ótica consegue iniciar a solicitação mesmo sem encontrar a lente exata.',
        'O laboratório recebe o pedido para analisar.',
        'O laboratório pode informar prazo.',
        'O pedido fica acompanhado pelo sistema.',
      ],
    },
    {
      title: 'Conferência antes de criar Pedido Especial',
      short: 'Antes de enviar, o sistema verifica se já existe uma lente compatível.',
      what: 'Se encontrar uma lente parecida ou igual, a ótica pode usar a lente encontrada ou continuar com o Pedido Especial.',
      when: 'Use para evitar pedidos duplicados e confirmar a escolha antes de enviar.',
      badges: ['Ótica', 'Pedidos'],
      icon: <Search size={24} />,
      steps: [
        'Entre como ótica.',
        'Abra um Pedido Especial.',
        'Preencha os dados de uma lente que já existe.',
        'Avance no pedido.',
        'Veja se aparece uma lente encontrada.',
        'Escolha entre usar a lente encontrada ou continuar com Pedido Especial.',
      ],
      observe: [
        'O sistema ajuda a evitar pedido duplicado.',
        'A ótica confirma antes de seguir.',
        'Nenhum pedido é criado sem essa decisão.',
      ],
    },
    {
      title: 'Receita obrigatória',
      short: 'A ótica precisa anexar a receita do cliente antes de enviar o pedido.',
      what: 'A receita pode ser enviada como imagem ou PDF. No celular, também é possível tirar uma foto.',
      when: 'Use em pedidos normais, Pedidos Especiais e retrabalhos abertos pela ótica.',
      badges: ['Ótica', 'Receita', 'Pedidos'],
      icon: <Upload size={24} />,
      steps: [
        'Entre como ótica.',
        'Tente criar um pedido sem anexar receita.',
        'Veja que o sistema bloqueia o envio.',
        'Anexe uma imagem ou PDF.',
        'Envie o pedido.',
        'Entre como laboratório.',
        'Abra o pedido e confira a receita anexada.',
      ],
      observe: [
        'Pedido normal exige receita.',
        'Pedido Especial exige receita.',
        'Retrabalho aberto pela ótica exige receita.',
        'O laboratório consegue visualizar a receita.',
        'No celular, é possível anexar foto da câmera.',
      ],
    },
    {
      title: 'Retrabalho',
      short: 'Para quando um pedido finalizado precisa voltar para ajuste ou ser refeito.',
      what: 'A ótica ou o laboratório podem abrir um novo acompanhamento a partir de um pedido finalizado.',
      when: 'Use quando uma lente voltou para ajuste ou precisa ser refeita.',
      badges: ['Ótica', 'Laboratório', 'Retrabalho'],
      icon: <RefreshCw size={24} />,
      steps: [
        'Entre como ótica.',
        'Abra um pedido finalizado.',
        'Clique em Abrir Retrabalho.',
        'Escolha o motivo.',
        'Selecione qual lente precisa ser refeita.',
        'Anexe a receita.',
        'Envie para o laboratório.',
        'Entre como laboratório e aceite ou rejeite.',
      ],
      observe: [
        'O pedido original continua finalizado.',
        'O retrabalho aparece como um novo acompanhamento.',
        'Se a ótica abriu, o laboratório precisa aceitar.',
        'Se o laboratório abriu, o retrabalho já começa aceito.',
      ],
    },
    {
      title: 'Trocar lente no Retrabalho',
      short: 'Ao refazer um pedido, dá para manter a mesma lente, escolher outra ou solicitar Pedido Especial.',
      what: 'Cada lente do pedido pode ter uma decisão diferente durante o retrabalho.',
      when: 'Use quando a lente original não deve ser repetida exatamente igual.',
      badges: ['Retrabalho', 'Lentes'],
      icon: <Wand2 size={24} />,
      steps: [
        'Abra um pedido finalizado.',
        'Clique em Abrir Retrabalho.',
        'Selecione uma lente do pedido.',
        'Escolha refazer com a mesma lente.',
        'Ou escolha outra lente disponível.',
        'Ou solicite Pedido Especial se não houver lente adequada.',
        'Continue o fluxo.',
      ],
      observe: [
        'O pedido original fica preservado.',
        'O retrabalho mostra qual lente será refeita.',
        'O laboratório consegue acompanhar a solicitação.',
      ],
    },
    {
      title: 'Novas opções no cadastro de lentes',
      short: 'O laboratório pode criar suas próprias marcas, materiais, categorias, índices e tratamentos.',
      what: 'Ao cadastrar uma lente, se a opção não existir, escolha Outro e salve um novo valor.',
      when: 'Use quando o laboratório trabalha com uma marca, material ou tratamento que não aparece na lista.',
      badges: ['Laboratório', 'Cadastro'],
      icon: <Plus size={24} />,
      steps: [
        'Entre como laboratório.',
        'Vá para o cadastro de lentes.',
        'Em algum campo, escolha Outro.',
        'Cadastre uma nova marca, material ou tratamento.',
        'Salve a lente.',
        'Crie outra lente.',
        'Veja que a nova opção aparece para usar novamente.',
      ],
      observe: [
        'O laboratório não fica preso às opções padrão.',
        'A opção nova fica salva.',
        'A opção aparece em cadastros futuros.',
        'Outro laboratório não vê essa opção.',
      ],
    },
    {
      title: 'Motivos personalizados de Retrabalho',
      short: 'O laboratório pode cadastrar novos motivos para explicar por que o pedido voltou.',
      what: 'Além de Erro de Médico, o laboratório pode criar motivos que façam sentido para sua rotina.',
      when: 'Use quando o laboratório precisa organizar melhor os tipos de retrabalho.',
      badges: ['Laboratório', 'Retrabalho'],
      icon: <ClipboardCheck size={24} />,
      steps: [
        'Entre como laboratório.',
        'Abra o fluxo de Retrabalho.',
        'No campo motivo, escolha Outro.',
        'Cadastre um novo motivo.',
        'Salve.',
        'Abra outro retrabalho.',
        'Veja que o motivo novo aparece na lista.',
      ],
      observe: [
        'O laboratório cria seus próprios motivos.',
        'As óticas vinculadas conseguem usar esses motivos.',
        'Outros laboratórios não veem esses motivos.',
      ],
    },
    {
      title: 'Listas mais organizadas',
      short: 'As telas com muitas informações agora são divididas em páginas.',
      what: 'O sistema mostra uma quantidade por vez e permite avançar ou voltar.',
      when: 'Use em listas de pedidos, estoque, lentes e óticas.',
      badges: ['Laboratório', 'Organização'],
      icon: <ListChecks size={24} />,
      steps: [
        'Entre como laboratório.',
        'Acesse uma lista com muitos registros.',
        'Veja os botões de próxima página e página anterior.',
        'Avance e volte nas páginas.',
        'Use a busca da tela.',
        'Confira se a lista continua organizada.',
      ],
      observe: [
        'A navegação fica mais rápida.',
        'A tela não fica carregada demais.',
        'É possível avançar e voltar nas páginas.',
      ],
    },
  ];

  const quickV2Roadmap = [
    'Entre como laboratório.',
    'Cadastre uma nova lente.',
    'Use Outro para criar uma nova opção personalizada.',
    'Entre como ótica.',
    'Consulte as lentes disponíveis.',
    'Crie um pedido normal anexando receita.',
    'Crie um Pedido Especial quando não encontrar uma lente.',
    'Entre como laboratório e analise o Pedido Especial.',
    'Finalize um pedido.',
    'Abra um Retrabalho.',
    'Teste os botões de próxima página nas listas.',
  ];

  return (
    <>
      <style>{cssText}</style>

      <main className="demo-page">
        <header className="demo-topbar">
          <Image src="/logo.svg" alt="LenteLink" width={170} height={34} priority />
          <a href="/login" className="demo-topbar-link">Acessar sistema</a>
        </header>

        <section className="demo-hero">
          <div className="demo-hero-content">
            <span className="demo-hero-badge"><ShieldCheck size={16} /> Ambiente de demonstração</span>
            <h1>Demonstração LenteLink</h1>
            <p>
              Teste o fluxo entre laboratório e ótica: cadastro de lentes, consulta de disponibilidade,
              pedidos, Pedidos Especiais, retrabalho e acompanhamento.
            </p>
            <p className="demo-hero-note">
              Use os acessos abaixo para entrar como laboratório ou como ótica e simular o funcionamento real do sistema.
            </p>
            <div className="demo-hero-actions">
              <a href="/login" className="demo-primary-action">Acessar sistema <ArrowRight size={18} /></a>
              <button type="button" className="demo-secondary-action" onClick={() => setActiveTab('v2')}>
                Ver novidades V2 <Sparkles size={17} />
              </button>
            </div>
          </div>
        </section>

        <nav className="demo-tabs" aria-label="Navegação da demonstração">
          {[
            { value: 'access' as const, label: 'Acessos da Demonstração', icon: <Lock size={17} /> },
            { value: 'guide' as const, label: 'Como testar', icon: <PackageCheck size={17} /> },
            { value: 'v2' as const, label: 'Novidades V2', icon: <Sparkles size={17} /> },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={activeTab === tab.value ? 'demo-tab demo-tab-active' : 'demo-tab'}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'access' && (
          <section className="demo-section">
            <SectionHeading
              eyebrow="Acessos"
              title="Entre pelos dois lados da operação"
              subtitle="Teste primeiro como laboratório e depois como ótica para entender a jornada completa."
            />

            <div className="demo-access-grid">
              {accessProfiles.map((profile) => <AccessCard key={profile.email} profile={profile} />)}
            </div>

            <div className="demo-role-panel">
              <div>
                <Glasses size={24} />
                <h3>O que o laboratório faz</h3>
                <p>Cadastra lentes, controla disponibilidade, recebe pedidos, analisa Pedidos Especiais e acompanha retrabalhos.</p>
              </div>
              <div>
                <Store size={24} />
                <h3>O que a ótica faz</h3>
                <p>Consulta lentes, cria pedidos com receita, solicita Pedido Especial e acompanha o andamento com mais clareza.</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'guide' && (
          <section className="demo-section">
            <SectionHeading
              eyebrow="Roteiro"
              title="Como testar em poucos minutos"
              subtitle="Siga esta sequência simples para simular o atendimento entre laboratório e ótica."
            />

            <div className="demo-guide-layout">
              <div className="demo-guide-card">
                <h3>Passo a passo rápido</h3>
                <StepList items={quickGuide} />
              </div>
              <div className="demo-guide-card">
                <h3>O que observar</h3>
                <CheckList items={checklist} />
              </div>
            </div>

            <div className="demo-info-strip">
              <FileText size={20} />
              <p>
                Dica: se ainda não houver uma lente para testar, comece pelo laboratório cadastrando uma lente
                e uma variação dela. Depois entre como ótica e faça o pedido.
              </p>
            </div>
          </section>
        )}

        {activeTab === 'v2' && (
          <section className="demo-section">
            <SectionHeading
              eyebrow="Novidades"
              title="Novidades da Demonstração V2"
              subtitle="Conheça os novos fluxos do LenteLink e veja sugestões simples para testar cada funcionalidade."
            />

            <div className="demo-v2-intro">
              <Sparkles size={24} />
              <p>
                Nesta versão, a demonstração ficou mais completa. Agora você consegue testar pedidos com receita
                obrigatória, Pedido Especial quando a lente não é encontrada, Retrabalho para pedidos já finalizados,
                novas opções no cadastro de lentes e listas mais organizadas.
              </p>
              <strong>Dica: teste primeiro como laboratório e depois como ótica para entender os dois lados da operação.</strong>
            </div>

            <div className="demo-v2-grid">
              {v2Features.map((feature) => (
                <V2FeatureCard
                  key={feature.title}
                  feature={feature}
                  isOpen={openFeature === feature.title}
                  onToggle={() => setOpenFeature((current) => current === feature.title ? '' : feature.title)}
                />
              ))}
            </div>

            <div className="demo-roadmap">
              <div className="demo-roadmap-header">
                <Layers3 size={24} />
                <div>
                  <h3>Roteiro rápido de teste</h3>
                  <p>Uma sequência para validar as novidades como se fosse uma operação real.</p>
                </div>
              </div>
              <StepList items={quickV2Roadmap} />
              <p className="demo-roadmap-footer">
                Esse roteiro simula uma operação real entre ótica e laboratório, desde o cadastro da lente
                até o pedido, análise, retrabalho e acompanhamento.
              </p>
            </div>
          </section>
        )}

        <footer className="demo-footer">
          <Image src="/logo.svg" alt="LenteLink" width={150} height={30} />
          <span>© {new Date().getFullYear()} LenteLink. Todos os direitos reservados.</span>
        </footer>
      </main>
    </>
  );
}

const cssText = `
.demo-page{
  min-height:100vh;
  overflow-x:hidden;
  background:
    radial-gradient(circle at 18% 0%, rgba(99,102,241,.18), transparent 34rem),
    radial-gradient(circle at 92% 12%, rgba(168,85,247,.15), transparent 30rem),
    linear-gradient(180deg,#070914 0%,#090b14 48%,#070914 100%);
  color:#f8fafc;
}

.demo-topbar{
  position:relative;
  z-index:2;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:1rem;
  width:min(1120px,calc(100% - 2rem));
  margin:0 auto;
  padding:1.25rem 0;
}

.demo-topbar img,.demo-footer img{height:34px;width:auto}

.demo-topbar-link{
  display:inline-flex;
  min-height:42px;
  align-items:center;
  justify-content:center;
  border:1px solid rgba(255,255,255,.12);
  border-radius:12px;
  padding:0 .95rem;
  color:#dbeafe;
  font-size:.88rem;
  font-weight:800;
  text-decoration:none;
  background:rgba(15,23,42,.52);
}

.demo-hero{
  width:min(1120px,calc(100% - 2rem));
  margin:0 auto;
  padding:3.25rem 0 1.5rem;
}

.demo-hero-content{
  max-width:850px;
}

.demo-hero-badge,.demo-eyebrow{
  display:inline-flex;
  align-items:center;
  gap:.45rem;
  width:max-content;
  max-width:100%;
  border:1px solid rgba(139,92,246,.28);
  border-radius:999px;
  background:rgba(139,92,246,.12);
  color:#c4b5fd;
  padding:.38rem .75rem;
  font-size:.76rem;
  font-weight:900;
  text-transform:uppercase;
  letter-spacing:.08em;
}

.demo-hero h1{
  margin:1rem 0 .8rem;
  max-width:760px;
  color:#fff;
  font-size:clamp(2.35rem,6vw,5rem);
  line-height:.98;
  font-weight:950;
  letter-spacing:0;
}

.demo-hero p{
  max-width:760px;
  margin:0;
  color:#cbd5e1;
  font-size:clamp(1rem,2vw,1.22rem);
  line-height:1.72;
  font-weight:560;
}

.demo-hero-note{
  margin-top:1rem!important;
  max-width:650px!important;
  color:#94a3b8!important;
  font-size:.98rem!important;
}

.demo-hero-actions{
  display:flex;
  flex-wrap:wrap;
  gap:.8rem;
  margin-top:1.7rem;
}

.demo-primary-action,.demo-secondary-action,.demo-profile-action,.demo-expand-button{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:.5rem;
  border:0;
  border-radius:12px;
  font-family:inherit;
  font-weight:900;
  text-decoration:none;
  cursor:pointer;
  transition:transform .18s ease, border-color .18s ease, background .18s ease;
}

.demo-primary-action{
  min-height:48px;
  padding:0 1.15rem;
  color:#fff;
  background:linear-gradient(135deg,#4f46e5,#9333ea);
  box-shadow:0 20px 45px -28px rgba(139,92,246,1);
}

.demo-secondary-action{
  min-height:48px;
  padding:0 1.05rem;
  color:#e0e7ff;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(15,23,42,.58);
}

.demo-primary-action:hover,.demo-secondary-action:hover,.demo-profile-action:hover,.demo-expand-button:hover{
  transform:translateY(-1px);
}

.demo-tabs{
  position:sticky;
  top:0;
  z-index:5;
  display:flex;
  gap:.5rem;
  width:min(1120px,calc(100% - 2rem));
  margin:1.5rem auto 0;
  padding:.5rem;
  border:1px solid rgba(255,255,255,.1);
  border-radius:16px;
  background:rgba(6,8,18,.82);
  backdrop-filter:blur(18px);
}

.demo-tab{
  display:inline-flex;
  flex:1 1 0;
  min-height:46px;
  min-width:0;
  align-items:center;
  justify-content:center;
  gap:.5rem;
  border:1px solid transparent;
  border-radius:12px;
  background:transparent;
  color:#94a3b8;
  font-family:inherit;
  font-size:.9rem;
  font-weight:900;
  cursor:pointer;
  transition:all .18s ease;
}

.demo-tab-active{
  border-color:rgba(139,92,246,.35);
  background:linear-gradient(135deg,rgba(79,70,229,.3),rgba(147,51,234,.22));
  color:#fff;
  box-shadow:0 16px 42px -34px rgba(139,92,246,.9);
}

.demo-section{
  width:min(1120px,calc(100% - 2rem));
  margin:0 auto;
  padding:2.2rem 0 3.5rem;
}

.demo-section-heading{
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  gap:.7rem;
  margin-bottom:1.35rem;
}

.demo-section-heading h2{
  margin:0;
  max-width:800px;
  color:#fff;
  font-size:clamp(1.7rem,3.6vw,3rem);
  line-height:1.08;
  font-weight:950;
  letter-spacing:0;
}

.demo-section-heading p{
  max-width:760px;
  margin:0;
  color:#a8b3c7;
  font-size:1rem;
  line-height:1.7;
  font-weight:560;
}

.demo-access-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:1rem;
}

.demo-access-card,.demo-guide-card,.demo-v2-card,.demo-roadmap,.demo-v2-intro,.demo-role-panel,.demo-info-strip{
  border:1px solid rgba(255,255,255,.1);
  background:rgba(15,23,42,.58);
  box-shadow:0 24px 70px -52px rgba(0,0,0,.95);
  backdrop-filter:blur(18px);
}

.demo-access-card{
  min-width:0;
  border-top:3px solid var(--profile-accent);
  border-radius:18px;
  padding:1.15rem;
}

.demo-access-card-header{
  display:flex;
  gap:.9rem;
  align-items:flex-start;
}

.demo-icon-shell,.demo-v2-icon{
  display:inline-flex;
  flex:0 0 auto;
  width:48px;
  height:48px;
  align-items:center;
  justify-content:center;
  border:1px solid rgba(255,255,255,.1);
  border-radius:14px;
  color:#ddd6fe;
  background:rgba(139,92,246,.15);
}

.demo-access-card h3,.demo-role-panel h3,.demo-guide-card h3,.demo-v2-card h3,.demo-roadmap h3{
  margin:0;
  color:#fff;
  font-size:1.1rem;
  line-height:1.25;
  font-weight:950;
}

.demo-access-card-header p,.demo-role-panel p,.demo-v2-card p,.demo-v2-intro p,.demo-roadmap p,.demo-info-strip p{
  margin:.4rem 0 0;
  color:#a8b3c7;
  line-height:1.62;
  font-size:.92rem;
  font-weight:560;
}

.demo-login-box{
  display:grid;
  gap:.75rem;
  margin:1rem 0;
  border:1px solid rgba(255,255,255,.08);
  border-radius:14px;
  background:rgba(2,6,23,.46);
  padding:.9rem;
}

.demo-login-row{
  display:grid;
  gap:.38rem;
}

.demo-login-row>span{
  color:#64748b;
  font-size:.72rem;
  font-weight:950;
  text-transform:uppercase;
  letter-spacing:.08em;
}

.demo-login-value{
  display:flex;
  flex-wrap:wrap;
  gap:.5rem;
  align-items:center;
  min-width:0;
}

.demo-login-value code{
  max-width:100%;
  overflow-wrap:anywhere;
  border:1px solid rgba(99,102,241,.22);
  border-radius:9px;
  background:rgba(99,102,241,.1);
  color:#e5e7eb;
  padding:.33rem .55rem;
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
  font-size:.86rem;
  font-weight:800;
}

.demo-copy-button{
  display:inline-flex;
  min-height:34px;
  align-items:center;
  gap:.35rem;
  border:1px solid rgba(255,255,255,.1);
  border-radius:9px;
  background:rgba(255,255,255,.04);
  color:#dbeafe;
  padding:0 .6rem;
  font-family:inherit;
  font-size:.76rem;
  font-weight:900;
  cursor:pointer;
}

.demo-profile-action{
  width:100%;
  min-height:44px;
  color:#fff;
  background:var(--profile-accent);
}

.demo-highlight-list{
  display:grid;
  gap:.45rem;
  margin-top:1rem;
}

.demo-highlight-list>span{
  color:#64748b;
  font-size:.72rem;
  font-weight:950;
  text-transform:uppercase;
  letter-spacing:.08em;
}

.demo-highlight-list p,.demo-check-list p{
  display:flex;
  align-items:flex-start;
  gap:.5rem;
  margin:0;
  color:#cbd5e1;
  font-size:.86rem;
  line-height:1.48;
  font-weight:650;
}

.demo-highlight-list svg,.demo-check-list svg{
  flex:0 0 auto;
  color:#818cf8;
  margin-top:.12rem;
}

.demo-role-panel{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:1rem;
  margin-top:1rem;
  border-radius:18px;
  padding:1rem;
}

.demo-role-panel>div{
  min-width:0;
  border:1px solid rgba(255,255,255,.08);
  border-radius:14px;
  background:rgba(255,255,255,.025);
  padding:1rem;
}

.demo-role-panel svg{
  color:#a78bfa;
  margin-bottom:.65rem;
}

.demo-guide-layout{
  display:grid;
  grid-template-columns:minmax(0,1.05fr) minmax(320px,.95fr);
  gap:1rem;
}

.demo-guide-card,.demo-roadmap{
  border-radius:18px;
  padding:1rem;
}

.demo-step-list{
  display:grid;
  gap:.55rem;
  margin:1rem 0 0;
  padding:0;
  list-style:none;
}

.demo-step-list li{
  display:grid;
  grid-template-columns:32px minmax(0,1fr);
  gap:.65rem;
  align-items:start;
  min-width:0;
}

.demo-step-list li>span{
  display:flex;
  width:32px;
  height:32px;
  align-items:center;
  justify-content:center;
  border-radius:10px;
  background:linear-gradient(135deg,#4f46e5,#9333ea);
  color:#fff;
  font-size:.78rem;
  font-weight:950;
}

.demo-step-list p{
  min-width:0;
  margin:0;
  border:1px solid rgba(255,255,255,.08);
  border-radius:12px;
  background:rgba(2,6,23,.35);
  color:#dbe4f0;
  padding:.55rem .7rem;
  font-size:.9rem;
  line-height:1.5;
  font-weight:650;
}

.demo-check-list{
  display:grid;
  gap:.65rem;
  margin-top:1rem;
}

.demo-info-strip{
  display:flex;
  gap:.75rem;
  align-items:flex-start;
  margin-top:1rem;
  border-radius:16px;
  padding:1rem;
  color:#fde68a;
  background:rgba(245,158,11,.1);
  border-color:rgba(245,158,11,.22);
}

.demo-info-strip svg{
  flex:0 0 auto;
  margin-top:.12rem;
}

.demo-v2-intro{
  display:grid;
  grid-template-columns:42px minmax(0,1fr);
  gap:.85rem;
  align-items:start;
  border-radius:18px;
  padding:1rem;
  margin-bottom:1rem;
}

.demo-v2-intro svg{
  color:#c4b5fd;
}

.demo-v2-intro strong{
  grid-column:2;
  color:#e0e7ff;
  font-size:.92rem;
  line-height:1.55;
}

.demo-v2-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:1rem;
}

.demo-v2-card{
  min-width:0;
  border-radius:18px;
  padding:1rem;
}

.demo-v2-card-top{
  display:grid;
  grid-template-columns:48px minmax(0,1fr);
  gap:.85rem;
  align-items:start;
}

.demo-badge-row{
  display:flex;
  flex-wrap:wrap;
  gap:.35rem;
  margin-bottom:.55rem;
}

.demo-badge-row span{
  border:1px solid rgba(139,92,246,.24);
  border-radius:999px;
  background:rgba(139,92,246,.12);
  color:#c4b5fd;
  padding:.2rem .48rem;
  font-size:.68rem;
  font-weight:950;
  text-transform:uppercase;
  letter-spacing:.05em;
}

.demo-v2-summary{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:.65rem;
  margin-top:1rem;
}

.demo-v2-summary>div{
  min-width:0;
  border:1px solid rgba(255,255,255,.08);
  border-radius:13px;
  background:rgba(255,255,255,.025);
  padding:.8rem;
}

.demo-v2-summary strong{
  display:block;
  color:#fff;
  font-size:.78rem;
  font-weight:950;
  text-transform:uppercase;
  letter-spacing:.08em;
}

.demo-expand-button{
  width:100%;
  min-height:42px;
  margin-top:.9rem;
  color:#fff;
  border:1px solid rgba(139,92,246,.3);
  background:rgba(139,92,246,.16);
}

.demo-expand-button svg{
  transition:transform .18s ease;
}

.demo-expand-icon-open{
  transform:translateX(.2rem);
}

.demo-v2-details{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:1rem;
  margin-top:1rem;
  border-top:1px solid rgba(255,255,255,.1);
  padding-top:1rem;
}

.demo-v2-details h4{
  margin:0;
  color:#fff;
  font-size:.93rem;
  font-weight:950;
}

.demo-roadmap{
  margin-top:1rem;
}

.demo-roadmap-header{
  display:flex;
  gap:.85rem;
  align-items:flex-start;
}

.demo-roadmap-header svg{
  flex:0 0 auto;
  color:#c4b5fd;
}

.demo-roadmap-footer{
  border-top:1px solid rgba(255,255,255,.1);
  padding-top:1rem;
}

.demo-footer{
  display:flex;
  flex-direction:column;
  gap:.75rem;
  align-items:center;
  justify-content:center;
  width:min(1120px,calc(100% - 2rem));
  margin:0 auto;
  border-top:1px solid rgba(255,255,255,.08);
  padding:2rem 0 2.5rem;
  color:#64748b;
  font-size:.84rem;
  font-weight:650;
  text-align:center;
}

@media(max-width:860px){
  .demo-access-grid,.demo-role-panel,.demo-guide-layout,.demo-v2-grid,.demo-v2-details{
    grid-template-columns:1fr;
  }

  .demo-v2-summary{
    grid-template-columns:1fr;
  }
}

@media(max-width:640px){
  .demo-topbar{
    width:calc(100% - 1rem);
  }

  .demo-topbar img,.demo-footer img{
    height:28px;
  }

  .demo-topbar-link{
    min-height:38px;
    padding:0 .7rem;
    font-size:.78rem;
  }

  .demo-hero,.demo-section,.demo-tabs,.demo-footer{
    width:calc(100% - 1rem);
  }

  .demo-hero{
    padding:2.1rem 0 1rem;
  }

  .demo-hero h1{
    font-size:clamp(2.2rem,14vw,3.1rem);
  }

  .demo-hero-actions{
    display:grid;
    grid-template-columns:1fr;
  }

  .demo-primary-action,.demo-secondary-action{
    width:100%;
  }

  .demo-tabs{
    position:relative;
    top:auto;
    display:grid;
    grid-template-columns:1fr;
  }

  .demo-tab{
    justify-content:flex-start;
    padding:0 .85rem;
  }

  .demo-section{
    padding:1.45rem 0 2.4rem;
  }

  .demo-access-card,.demo-guide-card,.demo-v2-card,.demo-roadmap,.demo-v2-intro,.demo-role-panel,.demo-info-strip{
    border-radius:14px;
  }

  .demo-access-card-header,.demo-v2-card-top{
    grid-template-columns:1fr;
    display:flex;
    flex-direction:column;
  }

  .demo-v2-intro{
    grid-template-columns:1fr;
  }

  .demo-v2-intro strong{
    grid-column:auto;
  }

  .demo-login-value{
    align-items:stretch;
  }

  .demo-copy-button{
    justify-content:center;
  }
}
`;
