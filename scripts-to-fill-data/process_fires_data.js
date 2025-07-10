const fs = require('fs');
const csv = require('csv-parse/sync');

// Read the CSV file
const fileContent = fs.readFileSync('data/dashboard-fires-month-09-07-2025-20_34_07.csv', 'utf-8');

// Print the raw header row
const firstLine = fileContent.split('\n')[0];
console.log('Raw header row:', firstLine);
console.log('Header char codes:', Array.from(firstLine).map(c => c.charCodeAt(0)));

// Parse CSV with semicolon delimiter
const records = csv.parse(fileContent, {
  columns: true,
  delimiter: ';'
});

if (records.length > 0) {
  const keys = Object.keys(records[0]);
  console.log('Keys of first record:', keys);
  console.log('Key char codes:', keys.map(k => Array.from(k).map(c => c.charCodeAt(0))));
}

// Group by year and sum focuses
const yearlyData = {};
const yearsSet = new Set();

records.forEach((record, index) => {
  const dateKey = Object.keys(record).find(k => k.trim().toLowerCase() === 'date');
  if (!record || !dateKey || !record[dateKey]) return;
  const year = record[dateKey].split('/')[0];
  if (index < 5) console.log(`Processing record ${index}: year = ${year}`);
  yearsSet.add(year);
  const focuses = parseInt(record.focuses) || 0;
  if (!yearlyData[year]) {
    yearlyData[year] = 0;
  }
  yearlyData[year] += focuses;
});

console.log('Unique years found:', Array.from(yearsSet));

// Convert to array and sort by year
const result = Object.entries(yearlyData)
  .map(([year, total_fires]) => ({ year: parseInt(year), total_fires }))
  .sort((a, b) => a.year - b.year);

// Write to JSON file
fs.writeFileSync('data/wildfires_yearly.json', JSON.stringify(result, null, 2), 'utf-8');

console.log('Wildfires data processed and saved to data/wildfires_yearly.json');
console.log('Years covered:', result.map(r => r.year).join(', '));
console.log('Total records processed:', records.length); 