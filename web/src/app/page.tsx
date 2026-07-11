import Dashboard from '../components/Dashboard';
import { dataService } from '../services/dataService';
import { sanitizeYearRange } from '../utils/urlState';
import { dataCatalogSchema, jsonLdGraph, organizationSchema, websiteSchema } from '../lib/seo';

export const dynamic = 'force-dynamic';

interface HomeProps {
  searchParams: Promise<{ inicio?: string | string[]; fim?: string | string[] }>;
}

const parseYear = (value: string | string[] | undefined) => {
  const parsed = Number.parseInt(Array.isArray(value) ? value[0] : value || '', 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default async function Home({ searchParams }: HomeProps) {
  const query = await searchParams;
  const years = dataService.getAvailableYears();
  const bounds = { startYear: years[0] || 1990, endYear: years.at(-1) || 2025 };
  const initialYearRange = sanitizeYearRange(
    { startYear: parseYear(query.inicio), endYear: parseYear(query.fim) },
    { startYear: 2000, endYear: bounds.endYear },
    bounds,
  );
  const structuredData = jsonLdGraph(organizationSchema, websiteSchema, dataCatalogSchema);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Dashboard initialYearRange={initialYearRange} />
    </>
  );
}
