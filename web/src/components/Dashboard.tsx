import React, { useState, useMemo } from 'react';
import { dataService } from '../services/dataService';
import { ToggleOption, ChartConfig, YearRange } from '../types';
import ToggleSection from './ToggleSection';
import Chart from './Chart';
import PresidencyTimeline from './PresidencyTimeline';
import YearRangeControls from './YearRangeControls';

const Dashboard: React.FC = () => {
  const [displayAbout, setDisplayAbout] = useState(false);
  
  // Chart configurations with titles from data
  const chartConfigs: ChartConfig[] = useMemo(() => [
    {
      title: 'Principais Indicadores',
      type: 'multiple',
      toggles: [
        { key: 'gdp_growth', title: dataService.getIndicatorTitle('gdp_growth'), enabled: true, color: '#43A047', showGlobalAverage: true },
        { key: 'inflation', title: dataService.getIndicatorTitle('inflation'), enabled: true, color: '#FBC02D' },
        { key: 'unemployment', title: dataService.getIndicatorTitle('unemployment'), enabled: true, color: '#FF7043' },
        { key: 'selic_rate', title: dataService.getIndicatorTitle('selic_rate'), enabled: false, color: '#77CBDA' },
        { key: 'poverty_3dollar', title: dataService.getIndicatorTitle('poverty_3dollar'), enabled: false, color: '#AAAAAA', showGlobalAverage: true }
      ],
      dataKeys: ['gdp_growth', 'inflation', 'unemployment', 'selic_rate']
    },
    {
      title: 'Desenvolvimento Humano',
      type: 'exclusive',
      toggles: [
        { key: 'hdi', title: dataService.getIndicatorTitle('hdi'), enabled: true, color: '#388E3C', showGlobalAverage: true },
        { key: 'gini', title: dataService.getIndicatorTitle('gini'), enabled: false, color: '#FBC02D', showGlobalAverage: true },
        { key: 'life_expectancy', title: dataService.getIndicatorTitle('life_expectancy'), enabled: false, color: '#66BB6A', showGlobalAverage: true },
        { key: 'literacy', title: dataService.getIndicatorTitle('literacy'), enabled: false, color: '#4CAF50', showGlobalAverage: true },
        { key: 'under5_mortality', title: dataService.getIndicatorTitle('under5_mortality'), enabled: false, color: '#FBC02D', showGlobalAverage: true },
        { key: 'population', title: dataService.getIndicatorTitle('population'), enabled: false, color: '#43A047' },
      ],
      dataKeys: [ 'hdi', 'gini', 'poverty_3dollar', 'life_expectancy', 'literacy', 'population']
    },
    {
      title: 'Meio Ambiente',
      type: 'exclusive',
      toggles: [
        { key: 'co2', title: dataService.getIndicatorTitle('co2'), enabled: true, color: '#FBC02D' },
        { key: 'co2_per_capita', title: dataService.getIndicatorTitle('co2_per_capita'), enabled: false, color: '#898989', showGlobalAverage: true },
        { key: 'forest_area', title: dataService.getIndicatorTitle('forest_area'), enabled: false, color: '#43A047', showGlobalAverage: true },
        { key: 'amazon_deforestation', title: dataService.getIndicatorTitle('amazon_deforestation'), enabled: false, color: '#D32F2F' },
        { key: 'wildfires', title: dataService.getIndicatorTitle('wildfires'), enabled: false, color: '#FF7043' }
      ],
      dataKeys: ['co2_per_capita', 'forest_area', 'amazon_deforestation', 'wildfires']
    },
    {
      title: 'Dados Financeiros',
      type: 'exclusive',
      toggles: [
        { key: 'gdp', title: dataService.getIndicatorTitle('gdp'), enabled: true, color: '#43A047' },
        { key: 'gdp_capita', title: dataService.getIndicatorTitle('gdp_capita'), enabled: false, color: '#66BB6A', showGlobalAverage: true },
        { key: 'brl_to_usd', title: dataService.getIndicatorTitle('brl_to_usd'), enabled: false, color: '#FDD835' },
        { key: 'trade_balance', title: 'Balança Comercial', enabled: false, color: '#FDD835', isGroup: true },
        { key: 'exports_gdp', title: dataService.getIndicatorTitle('exports_gdp'), enabled: false, color: '#43A047', hidden: true },
        { key: 'imports_gdp', title: dataService.getIndicatorTitle('imports_gdp'), enabled: false, color: '#FDD835', hidden: true },
        { key: 'gnipc', title: dataService.getIndicatorTitle('gnipc'), enabled: false, color: '#81C784' },
        { key: 'public_debt_gross', title: dataService.getIndicatorTitle('public_debt_gross'), enabled: false, color: '#D32F2F' },
        { key: 'external_debt', title: dataService.getIndicatorTitle('external_debt'), enabled: false, color: '#FF7043' }
      ],
      groups: {
        'trade_balance': ['exports_gdp', 'imports_gdp']
      },
      dataKeys: ['gdp', 'gdp_capita', 'gnipc', 'public_debt_gross', 'trade_balance']
    },
    {
      title: 'Outros Indicadores',
      type: 'exclusive',
      toggles: [
        { key: 'mys', title: dataService.getIndicatorTitle('mys'), enabled: true, color: '#388E3C' },
        { key: 'health_expenditure', title: dataService.getIndicatorTitle('health_expenditure'), enabled: false, color: '#66BB6A', showGlobalAverage: true  },
        { key: 'gov_edu_expenditure', title: dataService.getIndicatorTitle('gov_edu_expenditure'), enabled: false, color: '#81C784', showGlobalAverage: true  },
        { key: 'se', title: 'Mulheres e Homens na Educação', enabled: false, color: '#FDD835', isGroup: true },
        { key: 'se_f', title: dataService.getIndicatorTitle('se_f'), enabled: false, color: '#FDD835', hidden: true},
        { key: 'se_m', title: dataService.getIndicatorTitle('se_m'), enabled: false, color: '#77CBDA', hidden: true },
        { key: 'pr', title: 'Mulheres e Homens no Parlamento', enabled: false, color: '#FDD835', isGroup: true },
        { key: 'pr_f', title: dataService.getIndicatorTitle('pr_f'), enabled: false, color: '#FDD835', hidden: true },
        { key: 'pr_m', title: dataService.getIndicatorTitle('pr_m'), enabled: false, color: '#77CBDA', hidden: true },
        { key: 'lfpr', title: 'Mulheres e Homens na Força de Trabalho', enabled: false, color: '#FDD835', isGroup: true },
        { key: 'lfpr_f', title: dataService.getIndicatorTitle('lfpr_f'), enabled: false, color: '#FDD835', hidden: true},
        { key: 'lfpr_m', title: dataService.getIndicatorTitle('lfpr_m'), enabled: false, color: '#77CBDA', hidden: true},
      ],
      groups: {
        'se': ['se_m', 'se_f'],
        'pr': ['pr_m', 'pr_f'],
        'lfpr': ['lfpr_m', 'lfpr_f']
      },
      dataKeys: ['health_expenditure', 'gov_edu_expenditure', 'mys']
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
  const endYear = availableYears[availableYears.length - 1] || 2024;

  // Year range filtering state
  const [selectedYearRange, setSelectedYearRange] = useState<YearRange>({
    startYear: 2000,
    endYear
  });

  const handleToggle = (chartIndex: number, key: string) => {
  
    setChartStates(prevStates => {
      const newStates = [...prevStates];
      
      if (chartConfigs[chartIndex].type === 'multiple') {
        // First chart (Indicadores Econômicos Principais) - allow multiple selections
        newStates[chartIndex] = newStates[chartIndex].map(toggle =>
          toggle.key === key ? { ...toggle, enabled: !toggle.enabled } : toggle
        );
      } else {
        const group = chartConfigs[chartIndex].groups?.[key] || []; 
        newStates[chartIndex] = newStates[chartIndex]
          .map(toggle => ({
          ...toggle,
          enabled: toggle.key === key || group.includes(toggle.key)
        }));
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
      .filter(toggle => toggle.enabled && !toggle.isGroup)
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
        <header className="text-center mb-6 fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white to-brazil-yellow-200 bg-clip-text text-transparent">
            <b className='text-green-600'>Brasil</b><b className='text-yellow-300'>Dados</b>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
            Visualização interativa de indicadores econômicos, sociais e ambientais do Brasil
          </p>
          <button className="mt-4 text-white/70 hover:text-white transition-colors underline" onClick={() => setDisplayAbout(!displayAbout)}>Entenda</button>
            <div
              className={`px-2 text-white/70 text-xs sm:text-sm max-w-[800px] mx-auto transition-all duration-700 ease-in-out overflow-hidden ${displayAbout ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <p className="text-white/70 mt-4">
              Este dashboard nasceu da crença de que informação de qualidade é fundamental para 
              um debate público mais qualificado. Aqui você pode acompanhar a evolução de 
              indicadores econômicos, sociais e ambientais, conectando dados com a realidade 
              que vivemos e ajudando a distinguir fatos de narrativas. Nosso país merece 
              decisões baseadas em evidências, e este é um serviço gratuito para todos que 
              acreditam que compreender nosso passado é essencial para construir um futuro melhor.
              </p>
              <p className="text-white/70 mt-3">
              Você pode explorar os dados selecionando os anos no componente a seguir, 
              e todos os gráficos serão atualizados. Alguns dados permitem seleção de multiplos indicadores, outros não. 
              Você pode visualizar os dados em escala linear e logarítmica, além de poder exportar o gráfico.
              </p>
              <h2 className='mt-3'>Dados de {startYear} a {endYear} • {availableYears.length} anos de história</h2>
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
          <div className="bg-white/10 backdrop-blur-sm md:rounded-2xl p-3 sm:p-6 md:p-8 md:border md:border-white/20">
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
