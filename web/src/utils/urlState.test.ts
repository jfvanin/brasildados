import { encodeStateToParams, decodeStateFromParams, applySelectionsToToggles, sanitizeYearRange } from './urlState';
import { ToggleOption } from '../types';

const makeToggle = (key: string, enabled = false, isGroup = false): ToggleOption => ({
    key, title: key, enabled, color: '#fff', isGroup,
});

describe('encodeStateToParams / decodeStateFromParams', () => {
    it('round-trips year range and chart selections', () => {
        const chartStates: ToggleOption[][] = [
            [makeToggle('gdp_growth', true), makeToggle('inflation', true), makeToggle('selic_rate')],
            [makeToggle('hdi', true)],
        ];
        const params = encodeStateToParams({ startYear: 2003, endYear: 2018 }, chartStates);
        const decoded = decodeStateFromParams(`?${params.toString()}`);

        expect(decoded.yearRange).toEqual({ startYear: 2003, endYear: 2018 });
        expect(decoded.chartSelections[0]).toEqual(['gdp_growth', 'inflation']);
        expect(decoded.chartSelections[1]).toEqual(['hdi']);
    });

    it('excludes group umbrella toggles from encoding', () => {
        const chartStates: ToggleOption[][] = [
            [makeToggle('trade_balance', true, true), makeToggle('exports_gdp', true), makeToggle('imports_gdp', true)],
        ];
        const params = encodeStateToParams({ startYear: 2000, endYear: 2025 }, chartStates);
        expect(params.get('g0')).toBe('exports_gdp.imports_gdp');
    });

    it('returns empty state for malformed input', () => {
        const decoded = decodeStateFromParams('?inicio=abc&g0=&gX=foo');
        expect(decoded.yearRange).toBeUndefined();
        expect(decoded.chartSelections[0]).toEqual([]);
        expect(Object.keys(decoded.chartSelections)).toHaveLength(1);
    });
});

describe('applySelectionsToToggles', () => {
    const defaults: ToggleOption[][] = [
        [makeToggle('gdp_growth', true), makeToggle('inflation'), makeToggle('unemployment')],
    ];

    it('applies valid selections', () => {
        const result = applySelectionsToToggles(defaults, { 0: ['inflation'] }, [undefined]);
        expect(result[0].find(t => t.key === 'inflation')!.enabled).toBe(true);
        expect(result[0].find(t => t.key === 'gdp_growth')!.enabled).toBe(false);
    });

    it('ignores unknown keys and keeps defaults when nothing valid remains', () => {
        const result = applySelectionsToToggles(defaults, { 0: ['nonexistent'] }, [undefined]);
        expect(result[0].find(t => t.key === 'gdp_growth')!.enabled).toBe(true);
    });

    it('keeps defaults for charts without a selection param', () => {
        const result = applySelectionsToToggles(defaults, {}, [undefined]);
        expect(result).toEqual(defaults);
    });

    it('re-enables umbrella toggles when all group members are selected', () => {
        const withGroup: ToggleOption[][] = [
            [makeToggle('se', false, true), makeToggle('se_f'), makeToggle('se_m')],
        ];
        const result = applySelectionsToToggles(withGroup, { 0: ['se_f', 'se_m'] }, [{ se: ['se_f', 'se_m'] }]);
        expect(result[0].find(t => t.key === 'se')!.enabled).toBe(true);
        expect(result[0].find(t => t.key === 'se_f')!.enabled).toBe(true);
    });
});

describe('sanitizeYearRange', () => {
    const bounds = { startYear: 1990, endYear: 2025 };
    const fallback = { startYear: 2000, endYear: 2025 };

    it('clamps out-of-bounds years', () => {
        expect(sanitizeYearRange({ startYear: 1900, endYear: 2099 }, fallback, bounds))
            .toEqual({ startYear: 1990, endYear: 2025 });
    });

    it('swaps inverted ranges', () => {
        expect(sanitizeYearRange({ startYear: 2020, endYear: 2005 }, fallback, bounds))
            .toEqual({ startYear: 2005, endYear: 2020 });
    });

    it('uses fallback when nothing requested', () => {
        expect(sanitizeYearRange(undefined, fallback, bounds)).toEqual(fallback);
    });
});
