import React, { useState, useMemo } from 'react';
import { dataService } from '../services/dataService';
import { ToggleOption, ChartConfig, YearRange } from '../types';
import ToggleSection from './ToggleSection';
import Chart from './Chart';
import PresidencyTimeline from './PresidencyTimeline';
import YearRangeControls from './YearRangeControls';

const Dashboard: React.FC = () => {
  // Chart configurations with titles from data
  const chartConfigs: ChartConfig[] = useMemo(() => [
    {
      title: 'Indicadores Econômicos Principais',
      toggles: [
        { key: 'gdp_growth', title: dataService.getIndicatorTitle('gdp_growth'), enabled: true, color: '#43A047' },
        { key: 'inflation', title: dataService.getIndicatorTitle('inflation'), enabled: false, color: '#FBC02D' },
        { key: 'unemployment', title: dataService.getIndicatorTitle('unemployment'), enabled: false, color: '#FF7043' }
      ],
      dataKeys: ['gdp_growth', 'inflation', 'unemployment']
    },
    {
      title: 'Dados Financeiros',
      toggles: [
        { key: 'gdp', title: dataService.getIndicatorTitle('gdp'), enabled: true, color: '#43A047' },
        { key: 'gdp_capita', title: dataService.getIndicatorTitle('gdp_capita'), enabled: false, color: '#66BB6A' },
        { key: 'exports_gdp', title: dataService.getIndicatorTitle('exports_gdp'), enabled: false, color: '#FDD835' },
        { key: 'imports_gdp', title: dataService.getIndicatorTitle('imports_gdp'), enabled: false, color: '#FFEB3B' },
        { key: 'gnipc', title: dataService.getIndicatorTitle('gnipc'), enabled: false, color: '#81C784' }
      ],
      dataKeys: ['gdp', 'gdp_capita', 'exports_gdp', 'imports_gdp', 'gnipc']
    },
    {
      title: 'Desenvolvimento Humano',
      toggles: [
        { key: 'population', title: dataService.getIndicatorTitle('population'), enabled: true, color: '#43A047' },
        { key: 'gini', title: dataService.getIndicatorTitle('gini'), enabled: false, color: '#FBC02D' },
        { key: 'life_expectancy', title: dataService.getIndicatorTitle('life_expectancy'), enabled: false, color: '#66BB6A' },
        { key: 'hdi', title: dataService.getIndicatorTitle('hdi'), enabled: false, color: '#388E3C' },
        { key: 'literacy', title: dataService.getIndicatorTitle('literacy'), enabled: false, color: '#4CAF50' }
      ],
      dataKeys: ['population', 'gini', 'life_expectancy', 'hdi', 'literacy']
    },
    {
      title: 'Meio Ambiente',
      toggles: [
        { key: 'co2_per_capita', title: dataService.getIndicatorTitle('co2_per_capita'), enabled: true, color: '#FBC02D' },
        { key: 'forest_area', title: dataService.getIndicatorTitle('forest_area'), enabled: false, color: '#43A047' },
        { key: 'amazon_deforestation', title: dataService.getIndicatorTitle('amazon_deforestation'), enabled: false, color: '#D32F2F' },
        { key: 'wildfires', title: dataService.getIndicatorTitle('wildfires'), enabled: false, color: '#FF7043' }
      ],
      dataKeys: ['co2_per_capita', 'forest_area', 'amazon_deforestation', 'wildfires']
    },
    {
      title: 'Outros Indicadores',
      toggles: [
        { key: 'under5_mortality', title: dataService.getIndicatorTitle('under5_mortality'), enabled: true, color: '#FBC02D' },
        { key: 'health_expenditure', title: dataService.getIndicatorTitle('health_expenditure'), enabled: false, color: '#66BB6A' },
        { key: 'gov_edu_expenditure', title: dataService.getIndicatorTitle('gov_edu_expenditure'), enabled: false, color: '#81C784' },
        { key: 'mys', title: dataService.getIndicatorTitle('mys'), enabled: false, color: '#388E3C' }
      ],
      dataKeys: ['under5_mortality', 'health_expenditure', 'gov_edu_expenditure', 'mys']
    }
  ], []);

  const [chartStates, setChartStates] = useState<ToggleOption[][]>(
    chartConfigs.map(config => config.toggles)
  );

  // Get data
  const presidencyPeriods = useMemo(() => dataService.getPresidencyPeriods(), []);
  const sources = useMemo(() => dataService.getAllSources(), []);
  const availableYears = useMemo(() => dataService.getAvailableYears(), []);
  
  const startYear = availableYears[0] || 1990;
  const endYear = availableYears[availableYears.length - 1] || 2022;

  // Year range filtering state
  const [selectedYearRange, setSelectedYearRange] = useState<YearRange>({
    startYear: 2000,
    endYear
  });

  const handleToggle = (chartIndex: number, key: string) => {
    setChartStates(prevStates => {
      const newStates = [...prevStates];
      
      if (chartIndex === 0) {
        // First chart (Indicadores Econômicos Principais) - allow multiple selections
        newStates[chartIndex] = newStates[chartIndex].map(toggle =>
          toggle.key === key ? { ...toggle, enabled: !toggle.enabled } : toggle
        );
      } else {
        // All other charts - exclusive toggles (only one can be selected at a time)
        newStates[chartIndex] = newStates[chartIndex].map(toggle =>
          toggle.key === key ? { ...toggle, enabled: true } : { ...toggle, enabled: false }
        );
      }
      
      return newStates;
    });
  };

  const handleYearRangeChange = (range: YearRange) => {
    setSelectedYearRange(range);
  };

  const handleResetYearRange = () => {
    setSelectedYearRange({ startYear, endYear });
  };

  const getChartData = (chartIndex: number) => {
    const enabledKeys = chartStates[chartIndex]
      .filter(toggle => toggle.enabled)
      .map(toggle => toggle.key);
    
    return dataService.getChartDataWithRange(
      enabledKeys, 
      selectedYearRange.startYear, 
      selectedYearRange.endYear
    );
  };

  return (
    <div className="min-h-screen bg-brazil-gradient">
      <div className="container mx-auto px-0 sm:px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12 fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white to-brazil-yellow-200 bg-clip-text text-transparent">
            <b className='text-green-600'>Brasil</b><b className='text-yellow-300'>Dados</b>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
            Visualização interativa de indicadores econômicos, sociais e ambientais do Brasil
          </p>
          <div className="mt-6 text-white/70 text-sm">
            Dados de {startYear} a {endYear} • {availableYears.length} anos de história
          </div>
        </header>

        {/* Master Timeline for Year Range Selection */}
        <div className="mb-8 sm:mb-12 fade-in">
          <div className="bg-white/10 backdrop-blur-sm md:rounded-2xl p-2 sm:p-4 md:p-4 md:border md:border-white/20 shadow-2xl">            
            <YearRangeControls
              selectedRange={selectedYearRange}
              totalRange={{ startYear, endYear }}
              onReset={handleResetYearRange}
            />
            
            <p className="text-white/70 mb-4 text-sm mt-4">
              💡 Arraste as bordas amarelas para filtrar os dados por período. Todos os gráficos serão atualizados automaticamente.
            </p>
            
            <PresidencyTimeline
              periods={presidencyPeriods}
              startYear={startYear}
              endYear={endYear}
              selectedRange={selectedYearRange}
              onRangeChange={handleYearRangeChange}
              isInteractive={true}
            />
          </div>
        </div>

        {/* Charts */}
        {chartConfigs.map((config, chartIndex) => (
          <div key={chartIndex} className="mb-8 sm:mb-16 fade-in" style={{animationDelay: `${chartIndex * 0.2}s`}}>
            <div className="bg-white/10 backdrop-blur-sm md:rounded-2xl p-3 sm:p-6 md:p-8 md:border md:border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-brazil-yellow-400 to-brazil-green-500 rounded-full"></div>
                {config.title}
                {(selectedYearRange.startYear !== startYear || selectedYearRange.endYear !== endYear) && (
                  <span className="text-sm bg-brazil-yellow-400 text-brazil-navy px-3 py-1 rounded-full font-medium">
                    Filtrado: {selectedYearRange.startYear}-{selectedYearRange.endYear}
                  </span>
                )}
              </h2>
              
              {/* Toggles */}
              <ToggleSection
                title="Selecionar Indicadores"
                toggles={chartStates[chartIndex]}
                onToggle={(key) => handleToggle(chartIndex, key)}
              />

              {/* Chart */}
              <div className="mb-6 bg-black/20 rounded-xl py-4 p-0 md:px-4">
                <Chart
                  data={getChartData(chartIndex)}
                  toggles={chartStates[chartIndex]}
                  title={config.title}
                  presidencyPeriods={presidencyPeriods}
                />
              </div>

              {/* Timeline */}
              <PresidencyTimeline
                periods={presidencyPeriods}
                startYear={startYear}
                endYear={endYear}
                selectedRange={selectedYearRange}
                isInteractive={false}
              />
            </div>
          </div>
        ))}

        {/* Sources */}
        <footer className="mt-8 sm:mt-16 fade-in">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-6 md:p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-2 h-6 bg-gradient-to-b from-brazil-green-500 to-brazil-yellow-400 rounded-full"></div>
              Fontes dos Dados
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {sources.map((source, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white/90 text-sm leading-relaxed">
                    • {source}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-white/20 text-center">
              <p className="text-white/70 text-sm">
                Dashboard desenvolvido para todos brasileiros que amam dados e transparência.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
