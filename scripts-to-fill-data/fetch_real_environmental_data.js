#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🌍 Buscando dados de CO2 reais do Our World in Data...\n');

// Função para fazer requisição HTTPS
function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          // Para CSV, retornamos o texto bruto
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Função para processar dados CSV do Our World in Data
async function fetchCO2Data() {
  console.log('📊 Baixando dados de CO2 do Our World in Data...');
  
  try {
    const csvUrl = 'https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv';
    const csvData = await fetchData(csvUrl);
    
    // Parse CSV para encontrar dados do Brasil
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    // Encontrar índices das colunas que queremos
    const countryIndex = headers.indexOf('country');
    const yearIndex = headers.indexOf('year');
    const co2PerCapitaIndex = headers.indexOf('co2_per_capita');
    const co2Index = headers.indexOf('co2');
    
    const brazilData = {};
    
    // Processar dados linha por linha
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      
      if (row[countryIndex] === 'Brazil' && row[yearIndex] && row[co2PerCapitaIndex]) {
        const year = row[yearIndex];
        const co2PerCapita = parseFloat(row[co2PerCapitaIndex]);
        
        if (!isNaN(co2PerCapita) && year >= 1990) {
          brazilData[year] = {
            value: co2PerCapita.toFixed(2),
            title: 'Emissões de CO2 per capita (toneladas)',
            source: 'Our World in Data - Global Carbon Atlas'
          };
        }
      }
    }
    
    console.log(`✅ ${Object.keys(brazilData).length} anos de dados de CO2 obtidos`);
    return { 'co2_per_capita': brazilData };
    
  } catch (error) {
    console.log(`❌ Erro ao buscar dados de CO2:`, error.message);
    return {};
  }
}

// Função para integrar ao dados_brasil.json
function integrateData(environmentalData) {
  const filePath = path.join(__dirname, 'src', 'dados_brasil.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let totalAdded = 0;
  
  // Para cada ano no dataset principal
  for (const [year, yearData] of Object.entries(data.years)) {
    if (yearData.data) {
      // Para cada indicador ambiental
      for (const [indicator, indicatorData] of Object.entries(environmentalData)) {
        if (indicatorData[year]) {
          yearData.data[indicator] = indicatorData[year];
          totalAdded++;
        }
      }
    }
  }
  
  // Salvar arquivo atualizado
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  
  return totalAdded;
}

// Executar script
(async () => {
  try {
    const environmentalData = await fetchCO2Data();
    
    console.log('\n🔄 Integrando dados ao arquivo principal...');
    const totalAdded = integrateData(environmentalData);
    
    console.log('\n🎉 Concluído!');
    console.log(`📊 Total de pontos de dados adicionados: ${totalAdded}`);
    console.log('✨ Dados de CO2 per capita reais foram integrados ao seu dataset!');
    
    console.log('\n📋 Indicador adicionado:');
    console.log('  • co2_per_capita: Emissões de CO2 per capita (toneladas) - Our World in Data');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
})();
