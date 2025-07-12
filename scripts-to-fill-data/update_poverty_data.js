const fs = require('fs');
const path = require('path');

async function updatePovertyData() {
    try {
        console.log('Fetching poverty data from World Bank API...');
        
        const response = await fetch('https://api.worldbank.org/v2/country/BRA/indicator/SI.POV.DDAY?format=json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data[1] || !Array.isArray(data[1])) {
            throw new Error('Invalid data format from API');
        }
        
        // Read the current brasil_data.json file
        const dataPath = path.join(__dirname, '../web/src/dados_brasil.json');
        const currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        // Process the poverty data
        const povertyData = data[1];
        const povertyByYear = {};
        
        povertyData.forEach(entry => {
            if (entry.value !== null && entry.date && entry.date >= 1990 && entry.date <= 2024) {
                povertyByYear[entry.date] = entry.value;
            }
        });
        
        console.log(`Found poverty data for ${Object.keys(povertyByYear).length} years`);
        
        // Update the data structure
        for (let year = 1990; year <= 2024; year++) {
            const yearStr = year.toString();
            
            // Ensure the year exists in the data structure
            if (!currentData.years[yearStr]) {
                currentData.years[yearStr] = { data: {}, government: { party: '', president: '' } };
            }
            
            // Add or update the poverty data
            currentData.years[yearStr].data.poverty_3dollar = {
                value: povertyByYear[year] || null,
                title: 'Pobreza - população vivendo com menos de $3,20/dia (PPP 2011) (%)',
                source: 'https://data.worldbank.org/indicator/SI.POV.DDAY (World Bank)'
            };
        }
        
        // Write the updated data back to the file
        fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2), 'utf8');
        
        console.log('Poverty data updated successfully in web/src/dados_brasil.json');
        console.log('Years with data:', Object.keys(povertyByYear).sort());
        
    } catch (error) {
        console.error('Error updating poverty data:', error.message);
        process.exit(1);
    }
}

// Add timeout to prevent hanging
const timeout = setTimeout(() => {
    console.error('Request timed out after 30 seconds');
    process.exit(1);
}, 30000);

updatePovertyData()
    .then(() => {
        clearTimeout(timeout);
        console.log('Script completed successfully');
    })
    .catch((error) => {
        clearTimeout(timeout);
        console.error('Script failed:', error);
        process.exit(1);
    }); 