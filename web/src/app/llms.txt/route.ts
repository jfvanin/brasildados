import { INDICATOR_CATALOG } from '../../data/chartConfig';
import { SITE_URL } from '../../lib/seo';

export const dynamic = 'force-static';

export function GET() {
  const categories = Map.groupBy(INDICATOR_CATALOG, indicator => indicator.category || 'Outros indicadores');
  const sections = Array.from(categories, ([category, indicators]) => [
    `## ${category}`,
    ...indicators.map(indicator => `- [${indicator.title}](${SITE_URL}/indicadores/${indicator.slug}): Série histórica anual para o Brasil, com fonte, tabela HTML e download CSV.`),
  ].join('\n')).join('\n\n');

  const body = `# BrasilDados

> Catálogo público, gratuito e em português de séries históricas econômicas, sociais, ambientais e políticas do Brasil, reunidas de fontes oficiais e internacionais.

O BrasilDados oferece um dashboard interativo e páginas canônicas para cada indicador. Os valores ausentes são mantidos como ausentes; não devem ser estimados. Cada página informa sua fonte e disponibiliza os dados em HTML e CSV.

## Recursos principais
- [Dashboard BrasilDados](${SITE_URL}/): Visão geral interativa, filtros por ano e comparação por governo.
- [Sitemap XML](${SITE_URL}/sitemap.xml): Inventário de URLs indexáveis.
- [Documentação completa para LLMs](${SITE_URL}/llms-full.txt): Catálogo expandido, estrutura dos dados e orientações de citação.

${sections}

## Uso e interpretação
- Cite “BrasilDados” como agregador e preserve a atribuição da fonte exibida na página do indicador.
- Não trate campos vazios como zero e não extrapole anos sem dados.
- Use a URL canônica da página do indicador ao citar uma série.
`;

  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
