#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Dados reais de desmatamento da Amazônia Legal do INPE
const amazonDeforestationData = {
  "1990": { "value": "13730", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "1991": { "value": "11030", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "1992": { "value": "13786", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "1993": { "value": "14896", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "1994": { "value": "14896", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "1995": { "value": "29059", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "1996": { "value": "18161", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "1997": { "value": "13227", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "1998": { "value": "17383", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "1999": { "value": "17259", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2000": { "value": "18226", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2001": { "value": "18165", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2002": { "value": "21650", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2003": { "value": "25396", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2004": { "value": "27772", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2005": { "value": "19014", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2006": { "value": "14286", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2007": { "value": "11651", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2008": { "value": "12911", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2009": { "value": "7464", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2010": { "value": "7000", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2011": { "value": "6418", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2012": { "value": "4571", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2013": { "value": "5891", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2014": { "value": "5012", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2015": { "value": "6207", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2016": { "value": "7893", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2017": { "value": "6947", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2018": { "value": "7536", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2019": { "value": "10129", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2020": { "value": "10851", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2021": { "value": "13038", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2022": { "value": "11594", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2023": { "value": "9064", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" },
  "2024": { "value": "6288", "title": "Desmatamento na Amazônia Legal (km²)", "source": "https://terrabrasilis.dpi.inpe.br (INPE)" }
};

console.log('🌳 Adicionando dados reais de desmatamento da Amazônia do INPE...\n');

// Função para integrar dados ao dados_brasil.json
function integrateDeforestationData() {
  const filePath = path.join(__dirname, 'src', 'dados_brasil.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let totalAdded = 0;
  
  // Para cada ano no dataset principal
  for (const [year, yearData] of Object.entries(data.years)) {
    if (yearData.data && amazonDeforestationData[year]) {
      yearData.data.amazon_deforestation = amazonDeforestationData[year];
      totalAdded++;
      console.log(`✅ Ano ${year}: ${amazonDeforestationData[year].value} km² adicionado`);
    }
  }
  
  // Salvar arquivo atualizado
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  
  return totalAdded;
}

// Executar script
try {
  const totalAdded = integrateDeforestationData();
  
  console.log('\n🎉 Concluído!');
  console.log(`📊 Total de anos com dados de desmatamento adicionados: ${totalAdded}`);
  console.log('🌳 Dados oficiais do INPE foram integrados ao dataset!');
  console.log('\n📋 Indicador adicionado:');
  console.log('  • amazon_deforestation: Desmatamento na Amazônia Legal (km²) - INPE');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}
