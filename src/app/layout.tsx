import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LenteLink - Gestao para Laboratorios Opticos',
  description: 'Sistema B2B para gestao de pedidos e estoque de laboratorios opticos e oticas.',
  icons: [{ rel: 'icon', url: '/logo-icon.svg', type: 'image/svg+xml' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
