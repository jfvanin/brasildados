import { INDICATOR_CATALOG } from '../data/chartConfig';
import { dataService } from '../services/dataService';
import type { IndicatorCatalogEntry } from '../types';

export const SITE_URL = 'https://brasildados.online';
export const SITE_NAME = 'BrasilDados';

const sourceUrl = (source?: string | null) => source?.match(/^https?:\/\/[^\s)]+/)?.[0];

export const organizationSchema = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/img/brasil_dados.jpg`,
    width: 900,
    height: 900,
  },
};

export const websiteSchema = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  description: 'Séries históricas de indicadores econômicos, sociais, ambientais e políticos do Brasil.',
  inLanguage: 'pt-BR',
  publisher: { '@id': `${SITE_URL}/#organization` },
};

export const dataCatalogSchema = {
  '@type': 'DataCatalog',
  '@id': `${SITE_URL}/#catalog`,
  name: 'Catálogo de indicadores do Brasil',
  description: 'Catálogo de séries históricas anuais sobre economia, desenvolvimento humano, meio ambiente, finanças e sociedade no Brasil.',
  url: SITE_URL,
  inLanguage: 'pt-BR',
  provider: { '@id': `${SITE_URL}/#organization` },
  dataset: INDICATOR_CATALOG.map(indicator => ({ '@id': `${SITE_URL}/indicadores/${indicator.slug}#dataset` })),
};

export const buildDatasetSchema = (indicator: IndicatorCatalogEntry) => {
  const series = dataService.getIndicatorSeries(indicator.key);
  const firstYear = series[0]?.year;
  const lastYear = series.at(-1)?.year;
  const canonical = `${SITE_URL}/indicadores/${indicator.slug}`;
  const provenance = sourceUrl(indicator.source);
  const info = dataService.getIndicatorInfo(indicator.key);

  return {
    '@type': 'Dataset',
    '@id': `${canonical}#dataset`,
    name: `${indicator.title} no Brasil`,
    alternateName: `${indicator.title} - série histórica brasileira`,
    description: `${info?.description || `Série histórica anual de ${indicator.title} no Brasil.`} Valores disponíveis de ${firstYear} a ${lastYear}.`,
    url: canonical,
    mainEntityOfPage: canonical,
    inLanguage: 'pt-BR',
    temporalCoverage: `${firstYear}/${lastYear}`,
    spatialCoverage: { '@type': 'Country', name: 'Brasil', identifier: 'BR' },
    creator: { '@id': `${SITE_URL}/#organization` },
    provider: { '@id': `${SITE_URL}/#organization` },
    includedInDataCatalog: { '@id': `${SITE_URL}/#catalog` },
    isAccessibleForFree: true,
    variableMeasured: {
      '@type': 'PropertyValue',
      name: indicator.title,
      description: info?.description || `${indicator.title}, observado anualmente para o Brasil.`,
    },
    keywords: [indicator.title, indicator.category, 'Brasil', 'série histórica', 'indicadores brasileiros'].filter(Boolean),
    ...(provenance ? { isBasedOn: provenance } : {}),
    distribution: {
      '@type': 'DataDownload',
      name: `${indicator.title} em CSV`,
      contentUrl: `${canonical}/dados.csv`,
      encodingFormat: 'text/csv',
    },
  };
};

export const jsonLdGraph = (...entities: object[]) => ({
  '@context': 'https://schema.org',
  '@graph': entities,
});
