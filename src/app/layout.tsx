import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpticaLab - Gestão para Laboratórios Ópticos',
  description: 'Sistema B2B white-label para gestão de pedidos e estoque de laboratórios ópticos e óticas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
