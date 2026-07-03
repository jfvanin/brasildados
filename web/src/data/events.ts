import { HistoricalEvent } from '../types';

// Key historical events shown as optional vertical markers on the charts.
// Kept factual and neutral; short labels to avoid cluttering the chart.
export const HISTORICAL_EVENTS: HistoricalEvent[] = [
    { year: 1994, label: 'Plano Real' },
    { year: 1999, label: 'Câmbio flutuante' },
    { year: 2008, label: 'Crise global' },
    { year: 2016, label: 'Impeachment' },
    { year: 2020, label: 'Pandemia' },
];
