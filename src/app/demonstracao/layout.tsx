import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demonstração | LenteLink',
  description: 'Página de demonstração do LenteLink para validação do sistema.',
  robots: { index: false, follow: false },
};

export default function DemonstracaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
