import { dataService } from './dataService';

describe('dataService.getIndicatorsCatalog', () => {
    it('returns indicators with titles, sorted alphabetically', () => {
        const catalog = dataService.getIndicatorsCatalog();
        expect(catalog.length).toBeGreaterThan(30);
        expect(catalog.some(entry => entry.key === 'gdp_growth')).toBe(true);
        expect(catalog.some(entry => entry.key === 'hdi')).toBe(true);

        const titles = catalog.map(entry => entry.title);
        expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b, 'pt-BR')));
    });

    it('excludes indicators with no numeric values (dead keys)', () => {
        const catalog = dataService.getIndicatorsCatalog();
        expect(catalog.some(entry => entry.key === 'co2_pc')).toBe(false);
    });

    it('excludes internal gender-split and rank keys', () => {
        const catalog = dataService.getIndicatorsCatalog();
        ['hdi_f', 'hdi_m', 'se_f', 'pr_m', 'lfpr_f', 'hdi_rank', 'gii_rank', 'gdi_group'].forEach(key => {
            expect(catalog.some(entry => entry.key === key)).toBe(false);
        });
        expect(catalog.some(entry => entry.key === 'mf')).toBe(true); // not a split key
    });
});

describe('dataService.getPresidencyStats', () => {
    it('returns one stat per government with data, colored by party', () => {
        const stats = dataService.getPresidencyStats('gdp_growth');
        expect(stats.length).toBeGreaterThanOrEqual(6);
        stats.forEach(stat => {
            expect(stat.president).toBeTruthy();
            expect(stat.color).toMatch(/^#/);
            expect(stat.yearsWithData).toBeGreaterThan(0);
            expect(Number.isFinite(stat.average)).toBe(true);
        });
    });

    it('computes the average of the period values', () => {
        // Single-year range: average must equal that year's value
        const stats = dataService.getPresidencyStats('gdp_growth', 2010, 2010);
        expect(stats).toHaveLength(1);
        const chartPoint = dataService.getChartData(['gdp_growth']).find(p => p.year === 2010)!;
        expect(stats[0].average).toBeCloseTo(chartPoint['gdp_growth'] as number, 6);
        expect(stats[0].delta).toBeNull(); // single value -> no delta
    });

    it('respects the selected year range', () => {
        const stats = dataService.getPresidencyStats('gdp_growth', 2019, 2022);
        expect(stats).toHaveLength(1); // only Bolsonaro's government
        expect(stats[0].startYear).toBe(2019);
        expect(stats[0].endYear).toBe(2022);
    });

    it('returns empty for unknown indicators', () => {
        expect(dataService.getPresidencyStats('does_not_exist')).toEqual([]);
    });

    it('computes delta as last minus first available value', () => {
        const stats = dataService.getPresidencyStats('hdi', 2003, 2010);
        expect(stats).toHaveLength(1);
        const points = dataService.getChartData(['hdi']);
        const first = points.find(p => p.year === 2003)!['hdi'] as number;
        const last = points.find(p => p.year === 2010)!['hdi'] as number;
        expect(stats[0].delta).toBeCloseTo(last - first, 6);
    });
});
