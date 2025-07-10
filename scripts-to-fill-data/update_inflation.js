const fs = require('fs');
const path = require('path');

const API_URL = 'https://www.imf.org/external/datamapper/api/v1/PCPIEPCH/BRA';
const DATA_FILE = path.join(__dirname, 'web/src/dados_brasil.json');
const INDEX_TITLE = 'Inflação - IPCA (variação anual %)';
const SOURCE = 'https://www.ibge.gov.br (IBGE)';

async function fetchInflationData() {
  if (typeof fetch !== 'function') {
    console.error('fetch is not available. Please use Node.js 18+ or install node-fetch.');
    process.exit(1);
  }
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch inflation data: ' + res.statusText);
  const json = await res.json();
  return json.values.PCPIEPCH.BRA;
}

function updateInflationInJson(inflationData) {
  const file = fs.readFileSync(DATA_FILE, 'utf-8');
  const json = JSON.parse(file);
  if (!json.years) {
    console.error('No "years" object found in dados_brasil.json');
    process.exit(1);
  }
  for (let year = 1990; year <= 2024; year++) {
    const y = String(year);
    if (json.years[y] && json.years[y].data) {
      json.years[y].data.inflation = {
        value: inflationData[y],
        title: INDEX_TITLE,
        source: SOURCE
      };
    }
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(json, null, 2), 'utf-8');
  console.log('Inflation data updated for years 1990-2024 in', DATA_FILE);
}

(async () => {
  try {
    const inflationData = await fetchInflationData();
    updateInflationInJson(inflationData);
  } catch (err) {
    console.error('Error updating inflation data:', err);
  }
})(); 