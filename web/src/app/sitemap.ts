import type { MetadataRoute } from 'next';
import { INDICATOR_CATALOG } from '../data/chartConfig';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://brasildados.online';
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    ...INDICATOR_CATALOG.map(indicator => ({
      url: `${base}/indicadores/${indicator.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
