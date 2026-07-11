import type { Metadata } from 'next';
import Script from 'next/script';
import '../index.css';
import { SITE_NAME, SITE_URL } from '../lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: 'BrasilDados - Indicadores Econômicos, Sociais e Ambientais',
    template: '%s | BrasilDados',
  },
  description: 'Explore séries históricas de indicadores econômicos, sociais e ambientais do Brasil, com fontes oficiais, gráficos e dados por ano.',
  alternates: { canonical: '/' },
  authors: [{ name: 'BrasilDados' }],
  category: 'data visualization',
  keywords: ['dados do Brasil', 'indicadores do Brasil', 'séries históricas', 'economia brasileira', 'dados sociais', 'dados ambientais'],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: {
    type: 'website', locale: 'pt_BR', siteName: SITE_NAME, url: SITE_URL,
    title: 'BrasilDados - Indicadores do Brasil',
    description: 'Dados históricos do Brasil em gráficos interativos e tabelas acessíveis.',
    images: [{ url: '/img/brasil_dados.jpg', width: 900, height: 900, alt: 'BrasilDados - Indicadores do Brasil' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BrasilDados - Indicadores do Brasil',
    description: 'Dados históricos do Brasil em gráficos interativos e tabelas acessíveis.',
    images: ['/img/brasil_dados.jpg'],
  },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-Q0SELEH9GT" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-Q0SELEH9GT');`}
        </Script>
      </body>
    </html>
  );
}
