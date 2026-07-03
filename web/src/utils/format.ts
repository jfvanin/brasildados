// Number formatting helpers (pt-BR locale, compact notation for large values)

const compactUnits: Array<{ threshold: number; divisor: number; suffix: string }> = [
    { threshold: 1e12, divisor: 1e12, suffix: ' tri' },
    { threshold: 1e9, divisor: 1e9, suffix: ' bi' },
    { threshold: 1e6, divisor: 1e6, suffix: ' mi' },
    { threshold: 1e3, divisor: 1e3, suffix: ' mil' },
];

// Formats a number in pt-BR, using compact suffixes (mil, mi, bi, tri) for large magnitudes
export const formatValueBR = (value: number): string => {
    if (!isFinite(value)) return String(value);

    const abs = Math.abs(value);
    for (const { threshold, divisor, suffix } of compactUnits) {
        if (abs >= threshold) {
            const scaled = value / divisor;
            return scaled.toLocaleString('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: Math.abs(scaled) >= 100 ? 0 : 1,
            }) + suffix;
        }
    }

    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: abs >= 100 ? 1 : 2,
    });
};

// Derives the display unit from an indicator title, e.g. "Taxa Selic (%)" -> "%"
export const getUnitFromTitle = (title: string): { prefix: string; suffix: string } => {
    if (/\(%[^)]*\)|\(em %\)/.test(title) || /\(.*% .*\)/.test(title)) return { prefix: '', suffix: '%' };
    if (/\(US\$\)|\(em US\$\)/.test(title)) return { prefix: 'US$ ', suffix: '' };
    if (/PPP \$/.test(title)) return { prefix: '$ ', suffix: '' };
    if (/\(km²\)/.test(title)) return { prefix: '', suffix: ' km²' };
    return { prefix: '', suffix: '' };
};

// Full formatted value with unit for tooltips: formatWithUnit(1234567890, 'Dívida (US$)') -> "US$ 1,2 bi"
export const formatWithUnit = (value: number, title: string): string => {
    const { prefix, suffix } = getUnitFromTitle(title);
    return `${prefix}${formatValueBR(value)}${suffix}`;
};

// Y-axis tick formatter (shorter: no unit, compact)
export const formatAxisTick = (value: number): string => formatValueBR(value);
