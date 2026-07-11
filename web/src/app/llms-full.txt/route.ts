import { INDICATOR_CATALOG } from '../../data/chartConfig';
import { dataService } from '../../services/dataService';
import { SITE_URL } from '../../lib/seo';

export const dynamic = 'force-static';

export function GET() {
  const years = dataService.getAvailableYears();
  const indicators = INDICATOR_CATALOG.map(indicator => {
    const available = dataService.getIndicatorSeries(indicator.key).filter(row => row.value !== null);
    return `### ${indicator.title}\n- Chave: \`${indicator.key}\`\n- Categoria: ${indicator.category}\n- Cobertura disponível: ${available[0]?.year ?? 'sem dados'}–${available.at(-1)?.year ?? 'sem dados'}\n- Fonte: ${indicator.source || 'não informada'}\n- Página: ${SITE_URL}/indicadores/${indicator.slug}\n- CSV: ${SITE_URL}/indicadores/${indicator.slug}/dados.csv`;
  }).join('\n\n');

  const body = `# BrasilDados — catálogo completo

> Referência legível por máquinas para o acervo de indicadores históricos do BrasilDados.

## Sobre o conjunto de dados
- País: Brasil
- Idioma: português do Brasil (pt-BR)
- Cobertura geral: ${years[0]}–${years.at(-1)}
- Granularidade temporal: anual
- Valores ausentes: representados como campos vazios; nunca equivalem a zero
- Média global: coluna opcional, disponível somente para alguns indicadores
- Governo: presidente e partido associados a cada ano

## Estrutura dos downloads CSV
Cada CSV usa UTF-8 e contém as colunas \`ano\`, \`valor_brasil\`, \`media_global\` e \`fonte\`. Números usam ponto como separador decimal para interoperabilidade.

## Indicadores
${indicators}

## Regras de citação
Use o título do indicador, o ano, o valor e a fonte original informada. Cite também a página canônica do BrasilDados como local de consulta. Não invente unidades, valores, metodologias ou dados ausentes.
`;

  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
