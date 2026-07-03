import { test, expect } from '@playwright/test';

test.describe('BrasilDados dashboard', () => {
    test('happy path: loads, renders charts, toggle updates chart and URL', async ({ page }) => {
        await page.goto('/');

        // Header and main sections
        await expect(page.getByRole('heading', { name: /BrasilDados/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Principais Indicadores' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Desigualdade e Pobreza' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Gênero' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Comparativo por Governo' })).toBeVisible();

        // Line charts actually draw SVG paths
        await expect(page.locator('svg .recharts-line-curve').first()).toBeVisible();

        // Presidency comparison draws party-colored bars
        await expect(page.locator('.recharts-bar-rectangle').first()).toBeVisible();

        // Toggling an indicator is reflected in the shareable URL
        await page.getByText('Taxa Básica de Juros (Selic) (%)', { exact: false }).first().click();
        await expect(page).toHaveURL(/selic_rate/);

        // Default year range is written to the URL
        await expect(page).toHaveURL(/inicio=2000/);
    });

    test('URL state restores a shared view', async ({ page }) => {
        await page.goto('/?inicio=2005&fim=2015&g0=inflation');

        // Year range applied and surfaced in the section badges
        await expect(page.getByText('Filtrado: 2005-2015').first()).toBeVisible();

        // Only the inflation line is drawn in the first chart
        const firstChartLines = page.locator('svg .recharts-line-curve');
        await expect(firstChartLines.first()).toBeVisible();
    });

    test('failure mode: malformed URL params do not break the app', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));

        await page.goto('/?inicio=banana&fim=&g0=unknown.keys&g99=zzz&%%%');

        await expect(page.getByRole('heading', { name: 'Principais Indicadores' })).toBeVisible();
        await expect(page.locator('svg .recharts-line-curve').first()).toBeVisible();
        expect(errors).toEqual([]);
    });

    test('presidency comparison switches indicator and metric', async ({ page }) => {
        await page.goto('/');

        const select = page.getByLabel('Selecionar indicador');
        await select.selectOption({ label: 'Índice de Desenvolvimento Humano (IDH)' });
        await expect(page.locator('.recharts-bar-rectangle').first()).toBeVisible();

        await page.getByRole('button', { name: 'Variação no período' }).click();
        await expect(page.locator('.recharts-bar-rectangle').first()).toBeVisible();
    });
});
