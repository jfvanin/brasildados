import { BrazilData, ChartDataPoint, PresidencyPeriod, PARTY_COLORS, PartyCode, presidentNicks } from '../types';
import brazilData from '../dados_brasil.json';

class DataService {
    private data: BrazilData;

    constructor() {
        this.data = brazilData as any; // Type assertion to handle complex nested structure
    }

    // Get all available years
    getAvailableYears(): number[] {
        return Object.keys(this.data.years)
            .map(year => parseInt(year))
            .sort((a, b) => a - b);
    }

    // Get chart data for specific indicators
    getChartData(indicators: string[]): ChartDataPoint[] {
        const years = this.getAvailableYears();

        return years.map(year => {
            const yearData = this.data.years[year.toString()];
            const dataPoint: ChartDataPoint = { year };

            indicators.forEach(indicator => {
                if (yearData?.data[indicator]?.value !== null && yearData?.data[indicator]?.value !== undefined) {
                    const value = parseFloat(yearData.data[indicator].value!.toString());
                    if (!isNaN(value)) {
                        dataPoint[indicator] = value;
                    }
                }
            });

            return dataPoint;
        });
    }

    // Get chart data for specific indicators with year range filtering
    getChartDataWithRange(indicators: string[], startYear?: number, endYear?: number): ChartDataPoint[] {
        const allYears = this.getAvailableYears();
        const years = allYears.filter(year => {
            if (startYear && year < startYear) return false;
            if (endYear && year > endYear) return false;
            return true;
        });

        return years.map(year => {
            const yearData = this.data.years[year.toString()];
            const dataPoint: ChartDataPoint = { year };

            indicators.forEach(indicator => {
                if (yearData?.data[indicator]?.value !== null && yearData?.data[indicator]?.value !== undefined) {
                    const value = parseFloat(yearData.data[indicator].value!.toString());
                    if (!isNaN(value)) {
                        dataPoint[indicator] = value;
                    }
                }

                // Add global average if available
                if (yearData?.data[indicator]?.global_average_value !== null &&
                    yearData?.data[indicator]?.global_average_value !== undefined) {
                    const globalValue = parseFloat(yearData.data[indicator].global_average_value!.toString());
                    if (!isNaN(globalValue)) {
                        dataPoint[`${indicator}_global`] = globalValue;
                    }
                }
            });

            return dataPoint;
        });
    }

    // Get presidency periods with colors
    getPresidencyPeriods(): PresidencyPeriod[] {
        const years = this.getAvailableYears();
        const periods: PresidencyPeriod[] = [];
        let currentPeriod: Partial<PresidencyPeriod> | null = null;

        years.forEach(year => {
            const government = this.data.years[year.toString()]?.government;

            if (government) {
                if (!currentPeriod ||
                    currentPeriod.president !== government.president ||
                    currentPeriod.party !== government.party) {

                    // Close previous period
                    if (currentPeriod) {
                        currentPeriod.endYear = year - 1;
                        periods.push(currentPeriod as PresidencyPeriod);
                    }

                    // Start new period
                    currentPeriod = {
                        president: government.president,
                        presidentNick: presidentNicks[government.president] || government.president.split(' ').slice(-1)[0], // Get last name or nickname
                        party: government.party,
                        startYear: year,
                        color: PARTY_COLORS[government.party as PartyCode] || PARTY_COLORS.default
                    };
                }
            }
        });

        // Close last period
        if (currentPeriod) {
            (currentPeriod as PresidencyPeriod).endYear = years[years.length - 1];
            periods.push(currentPeriod as PresidencyPeriod);
        }

        return periods;
    }

    // Get data title for an indicator
    getIndicatorTitle(indicator: string): string {
        const years = Object.keys(this.data.years);
        for (const year of years) {
            const data = this.data.years[year].data[indicator];
            if (data && data.title) {
                return data.title;
            }
        }
        return indicator;
    }

    // Get all unique sources
    getAllSources(): string[] {
        const sources = new Set<string>();

        // Add data sources
        Object.values(this.data.years).forEach(yearData => {
            Object.values(yearData.data).forEach(dataPoint => {
                if (dataPoint.source) {
                    try {
                        // Try to extract domain and label from the source string
                        const urlMatch = dataPoint.source.match(/https?:\/\/([^/]+)\/.*\(([^)]+)\)/);
                        if (urlMatch) {
                            // urlMatch[1] = domain, urlMatch[2] = label
                            sources.add(`https://${urlMatch[1]} (${urlMatch[2]})`);
                        } else {
                            sources.add(dataPoint.source);
                        }
                    } catch {
                        //sources.add(dataPoint.source);
                    }
                }
            });
        });

        return Array.from(sources).sort();
    }

    // Get government info for a specific year
    getGovernmentInfo(year: number) {
        return this.data.years[year.toString()]?.government;
    }

    // Get main dashboard title from meta data
    getMainTitle(): string {
        const country = this.data.meta?.country?.value || 'Brasil';
        return `Dados do ${country}`;
    }

    // Get main dashboard subtitle/description
    getMainSubtitle(): string {
        return 'Visualização interativa de indicadores econômicos, sociais e ambientais do Brasil';
    }

    // Check if indicator has global average values
    hasGlobalAverage(indicator: string): boolean {
        const years = Object.keys(this.data.years);
        for (const year of years) {
            const data = this.data.years[year].data[indicator];
            if (data && data.global_average_value !== null && data.global_average_value !== undefined) {
                return true;
            }
        }
        return false;
    }
}

export const dataService = new DataService();
