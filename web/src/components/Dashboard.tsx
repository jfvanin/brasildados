'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { ToggleOption, YearRange } from '../types';
import ToggleSection from './ToggleSection';
import Chart from './Chart';
import PresidencyTimeline from './PresidencyTimeline';
import PresidencyComparison from './PresidencyComparison';
import YearRangeControls from './YearRangeControls';
import IndicatorDataTable from './IndicatorDataTable';
import { CHART_CONFIGS } from '../data/chartConfig';
import { encodeStateToParams, ComparisonState } from '../utils/urlState';

interface DashboardProps { initialYearRange: YearRange }

const Dashboard: React.FC<DashboardProps> = ({ initialYearRange }) => {
  const [displayAbout, setDisplayAbout] = useState(false);
  const chartConfigs = CHART_CONFIGS;

  const comparisonIndicators = useMemo(() => {
    const indicators = new Map<string, string>();
    chartConfigs.forEach(config => {
      config.toggles.forEach(toggle => {
        if (!toggle.isGroup && !indicators.has(toggle.key)) {
          indicators.set(toggle.key, toggle.title);
        }
      });
    });
    return Array.from(indicators, ([key, title]) => ({ key, title }));
  }, [chartConfigs]);

  // Get data
  const presidencyPeriods = useMemo(() => dataService.getPresidencyPeriods(), []);
  const sources = useMemo(() => dataService.getAllSources(), []);
  const availableYears = useMemo(() => dataService.getAvailableYears(), []);

  const startYear = availableYears[0] || 1990;
  const endYear = availableYears[availableYears.length - 1] || 2024;

  const [chartStates, setChartStates] = useState<ToggleOption[][]>(
    chartConfigs.map(config => config.toggles)
  );

  // Year range filtering state
  const [selectedYearRange, setSelectedYearRange] = useState<YearRange>(initialYearRange);

  // Presidency comparison controls stay local; only years are reflected in the URL
  const [comparison, setComparison] = useState<ComparisonState>({
    indicator: 'gdp_growth',
    metric: 'delta',
  });

  // Keep only the year range in sync with the URL
  useEffect(() => {
    const params = encodeStateToParams(selectedYearRange);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }, [selectedYearRange]);

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

  const handleScrollToComparison = () => {
    document.getElementById('presidency-comparison')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
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
          <h2 className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
            Visualização interativa de indicadores econômicos, sociais e ambientais do Brasil
          </h2>
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
              Para os anos mais recentes, alguns indicadores ainda não estão disponíveis nas fontes oficiais que utilizamos — 
              como Banco Mundial, IBGE e ONU. Nesses casos, optamos por manter o dado em branco em vez de usar fontes 
              alternativas de menor rigor, priorizando sempre a precisão e a compatibilidade com os padrões internacionais 
              de mensuração. Acreditamos que um dado ausente é mais honesto do que um dado impreciso.
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

        <div className="mb-8 sm:mb-12 fade-in">
          <button
            type="button"
            onClick={handleScrollToComparison}
            className="group flex min-h-[72px] w-full flex-col items-center justify-center bg-green-500/70 px-4 py-3 text-center shadow-2xl backdrop-blur-sm transition-all duration-200 hover:bg-green-500/85 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-brazil-yellow-400 focus:ring-offset-2 focus:ring-offset-brazil-navy"
            aria-label="Ir para o comparativo por governo"
          >
            <span className="text-lg font-medium leading-tight text-white/95">
              Compare resultados por governo
            </span>
            <span className="relative mt-6 block h-2 w-20" aria-hidden="true">
              <span className="absolute left-1/2 top-1 h-1 w-8 origin-right -translate-x-full rotate-45 rounded-full bg-white/90 transition-transform duration-200 group-hover:translate-y-0.5" />
              <span className="absolute left-1/2 top-1 h-1 w-8 origin-left rotate-[-45deg] rounded-full bg-white/90 transition-transform duration-200 group-hover:translate-y-0.5" />
            </span>
          </button>
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

              <div className="mb-4 text-xs text-white/50">
                <h3 className="text-md font-semibold text-white mb-3">Fonte:</h3>
                {Array.from(
                  new Set(
                    chartStates[chartIndex]
                      .filter(t => t.enabled && !t.isGroup)
                      .map(t => dataService.getIndicatorSource(t.key))
                      .filter((s): s is string => !!s)
                  )
                ).map((source, i) => (
                  <span key={i} className="block">{source}</span>
                ))}
              </div>

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

              <IndicatorDataTable category={config.title} indicators={config.toggles} />
            </div>
          </div>
        ))}

        {/* Presidency comparison */}
        <div id="presidency-comparison" className="mb-8 sm:mb-16 fade-in scroll-mt-6">
          <div className="bg-white/10 backdrop-blur-sm md:rounded-2xl p-3 sm:p-6 md:p-8 md:border md:border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-brazil-yellow-400 to-brazil-green-500 rounded-full"></div>
              Comparativo por Governo
              {(selectedYearRange.startYear !== startYear || selectedYearRange.endYear !== endYear) && (
                <span className="text-sm bg-brazil-yellow-400 text-brazil-navy px-3 py-1 rounded-full font-medium">
                  Filtrado: {selectedYearRange.startYear}-{selectedYearRange.endYear}
                </span>
              )}
            </h2>
            <p className="text-white/70 text-sm mb-6">
              Compare como cada indicador se comportou em cada governo.
            </p>
            <PresidencyComparison
              yearRange={selectedYearRange}
              indicators={comparisonIndicators}
              state={comparison}
              onStateChange={setComparison}
            />
          </div>
        </div>

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
