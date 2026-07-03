import { YearRange } from '../types';

// Serializes/restores only the selected year range to URL query params.
// Format: ?inicio=2000&fim=2025

export type ComparisonMetric = 'average' | 'delta';

export interface ComparisonState {
    indicator: string;
    metric: ComparisonMetric;
}

export interface DashboardUrlState {
    yearRange?: Partial<YearRange>;
}

export const encodeStateToParams = (yearRange: YearRange): URLSearchParams => {
    const params = new URLSearchParams();
    params.set('inicio', String(yearRange.startYear));
    params.set('fim', String(yearRange.endYear));
    return params;
};

export const decodeStateFromParams = (search: string): DashboardUrlState => {
    const state: DashboardUrlState = {};
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

    return state;
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
