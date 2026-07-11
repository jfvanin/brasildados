import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { ChartDataPoint, ToggleOption, PresidencyPeriod } from '../types';
import { ChartExportButton } from './ChartExportButton';
import { HISTORICAL_EVENTS } from '../data/events';
import { formatAxisTick, formatWithUnit } from '../utils/format';
import { dataService } from '../services/dataService';

interface ChartProps {
  data: ChartDataPoint[];
  toggles: ToggleOption[];
  title: string;
  presidencyPeriods: PresidencyPeriod[];
}

const Chart: React.FC<ChartProps> = ({ data, toggles, title, presidencyPeriods }) => {
  const [isLogScale, setIsLogScale] = useState(true);
  const [showEvents, setShowEvents] = useState(false);
  const [showIndicatorInfo, setShowIndicatorInfo] = useState(false);
  const enabledToggles = toggles.filter(toggle => toggle.enabled && !toggle.isGroup);
  const enabledIndicatorInfo = enabledToggles
    .map(toggle => ({ toggle, info: dataService.getIndicatorInfo(toggle.key) }))
    .filter(entry => entry.info !== null);

  // Stable chart ID for export (title is unique per dashboard section)
  const chartId = `chart-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const indicatorInfoId = `${chartId}-indicator-info`;

  React.useEffect(() => {
    if (!showIndicatorInfo) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowIndicatorInfo(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [showIndicatorInfo]);

  // Events inside the visible year window
  const visibleEvents = HISTORICAL_EVENTS.filter(event => {
    const firstYear = data[0]?.year;
    const lastYear = data[data.length - 1]?.year;
    return firstYear !== undefined && event.year >= firstYear && event.year <= lastYear;
  });

  // Check if current data has non-positive values (incompatible with log scale)
  const hasNonPositiveValues = () => {
    return data.some(point =>
      enabledToggles.some(toggle => {
        const value = point[toggle.key] as number;
        return typeof value === 'number' && !isNaN(value) && value <= 0;
      })
    );
  };

  // Auto-disable log scale if non-positive values are present
  const canUseLogScale = !hasNonPositiveValues();
  
  // Reset to linear scale if log scale becomes invalid
  React.useEffect(() => {
    if (isLogScale && !canUseLogScale) {
      setIsLogScale(false);
    }
  }, [isLogScale, canUseLogScale]);

  // Get the party color for a specific year
  const getPartyColorForYear = (year: number): string => {
    const government = presidencyPeriods.find(
      period => year >= period.startYear && year <= period.endYear
    );
    return government?.color || '#fff';
  };

  // Custom X-axis tick component with party colors
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const year = payload.value;
    const color = getPartyColorForYear(year);
    
    return (
      <g transform={`translate(${x},${y})`}>
        {/* Colored tick line */}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={6}
          stroke={color}
          strokeWidth={2}
        />
        {/* Year label with party color */}
        <text
          x={0}
          y={20}
          dy={0}
          textAnchor="middle"
          fill={color}
          fontSize={12}
          fontWeight="bold"
          transform="rotate(-45)"
          style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)' }}
        >
          {year}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const government = presidencyPeriods.find(
        period => label >= period.startYear && label <= period.endYear
      );

      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-xl max-w-xs">
          <p className="font-bold text-brazil-navy text-lg mb-1">{`Ano: ${label}`}</p>
          {government && (
            <div className="mb-3 p-2 rounded" style={{ backgroundColor: government.color + '20' }}>
              <p className="text-sm font-medium text-brazil-navy">
                <strong>Presidente:</strong> {government.president}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Partido:</strong> {government.party}
              </p>
            </div>
          )}
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm font-medium">
                <strong>{entry.name}:</strong> {' '}
                {typeof entry.value === 'number'
                  ? formatWithUnit(entry.value, entry.name || '')
                  : entry.value
                }
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const getYAxisDomain = (): [number, number] => {
    if (enabledToggles.length === 0) return [0, 100];
    
    let min = 0; // Always include zero
    let max = -Infinity;
    
    data.forEach(point => {
      enabledToggles.forEach(toggle => {
        const value = point[toggle.key] as number;
        if (typeof value === 'number' && !isNaN(value)) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });
    
    if (max === -Infinity) return [0, 100];
    
    // Ensure zero is always visible with some padding
    const padding = Math.abs(max - min) * 0.05;
    const finalMin = min < 0 ? Math.floor(min - padding) : 0;
    const finalMax = Math.ceil(max + padding);
    
    return [finalMin, finalMax];
  };

  return (
    <div id={chartId} className="w-full h-96 md:h-[500px] relative">
      {/* Presidency period indicators above the chart */}
      <div className="absolute top-0 h-3 z-10" style={{ left: '60px', right: '20px' }}>
        {presidencyPeriods.map((period, index) => {
          const chartStartYear = data[0]?.year || period.startYear;
          const chartEndYear = data[data.length - 1]?.year || period.endYear;
          const totalYears = chartEndYear - chartStartYear;
          
          const periodStart = Math.max(period.startYear, chartStartYear);
          const periodEnd = Math.min(period.endYear, chartEndYear);
          
          if (periodStart > periodEnd) return null;
          
          // Calculate position based on discrete year positions
          // Each year takes up 1/(totalYears) of the chart width
          // The position is calculated from the start of each year's section
          const yearWidth = 100 / (totalYears + 1); // +1 because we include both start and end years
          const startYearIndex = periodStart - chartStartYear;
          const endYearIndex = periodEnd - chartStartYear;
          
          const left = startYearIndex * yearWidth;
          const width = (endYearIndex - startYearIndex + 1) * yearWidth;
          
          return (
            <div
              key={index}
              className="absolute top-0 h-3 border-l-2 border-r-2 border-white/30 font-semibold text-blue-950 flex items-center justify-center"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: period.color,
              }}
              title={`${period.president} (${period.party}) - ${period.startYear}-${period.endYear}`}
            >
              {period.presidentNick !== 'D-T' ? 
                (<span className="text-[8px]">{period.presidentNick}</span>)
                :
                (<span className="text-[4px] sm:text-[8px]">{period.presidentNick}</span>
                )}
            </div>
          );
        })}
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 1, bottom: 60 }}>
          {/* Custom grid with party colors */}
          <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="2 2" />
          
          {/* X-axis with custom party-colored ticks */}
          <XAxis 
            dataKey="year" 
            axisLine={{ stroke: '#fff', strokeWidth: 2 }}
            tickLine={false}
            tick={<CustomXAxisTick />}
            interval="preserveStartEnd"
            height={60}
          />
          
          {/* Y-axis with zero line emphasis */}
          <YAxis 
            stroke="#fff"
            fontSize={12}
            domain={isLogScale ? ['auto', 'auto'] : getYAxisDomain()}
            scale={isLogScale ? 'log' : 'linear'}
            axisLine={{ stroke: '#fff', strokeWidth: 2 }}
            tickLine={{ stroke: '#fff', strokeWidth: 1 }}
            tick={{ fill: '#fff', fontSize: 12 }}
            tickFormatter={(value) => {
              if (!isLogScale && value === 0) return '0'; // Always show zero clearly in linear scale
              return formatAxisTick(value);
            }}
          />
          
          {/* Prominent zero reference line - only in linear scale */}
          {!isLogScale && (
            <ReferenceLine 
              y={0} 
              stroke="#FFEB3B" 
              strokeWidth={3} 
              strokeDasharray="5 5"
              label={{ 
                value: "ZERO", 
                position: "left", 
                style: { 
                  fill: '#FFEB3B', 
                  fontWeight: 'bold', 
                  fontSize: '12px',
                  textShadow: '0 0 3px rgba(0,0,0,0.8)'
                } 
              }}
            />
          )}
          
          {/* Historical event markers (optional) */}
          {showEvents && visibleEvents.map(event => (
            <ReferenceLine
              key={event.year}
              x={event.year}
              stroke="rgba(255,255,255,0.6)"
              strokeDasharray="4 4"
              label={{
                value: event.label,
                position: 'insideBottomLeft',
                angle: -90,
                offset: 12,
                style: { fill: 'rgba(255,255,255,0.75)', fontSize: '10px' }
              }}
            />
          ))}

          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#fff', paddingTop: '20px' }}
          />
          
          {enabledToggles.flatMap((toggle) => {
            // Check if global average data exists for this indicator
            const hasGlobalData = toggle.showGlobalAverage && data.some(point => point[`${toggle.key}_global`] !== undefined);

            const lines = [
              <Line
                key={toggle.key}
                type="monotone"
                dataKey={toggle.key}
                stroke={toggle.color}
                strokeWidth={3}
                dot={{ fill: toggle.color, strokeWidth: 2, r: 2.5 }}
                activeDot={{ r: 4, stroke: toggle.color, strokeWidth: 2, fill: '#fff' }}
                name={toggle.title}
                connectNulls={true}
                isAnimationActive={false}
              />,
            ];

            if (hasGlobalData) {
              lines.push(
                <Line
                  key={`${toggle.key}_global`}
                  type="monotone"
                  dataKey={`${toggle.key}_global`}
                  stroke={toggle.color}
                  strokeWidth={1.5}
                  strokeDasharray="8 4"
                  dot={false}
                  activeDot={{ r: 3, stroke: toggle.color, strokeWidth: 2, fill: '#fff' }}
                  name={`${toggle.title} (Média Global)`}
                  connectNulls={true}
                  legendType="plainline"
                  isAnimationActive={false}
                />,
              );
            }

            return lines;
          })}
        </LineChart>
      </ResponsiveContainer>
      
      <div className="absolute bottom-0 left-1.5 z-20 flex gap-2" data-export-button>
        {visibleEvents.length > 0 && (
          <button
            onClick={() => setShowEvents(!showEvents)}
            className={`rounded-lg border p-1.5 px-2 text-[9px] font-medium transition-all duration-200 sm:text-xs ${
              showEvents
                ? 'border-brazil-yellow-400 bg-brazil-yellow-400 text-brazil-navy hover:bg-brazil-yellow-300'
                : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
            }`}
            title={showEvents ? 'Ocultar eventos históricos' : 'Mostrar eventos históricos'}
          >
            Eventos
          </button>
        )}

        {enabledIndicatorInfo.length > 0 && (
          <button
            onClick={() => setShowIndicatorInfo(!showIndicatorInfo)}
            className={`rounded-lg border p-1.5 px-2 text-[9px] font-medium transition-all duration-200 sm:text-xs ${
              showIndicatorInfo
                ? 'border-brazil-yellow-400 bg-brazil-yellow-400 text-brazil-navy hover:bg-brazil-yellow-300'
                : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
            }`}
            aria-expanded={showIndicatorInfo}
            aria-controls={indicatorInfoId}
            title="Entenda os indicadores exibidos"
          >
            O que significa?
          </button>
        )}
      </div>

      {showIndicatorInfo && enabledIndicatorInfo.length > 0 && (
        <div
          id={indicatorInfoId}
          role="dialog"
          aria-label="Explicação dos indicadores"
          className="absolute bottom-20 left-1.5 z-30 max-h-64 w-[calc(100%-0.75rem)] max-w-md overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 text-brazil-navy shadow-2xl sm:bottom-24"
          data-export-button
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="font-bold">Entenda os indicadores</h3>
            <button
              type="button"
              onClick={() => setShowIndicatorInfo(false)}
              className="rounded px-1 text-lg leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              aria-label="Fechar explicação"
            >
              ×
            </button>
          </div>
          <div className="space-y-4">
            {enabledIndicatorInfo.map(({ toggle, info }) => (
              <section key={toggle.key}>
                <h4 className="text-sm font-bold" style={{ color: toggle.color }}>{toggle.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-gray-700">{info!.description}</p>
                {info!.interpretation && (
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    <strong>Como interpretar:</strong> {info!.interpretation}
                  </p>
                )}
              </section>
            ))}
          </div>
        </div>
      )}

      {/* Logarithmic Scale Toggle Button - only show if no negative values */}
      {canUseLogScale && (
        <button
          data-export-button
          onClick={() => setIsLogScale(!isLogScale)}
          className={`absolute bottom-9 sm:bottom-12 right-1.5 p-1.5 px-2 text-[9px] sm:text-xs font-medium rounded-lg border transition-all duration-200 z-20 ${
            isLogScale 
              ? 'bg-brazil-yellow-400 text-brazil-navy border-brazil-yellow-400 hover:bg-brazil-yellow-300' 
              : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
          }`}
          title={isLogScale ? 'Trocar para escala linear' : 'Trocar para escala logarítmica'}
        >
          {isLogScale ? 'Logarítmico' : 'Linear'}
        </button>
      )}

      {/* Export Button */}
      <ChartExportButton 
        chartId={chartId}
        className="bottom-0 right-1 z-10"
        chartData={{ data, toggles: enabledToggles, title }}
        fileName={`brasil-dados-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      />
    </div>
  );
};

export default Chart;
