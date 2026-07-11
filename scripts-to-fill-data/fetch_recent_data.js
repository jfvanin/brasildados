#!/usr/bin/env node
/**
 * fetch_recent_data.js
 * Fetches missing 2024/2025 data for Brazil from World Bank, BCB, and HDR APIs.
 *
 * Run:  node fetch_recent_data.js [--dry-run]
 *   --dry-run  prints what would be written without saving
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../web/src/dados_brasil.json');
const DRY_RUN = process.argv.includes('--dry-run');
const YEARS = ['2024', '2025'];

// ─────────────────────────────────────────────────────────────────────────────
// HTTP helpers
// ─────────────────────────────────────────────────────────────────────────────
function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js/brasildados' } }, res => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fetchJSON(url) {
  const text = await fetchText(url);
  return JSON.parse(text);
}

// ─────────────────────────────────────────────────────────────────────────────
// World Bank  (returns { "2024": value, "2025": value })
// ─────────────────────────────────────────────────────────────────────────────
async function fetchWorldBank(indicatorCode) {
  const url = `https://api.worldbank.org/v2/country/BRA/indicator/${indicatorCode}?format=json&date=2020:2025&mrv=6&per_page=20`;
  try {
    const json = await fetchJSON(url);
    const result = {};
    if (!Array.isArray(json) || !json[1]) return result;
    for (const item of json[1]) {
      if (item.value !== null && item.value !== undefined) {
        result[String(item.date)] = item.value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HDR (UNDP)  – composite indices time series CSV
// ─────────────────────────────────────────────────────────────────────────────
async function fetchHDR() {
  // The HDR API endpoint for Brazil composite indices
  const url = 'https://hdr.undp.org/sites/default/files/2025_statistical_annex_tables/HDR25_Composite_indices_complete_time_series.csv';
  console.log('  Fetching HDR data from UNDP...');
  try {
    const csv = await fetchText(url);
    const lines = csv.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const brazilLine = lines.find(l => l.includes(',BRA,') || l.startsWith('Brazil,'));
    if (!brazilLine) return null;

    const values = brazilLine.split(',').map(v => v.replace(/"/g, '').trim());
    const row = {};
    headers.forEach((h, i) => (row[h] = values[i]));
    return row;
  } catch (e) {
    console.log('  HDR CSV not available:', e.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IBGE / IMF inflation
// ─────────────────────────────────────────────────────────────────────────────
async function fetchInflation() {
  const url = 'https://www.imf.org/external/datamapper/api/v1/PCPIEPCH/BRA';
  try {
    const json = await fetchJSON(url);
    return json.values?.PCPIEPCH?.BRA || {};
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Banco Central do Brasil
// ─────────────────────────────────────────────────────────────────────────────
async function fetchBCBSeries(seriesCode) {
  // Returns annual average/last value per year
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesCode}/dados/ultimos/1200?formato=json`;
  try {
    const json = await fetchJSON(url);
    // Group by year, take last value of each year
    const byYear = {};
    for (const item of json) {
      const year = item.data.slice(-4);
      byYear[year] = parseFloat(item.valor.replace(',', '.'));
    }
    return byYear;
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Our World in Data CO2
// ─────────────────────────────────────────────────────────────────────────────
async function fetchOWIDCO2() {
  const url = 'https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv';
  try {
    const csv = await fetchText(url);
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    const countryIdx = headers.indexOf('country');
    const yearIdx = headers.indexOf('year');
    const co2Idx = headers.indexOf('co2');
    const co2PcIdx = headers.indexOf('co2_per_capita');
    const result = {};
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      if (row[countryIdx] === 'Brazil') {
        const yr = row[yearIdx];
        if (YEARS.includes(yr)) {
          result[yr] = {
            co2: row[co2Idx] ? parseFloat(row[co2Idx]) : null,
            co2_per_capita: row[co2PcIdx] ? parseFloat(row[co2PcIdx]) : null,
          };
        }
      }
    }
    return result;
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📥 Fetching recent data for Brazil (2024-2025)...\n');

  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const json = JSON.parse(raw);

  // ── World Bank indicators ────────────────────────────────────────────────
  const wbIndicators = {
    gdp:                { code: 'NY.GDP.MKTP.CD',    title: 'PIB (US$ corrente)',           source: 'https://data.worldbank.org/indicator/NY.GDP.MKTP.CD (Banco Mundial)' },
    gdp_capita:         { code: 'NY.GDP.PCAP.CD',    title: 'PIB per capita (US$ corrente)',source: 'https://data.worldbank.org/indicator/NY.GDP.PCAP.CD (Banco Mundial)' },
    gdp_growth:         { code: 'NY.GDP.MKTP.KD.ZG', title: 'Crescimento do PIB (%)',        source: 'https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG (Banco Mundial)' },
    exports_gdp:        { code: 'NE.EXP.GNFS.ZS',   title: 'Exportações (% do PIB)',        source: 'https://data.worldbank.org/indicator/NE.EXP.GNFS.ZS (Banco Mundial)' },
    imports_gdp:        { code: 'NE.IMP.GNFS.ZS',   title: 'Importações (% do PIB)',        source: 'https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS (Banco Mundial)' },
    population:         { code: 'SP.POP.TOTL',       title: 'População total',               source: 'https://data.worldbank.org/indicator/SP.POP.TOTL (Banco Mundial)' },
    life_expectancy:    { code: 'SP.DYN.LE00.IN',    title: 'Expectativa de vida (anos)',    source: 'https://data.worldbank.org/indicator/SP.DYN.LE00.IN (Banco Mundial)' },
    literacy:           { code: 'SE.ADT.LITR.ZS',    title: 'Taxa de alfabetização (%)',     source: 'https://data.worldbank.org/indicator/SE.ADT.LITR.ZS (Banco Mundial)' },
    gov_edu_expenditure:{ code: 'SE.XPD.TOTL.GD.ZS', title: 'Gasto gov. em educação (% PIB)',source: 'https://data.worldbank.org/indicator/SE.XPD.TOTL.GD.ZS (Banco Mundial)' },
    health_expenditure: { code: 'SH.XPD.CHEX.GD.ZS', title: 'Gastos com saúde (% do PIB)', source: 'https://data.worldbank.org/indicator/SH.XPD.CHEX.GD.ZS (Banco Mundial)' },
    physicians:         { code: 'SH.MED.PHYS.ZS',   title: 'Médicos por 1.000 hab.',        source: 'https://data.worldbank.org/indicator/SH.MED.PHYS.ZS (Banco Mundial)' },
    under5_mortality:   { code: 'SH.DYN.MORT',       title: 'Mortalidade < 5 anos (por 1.000 nascidos vivos)', source: 'https://data.worldbank.org/indicator/SH.DYN.MORT (Banco Mundial)' },
    co2_pc:             { code: 'EN.ATM.CO2E.PC',    title: 'CO2 per capita (toneladas)',    source: 'https://data.worldbank.org/indicator/EN.ATM.CO2E.PC (Banco Mundial)' },
    renewable_energy:   { code: 'EG.FEC.RNEW.ZS',   title: 'Energia renovável (% consumo total)', source: 'https://data.worldbank.org/indicator/EG.FEC.RNEW.ZS (Banco Mundial)' },
    forest_area:        { code: 'AG.LND.FRST.ZS',    title: 'Área florestal (% do território)', source: 'https://data.worldbank.org/indicator/AG.LND.FRST.ZS (Banco Mundial)' },
    unemployment:       { code: 'SL.UEM.TOTL.ZS',   title: 'Desemprego (% da força de trabalho)', source: 'https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS (Banco Mundial)' },
    gini:               { code: 'SI.POV.GINI',       title: 'Coeficiente de Gini',           source: 'https://data.worldbank.org/indicator/SI.POV.GINI (Banco Mundial)' },
    income_share_20:    { code: 'SI.DST.FRST.20',    title: 'Participação na renda - 20% mais pobres (%)', source: 'https://data.worldbank.org/indicator/SI.DST.FRST.20 (Banco Mundial)' },
    poverty_3dollar:    { code: 'SI.POV.DDAY',       title: 'Pobreza extrema (% pop, $3.65/dia)', source: 'https://data.worldbank.org/indicator/SI.POV.DDAY (Banco Mundial)' },
    homicides:          { code: 'VC.IHR.PSRC.P5',   title: 'Homicídios (por 100.000 hab.)', source: 'https://data.worldbank.org (Banco Mundial)' },
  };

  const updates = {}; // updates[year][indicator] = value

  // Fetch all WB indicators in parallel
  console.log('🏦 World Bank indicators...');
  const wbResults = await Promise.all(
    Object.entries(wbIndicators).map(async ([key, { code }]) => {
      process.stdout.write(`  ${key}... `);
      const data = await fetchWorldBank(code);
      const found = YEARS.filter(y => data[y] !== undefined);
      console.log(found.length ? `✓ (${found.join(', ')})` : 'no recent data');
      return { key, data };
    })
  );

  for (const { key, data } of wbResults) {
    for (const year of YEARS) {
      if (data[year] !== undefined) {
        if (!updates[year]) updates[year] = {};
        updates[year][key] = data[year];
      }
    }
  }

  // Inflation (IMF/IBGE)
  console.log('\n📈 Inflation (IMF)...');
  const inflationData = await fetchInflation();
  for (const year of YEARS) {
    if (inflationData[year] !== undefined) {
      if (!updates[year]) updates[year] = {};
      updates[year].inflation = inflationData[year];
    }
  }
  console.log('  inflation:', YEARS.map(y => `${y}: ${updates[y]?.inflation ?? 'n/a'}`).join(', '));

  // CO2 (Our World in Data)
  console.log('\n🌍 CO2 (Our World in Data)...');
  const co2Data = await fetchOWIDCO2();
  for (const year of YEARS) {
    if (co2Data[year]) {
      if (!updates[year]) updates[year] = {};
      if (co2Data[year].co2 !== null) updates[year].co2 = co2Data[year].co2;
      if (co2Data[year].co2_per_capita !== null) updates[year].co2_per_capita = co2Data[year].co2_per_capita;
    }
  }
  console.log('  co2:', YEARS.map(y => `${y}: ${updates[y]?.co2 ?? 'n/a'}`).join(', '));

  // BCB: Selic (series 432), BRL/USD (series 1), Public Debt (series 13762), External Debt (series 3545)
  console.log('\n🏛️  Banco Central do Brasil...');
  const bcbSeries = {
    selic_rate:       { code: 432,   title: 'Taxa Selic (% a.a.)',               source: 'https://api.bcb.gov.br/ (Banco Central do Brasil)' },
    public_debt_gross:{ code: 13762, title: 'Dívida bruta do governo geral (% PIB)', source: 'https://api.bcb.gov.br/ (Banco Central do Brasil)' },
    external_debt:    { code: 3545,  title: 'Dívida externa total (US$ milhões)', source: 'https://api.bcb.gov.br/ (Banco Central do Brasil)' },
    brl_to_usd:       { code: 1,     title: 'Câmbio BRL/USD (média anual)',       source: 'https://api.bcb.gov.br (Banco Central do Brasil)' },
  };

  for (const [key, { code }] of Object.entries(bcbSeries)) {
    process.stdout.write(`  ${key}... `);
    const data = await fetchBCBSeries(code);
    const found = YEARS.filter(y => data[y] !== undefined);
    console.log(found.length ? `✓ (${found.join(', ')})` : 'no recent data');
    for (const year of YEARS) {
      if (data[year] !== undefined) {
        if (!updates[year]) updates[year] = {};
        updates[year][key] = data[year];
      }
    }
  }

  // HDR (UNDP) – check if 2024 data is available
  console.log('\n🎓 HDR / UNDP...');
  const hdrRow = await fetchHDR();
  const hdrIndicators = {
    hdi: 'hdi', eys: 'eys', mys: 'mys', gnipc: 'gnipc', gdi: 'gdi',
    hdi_f: 'hdi_f', eys_f: 'eys_f', mys_f: 'mys_f', gni_pc_f: 'gni_pc_f',
    hdi_m: 'hdi_m', eys_m: 'eys_m', mys_m: 'mys_m', gni_pc_m: 'gni_pc_m',
    ihdi: 'ihdi', coef_ineq: 'coef_ineq', loss: 'loss',
    ineq_le: 'ineq_le', ineq_edu: 'ineq_edu', ineq_inc: 'ineq_inc',
    gii: 'gii', mmr: 'mmr', abr: 'abr',
    se_f: 'se_f', se_m: 'se_m', pr_f: 'pr_f', pr_m: 'pr_m',
    lfpr_f: 'lfpr_f', lfpr_m: 'lfpr_m',
    phdi: 'phdi', diff_hdi_phdi: 'diff_hdi_phdi', mf: 'mf',
  };

  if (hdrRow) {
    // HDR CSV columns are like "hdi_2023", "hdi_2024" etc.
    for (const year of YEARS) {
      for (const [key] of Object.entries(hdrIndicators)) {
        const colName = `${key}_${year}`;
        if (hdrRow[colName] !== undefined && hdrRow[colName] !== '') {
          if (!updates[year]) updates[year] = {};
          const num = parseFloat(hdrRow[colName]);
          updates[year][key] = isNaN(num) ? hdrRow[colName] : num;
        }
      }
    }
    const hdrFound = YEARS.flatMap(y =>
      Object.keys(updates[y] || {}).filter(k => hdrIndicators[k])
        .map(k => `${k}(${y})`)
    );
    console.log(hdrFound.length ? `  ✓ Found: ${hdrFound.join(', ')}` : '  No HDR data available for 2024/2025 yet');
  } else {
    console.log('  HDR CSV could not be fetched');
  }

  // ── Apply updates to JSON ────────────────────────────────────────────────
  console.log('\n📝 Applying updates...\n');

  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const year of YEARS) {
    if (!updates[year]) {
      console.log(`  ${year}: no new data found`);
      continue;
    }
    const yearData = json.years[year];
    if (!yearData) {
      console.log(`  ${year}: year not found in JSON, skipping`);
      continue;
    }

    let yearUpdated = 0;
    let yearSkipped = 0;

    for (const [key, value] of Object.entries(updates[year])) {
      const existing = yearData.data[key];

      // Only update if currently null/missing, or if value has changed
      if (existing && existing.value !== null && existing.value !== undefined) {
        yearSkipped++;
        continue;
      }

      // Get title/source from indicator maps or existing data
      const wbMeta = wbIndicators[key];
      const bcbMeta = bcbSeries[key];
      const title = wbMeta?.title || bcbMeta?.title || existing?.title || key;
      const source = wbMeta?.source || bcbMeta?.source || existing?.source || '';

      yearData.data[key] = {
        ...(existing || {}),
        value: typeof value === 'number' ? parseFloat(value.toFixed(6)) : value,
        title,
        source,
      };
      yearUpdated++;
    }

    totalUpdated += yearUpdated;
    totalSkipped += yearSkipped;
    console.log(`  ${year}: ${yearUpdated} indicators updated, ${yearSkipped} already had values`);
  }

  console.log(`\n  Total: ${totalUpdated} updated, ${totalSkipped} already filled`);

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN – nothing saved. Remove --dry-run to save.');
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify(json, null, 2), 'utf-8');
    console.log(`\n✅ Saved to ${DATA_FILE}`);
  }

  // ── Summary: what's still missing ────────────────────────────────────────
  console.log('\n📋 STILL MISSING (manual lookup needed):');
  for (const year of YEARS) {
    const yearData = json.years[year]?.data || {};
    const allKeys = Object.keys(yearData);
    const stillNull = allKeys.filter(k => {
      const v = yearData[k]?.value;
      return v === null || v === undefined;
    });
    if (stillNull.length) {
      console.log(`\n  ${year} (${stillNull.length} missing):`);
      stillNull.forEach(k => {
        const src = yearData[k]?.source || '?';
        console.log(`    • ${k}  →  ${src}`);
      });
    } else {
      console.log(`\n  ${year}: all filled! 🎉`);
    }
  }

  console.log('\n📌 NOTES:');
  console.log('  • HDR/UNDP indicators (hdi, gii, ihdi, etc.) for 2024 will be in the');
  console.log('    HDR 2026 report, expected release: ~Nov/Dec 2026.');
  console.log('    Check: https://hdr.undp.org/data-center/documentation-and-downloads');
  console.log('  • World Bank indicators marked with 2-year lag (literacy, gini,');
  console.log('    physicians, forest_area, gov_edu_expenditure) may show 2022-2023 as');
  console.log('    the most recent available.');
  console.log('  • For INPE fire/deforestation data: https://terrabrasilis.dpi.inpe.br');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
