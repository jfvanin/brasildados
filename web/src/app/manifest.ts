import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BrasilDados - Indicadores do Brasil',
    short_name: 'BrasilDados',
    description: 'Séries históricas e visualizações de indicadores econômicos, sociais e ambientais do Brasil.',
    start_url: '/',
    display: 'standalone',
    background_color: '#002147',
    theme_color: '#002147',
    lang: 'pt-BR',
    icons: [{ src: '/img/brasil_dados.jpg', sizes: '900x900', type: 'image/jpeg' }],
  };
}
