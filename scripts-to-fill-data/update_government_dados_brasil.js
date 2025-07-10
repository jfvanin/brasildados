const fs = require('fs');

const governmentByYear = {
  '1990': { president: 'Fernando Collor de Mello', party: 'PRN' },
  '1991': { president: 'Fernando Collor de Mello', party: 'PRN' },
  '1992': { president: 'Fernando Collor de Mello', party: 'PRN' },
  '1993': { president: 'Itamar Franco', party: 'PMDB' },
  '1994': { president: 'Itamar Franco', party: 'PMDB' },
  '1995': { president: 'Fernando Henrique Cardoso', party: 'PSDB' },
  '1996': { president: 'Fernando Henrique Cardoso', party: 'PSDB' },
  '1997': { president: 'Fernando Henrique Cardoso', party: 'PSDB' },
  '1998': { president: 'Fernando Henrique Cardoso', party: 'PSDB' },
  '1999': { president: 'Fernando Henrique Cardoso', party: 'PSDB' },
  '2000': { president: 'Fernando Henrique Cardoso', party: 'PSDB' },
  '2001': { president: 'Fernando Henrique Cardoso', party: 'PSDB' },
  '2002': { president: 'Fernando Henrique Cardoso', party: 'PSDB' },
  '2003': { president: 'Luis Inácio Lula da Silva', party: 'PT' },
  '2004': { president: 'Luis Inácio Lula da Silva', party: 'PT' },
  '2005': { president: 'Luis Inácio Lula da Silva', party: 'PT' },
  '2006': { president: 'Luis Inácio Lula da Silva', party: 'PT' },
  '2007': { president: 'Luis Inácio Lula da Silva', party: 'PT' },
  '2008': { president: 'Luis Inácio Lula da Silva', party: 'PT' },
  '2009': { president: 'Luis Inácio Lula da Silva', party: 'PT' },
  '2010': { president: 'Luis Inácio Lula da Silva', party: 'PT' },
  '2011': { president: 'Dilma Rouseff', party: 'PT' },
  '2012': { president: 'Dilma Rouseff', party: 'PT' },
  '2013': { president: 'Dilma Rouseff', party: 'PT' },
  '2014': { president: 'Dilma Rouseff', party: 'PT' },
  '2015': { president: 'Dilma Rouseff', party: 'PT' },
  '2016': { president: 'Dilma Rouseff - Michel Temer', party: 'PT - PMDB' },
  '2017': { president: 'Michel Temer', party: 'PMDB' },
  '2018': { president: 'Michel Temer', party: 'PMDB' },
  '2019': { president: 'Jair Messias Bolsonaro', party: 'PSL/PL' },
  '2020': { president: 'Jair Messias Bolsonaro', party: 'PSL/PL' },
  '2021': { president: 'Jair Messias Bolsonaro', party: 'PSL/PL' },
  '2022': { president: 'Jair Messias Bolsonaro', party: 'PSL/PL' },
  '2023': { president: 'Luis Inácio Lula da Silva', party: 'PT' },
  '2024': { president: 'Luis Inácio Lula da Silva', party: 'PT' },
};

const data = JSON.parse(fs.readFileSync('./web/dados_brasil.json', 'utf-8'));
for (const year in data.years) {
  if (governmentByYear[year]) {
    data.years[year].government = governmentByYear[year];
  }
}
fs.writeFileSync('./web/dados_brasil.json', JSON.stringify(data, null, 2), 'utf-8');
console.log('Government info updated in ./web/dados_brasil.json'); 