# BrasilDados

**BrasilDados** is an interactive dashboard presenting key information and indicators about Brazil, bringing together socioeconomic, environmental, and political data from official and international sources.

## Project Structure

- The main web application code is in the `web` folder.
- The production build is generated in `web/build`.
- The dashboard loads its data from `src/dados_brasil.json`.
- The frontend is built with **ReactJS**, **TypeScript**, and **Tailwind CSS** for styling.

## Data Generation & Scripts

- The folder `scripts-to-fill-data` contains scripts used to generate and update the data for the dashboard.
- The script `generate-series.ts` is responsible for generating the main `dados_brasil.json` file.
- Other scripts in this folder either attach additional information to the JSON or generate intermediate data files.
- **Note:** The data processing workflow is not fully organized or automated yet:
  - Not all scripts attach data directly to the final JSON; some just generate data that is later added manually.
  - Some data in `dados_brasil.json` has been added or edited by hand.
  - There are still some TODOs to make the process fully shareable and reproducible.
  - For now, the current setup works for the dashboard's needs, but improvements are planned.

## How to Run the Project

1. Install dependencies:
   ```bash
   cd web
   npm install
   ```
2. Start the development server:

   ```bash
   npm start
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000) (or your configured port).

3. To build for production:
   ```bash
   npm run build
   ```
   The final build will be in `web/build`.

## About the Data

- The file `src/dados_brasil.json` aggregates indicators from several sources, such as:
  - Human Development Report (UN)
  - World Bank
  - INPE (wildfire data)
  - Other public datasets
- Data is processed and updated by auxiliary scripts (see above).

## Technologies Used

- ReactJS
- TypeScript
- Tailwind CSS

## Notes

- This project is open source and can be adapted for other public data contexts.
- Suggestions and contributions are welcome!

---

**Author:** jose
