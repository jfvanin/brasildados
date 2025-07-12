export interface DataPoint {
    value: string | number | null;
    title: string;
    source: string;
}

export interface GovernmentInfo {
    president: string;
    party: string;
}

export interface YearData {
    data: Record<string, DataPoint>;
    government: GovernmentInfo;
}

export interface BrazilData {
    meta: Record<string, DataPoint>;
    years: Record<string, YearData>;
}

export interface ChartDataPoint {
    year: number;
    [key: string]: number | string;
}

export interface ToggleOption {
    key: string;
    title: string;
    enabled: boolean;
    color: string;
    hidden?: boolean; // Optional property to hide the toggle
    isGroup?: boolean; // Indicates if this toggle is umbrella of toggle group
}

export interface ChartConfig {
    title: string;
    type: 'multiple' | 'exclusive';
    toggles: ToggleOption[];
    dataKeys: string[];
    groups?: Record<string, string[] | undefined>; // For exclusive toggles, group keys to toggle
}

export interface PresidencyPeriod {
    president: string;
    presidentNick: string; // Nickname or last name of the president
    party: string;
    startYear: number;
    endYear: number;
    color: string;
}

export interface YearRange {
    startYear: number;
    endYear: number;
}

export interface DraggableTimelineProps {
    periods: PresidencyPeriod[];
    startYear: number;
    endYear: number;
    selectedRange: YearRange;
    onRangeChange: (range: YearRange) => void;
}

// Party color mapping
export const PARTY_COLORS = {
    'PRN': '#68BA7F', // Green
    'PMDB': '#FFDE21', // Light Green
    'PSDB': '#FFEA99', // Yellow
    'PT': '#43A047', // Dark Green
    'PT - PMDB': '#82A903', // Dark Green
    'MDB': '#FFDE21', // Light Green (same as PMDB)
    'PSL/PL': '#E0BC00', // Bright Yellow
    'PL': '#E0BC00', // Bright Yellow
    'default': '#4CAF50' // Default green
} as const;

export const presidentNicks: Record<string, string> = {
    'Fernando Henrique Cardoso': 'FHC',
    'Luiz Inácio Lula da Silva': 'Lula',
    'Dilma Rousseff': 'Dilma',
    'Dilma Rousseff - Michel Temer': 'D-T', // Transition year
    'Michel Temer': 'Temer',
    'Jair Messias Bolsonaro': 'Bolsonaro',
    'Itamar Franco': 'Itamar',
    'Fernando Collor de Mello': 'Collor',
};

export type PartyCode = keyof typeof PARTY_COLORS;
