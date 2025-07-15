import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { ChartDataPoint, ToggleOption, PresidencyPeriod } from '../types';
import { ChartExportButton } from './ChartExportButton';

interface ChartProps {
  data: ChartDataPoint[];
  toggles: ToggleOption[];
  title: string;
  presidencyPeriods: PresidencyPeriod[];
}

const Chart: React.FC<ChartProps> = ({ data, toggles, title, presidencyPeriods }) => {
  const [isLogScale, setIsLogScale] = useState(true);
  const enabledToggles = toggles.filter(toggle => toggle.enabled && !toggle.isGroup);
  
  // Generate unique chart ID for export
  const chartId = `chart-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

  // Check if current data has negative values (incompatible with log scale)
  const hasNegativeValues = () => {
    return data.some(point => 
      enabledToggles.some(toggle => {
        const value = point[toggle.key] as number;
        return typeof value === 'number' && !isNaN(value) && value < 0;
      })
    );
  };

  // Auto-disable log scale if negative values are present
  const canUseLogScale = !hasNegativeValues();
  
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
                {typeof entry.value === 'number' ? 
                  entry.value.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) : entry.value
                }
                {entry.dataKey.includes('growth') || entry.dataKey.includes('inflation') || entry.dataKey.includes('unemployment') ? '%' : ''}
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
              if (value >= 1000000000) {
                return (value / 1000000000).toFixed(1) + 'B';
              } else if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
              } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
              }
              return value.toFixed(1);
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
          
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: '#fff', paddingTop: '20px' }}
          />
          
          {enabledToggles.map((toggle) => {
            // Check if global average data exists for this indicator
            const hasGlobalData = toggle.showGlobalAverage && data.some(point => point[`${toggle.key}_global`] !== undefined);
            
            return (
              <React.Fragment key={toggle.key}>
                {/* Main indicator line */}
                <Line
                  type="monotone"
                  dataKey={toggle.key}
                  stroke={toggle.color}
                  strokeWidth={3}
                  dot={{ fill: toggle.color, strokeWidth: 2, r: 2.5 }}
                  activeDot={{ r: 4, stroke: toggle.color, strokeWidth: 2, fill: '#fff' }}
                  name={toggle.title}
                  connectNulls={true}
                />
                
                {/* Global average line (dashed) if data exists */}
                {hasGlobalData && (
                  <Line
                    type="monotone"
                    dataKey={`${toggle.key}_global`}
                    stroke={toggle.color}
                    strokeWidth={1.5}
                    strokeDasharray="8 4"
                    dot={false}
                    activeDot={{ r: 3, stroke: toggle.color, strokeWidth: 2, fill: '#fff' }}
                    name={`${toggle.title} (Média Global)`}
                    connectNulls={true}
                    legendType='plainline'
                  />
                  // plainline' | 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye' | 'none'
                )}
              </React.Fragment>
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {/* Export Button */}
      <ChartExportButton 
        chartId={chartId}
        chartData={{ data, toggles: enabledToggles, title }}
        fileName={`brasil-dados-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      />
      
      {/* Logarithmic Scale Toggle Button - only show if no negative values */}
      {canUseLogScale && (
        <button
          data-export-button
          onClick={() => setIsLogScale(!isLogScale)}
          className={`absolute bottom-2 right-2 px-3 py-1 text-xs font-medium rounded-lg border transition-all duration-200 z-20 ${
            isLogScale 
              ? 'bg-brazil-yellow-400 text-brazil-navy border-brazil-yellow-400 hover:bg-brazil-yellow-300' 
              : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
          }`}
          title={isLogScale ? 'Trocar para escala linear' : 'Trocar para escala logarítmica'}
        >
          {isLogScale ? 'Logarítmico' : 'Linear'}
        </button>
      )}
    </div>
  );
};

export default Chart;
