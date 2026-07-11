import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getIndicatorBySlug, INDICATOR_CATALOG } from '../../../data/chartConfig';
import { dataService } from '../../../services/dataService';
import { buildDatasetSchema, jsonLdGraph, organizationSchema, SITE_URL } from '../../../lib/seo';

interface IndicatorPageProps { params: Promise<{ slug: string }> }

const formatValue = (value: string | number | null) =>
  value === null || value === '' ? '—' : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 }).format(Number(value));

export const dynamicParams = false;

export function generateStaticParams() {
  return INDICATOR_CATALOG.map(indicator => ({ slug: indicator.slug! }));
}

export async function generateMetadata({ params }: IndicatorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const indicator = getIndicatorBySlug(slug);
  if (!indicator) return {};
  const description = `Série histórica de ${indicator.title} no Brasil, com valores anuais, fonte e comparação global quando disponível.`;
  return {
    title: `${indicator.title} no Brasil`,
    description,
    alternates: { canonical: `/indicadores/${indicator.slug}` },
    openGraph: { title: `${indicator.title} no Brasil`, description, url: `/indicadores/${indicator.slug}` },
    twitter: { title: `${indicator.title} no Brasil`, description, card: 'summary_large_image', images: ['/img/brasil_dados.jpg'] },
    keywords: [indicator.title, indicator.category || '', 'Brasil', 'dados históricos', 'série histórica'].filter(Boolean),
  };
}

export default async function IndicatorPage({ params }: IndicatorPageProps) {
  const { slug } = await params;
  const indicator = getIndicatorBySlug(slug);
  if (!indicator) notFound();
  const series = dataService.getIndicatorSeries(indicator.key);
  const indicatorInfo = dataService.getIndicatorInfo(indicator.key);
  const related = INDICATOR_CATALOG.filter(item => item.category === indicator.category && item.key !== indicator.key).slice(0, 6);
  const dataset = buildDatasetSchema(indicator);
  const breadcrumbs = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'BrasilDados', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: indicator.title, item: `${SITE_URL}/indicadores/${indicator.slug}` },
    ],
  };

  return (
    <main className="min-h-screen bg-brazil-gradient px-4 py-10 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph(organizationSchema, dataset, breadcrumbs)) }} />
      <article className="mx-auto max-w-5xl">
        <nav aria-label="Navegação estrutural" className="mb-6 text-sm text-white/70">
          <Link href="/" className="underline hover:text-white">BrasilDados</Link> <span aria-hidden="true">/</span> {indicator.title}
        </nav>
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brazil-yellow-300">{indicator.category}</p>
          <h1 className="text-3xl font-bold md:text-5xl">{indicator.title} no Brasil</h1>
          <p className="mt-4 max-w-3xl text-lg text-white/80">
            Consulte a série histórica anual de {indicator.title}, com dados disponíveis entre {series[0]?.year} e {series.at(-1)?.year}.
          </p>
          <p className="mt-3 text-sm text-white/70"><strong>Fonte:</strong> {indicator.source || 'Não informada'}</p>
          <a className="mt-4 inline-flex rounded-lg bg-brazil-yellow-400 px-4 py-2 text-sm font-semibold text-brazil-navy hover:bg-brazil-yellow-300" href={`/indicadores/${indicator.slug}/dados.csv`} download>
            Baixar dados em CSV
          </a>
        </header>

        {indicatorInfo && (
          <section className="mb-8 rounded-xl border border-white/20 bg-white/10 p-4" aria-labelledby="entenda-indicador">
            <h2 id="entenda-indicador" className="text-lg font-bold">O que este indicador significa?</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{indicatorInfo.description}</p>
            {indicatorInfo.interpretation && <p className="mt-2 text-sm leading-relaxed text-white/70"><strong>Como interpretar:</strong> {indicatorInfo.interpretation}</p>}
          </section>
        )}

        <section aria-labelledby="historico" className="overflow-hidden rounded-2xl border border-white/20 bg-white/10">
          <h2 id="historico" className="px-4 py-4 text-xl font-bold">Dados históricos</h2>
          <div className="max-h-[65vh] overflow-auto border-t border-white/20">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Valores anuais de {indicator.title} no Brasil</caption>
              <thead className="sticky top-0 bg-brazil-navy">
                <tr><th scope="col" className="px-4 py-3">Ano</th><th scope="col" className="px-4 py-3">Brasil</th>{indicator.hasGlobalAverage && <th scope="col" className="px-4 py-3">Média global</th>}</tr>
              </thead>
              <tbody>{series.map(row => (
                <tr key={row.year} className="border-t border-white/10 odd:bg-white/[0.03]">
                  <th scope="row" className="px-4 py-3">{row.year}</th><td className="px-4 py-3">{formatValue(row.value)}</td>{indicator.hasGlobalAverage && <td className="px-4 py-3">{formatValue(row.globalAverage)}</td>}
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>

        {related.length > 0 && <aside className="mt-8"><h2 className="mb-3 text-xl font-bold">Indicadores relacionados</h2><ul className="grid gap-2 sm:grid-cols-2">{related.map(item => <li key={item.key}><Link className="block rounded-lg border border-white/20 bg-white/10 p-3 hover:bg-white/20" href={`/indicadores/${item.slug}`}>{item.title}</Link></li>)}</ul></aside>}
        <p className="mt-10"><Link href="/" className="font-semibold text-brazil-yellow-300 underline">Voltar ao dashboard interativo</Link></p>
      </article>
    </main>
  );
}
