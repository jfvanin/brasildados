const fs = require('fs');
const path = require('path');

// All World Bank indicators from generate-series.ts
const worldBankIndicators = {
    gdp: 'NY.GDP.MKTP.CD',
    gdp_capita: 'NY.GDP.PCAP.CD',
    gdp_growth: 'NY.GDP.MKTP.KD.ZG',
    inflation: 'FP.CPI.TOTL.ZG',
    exports_gdp: 'NE.EXP.GNFS.ZS',
    imports_gdp: 'NE.IMP.GNFS.ZS',
    population: 'SP.POP.TOTL',
    life_expectancy: 'SP.DYN.LE00.IN',
    literacy: 'SE.ADT.LITR.ZS',
    gov_edu_expenditure: 'SE.XPD.TOTL.GD.ZS',
    health_expenditure: 'SH.XPD.CHEX.GD.ZS',
    physicians: 'SH.MED.PHYS.ZS',
    under5_mortality: 'SH.DYN.MORT',
    co2_pc: 'EN.ATM.CO2E.PC',
    renewable_energy: 'EG.FEC.RNEW.ZS',
    forest_area: 'AG.LND.FRST.ZS',
    unemployment: 'SL.UEM.TOTL.ZS',
    gini: 'SI.POV.GINI',
    income_share_20: 'SI.DST.FRST.20',
    poverty_3dollar: 'SI.POV.DDAY'
};

async function fetchGlobalData(indicator) {
    const url = `https://api.worldbank.org/v2/country/WLD/indicator/${indicator}?format=json&date=1990:2024&per_page=100`;
    
    try {
        console.log(`Fetching global data for ${indicator}...`);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data[1] || !Array.isArray(data[1])) {
            console.warn(`No data available for ${indicator}`);
            return {};
        }
        
        const yearValueMap = {};
        data[1].forEach(entry => {
            if (entry.value !== null && entry.date >= 1990 && entry.date <= 2024) {
                yearValueMap[entry.date] = entry.value;
            }
        });
        
        console.log(`Found global data for ${indicator}: ${Object.keys(yearValueMap).length} years`);
        return yearValueMap;
        
    } catch (error) {
        console.error(`Error fetching ${indicator}:`, error.message);
        return {};
    }
}

async function updateGlobalAverages() {
    try {
        console.log('Starting to fetch global averages for all World Bank indicators...');
        
        // Read the current brasil_data.json file
        const dataPath = path.join(__dirname, '../web/src/dados_brasil.json');
        const currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        // Fetch global data for all indicators
        const globalDataPromises = Object.entries(worldBankIndicators).map(async ([key, indicator]) => {
            const data = await fetchGlobalData(indicator);
            return { key, data };
        });
        
        const globalDataResults = await Promise.all(globalDataPromises);
        
        // Create a map of indicator key to global data
        const globalDataMap = {};
        globalDataResults.forEach(({ key, data }) => {
            globalDataMap[key] = data;
        });
        
        console.log('\nUpdating brasil_data.json with global averages...');
        
        // Update the data structure for years 1990-2024
        for (let year = 1990; year <= 2024; year++) {
            const yearStr = year.toString();
            
            // Ensure the year exists in the data structure
            if (!currentData.years[yearStr]) {
                currentData.years[yearStr] = { data: {}, government: { party: '', president: '' } };
            }
            
            // Update each World Bank indicator with global average
            Object.keys(worldBankIndicators).forEach(indicatorKey => {
                // Only update if the indicator exists in the current data
                if (currentData.years[yearStr].data[indicatorKey]) {
                    const globalValue = globalDataMap[indicatorKey][year] || null;
                    
                    // Add global_average_value to the existing indicator data
                    currentData.years[yearStr].data[indicatorKey].global_average_value = globalValue;
                }
            });
        }
        
        // Write the updated data back to the file
        fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2), 'utf8');
        
        console.log('Global averages updated successfully in web/src/dados_brasil.json');
        
        // Print summary
        console.log('\nSummary of global data added:');
        Object.keys(worldBankIndicators).forEach(indicatorKey => {
            const dataCount = Object.keys(globalDataMap[indicatorKey]).length;
            console.log(`- ${indicatorKey}: ${dataCount} years of global data`);
        });
        
    } catch (error) {
        console.error('Error updating global averages:', error.message);
        process.exit(1);
    }
}

// Add timeout to prevent hanging
const timeout = setTimeout(() => {
    console.error('Request timed out after 5 minutes');
    process.exit(1);
}, 300000); // 5 minutes timeout

updateGlobalAverages()
    .then(() => {
        clearTimeout(timeout);
        console.log('\nScript completed successfully');
    })
    .catch((error) => {
        clearTimeout(timeout);
        console.error('Script failed:', error);
        process.exit(1);
    }); 