import * as fs from 'fs';
import * as csv from 'csv-parse/sync';
import axios from 'axios';

// Mapping from column prefixes to Portuguese titles
const prefixTitleMap: Record<string, string> = {
    // Metadata
    iso3: 'Código ISO Alpha-3',
    country: 'País',
    hdicode: 'Classificação do IDH',
    region: 'Região geográfica',
    hdi_rank_2023: 'Ranking do IDH em 2023',
    // Core HDI
    hdi_: 'Índice de Desenvolvimento Humano (IDH)',
    eys_: 'Anos esperados de escolaridade',
    mys_: 'Média de anos de escolaridade',
    gnipc_: 'Renda Nacional Bruta per capita (PPP $)',
    // Gender disaggregated
    hdi_f_: 'IDH (feminino)',
    hdi_m_: 'IDH (masculino)',
    eys_f_: 'Anos esperados de escolaridade (feminino)',
    eys_m_: 'Anos esperados de escolaridade (masculino)',
    mys_f_: 'Média de anos de escolaridade (feminino)',
    mys_m_: 'Média de anos de escolaridade (masculino)',
    gni_pc_f_: 'Renda Nacional Bruta per capita (feminino, PPP $)',
    gni_pc_m_: 'Renda Nacional Bruta per capita (masculino, PPP $)',
    // GDI
    gdi_: 'Índice de Desenvolvimento de Gênero (IDG)',
    gdi_group_2023: 'Grupo do IDG em 2023',
    // IHDI & Inequality
    ihdi_: 'IDH ajustado à desigualdade (IHDI)',
    coef_ineq_: 'Coeficiente de desigualdade humana (%)',
    loss_: 'Perda no IDH devido à desigualdade (%)',
    ineq_le_: 'Desigualdade na expectativa de vida (%)',
    ineq_edu_: 'Desigualdade na educação (%)',
    ineq_inc_: 'Desigualdade na renda (%)',
    // GII
    gii_: 'Índice de Desigualdade de Gênero (IDG)',
    gii_rank_2023: 'Ranking do IDG em 2023',
    // Maternal & Reproductive
    mmr_: 'Razão de mortalidade materna (por 100 mil)',
    abr_: 'Taxa de natalidade na adolescência (por 1.000)',
    // Education Participation
    se_f_: '% de mulheres no ensino secundário',
    se_m_: '% de homens no ensino secundário',
    // Parliament Representation
    pr_f_: '% de cadeiras parlamentares ocupadas por mulheres',
    pr_m_: '% de cadeiras parlamentares ocupadas por homens',
    // Labor Force
    lfpr_f_: '% de participação feminina na força de trabalho',
    lfpr_m_: '% de participação masculina na força de trabalho',
    // PHDI
    phdi_: 'IDH ajustado a pressões planetárias (PHDI)',
    rankdiff_hdi_phdi_2023: 'Diferença de ranking entre IDH e PHDI em 2023',
    diff_hdi_phdi_: 'Diferença entre IDH e PHDI',
    // Environmental
    mf_: 'Pegada material per capita (toneladas)',
    // GDP (removed le_, pop_total_, co2_prod_)
    gdp: 'Produto Interno Bruto (PIB)',
    gdp_capita: 'PIB per capita',
    gdp_growth: 'Crescimento do PIB (%)',
    inflation: 'Inflação, preços ao consumidor (variação anual %)',
    exports_gdp: 'Exportações de bens e serviços (% do PIB)',
    imports_gdp: 'Importações de bens e serviços (% do PIB)',
    population: 'População total',
    life_expectancy: 'Expectativa de vida ao nascer',
    literacy: 'Taxa de alfabetização (% adultos)',
    gov_edu_expenditure: 'Gasto do governo em educação (% do PIB)',
    health_expenditure: 'Gasto em saúde (% do PIB)',
    physicians: 'Médicos por 1.000 habitantes',
    under5_mortality: 'Taxa de mortalidade até 5 anos (por 1.000 nascidos vivos)',
    co2_pc: 'Emissões de CO₂ (toneladas métricas per capita)',
    renewable_energy: 'Consumo de energia renovável (% do total final)',
    forest_area: 'Área florestal (% da terra)',
    unemployment: 'Taxa de desemprego (% da força de trabalho)',
    gini: 'Índice de Gini',
    income_share_20: 'Participação da renda dos 20% mais pobres',
    poverty_3dollar: 'Pobreza - população vivendo com menos de $3,20/dia (PPP 2011) (%)',
};

// Mapping from column prefixes to data source
const prefixSourceMap: Record<string, string> = Object.fromEntries(
    Object.keys(prefixTitleMap).map((key) => [key, 'https://hdr.undp.org/ (Human Development Report)'])
);
// Add World Bank sources for new indexes
prefixSourceMap['gdp'] = 'https://data.worldbank.org/indicator/NY.GDP.MKTP.CD (World Bank)';
prefixSourceMap['gdp_capita'] = 'https://data.worldbank.org/indicator/NY.GDP.PCAP.CD (World Bank)';
prefixSourceMap['gdp_growth'] = 'https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG (World Bank)';
prefixSourceMap['inflation'] = 'https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG (World Bank)';
prefixSourceMap['exports_gdp'] = 'https://data.worldbank.org/indicator/NE.EXP.GNFS.ZS (World Bank)';
prefixSourceMap['imports_gdp'] = 'https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS (World Bank)';
prefixSourceMap['population'] = 'https://data.worldbank.org/indicator/SP.POP.TOTL (World Bank)';
prefixSourceMap['life_expectancy'] = 'https://data.worldbank.org/indicator/SP.DYN.LE00.IN (World Bank)';
prefixSourceMap['literacy'] = 'https://data.worldbank.org/indicator/SE.ADT.LITR.ZS (World Bank)';
prefixSourceMap['gov_edu_expenditure'] = 'https://data.worldbank.org/indicator/SE.XPD.TOTL.GD.ZS (World Bank)';
prefixSourceMap['health_expenditure'] = 'https://data.worldbank.org/indicator/SH.XPD.CHEX.GD.ZS (World Bank)';
prefixSourceMap['physicians'] = 'https://data.worldbank.org/indicator/SH.MED.PHYS.ZS (World Bank)';
prefixSourceMap['under5_mortality'] = 'https://data.worldbank.org/indicator/SH.DYN.MORT (World Bank)';
prefixSourceMap['co2_pc'] = 'https://data.worldbank.org/indicator/EN.ATM.CO2E.PC (World Bank)';
prefixSourceMap['renewable_energy'] = 'https://data.worldbank.org/indicator/EG.FEC.RNEW.ZS (World Bank)';
prefixSourceMap['forest_area'] = 'https://data.worldbank.org/indicator/AG.LND.FRST.ZS (World Bank)';
prefixSourceMap['unemployment'] = 'https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS (World Bank)';
prefixSourceMap['gini'] = 'https://data.worldbank.org/indicator/SI.POV.GINI (World Bank)';
prefixSourceMap['income_share_20'] = 'https://data.worldbank.org/indicator/SI.DST.FRST.20 (World Bank)';
prefixSourceMap['poverty_3dollar'] = 'https://data.worldbank.org/indicator/SI.POV.DDAY (World Bank)';

// Helper to get the Portuguese title for a column
function getTitle(col: string): string {
    if (prefixTitleMap[col]) return prefixTitleMap[col];
    for (const prefix in prefixTitleMap) {
        if (prefix.endsWith('_') && col.startsWith(prefix)) {
            return prefixTitleMap[prefix];
        }
    }
    return col;
}

// Helper to get the source for a column
function getSource(col: string): string {
    if (prefixSourceMap[col]) return prefixSourceMap[col];
    for (const prefix in prefixSourceMap) {
        if (prefix.endsWith('_') && col.startsWith(prefix)) {
            return prefixSourceMap[prefix];
        }
    }
    return '';
}

const file = fs.readFileSync('data/HDR25_Composite_indices_complete_time_series.csv', 'utf-8');
const records = csv.parse(file, { columns: true });

const brazilRow = records.find((row: any) => row.country === 'Brazil' || row.iso3 === 'BRA');

const brazilDataByYear: Record<string, any> = {};
const meta: Record<string, any> = {};

// List of indicators to EXCLUDE from CSV because they are now sourced from the API
const apiIndicatorsToWbCode: Record<string, string> = {
    gdp: 'NY.GDP.MKTP.CD',
    gdp_capita: 'NY.GDP.PCAP.CD',
    gdp_growth: 'NY.GDP.MKTP.KD.ZG',
    inflation: 'FP.CPI.TOTL.ZG',
    exports_gdp: 'NE.EXP.GNFS.ZS',
    imports_gdp: 'NE.IMP.GNFS.ZS',
    population: 'SP.POP.TOTL', // Only from World Bank
    life_expectancy: 'SP.DYN.LE00.IN', // Only from World Bank
    literacy: 'SE.ADT.LITR.ZS',
    gov_edu_expenditure: 'SE.XPD.TOTL.GD.ZS',
    health_expenditure: 'SH.XPD.CHEX.GD.ZS',
    physicians: 'SH.MED.PHYS.ZS',
    under5_mortality: 'SH.DYN.MORT',
    co2_pc: 'EN.ATM.CO2E.PC', // Only from World Bank
    renewable_energy: 'EG.FEC.RNEW.ZS',
    forest_area: 'AG.LND.FRST.ZS',
    unemployment: 'SL.UEM.TOTL.ZS',
    gini: 'SI.POV.GINI',
    income_share_20: 'SI.DST.FRST.20',
    poverty_3dollar: 'SI.POV.DDAY',
};

// List of CSV columns to always exclude (repeated indicators)
const csvExcludePrefixes = ['pop_total', 'le', 'le_f', 'le_m', 'co2_prod'];

Object.entries(brazilRow).forEach(([col, value]) => {
    // Remove from CSV if it's an API indicator or a repeated indicator
    const match = col.match(/(.+)_([0-9]{4})$/);
    if (
        (match && Object.keys(apiIndicatorsToWbCode).includes(match[1])) ||
        (match && csvExcludePrefixes.includes(match[1]))
    ) return;
    if (!col.match(/_\d{4}$/)) {
        meta[col] = { value, title: getTitle(col), source: getSource(col) };
        return;
    }
    if (!match) return;
    const [_, prefix, year] = match;
    if (!brazilDataByYear[year]) brazilDataByYear[year] = { data: {}, government: { party: '', president: '' } };
    const indicator = prefix;
    brazilDataByYear[year].data[indicator] = { value, title: getTitle(prefix + '_'), source: getSource(prefix + '_') };
});

// World Bank API integration for all indicators
const countryCode = 'BRA';
const startYear = 1990;
const endYear = 2024;

const buildUrl = (indicator: string) =>
    `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json&date=${startYear}:${endYear}&per_page=100`;

async function fetchIndicator(indicator: string): Promise<Record<number, number>> {
    const url = buildUrl(indicator);
    const response = await axios.get(url);
    const data = response.data[1];
    const yearValueMap: Record<number, number> = {};
    if (Array.isArray(data)) {
        data.forEach((entry: any) => {
            if (entry.value !== null) {
                yearValueMap[parseInt(entry.date)] = entry.value;
            }
        });
    }
    return yearValueMap;
}

async function integrateApiIndicators() {
    const indicatorKeys = Object.keys(apiIndicatorsToWbCode) as string[];
    const fetches = await Promise.all(
        indicatorKeys.map(key => fetchIndicator(apiIndicatorsToWbCode[key]))
    );
    for (let year = startYear; year <= endYear; year++) {
        const yearStr = year.toString();
        if (!brazilDataByYear[yearStr]) brazilDataByYear[yearStr] = { data: {}, government: { party: '', president: '' } };
        indicatorKeys.forEach((key, idx) => {
            brazilDataByYear[yearStr].data[key] = {
                value: fetches[idx][year] ?? null,
                title: getTitle(key),
                source: getSource(key),
            };
        });
    }
}

// Remove indicators that are null for all years
afterApiIntegrationCleanup();

function afterApiIntegrationCleanup() {
    // Collect all indicator keys
    const allIndicators = new Set<string>();
    for (const year of Object.keys(brazilDataByYear)) {
        for (const key of Object.keys(brazilDataByYear[year].data)) {
            allIndicators.add(key);
        }
    }
    // For each indicator, check if it is null for all years
    for (const indicator of allIndicators) {
        let allNull = true;
        for (const year of Object.keys(brazilDataByYear)) {
            const val = brazilDataByYear[year].data[indicator]?.value;
            if (val !== null && val !== "" && val !== undefined) {
                allNull = false;
                break;
            }
        }
        // If all years are null, remove this indicator from all years
        if (allNull) {
            for (const year of Object.keys(brazilDataByYear)) {
                delete brazilDataByYear[year].data[indicator];
            }
        }
    }
}

async function main() {
    await integrateApiIndicators();
    const finalObj = { meta, years: brazilDataByYear };
    fs.writeFileSync('dados_brasil.json', JSON.stringify(finalObj, null, 2), 'utf-8');
    console.log('Arquivo dados_brasil.json gerado com sucesso!');
}

main().catch(err => console.error('Error:', err));