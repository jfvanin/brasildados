const fs = require('fs');
const https = require('https');

// Function to make HTTP requests
function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error(`Failed to parse JSON: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Function to format date for API (DD/MM/YYYY)
function formatDate(year, month, day) {
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
}

// Function to get the last value of each year from API data
function getYearEndValues(apiData) {
    const yearlyData = {};
    
    apiData.forEach(item => {
        const [day, month, year] = item.data.split('/');
        const yearNum = parseInt(year);
        const value = parseFloat(item.valor);
        
        if (!isNaN(value)) {
            // Keep only the last (most recent) value for each year
            if (!yearlyData[yearNum] || new Date(year, month - 1, day) > yearlyData[yearNum].date) {
                yearlyData[yearNum] = {
                    value: value,
                    date: new Date(year, month - 1, day)
                };
            }
        }
    });
    
    return yearlyData;
}

// Function to fetch data in 5-year periods
async function fetchDataInPeriods(seriesCode, startYear, endYear) {
    const allData = [];
    
    for (let year = startYear; year <= endYear; year += 5) {
        const periodEnd = Math.min(year + 4, endYear);
        const startDate = formatDate(year, 1, 1);
        const endDate = formatDate(periodEnd, 12, 31);
        
        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesCode}/dados?dataInicial=${startDate}&dataFinal=${endDate}&formato=json`;
        
        console.log(`Fetching ${seriesCode} data for ${year}-${periodEnd}...`);
        
        try {
            const periodData = await fetchData(url);
            allData.push(...periodData);
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error fetching data for period ${year}-${periodEnd}:`, error.message);
        }
    }
    
    return allData;
}

async function main() {
    try {
        console.log('🏛️  Fetching Brazilian economic data from Banco Central...');
        
        // API series codes
        const SELIC_RATE = '432';           // Taxa Selic - Meta definida pelo Copom
        const GROSS_DEBT = '13762';         // Dívida Bruta do Governo Geral - % PIB
        
        const startYear = 1990;
        const endYear = 2024;
        
        // Fetch all data
        console.log('📊 Fetching Selic Rate...');
        const selicData = await fetchDataInPeriods(SELIC_RATE, startYear, endYear);
        
        console.log('🏦 Fetching Gross Public Debt...');
        const grossDebtData = await fetchDataInPeriods(GROSS_DEBT, startYear, endYear);
        
        // Process data to get year-end values
        console.log('📈 Processing year-end values...');
        const selicYearly = getYearEndValues(selicData);
        const grossDebtYearly = getYearEndValues(grossDebtData);
        
        // Load existing data
        console.log('📂 Loading existing dados_brasil.json...');
        const existingData = JSON.parse(fs.readFileSync('./src/dados_brasil.json', 'utf8'));
        
        // Update data for each year
        let updatedCount = 0;
        
        for (let year = startYear; year <= endYear; year++) {
            const yearStr = year.toString();
            
            if (existingData.years[yearStr]) {
                let hasUpdates = false;
                
                // Add Selic Rate
                if (selicYearly[year]) {
                    existingData.years[yearStr].data.selic_rate = {
                        value: selicYearly[year].value.toString(),
                        title: "Taxa Selic (%)",
                        source: "https://api.bcb.gov.br/ (Banco Central do Brasil)"
                    };
                    hasUpdates = true;
                }
                
                // Add Gross Public Debt
                if (grossDebtYearly[year]) {
                    existingData.years[yearStr].data.public_debt_gross = {
                        value: grossDebtYearly[year].value.toString(),
                        title: "Dívida Bruta do Governo Geral (% PIB)",
                        source: "https://api.bcb.gov.br/ (Banco Central do Brasil)"
                    };
                    hasUpdates = true;
                }
                
                if (hasUpdates) {
                    updatedCount++;
                }
            }
        }
        
        // Save updated data
        console.log('💾 Saving updated dados_brasil.json...');
        fs.writeFileSync('./src/dados_brasil.json', JSON.stringify(existingData, null, 2));
        
        console.log('✅ Success! Data integration completed.');
        console.log(`📊 Updated ${updatedCount} years with new economic indicators.`);
        console.log('🎯 Added indicators:');
        console.log('   • Taxa Selic (%) - selic_rate');
        console.log('   • Dívida Bruta do Governo Geral (% PIB) - public_debt_gross');
        
        // Print summary stats
        console.log('\n📈 Data Summary:');
        console.log(`   • Selic Rate: ${Object.keys(selicYearly).length} years`);
        console.log(`   • Gross Public Debt: ${Object.keys(grossDebtYearly).length} years`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
main();
