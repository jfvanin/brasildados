import { describe, expect, it } from 'vitest';
import { getIndicatorBySlug, INDICATOR_CATALOG } from '../data/chartConfig';
import { buildDatasetSchema, dataCatalogSchema, SITE_URL } from './seo';

describe('SEO dataset schema', () => {
  it('publishes every indicator in the data catalog', () => {
    expect(dataCatalogSchema.dataset).toHaveLength(INDICATOR_CATALOG.length);
  });

  it('describes a real CSV distribution and provenance', () => {
    const indicator = getIndicatorBySlug('inflation')!;
    const schema = buildDatasetSchema(indicator);
    expect(schema).toMatchObject({
      '@type': 'Dataset',
      temporalCoverage: '1990/2025',
      isAccessibleForFree: true,
      isBasedOn: 'https://www.ibge.gov.br',
      distribution: {
        '@type': 'DataDownload',
        contentUrl: `${SITE_URL}/indicadores/inflation/dados.csv`,
        encodingFormat: 'text/csv',
      },
    });
  });
});
