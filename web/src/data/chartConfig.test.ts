import { describe, expect, it } from 'vitest';
import { CHART_CONFIGS, getIndicatorBySlug, INDICATOR_CATALOG, indicatorSlug } from './chartConfig';
import { dataService } from '../services/dataService';

describe('indicator catalog', () => {
  it('has a unique, reversible slug for every chart indicator', () => {
    expect(new Set(INDICATOR_CATALOG.map(item => item.slug)).size).toBe(INDICATOR_CATALOG.length);
    for (const indicator of INDICATOR_CATALOG) {
      expect(getIndicatorBySlug(indicator.slug!)).toEqual(indicator);
      expect(indicator.slug).toBe(indicatorSlug(indicator.key));
    }
  });

  it('covers every non-group series shown by the charts', () => {
    const chartKeys = new Set(CHART_CONFIGS.flatMap(config => config.toggles.filter(toggle => !toggle.isGroup).map(toggle => toggle.key)));
    expect(new Set(INDICATOR_CATALOG.map(item => item.key))).toEqual(chartKeys);
  });

  it('provides explanatory metadata for every chart indicator', () => {
    for (const indicator of INDICATOR_CATALOG) {
      expect(dataService.getIndicatorInfo(indicator.key)).toMatchObject({
        description: expect.any(String),
        interpretation: expect.any(String),
      });
    }
  });

  it('exposes the complete 1990–2025 series', () => {
    const series = dataService.getIndicatorSeries('inflation');
    expect(series).toHaveLength(36);
    expect(series[0].year).toBe(1990);
    expect(series.at(-1)).toMatchObject({ year: 2025, value: 4.26 });
  });
});
