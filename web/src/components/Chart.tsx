import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { ChartDataPoint, ToggleOption, PresidencyPeriod } from '../types';

interface ChartProps {
  data: ChartDataPoint[];
  toggles: ToggleOption[];
  title: string;
  presidencyPeriods: PresidencyPeriod[];
}

const Chart: React.FC<ChartProps> = ({ data, toggles, title, presidencyPeriods }) => {
  const enabledToggles = toggles.filter(toggle => toggle.enabled);

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
    <div className="w-full h-96 md:h-[500px] relative">
      {/* Presidency period indicators above the chart */}
      <div className="absolute top-0 h-3 z-10" style={{ left: '40px', right: '30px' }}>
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
              className="absolute top-0 h-3 border-l-2 border-r-2 border-white/30"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: period.color,
              }}
              title={`${period.president} (${period.party}) - ${period.startYear}-${period.endYear}`}
            />
          );
        })}
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
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
            domain={getYAxisDomain()}
            axisLine={{ stroke: '#fff', strokeWidth: 2 }}
            tickLine={{ stroke: '#fff', strokeWidth: 1 }}
            tick={{ fill: '#fff', fontSize: 12 }}
            tickFormatter={(value) => {
              if (value === 0) return '0'; // Always show zero clearly
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
          
          {/* Prominent zero reference line */}
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
          
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: '#fff', paddingTop: '20px' }}
          />
          
          {enabledToggles.map((toggle) => (
            <Line
              key={toggle.key}
              type="monotone"
              dataKey={toggle.key}
              stroke={toggle.color}
              strokeWidth={3}
              dot={{ fill: toggle.color, strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8, stroke: toggle.color, strokeWidth: 2, fill: '#fff' }}
              name={toggle.title}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
