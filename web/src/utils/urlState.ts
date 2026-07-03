import { ToggleOption, YearRange } from '../types';

// Serializes/restores dashboard state (year range + enabled toggles per chart)
// to URL query params, so any chart view is linkable.
// Format: ?inicio=2000&fim=2025&g0=gdp_growth.inflation&g1=hdi

export interface DashboardUrlState {
    yearRange?: Partial<YearRange>;
    chartSelections: Record<number, string[]>; // chart index -> enabled toggle keys
}

export const encodeStateToParams = (
    yearRange: YearRange,
    chartStates: ToggleOption[][],
): URLSearchParams => {
    const params = new URLSearchParams();
    params.set('inicio', String(yearRange.startYear));
    params.set('fim', String(yearRange.endYear));
    chartStates.forEach((toggles, index) => {
        const enabled = toggles.filter(t => t.enabled && !t.isGroup).map(t => t.key);
        params.set(`g${index}`, enabled.join('.'));
    });
    return params;
};

export const decodeStateFromParams = (search: string): DashboardUrlState => {
    const state: DashboardUrlState = { chartSelections: {} };
    let params: URLSearchParams;
    try {
        params = new URLSearchParams(search);
    } catch {
        return state;
    }

    const inicio = parseInt(params.get('inicio') || '', 10);
    const fim = parseInt(params.get('fim') || '', 10);
    if (!isNaN(inicio) || !isNaN(fim)) {
        state.yearRange = {};
        if (!isNaN(inicio)) state.yearRange.startYear = inicio;
        if (!isNaN(fim)) state.yearRange.endYear = fim;
    }

    params.forEach((value, key) => {
        const match = key.match(/^g(\d+)$/);
        if (match) {
            const index = parseInt(match[1], 10);
            state.chartSelections[index] = value.split('.').filter(Boolean);
        }
    });

    return state;
};

// Applies a decoded URL state onto the default toggle configuration.
// Unknown keys are ignored; a chart without a param keeps its defaults.
export const applySelectionsToToggles = (
    defaultStates: ToggleOption[][],
    selections: Record<number, string[]>,
    groups: Array<Record<string, string[] | undefined> | undefined>,
): ToggleOption[][] => {
    return defaultStates.map((toggles, chartIndex) => {
        const selected = selections[chartIndex];
        if (!selected) return toggles;

        const validKeys = selected.filter(key => toggles.some(t => t.key === key && !t.isGroup));
        if (validKeys.length === 0) return toggles;

        // Re-enable group umbrella toggles whose members are all selected
        const chartGroups = groups[chartIndex] || {};
        const groupKeys = Object.keys(chartGroups).filter(groupKey => {
            const members = chartGroups[groupKey] || [];
            return members.length > 0 && members.every(member => validKeys.includes(member));
        });

        return toggles.map(toggle => ({
            ...toggle,
            enabled: validKeys.includes(toggle.key) || groupKeys.includes(toggle.key),
        }));
    });
};

// Clamps a partial year range from the URL to the available data range
export const sanitizeYearRange = (
    requested: Partial<YearRange> | undefined,
    fallback: YearRange,
    bounds: YearRange,
): YearRange => {
    const clamp = (year: number) => Math.min(Math.max(year, bounds.startYear), bounds.endYear);
    let startYear = requested?.startYear !== undefined ? clamp(requested.startYear) : fallback.startYear;
    let endYear = requested?.endYear !== undefined ? clamp(requested.endYear) : fallback.endYear;
    if (startYear > endYear) [startYear, endYear] = [endYear, startYear];
    return { startYear, endYear };
};
