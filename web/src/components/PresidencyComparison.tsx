import React, { useMemo } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { dataService } from '../services/dataService';
import { PresidencyStat, YearRange } from '../types';
import { formatAxisTick, formatWithUnit } from '../utils/format';
import { ComparisonState, ComparisonMetric } from '../utils/urlState';

interface PresidencyComparisonProps {
  yearRange: YearRange;
  state: ComparisonState;
  onStateChange: (state: ComparisonState) => void;
}

type Metric = ComparisonMetric;

const PresidencyComparison: React.FC<PresidencyComparisonProps> = ({ yearRange, state, onStateChange }) => {
  const { indicator, metric } = state;
  const setIndicator = (value: string) => onStateChange({ ...state, indicator: value });
  const setMetric = (value: Metric) => onStateChange({ ...state, metric: value });

  const catalog = useMemo(() => dataService.getIndicatorsCatalog(), []);
  const indicatorTitle = dataService.getIndicatorTitle(indicator);

  const stats = useMemo(
    () => dataService.getPresidencyStats(indicator, yearRange.startYear, yearRange.endYear),
    [indicator, yearRange]
  );

  const chartData = stats
    .map(stat => ({
      ...stat,
      value: metric === 'average' ? stat.average : stat.delta,
    }))
    .filter((entry): entry is PresidencyStat & { value: number } => entry.value !== null);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const stat: PresidencyStat & { value: number } = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-xl max-w-xs">
        <p className="font-bold text-brazil-navy mb-1">{stat.president}</p>
        <p className="text-sm text-gray-700 mb-2">{stat.party} • {stat.startYear}–{stat.endYear}</p>
        <p className="text-sm font-medium">
          <strong>{metric === 'average' ? 'Média anual' : 'Variação no período'}:</strong>{' '}
          {formatWithUnit(stat.value, indicatorTitle)}
        </p>
        <p className="text-xs text-gray-500 mt-1">{stat.yearsWithData} ano(s) com dados</p>
      </div>
    );
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center">
        <select
          value={indicator}
          onChange={event => setIndicator(event.target.value)}
          aria-label="Selecionar indicador"
          className="bg-white/10 text-white border border-white/30 rounded-lg px-3 py-2 text-sm flex-1 max-w-xl [&>option]:text-brazil-navy"
        >
          {catalog.map(entry => (
            <option key={entry.key} value={entry.key}>{entry.title}</option>
          ))}
        </select>

        <div className="flex rounded-lg overflow-hidden border border-white/30 self-start">
          {([['average', 'Média anual'], ['delta', 'Variação no período']] as Array<[Metric, string]>).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setMetric(value)}
              className={`px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                metric === value
                  ? 'bg-brazil-yellow-400 text-brazil-navy'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="text-white/70 text-sm py-12 text-center">
          Sem dados para este indicador no período selecionado.
        </p>
      ) : (
        <div className="w-full h-80 md:h-96 bg-black/20 rounded-xl py-4 p-0 md:px-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 1, bottom: 10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="2 2" />
              <XAxis
                dataKey="presidentNick"
                stroke="#fff"
                tick={{ fill: '#fff', fontSize: 12 }}
                axisLine={{ stroke: '#fff', strokeWidth: 2 }}
              />
              <YAxis
                stroke="#fff"
                tick={{ fill: '#fff', fontSize: 12 }}
                tickFormatter={formatAxisTick}
                axisLine={{ stroke: '#fff', strokeWidth: 2 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.08)' }} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.5)" />
              <Bar dataKey="value" name={indicatorTitle} radius={[4, 4, 0, 0]}>
                {chartData.map(entry => (
                  <Cell key={`${entry.president}-${entry.startYear}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="text-white/50 text-xs mt-3">
        Barras coloridas pelo partido do presidente. "Média anual" é a média dos valores no período de cada governo
        dentro do intervalo selecionado; "Variação no período" é a diferença entre o último e o primeiro valor disponível.
      </p>
    </div>
  );
};

export default PresidencyComparison;
