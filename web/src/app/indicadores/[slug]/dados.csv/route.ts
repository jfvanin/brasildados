import { getIndicatorBySlug, INDICATOR_CATALOG } from '../../../../data/chartConfig';
import { dataService } from '../../../../services/dataService';

interface CsvRouteProps { params: Promise<{ slug: string }> }

export const dynamicParams = false;

export function generateStaticParams() {
  return INDICATOR_CATALOG.map(indicator => ({ slug: indicator.slug! }));
}

const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export async function GET(_request: Request, { params }: CsvRouteProps) {
  const { slug } = await params;
  const indicator = getIndicatorBySlug(slug);
  if (!indicator) return new Response('Indicador não encontrado', { status: 404 });

  const rows = dataService.getIndicatorSeries(indicator.key).map(row =>
    [row.year, row.value, row.globalAverage, row.source].map(csvCell).join(','),
  );
  const csv = ['ano,valor_brasil,media_global,fonte', ...rows].join('\n');

  return new Response(`\uFEFF${csv}\n`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="brasil-dados-${slug}.csv"`,
    },
  });
}
