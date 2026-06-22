'use client';

import { useState } from 'react';
import type { Metadata } from 'next';

/* ───────────────────────────────────────────────────── */
/* Copy-to-clipboard helper                              */
/* ───────────────────────────────────────────────────── */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button onClick={handleCopy} style={styles.copyBtn}>
      {copied ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          <span style={{ color: '#10b981' }}>Copiado!</span>
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

/* ───────────────────────────────────────────────────── */
/* Icons (inline SVG)                                    */
/* ───────────────────────────────────────────────────── */
const Icons = {
  lab: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#iconGrad1)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <defs><linearGradient id="iconGrad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#818cf8"/><stop offset="100%" stopColor="#c084fc"/></linearGradient></defs>
      <path d="M9 3h6v4l5 10H4L9 7V3z"/><line x1="9" y1="3" x2="15" y2="3"/><path d="M7 17h10"/>
    </svg>
  ),
  store: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#iconGrad2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <defs><linearGradient id="iconGrad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
  ),
  arrow: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
  ),
  external: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
  ),
  eye: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
};

/* ───────────────────────────────────────────────────── */
/* Access Card                                           */
/* ───────────────────────────────────────────────────── */
function AccessCard({
  icon,
  title,
  description,
  email,
  password,
  features,
  accentColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  email: string;
  password: string;
  features: string[];
  accentColor: string;
}) {
  return (
    <div style={{ ...styles.accessCard, borderTop: `3px solid ${accentColor}` }}>
      <div style={styles.accessCardHeader}>
        <div style={{ ...styles.iconCircle, background: `${accentColor}15` }}>
          {icon}
        </div>
        <h3 style={styles.accessCardTitle}>{title}</h3>
      </div>

      <p style={styles.accessCardDesc}>{description}</p>

      <div style={styles.credentialBlock}>
        <div style={styles.credentialRow}>
          <span style={styles.credentialLabel}>Email</span>
          <div style={styles.credentialValueRow}>
            <code style={styles.credentialValue}>{email}</code>
            <CopyButton text={email} label="Copiar email" />
          </div>
        </div>
        <div style={styles.credentialRow}>
          <span style={styles.credentialLabel}>Senha</span>
          <div style={styles.credentialValueRow}>
            <code style={styles.credentialValue}>{password}</code>
            <CopyButton text={password} label="Copiar senha" />
          </div>
        </div>
      </div>

      <a
        href="https://lentelink.vercel.app/login"
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...styles.enterBtn, background: accentColor }}
      >
        Entrar no sistema
        {Icons.external}
      </a>

      <div style={styles.featureList}>
        <span style={styles.featureListTitle}>O que validar com esse acesso:</span>
        {features.map((f, i) => (
          <div key={i} style={styles.featureItem}>
            {Icons.check}
            <span>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────── */
/* Main Page                                             */
/* ───────────────────────────────────────────────────── */
export default function DemoPage() {
  const steps = [
    'Entre com o acesso do laboratório',
    'Confira se a ótica Giori & Focari está cadastrada',
    'Confira ou cadastre uma lente no catálogo',
    'Confira ou cadastre um item de estoque',
    'Saia da conta do laboratório',
    'Entre com o acesso da ótica',
    'Busque uma lente disponível',
    'Faça um pedido',
    'Volte com o acesso do laboratório',
    'Veja o pedido recebido',
    'Altere o status do pedido',
    'Entre novamente como ótica e confira se o status atualizou',
  ];

  const checklistItems = [
    'A busca de lentes é fácil de usar?',
    'As informações de estoque estão claras?',
    'O prazo de produção aparece quando não há pronta entrega?',
    'O pedido é simples de fazer?',
    'O laboratório consegue acompanhar os pedidos recebidos?',
    'A ótica consegue acompanhar o andamento?',
    'O sistema parece útil para a rotina do laboratório e das óticas?',
    'Existe alguma informação que deveria aparecer e não aparece?',
  ];

  const flowSteps = [
    { emoji: '🏭', text: 'Laboratório cadastra lentes e estoque' },
    { emoji: '🔍', text: 'Ótica consulta disponibilidade' },
    { emoji: '📋', text: 'Ótica faz pedido' },
    { emoji: '✅', text: 'Laboratório confirma e atualiza status' },
    { emoji: '📱', text: 'Ótica acompanha o andamento' },
  ];

  return (
    <div style={styles.page}>
      {/* Background decorations */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.bgOrb3} />

      {/* ─── Header ─── */}
      <header style={styles.header}>
        <img src="/logo.svg" alt="LenteLink" style={styles.logo} />
      </header>

      {/* ─── Hero ─── */}
      <section style={styles.hero}>
        <div style={styles.heroBadge}>
          <span style={styles.heroBadgeDot} />
          Ambiente de demonstração
        </div>
        <h1 style={styles.heroTitle}>
          Demonstração <span style={styles.gradientText}>LenteLink</span>
        </h1>
        <p style={styles.heroSubtitle}>
          Teste como o laboratório e a ótica se conectam para consultar lentes,
          controlar estoque e acompanhar pedidos em tempo real.
        </p>
        <a
          href="https://lentelink.vercel.app/login"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.heroCta}
        >
          Acessar sistema
          {Icons.external}
        </a>
      </section>

      {/* ─── Access Cards ─── */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Acessos para teste</h2>
        <p style={styles.sectionSubtitle}>
          Use os acessos abaixo para navegar pelo sistema como laboratório e como ótica.
        </p>
        <div style={styles.cardsGrid}>
          <AccessCard
            icon={Icons.lab}
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
            icon={Icons.store}
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

      {/* ─── System Flow ─── */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Fluxo principal do sistema</h2>
        <p style={styles.sectionSubtitle}>
          Veja como o laboratório e a ótica interagem pelo LenteLink.
        </p>
        <div style={styles.flowContainer}>
          {flowSteps.map((step, i) => (
            <div key={i}>
              <div style={styles.flowStep}>
                <span style={styles.flowEmoji}>{step.emoji}</span>
                <span style={styles.flowText}>{step.text}</span>
              </div>
              {i < flowSteps.length - 1 && (
                <div style={styles.flowArrow}>{Icons.arrow}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Test Roadmap ─── */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Como testar em poucos minutos</h2>
        <p style={styles.sectionSubtitle}>
          Siga esse roteiro simples para validar as principais funcionalidades.
        </p>
        <div style={styles.stepsContainer}>
          {steps.map((step, i) => (
            <div key={i} style={styles.stepItem}>
              <div style={styles.stepNumber}>{i + 1}</div>
              <span style={styles.stepText}>{step}</span>
            </div>
          ))}
        </div>
        <div style={styles.tipCard}>
          <span style={styles.tipIcon}>💡</span>
          <p style={styles.tipText}>
            Se ainda não houver lentes cadastradas no ambiente, primeiro entre como
            laboratório, cadastre uma lente e um item de estoque. Depois entre como
            ótica para testar a busca e o pedido.
          </p>
        </div>
      </section>

      {/* ─── Checklist ─── */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>O que observar durante a demonstração</h2>
        <p style={styles.sectionSubtitle}>
          Enquanto navega pelo sistema, observe os pontos abaixo.
        </p>
        <div style={styles.checklistGrid}>
          {checklistItems.map((item, i) => (
            <div key={i} style={styles.checklistItem}>
              {Icons.eye}
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Disclaimer ─── */}
      <section style={{ ...styles.section, paddingBottom: '1rem' }}>
        <div style={styles.disclaimerCard}>
          <p style={styles.disclaimerText}>
            Esta é uma <strong>versão de demonstração</strong>. O objetivo é validar se
            o fluxo faz sentido para a operação real e levantar ajustes antes da versão
            final.
          </p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={styles.footer}>
        <img src="/logo.svg" alt="LenteLink" style={{ height: 28, opacity: 0.6 }} />
        <span style={styles.footerText}>
          © {new Date().getFullYear()} LenteLink — Todos os direitos reservados.
        </span>
      </footer>
    </div>
  );
}

/* ───────────────────────────────────────────────────── */
/* Inline Styles                                         */
/* ───────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  /* Page */
  page: {
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden',
    background: '#08090f',
  },

  /* Background orbs */
  bgOrb1: {
    position: 'fixed',
    top: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgOrb2: {
    position: 'fixed',
    bottom: '-15%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgOrb3: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '800px',
    height: '800px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 60%)',
    pointerEvents: 'none',
    zIndex: 0,
  },

  /* Header */
  header: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem 1.5rem 0',
  },
  logo: {
    height: '36px',
  },

  /* Hero */
  hero: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    maxWidth: '720px',
    margin: '0 auto',
    padding: '3rem 1.5rem 2rem',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '9999px',
    padding: '0.375rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#a5b4fc',
    marginBottom: '1.5rem',
  },
  heroBadgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#6366f1',
    display: 'inline-block',
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    color: '#f0f2f7',
    marginBottom: '1rem',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #c084fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
    color: '#94a3b8',
    lineHeight: 1.7,
    maxWidth: '600px',
    margin: '0 auto 2rem',
  },
  heroCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '1rem',
    padding: '0.875rem 2rem',
    borderRadius: '0.75rem',
    textDecoration: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
  },

  /* Sections */
  section: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '900px',
    margin: '0 auto',
    padding: '3rem 1.5rem',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 'clamp(1.375rem, 3vw, 1.75rem)',
    fontWeight: 700,
    letterSpacing: '-0.025em',
    color: '#f0f2f7',
    marginBottom: '0.5rem',
  },
  sectionSubtitle: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '0.9375rem',
    marginBottom: '2rem',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  /* Access Cards Grid */
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
    gap: '1.5rem',
  },

  /* Access Card */
  accessCard: {
    background: 'rgba(18,20,28,0.7)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '1rem',
    padding: '1.75rem',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  accessCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  iconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  accessCardTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#f0f2f7',
    letterSpacing: '-0.02em',
  },
  accessCardDesc: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    marginBottom: '1.25rem',
  },

  /* Credential block */
  credentialBlock: {
    background: 'rgba(2,6,23,0.5)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.75rem',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.25rem',
  },
  credentialRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  credentialLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  credentialValueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  credentialValue: {
    fontSize: '0.9375rem',
    color: '#e2e8f0',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    background: 'rgba(99,102,241,0.08)',
    padding: '0.25rem 0.625rem',
    borderRadius: '0.375rem',
    border: '1px solid rgba(99,102,241,0.15)',
    wordBreak: 'break-all',
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.5rem',
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#cbd5e1',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
  },

  /* Enter button */
  enterBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.9375rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 15px rgba(99,102,241,0.25)',
    marginBottom: '1.25rem',
  },

  /* Feature list */
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  featureListTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#cbd5e1',
    lineHeight: 1.5,
  },

  /* Flow */
  flowContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0',
  },
  flowStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(18,20,28,0.7)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.75rem',
    padding: '1rem 1.5rem',
    minWidth: 'min(100%, 420px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
  flowEmoji: {
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  flowText: {
    fontSize: '0.9375rem',
    color: '#e2e8f0',
    fontWeight: 500,
  },
  flowArrow: {
    display: 'flex',
    justifyContent: 'center',
    padding: '0.5rem 0',
    opacity: 0.5,
  },

  /* Steps */
  stepsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    background: 'rgba(18,20,28,0.5)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '0.75rem',
    padding: '0.875rem 1rem',
  },
  stepNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  stepText: {
    fontSize: '0.875rem',
    color: '#cbd5e1',
    lineHeight: 1.5,
    paddingTop: '0.125rem',
  },

  /* Tip card */
  tipCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    background: 'rgba(245,158,11,0.08)',
    border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: '0.75rem',
    padding: '1rem 1.25rem',
  },
  tipIcon: {
    fontSize: '1.25rem',
    flexShrink: 0,
    lineHeight: 1.6,
  },
  tipText: {
    fontSize: '0.875rem',
    color: '#fde68a',
    lineHeight: 1.6,
    margin: 0,
  },

  /* Checklist */
  checklistGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))',
    gap: '0.75rem',
  },
  checklistItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    background: 'rgba(18,20,28,0.5)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '0.75rem',
    padding: '0.875rem 1rem',
    fontSize: '0.875rem',
    color: '#cbd5e1',
    lineHeight: 1.5,
  },

  /* Disclaimer */
  disclaimerCard: {
    background: 'rgba(99,102,241,0.06)',
    border: '1px solid rgba(99,102,241,0.15)',
    borderRadius: '0.75rem',
    padding: '1.25rem 1.5rem',
    textAlign: 'center',
  },
  disclaimerText: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    margin: 0,
    lineHeight: 1.6,
  },

  /* Footer */
  footer: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '2rem 1.5rem 3rem',
    borderTop: '1px solid rgba(255,255,255,0.04)',
  },
  footerText: {
    fontSize: '0.8125rem',
    color: '#475569',
  },
};
