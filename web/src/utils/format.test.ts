import { formatValueBR, getUnitFromTitle, formatWithUnit } from './format';

describe('formatValueBR', () => {
    it('formats small values with up to 2 decimals in pt-BR', () => {
        expect(formatValueBR(13.75)).toBe('13,75');
        expect(formatValueBR(0.699)).toBe('0,7');
    });

    it('formats values >= 100 with at most 1 decimal', () => {
        expect(formatValueBR(213.5)).toBe('213,5');
    });

    it('uses compact suffixes for large magnitudes', () => {
        expect(formatValueBR(1500)).toBe('1,5 mil');
        expect(formatValueBR(2500000)).toBe('2,5 mi');
        expect(formatValueBR(242900000000)).toBe('243 bi');
        expect(formatValueBR(1200000000000)).toBe('1,2 tri');
    });

    it('handles negative values', () => {
        expect(formatValueBR(-3200000)).toBe('-3,2 mi');
    });

    it('handles zero', () => {
        expect(formatValueBR(0)).toBe('0');
    });
});

describe('getUnitFromTitle', () => {
    it('detects percentage units', () => {
        expect(getUnitFromTitle('Taxa Básica de Juros (Selic) (%)').suffix).toBe('%');
        expect(getUnitFromTitle('Dívida Bruta do Governo Geral (% PIB)').suffix).toBe('%');
        expect(getUnitFromTitle('Consumo de energia renovável (% do total final)').suffix).toBe('%');
    });

    it('detects US$ prefix', () => {
        expect(getUnitFromTitle('Dívida Externa Total (US$)').prefix).toBe('US$ ');
    });

    it('detects PPP $ prefix', () => {
        expect(getUnitFromTitle('Renda Nacional Bruta per capita (PPP $)').prefix).toBe('$ ');
    });

    it('returns empty units for plain titles', () => {
        expect(getUnitFromTitle('Índice de Desenvolvimento Humano (IDH)')).toEqual({ prefix: '', suffix: '' });
    });
});

describe('formatWithUnit', () => {
    it('combines value and unit', () => {
        expect(formatWithUnit(13.75, 'Selic (%)')).toBe('13,75%');
        expect(formatWithUnit(242900000000, 'Dívida Externa Total (US$)')).toBe('US$ 243 bi');
    });
});
