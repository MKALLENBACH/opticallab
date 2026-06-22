'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════
   COPY BUTTON
   ═══════════════════════════════════════════════════════ */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="demo-copy-btn">
      {copied ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          <span style={{ color: '#10b981' }}>Copiado!</span>
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   SMALL REUSABLE PIECES
   ═══════════════════════════════════════════════════════ */
function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="demo-section-heading">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

function FeatureCard({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div className="demo-feature-card">
      <span className="demo-feature-emoji">{emoji}</span>
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}

function BulletList({ items, icon }: { items: string[]; icon?: ReactNode }) {
  return (
    <ul className="demo-bullet-list">
      {items.map((item, i) => (
        <li key={i}>
          {icon ?? <span className="demo-bullet-dot" />}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const CheckIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);

const XIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
);

const ExternalIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
);

const ArrowDown = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
);

const EyeIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

/* ═══════════════════════════════════════════════════════
   ACCESS CARD
   ═══════════════════════════════════════════════════════ */
function AccessCard({
  icon, title, description, email, password, features, accentColor,
}: {
  icon: ReactNode; title: string; description: string;
  email: string; password: string; features: string[]; accentColor: string;
}) {
  return (
    <div className="demo-access-card" style={{ borderTopColor: accentColor }}>
      <div className="demo-access-header">
        <div className="demo-icon-circle" style={{ background: `${accentColor}15` }}>{icon}</div>
        <h3>{title}</h3>
      </div>
      <p className="demo-access-desc">{description}</p>

      <div className="demo-cred-block">
        <div className="demo-cred-row">
          <span className="demo-cred-label">Email</span>
          <div className="demo-cred-value-row">
            <code>{email}</code>
            <CopyButton text={email} label="Copiar email" />
          </div>
        </div>
        <div className="demo-cred-row">
          <span className="demo-cred-label">Senha</span>
          <div className="demo-cred-value-row">
            <code>{password}</code>
            <CopyButton text={password} label="Copiar senha" />
          </div>
        </div>
      </div>

      <a href="https://lentelink.vercel.app/login" target="_blank" rel="noopener noreferrer"
         className="demo-enter-btn" style={{ background: accentColor }}>
        Entrar no sistema {ExternalIcon}
      </a>

      <div className="demo-feature-list">
        <span className="demo-feature-list-title">O que validar com esse acesso:</span>
        {features.map((f, i) => (
          <div key={i} className="demo-feature-item">{CheckIcon}<span>{f}</span></div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ICONS FOR LAB / STORE HEADERS
   ═══════════════════════════════════════════════════════ */
const LabIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#ig1)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <defs><linearGradient id="ig1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#818cf8"/><stop offset="100%" stopColor="#c084fc"/></linearGradient></defs>
    <path d="M9 3h6v4l5 10H4L9 7V3z"/><line x1="9" y1="3" x2="15" y2="3"/><path d="M7 17h10"/>
  </svg>
);
const StoreIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#ig2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <defs><linearGradient id="ig2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */
export default function DemoPage() {

  /* ── data ── */
  const steps = [
    'Entre com o acesso do laboratório',
    'Confira se a ótica Giori & Focari aparece cadastrada',
    'Acesse o catálogo de lentes',
    'Cadastre ou confira uma lente',
    'Acesse o estoque',
    'Cadastre ou confira um item de estoque',
    'Saia da conta do laboratório',
    'Entre com o acesso da ótica',
    'Busque a lente cadastrada',
    'Faça um pedido',
    'Saia da conta da ótica',
    'Entre novamente como laboratório',
    'Veja o pedido recebido',
    'Altere o status do pedido',
    'Volte como ótica e confira se o status atualizou',
  ];

  const checklist = [
    'Ficou claro o papel do laboratório?',
    'Ficou claro o papel da ótica?',
    'A busca de lentes é fácil de usar?',
    'As informações de estoque estão claras?',
    'O prazo aparece quando não há pronta entrega?',
    'O pedido é simples de fazer?',
    'O status do pedido é fácil de acompanhar?',
    'O sistema reduziria mensagens manuais no WhatsApp?',
    'O sistema ajudaria a organizar a rotina?',
    'Faltou alguma informação importante para a operação real?',
  ];

  const flowSteps = [
    { emoji: '🏭', text: 'Laboratório cadastra lentes e estoque' },
    { emoji: '🔍', text: 'Ótica consulta disponibilidade' },
    { emoji: '📋', text: 'Ótica faz o pedido online' },
    { emoji: '✅', text: 'Laboratório recebe e confirma' },
    { emoji: '📱', text: 'Ótica acompanha o status' },
  ];

  const beforeItems = [
    'Pedido pelo WhatsApp',
    'Resposta manual sobre estoque',
    'Informações espalhadas',
    'Dificuldade para acompanhar status',
    'Mais chance de erro',
  ];

  const afterItems = [
    'Consulta de lentes online',
    'Estoque e prazos organizados',
    'Pedido feito pela ótica',
    'Status acompanhado no sistema',
    'Histórico completo por ótica',
  ];

  /* ── render ── */
  return (
    <>
      {/* injected scoped styles */}
      <style>{cssText}</style>

      <div className="demo-page">
        {/* BG orbs */}
        <div className="demo-orb demo-orb-1" />
        <div className="demo-orb demo-orb-2" />
        <div className="demo-orb demo-orb-3" />

        {/* ─── HEADER ─── */}
        <header className="demo-header">
          <img src="/logo.svg" alt="LenteLink" className="demo-logo" />
        </header>

        {/* ─── HERO ─── */}
        <section className="demo-hero">
          <div className="demo-badge"><span className="demo-badge-dot" />Ambiente de demonstração</div>
          <h1>Demonstração <span className="demo-gradient-text">LenteLink</span></h1>
          <p className="demo-hero-sub">
            O LenteLink é um portal online que conecta o laboratório às óticas parceiras, permitindo
            consultar lentes, verificar estoque, fazer pedidos e acompanhar o andamento em tempo real.
          </p>
          <p className="demo-hero-extra">
            A ideia é reduzir pedidos perdidos no WhatsApp, agilizar o atendimento e dar mais controle
            para o laboratório e para as óticas.
          </p>
          <a href="https://lentelink.vercel.app/login" target="_blank" rel="noopener noreferrer" className="demo-cta">
            Acessar sistema {ExternalIcon}
          </a>
        </section>

        {/* ─── O QUE É ─── */}
        <section className="demo-section">
          <SectionHeading title="O que é o LenteLink?" />
          <p className="demo-body-text">
            O LenteLink é um sistema online para laboratórios ópticos atenderem suas óticas parceiras
            de forma mais organizada. Pelo sistema, o laboratório cadastra lentes, estoque e prazos.
            A ótica acessa com login próprio, consulta disponibilidade e faz pedidos diretamente pela
            plataforma.
          </p>
          <div className="demo-features-grid">
            <FeatureCard emoji="📦" title="Catálogo de lentes" text="O laboratório organiza os tipos de lentes que trabalha." />
            <FeatureCard emoji="📊" title="Estoque e prazos" text="A ótica consegue ver se a lente está pronta entrega ou se depende de produção." />
            <FeatureCard emoji="🛒" title="Pedidos online" text="A ótica faz o pedido direto pelo sistema, sem depender apenas do WhatsApp." />
            <FeatureCard emoji="📍" title="Acompanhamento" text="Laboratório e ótica acompanham o status do pedido até a finalização." />
          </div>
        </section>

        {/* ─── PROBLEMA ─── */}
        <section className="demo-section">
          <SectionHeading title="Qual problema o sistema resolve?" />
          <p className="demo-body-text">
            Muitos laboratórios ainda recebem pedidos por WhatsApp, ligação ou mensagens soltas.
            Isso pode gerar demora no atendimento, erro de informação, pedido perdido e falta de histórico.
          </p>
          <div className="demo-compare-grid">
            <div className="demo-compare-card demo-compare-before">
              <h4><span className="demo-compare-label demo-compare-label-before">Antes</span></h4>
              <ul>{beforeItems.map((t, i) => <li key={i}>{XIcon}<span>{t}</span></li>)}</ul>
            </div>
            <div className="demo-compare-card demo-compare-after">
              <h4><span className="demo-compare-label demo-compare-label-after">Com LenteLink</span></h4>
              <ul>{afterItems.map((t, i) => <li key={i}>{CheckIcon}<span>{t}</span></li>)}</ul>
            </div>
          </div>
        </section>

        {/* ─── COMO FUNCIONA ─── */}
        <section className="demo-section">
          <SectionHeading title="Como funciona na prática?" />
          <div className="demo-flow">
            {flowSteps.map((s, i) => (
              <div key={i}>
                <div className="demo-flow-step">
                  <span className="demo-flow-num">{i + 1}</span>
                  <span className="demo-flow-emoji">{s.emoji}</span>
                  <span className="demo-flow-text">{s.text}</span>
                </div>
                {i < flowSteps.length - 1 && <div className="demo-flow-arrow">{ArrowDown}</div>}
              </div>
            ))}
          </div>
          <p className="demo-body-text" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            O objetivo é transformar o relacionamento entre laboratório e ótica em um processo mais
            rápido, organizado e fácil de acompanhar.
          </p>
        </section>

        {/* ─── LADO DO LABORATÓRIO ─── */}
        <section className="demo-section">
          <div className="demo-role-grid">
            <div className="demo-role-card">
              <div className="demo-role-header">
                <div className="demo-icon-circle" style={{ background: 'rgba(139,92,246,0.12)' }}>{LabIcon}</div>
                <h3>O lado do laboratório</h3>
              </div>
              <p>No acesso do laboratório, a equipe consegue organizar a operação e acompanhar os pedidos recebidos das óticas.</p>
              <BulletList items={[
                'Ver painel inicial',
                'Cadastrar óticas parceiras',
                'Cadastrar e editar lentes',
                'Cadastrar e editar estoque',
                'Ver pedidos recebidos',
                'Atualizar status dos pedidos',
                'Acompanhar o andamento da operação',
              ]} />
            </div>
            <div className="demo-role-card">
              <div className="demo-role-header">
                <div className="demo-icon-circle" style={{ background: 'rgba(99,102,241,0.12)' }}>{StoreIcon}</div>
                <h3>O lado da ótica</h3>
              </div>
              <p>No acesso da ótica, a equipe consegue consultar lentes e fazer pedidos de forma simples.</p>
              <BulletList items={[
                'Ver painel inicial',
                'Buscar lentes',
                'Conferir disponibilidade',
                'Ver prazo de produção',
                'Fazer pedido',
                'Acompanhar status',
                'Consultar histórico de pedidos',
              ]} />
            </div>
          </div>
        </section>

        {/* ─── ACESSOS ─── */}
        <section className="demo-section">
          <SectionHeading
            title="Acessos para teste"
            subtitle="Agora que você entendeu o fluxo, use os acessos abaixo para testar os dois lados do sistema: primeiro como laboratório e depois como ótica."
          />
          <div className="demo-cards-grid">
            <AccessCard
              icon={LabIcon}
              title="Acesso do Laboratório"
              description="Use este acesso para ver o lado do laboratório: cadastro de óticas, catálogo de lentes, estoque e pedidos recebidos."
              email="alexemetz@admin.com"
              password="123456"
              accentColor="#8b5cf6"
              features={[
                'Ver o painel inicial',
                'Conferir a ótica Giori & Focari',
                'Cadastrar ou editar lentes',
                'Cadastrar ou editar estoque',
                'Ver pedidos recebidos',
                'Atualizar status dos pedidos',
              ]}
            />
            <AccessCard
              icon={StoreIcon}
              title="Acesso da Ótica — Giori & Focari"
              description="Use este acesso para ver o lado da ótica: busca de lentes, disponibilidade em estoque, criação e acompanhamento de pedidos."
              email="giorifocari@admin.com"
              password="123456"
              accentColor="#6366f1"
              features={[
                'Ver o painel da ótica',
                'Buscar lentes disponíveis',
                'Conferir quantidade em estoque',
                'Ver prazo quando não houver pronta entrega',
                'Criar pedido de lentes',
                'Acompanhar status do pedido',
                'Ver histórico de pedidos',
              ]}
            />
          </div>
        </section>

        {/* ─── ROTEIRO ─── */}
        <section className="demo-section">
          <SectionHeading
            title="Como testar em poucos minutos"
            subtitle="Siga este roteiro para entender o fluxo completo entre laboratório e ótica."
          />
          <div className="demo-steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="demo-step-item">
                <div className="demo-step-num">{i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
          <div className="demo-tip">
            <span className="demo-tip-icon">💡</span>
            <p>
              Caso ainda não existam lentes cadastradas, primeiro use o acesso do laboratório para
              cadastrar uma lente e um item de estoque. Depois use o acesso da ótica para testar a
              busca e o pedido.
            </p>
          </div>
        </section>

        {/* ─── CHECKLIST ─── */}
        <section className="demo-section">
          <SectionHeading
            title="O que observar durante a demonstração"
            subtitle="Enquanto navega pelo sistema, observe os pontos abaixo."
          />
          <div className="demo-checklist-grid">
            {checklist.map((c, i) => (
              <div key={i} className="demo-checklist-item">{EyeIcon}<span>{c}</span></div>
            ))}
          </div>
        </section>

        {/* ─── FEEDBACK ─── */}
        <section className="demo-section">
          <div className="demo-feedback-card">
            <h3>Depois do teste</h3>
            <p>
              Depois de navegar pelo sistema, envie suas dúvidas, sugestões e pontos de melhoria.
              A ideia dessa demonstração é validar se o fluxo faz sentido para a operação real
              antes da versão final.
            </p>
            <a href="https://wa.me/?text=Ol%C3%A1!%20Testei%20o%20LenteLink%20e%20gostaria%20de%20enviar%20meu%20feedback." target="_blank" rel="noopener noreferrer" className="demo-feedback-btn">
              💬 Enviar feedback
            </a>
          </div>
        </section>

        {/* ─── DISCLAIMER ─── */}
        <section className="demo-section" style={{ paddingBottom: '0.5rem' }}>
          <div className="demo-disclaimer">
            Esta é uma <strong>versão de demonstração</strong>. O objetivo é validar se o fluxo
            faz sentido para a operação real e levantar ajustes antes da versão final.
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="demo-footer">
          <img src="/logo.svg" alt="LenteLink" style={{ height: 28, opacity: 0.5 }} />
          <span>© {new Date().getFullYear()} LenteLink — Todos os direitos reservados.</span>
        </footer>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   CSS  (scoped via className prefix "demo-")
   ═══════════════════════════════════════════════════════ */
const cssText = `
/* ── page ── */
.demo-page{position:relative;min-height:100vh;overflow-x:hidden;background:#08090f}

/* orbs */
.demo-orb{position:fixed;border-radius:50%;pointer-events:none;z-index:0}
.demo-orb-1{top:-18%;right:-8%;width:600px;height:600px;background:radial-gradient(circle,rgba(99,102,241,.08) 0%,transparent 70%)}
.demo-orb-2{bottom:-12%;left:-8%;width:500px;height:500px;background:radial-gradient(circle,rgba(139,92,246,.06) 0%,transparent 70%)}
.demo-orb-3{top:45%;left:50%;transform:translate(-50%,-50%);width:900px;height:900px;background:radial-gradient(circle,rgba(99,102,241,.025) 0%,transparent 55%)}

/* ── header ── */
.demo-header{position:relative;z-index:10;display:flex;justify-content:center;padding:2rem 1.5rem 0}
.demo-logo{height:36px}

/* ── hero ── */
.demo-hero{position:relative;z-index:10;text-align:center;max-width:740px;margin:0 auto;padding:2.5rem 1.5rem 1.5rem}
.demo-badge{display:inline-flex;align-items:center;gap:.5rem;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:9999px;padding:.35rem 1rem;font-size:.8125rem;font-weight:500;color:#a5b4fc;margin-bottom:1.25rem}
.demo-badge-dot{width:6px;height:6px;border-radius:50%;background:#6366f1;display:inline-block}
.demo-hero h1{font-size:clamp(2rem,5vw,3rem);font-weight:800;line-height:1.15;letter-spacing:-.03em;color:#f0f2f7;margin:0 0 1rem}
.demo-gradient-text{background:linear-gradient(135deg,#6366f1 0%,#a855f7 50%,#c084fc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.demo-hero-sub{font-size:clamp(.975rem,2.5vw,1.125rem);color:#94a3b8;line-height:1.75;max-width:620px;margin:0 auto 1rem}
.demo-hero-extra{font-size:.9375rem;color:#64748b;line-height:1.7;max-width:560px;margin:0 auto 2rem;font-style:italic}
.demo-cta{display:inline-flex;align-items:center;gap:.5rem;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-weight:600;font-size:1rem;padding:.875rem 2rem;border-radius:.75rem;text-decoration:none;box-shadow:0 4px 20px rgba(99,102,241,.3);transition:transform .2s,box-shadow .2s}
.demo-cta:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(99,102,241,.4)}

/* ── sections ── */
.demo-section{position:relative;z-index:10;max-width:920px;margin:0 auto;padding:2.5rem 1.5rem}
.demo-section-heading{text-align:center;margin-bottom:1.75rem}
.demo-section-heading h2{font-size:clamp(1.375rem,3vw,1.75rem);font-weight:700;letter-spacing:-.025em;color:#f0f2f7;margin:0 0 .4rem}
.demo-section-heading p{color:#94a3b8;font-size:.9375rem;max-width:600px;margin:0 auto;line-height:1.65}
.demo-body-text{color:#94a3b8;font-size:.9375rem;line-height:1.75;max-width:700px;margin:0 auto 1.75rem;text-align:center}

/* ── feature cards 2×2 ── */
.demo-features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:1rem}
.demo-feature-card{background:rgba(18,20,28,.65);border:1px solid rgba(255,255,255,.05);border-radius:.875rem;padding:1.25rem;text-align:center;box-shadow:0 4px 15px rgba(0,0,0,.2)}
.demo-feature-emoji{font-size:1.75rem;display:block;margin-bottom:.5rem}
.demo-feature-card h4{font-size:.9375rem;font-weight:600;color:#e2e8f0;margin:0 0 .35rem}
.demo-feature-card p{font-size:.8125rem;color:#94a3b8;line-height:1.55;margin:0}

/* ── compare ── */
.demo-compare-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:1.25rem}
.demo-compare-card{background:rgba(18,20,28,.65);border:1px solid rgba(255,255,255,.05);border-radius:.875rem;padding:1.5rem;box-shadow:0 4px 15px rgba(0,0,0,.2)}
.demo-compare-card h4{margin:0 0 1rem}
.demo-compare-card ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.6rem}
.demo-compare-card li{display:flex;align-items:center;gap:.5rem;font-size:.875rem;color:#cbd5e1;line-height:1.45}
.demo-compare-label{display:inline-block;padding:.25rem .75rem;border-radius:9999px;font-size:.75rem;font-weight:600;letter-spacing:.03em}
.demo-compare-label-before{background:rgba(248,113,113,.12);color:#fca5a5}
.demo-compare-label-after{background:rgba(99,102,241,.12);color:#a5b4fc}
.demo-compare-before{border-top:3px solid rgba(248,113,113,.4)}
.demo-compare-after{border-top:3px solid rgba(99,102,241,.5)}

/* ── flow ── */
.demo-flow{display:flex;flex-direction:column;align-items:center}
.demo-flow-step{display:flex;align-items:center;gap:.75rem;background:rgba(18,20,28,.7);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.06);border-radius:.75rem;padding:.875rem 1.25rem;min-width:min(100%,420px);box-shadow:0 4px 15px rgba(0,0,0,.2)}
.demo-flow-num{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;flex-shrink:0}
.demo-flow-emoji{font-size:1.35rem;flex-shrink:0}
.demo-flow-text{font-size:.9rem;color:#e2e8f0;font-weight:500}
.demo-flow-arrow{display:flex;justify-content:center;padding:.35rem 0;opacity:.45}

/* ── role cards ── */
.demo-role-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:1.25rem}
.demo-role-card{background:rgba(18,20,28,.65);border:1px solid rgba(255,255,255,.05);border-radius:.875rem;padding:1.5rem;box-shadow:0 4px 15px rgba(0,0,0,.2)}
.demo-role-header{display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem}
.demo-role-header h3{font-size:1.0625rem;font-weight:700;color:#f0f2f7;margin:0}
.demo-role-card>p{color:#94a3b8;font-size:.875rem;line-height:1.65;margin:0 0 1rem}
.demo-icon-circle{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}

/* bullet list */
.demo-bullet-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.45rem}
.demo-bullet-list li{display:flex;align-items:center;gap:.5rem;font-size:.875rem;color:#cbd5e1}
.demo-bullet-dot{width:6px;height:6px;border-radius:50%;background:#6366f1;flex-shrink:0}

/* ── access cards ── */
.demo-cards-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:1.5rem}
.demo-access-card{background:rgba(18,20,28,.7);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.06);border-top:3px solid;border-radius:1rem;padding:1.75rem;box-shadow:0 8px 30px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.05)}
.demo-access-header{display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem}
.demo-access-header h3{font-size:1.0625rem;font-weight:700;color:#f0f2f7;margin:0}
.demo-access-desc{color:#94a3b8;font-size:.875rem;line-height:1.6;margin:0 0 1.25rem}

/* credentials */
.demo-cred-block{background:rgba(2,6,23,.5);border:1px solid rgba(255,255,255,.06);border-radius:.75rem;padding:1rem;display:flex;flex-direction:column;gap:.75rem;margin-bottom:1.25rem}
.demo-cred-row{display:flex;flex-direction:column;gap:.25rem}
.demo-cred-label{font-size:.7rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em}
.demo-cred-value-row{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.demo-cred-value-row code{font-size:.9rem;color:#e2e8f0;font-family:'JetBrains Mono','Fira Code',monospace;background:rgba(99,102,241,.08);padding:.2rem .6rem;border-radius:.375rem;border:1px solid rgba(99,102,241,.15);word-break:break-all}
.demo-copy-btn{display:inline-flex;align-items:center;gap:.35rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:.5rem;padding:.35rem .7rem;font-size:.7rem;font-weight:500;color:#cbd5e1;cursor:pointer;transition:all .15s;white-space:nowrap;font-family:inherit}
.demo-copy-btn:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.15)}
.demo-enter-btn{display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;padding:.75rem 1.5rem;border-radius:.75rem;color:#fff;font-weight:600;font-size:.9375rem;text-decoration:none;transition:all .2s;box-shadow:0 4px 15px rgba(99,102,241,.25);margin-bottom:1.25rem}
.demo-enter-btn:hover{filter:brightness(1.1);transform:translateY(-1px)}

/* feature list */
.demo-feature-list{display:flex;flex-direction:column;gap:.45rem}
.demo-feature-list-title{font-size:.7rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.15rem}
.demo-feature-item{display:flex;align-items:center;gap:.5rem;font-size:.85rem;color:#cbd5e1;line-height:1.45}

/* ── steps ── */
.demo-steps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,380px),1fr));gap:.65rem;margin-bottom:1.5rem}
.demo-step-item{display:flex;align-items:flex-start;gap:.75rem;background:rgba(18,20,28,.5);border:1px solid rgba(255,255,255,.04);border-radius:.75rem;padding:.8rem 1rem;font-size:.85rem;color:#cbd5e1;line-height:1.5}
.demo-step-num{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;flex-shrink:0}

/* tip */
.demo-tip{display:flex;align-items:flex-start;gap:.75rem;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:.75rem;padding:1rem 1.25rem}
.demo-tip-icon{font-size:1.2rem;flex-shrink:0;line-height:1.55}
.demo-tip p{font-size:.85rem;color:#fde68a;line-height:1.6;margin:0}

/* ── checklist ── */
.demo-checklist-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,380px),1fr));gap:.65rem}
.demo-checklist-item{display:flex;align-items:flex-start;gap:.65rem;background:rgba(18,20,28,.5);border:1px solid rgba(255,255,255,.04);border-radius:.75rem;padding:.8rem 1rem;font-size:.85rem;color:#cbd5e1;line-height:1.5}

/* ── feedback ── */
.demo-feedback-card{text-align:center;background:rgba(18,20,28,.65);border:1px solid rgba(99,102,241,.12);border-radius:1rem;padding:2rem 1.5rem;box-shadow:0 4px 20px rgba(0,0,0,.2)}
.demo-feedback-card h3{font-size:1.25rem;font-weight:700;color:#f0f2f7;margin:0 0 .75rem}
.demo-feedback-card p{color:#94a3b8;font-size:.9rem;line-height:1.65;max-width:540px;margin:0 auto 1.5rem}
.demo-feedback-btn{display:inline-flex;align-items:center;gap:.5rem;background:rgba(37,99,235,.15);border:1px solid rgba(59,130,246,.3);color:#93c5fd;font-weight:600;font-size:.9375rem;padding:.75rem 1.75rem;border-radius:.75rem;text-decoration:none;transition:all .2s}
.demo-feedback-btn:hover{background:rgba(37,99,235,.25);border-color:rgba(59,130,246,.5)}

/* ── disclaimer ── */
.demo-disclaimer{background:rgba(99,102,241,.06);border:1px solid rgba(99,102,241,.15);border-radius:.75rem;padding:1.15rem 1.5rem;text-align:center;font-size:.85rem;color:#94a3b8;line-height:1.6}

/* ── footer ── */
.demo-footer{position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;gap:.65rem;padding:2rem 1.5rem 3rem;border-top:1px solid rgba(255,255,255,.04)}
.demo-footer span{font-size:.8rem;color:#475569}

/* ── mobile ── */
@media(max-width:640px){
  .demo-hero{padding:2rem 1rem 1rem}
  .demo-section{padding:2rem 1rem}
  .demo-access-card{padding:1.25rem}
  .demo-flow-step{min-width:100%}
}
`;
