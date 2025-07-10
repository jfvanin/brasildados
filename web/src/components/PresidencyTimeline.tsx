import React, { useState, useCallback, useRef } from 'react';
import { PresidencyPeriod, YearRange } from '../types';

interface PresidencyTimelineProps {
  periods: PresidencyPeriod[];
  startYear: number;
  endYear: number;
  selectedRange?: YearRange;
  onRangeChange?: (range: YearRange) => void;
  isInteractive?: boolean;
}

const PresidencyTimeline: React.FC<PresidencyTimelineProps> = ({ 
  periods, 
  startYear, 
  endYear, 
  selectedRange,
  onRangeChange,
  isInteractive = false
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [hoveredPeriod, setHoveredPeriod] = useState<PresidencyPeriod | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const totalYears = endYear - startYear + 1;
  // const displayStartYear = selectedRange?.startYear || startYear;
  // const displayEndYear = selectedRange?.endYear || endYear;

  // Helper function to get president image path
  const getPresidentImagePath = (presidentNick: string) => {
    const imageName = presidentNick.toLowerCase();
    // Images are now in public/img folder, accessible via URL path
    return `/img/${imageName}.jpg`;
  };

  // Mouse event handlers for tooltip
  const handleMouseEnter = (period: PresidencyPeriod, event: React.MouseEvent) => {
    setHoveredPeriod(period);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleTooltipMouseMove = useCallback((event: React.MouseEvent) => {
    if (hoveredPeriod) {
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  }, [hoveredPeriod]);

  const handleMouseLeave = () => {
    setHoveredPeriod(null);
  };

  const getYearFromPosition = useCallback((clientX: number) => {
    if (!timelineRef.current) return startYear;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    const year = Math.round(startYear + (percentage / 100) * totalYears);
    
    return Math.max(startYear, Math.min(endYear, year));
  }, [startYear, endYear, totalYears]);

  const handleMouseDown = useCallback((handle: 'start' | 'end', e: React.MouseEvent) => {
    if (!isInteractive || !onRangeChange) return;
    
    e.preventDefault();
    setIsDragging(handle);
  }, [isInteractive, onRangeChange]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !onRangeChange || !selectedRange) return;

    const newYear = getYearFromPosition(e.clientX);
    
    if (isDragging === 'start') {
      const newStartYear = Math.min(newYear, selectedRange.endYear - 1);
      onRangeChange({
        startYear: Math.max(startYear, newStartYear),
        endYear: selectedRange.endYear
      });
    } else if (isDragging === 'end') {
      const newEndYear = Math.max(newYear, selectedRange.startYear + 1);
      onRangeChange({
        startYear: selectedRange.startYear,
        endYear: Math.min(endYear, newEndYear)
      });
    }
  }, [isDragging, onRangeChange, selectedRange, getYearFromPosition, startYear, endYear]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
    // setDragOffset(0);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getHandlePosition = (year: number) => {
    return ((year - startYear) / totalYears) * 100;
  };

  const getEndHandlePosition = (year: number) => {
    return ((year + 1 - startYear) / totalYears) * 100;
  };

  return (
    <div className="mt-5 ml-2">
      <div className="flex items-center justify-between mb-3">
        {isInteractive && selectedRange && (
        <>
          <h4 className="text-white font-medium">Presidências</h4>
          <div className="text-white/70 text-sm">
            Período selecionado: {selectedRange.startYear} - {selectedRange.endYear}
          </div>
        </>
        )}
      </div>
      
      <div className="relative">
        {/* Main timeline */}
        <div 
          ref={timelineRef}
          className={`relative ${isInteractive ? 'h-16' : 'h-6'} bg-white/10 rounded-lg overflow-hidden select-none`}
        >
          {/* Background periods (dimmed when filtered) */}
          {periods.map((period, index) => {
            const width = ((Math.min(period.endYear, endYear) - Math.max(period.startYear, startYear) + 1) / totalYears) * 100;
            const left = ((Math.max(period.startYear, startYear) - startYear) / totalYears) * 100;
            
            if (width <= 0) return null;
            
            const isInSelectedRange = selectedRange ? 
              (period.endYear >= selectedRange.startYear && period.startYear <= selectedRange.endYear) : true;

            return (
              <div
                key={`bg-${index}`}
                className={`absolute top-0 h-full flex items-center justify-center text-xs font-medium border-r border-white/20 last:border-r-0 transition-opacity duration-200 cursor-pointer hover:opacity-90 ${
                  isInSelectedRange ? 'opacity-100' : 'opacity-30'
                }`}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: isInSelectedRange ? period.color : period.color + '40',
                  color: '#002147'
                }}
                onMouseEnter={(e) => !isInteractive && handleMouseEnter(period, e)}
                onMouseMove={handleTooltipMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <div className="text-center px-1">
                  <div className="font-bold truncate">{period.presidentNick}</div>
                  {isInteractive && (
                    <>
                        <div className="text-xs opacity-80">{period.party}</div>
                        <div className="text-xs opacity-60">{period.startYear}-{period.endYear}</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Range overlay for selected area */}
          {isInteractive && selectedRange && (
            <div
              className="absolute top-0 h-full bg-white/20 border-2 border-brazil-yellow-400 pointer-events-none"
              style={{
                left: `${getHandlePosition(selectedRange.startYear)}%`,
                width: `${getEndHandlePosition(selectedRange.endYear) - getHandlePosition(selectedRange.startYear)}%`,
              }}
            />
          )}
        </div>

        {/* Draggable handles */}
        {isInteractive && selectedRange && onRangeChange && (
          <>
            {/* Start handle */}
            <div
              className="absolute top-0 w-4 h-16 bg-brazil-yellow-400 rounded-l cursor-ew-resize shadow-lg transform -translate-x-2 hover:bg-brazil-yellow-300 transition-colors duration-200 z-10"
              style={{
                left: `${getHandlePosition(selectedRange.startYear)}%`,
              }}
              onMouseDown={(e) => handleMouseDown('start', e)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-8 bg-brazil-navy rounded"></div>
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium bg-brazil-navy px-2 py-1 rounded">
                {selectedRange.startYear}
              </div>
            </div>

            {/* End handle */}
            <div
              className="absolute top-0 w-4 h-16 bg-brazil-yellow-400 rounded-r cursor-ew-resize shadow-lg transform -translate-x-4 hover:bg-brazil-yellow-300 transition-colors duration-200 z-10"
              style={{
                left: `${getEndHandlePosition(selectedRange.endYear)}%`,
              }}
              onMouseDown={(e) => handleMouseDown('end', e)}
            >
              <div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-8 bg-brazil-navy rounded"></div>
                </div>
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium bg-brazil-navy px-2 py-1 rounded">
                {selectedRange.endYear}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Year markers */}
    <div className={`relative mt-8 ${isInteractive ? 'h-6' : 'h-2'}`}>
      {Array.from({ length: Math.ceil(totalYears / 5) + 1 }, (_, i) => {
        const year = startYear + (i * 5);
        if (year > endYear) return null;
        
        const position = ((year - startYear) / totalYears) * 100;
        const isInRange = selectedRange ? 
        (year >= selectedRange.startYear && year <= selectedRange.endYear) : true;
        
        return (
        <div
          key={year}
          className={`absolute text-xs transition-opacity duration-200 ${
            isInRange ? 'text-white/90 font-medium' : 'text-white/40'
          }`}
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          {year}
        </div>
        );
      })}
    </div>

    {/* President Tooltip */}
    {hoveredPeriod && (
      <div 
        className="fixed z-50 pointer-events-none"
        style={{
          left: `${Math.min(tooltipPosition.x + 15, window.innerWidth - 320)}px`,
          top: `${Math.min(tooltipPosition.y + 15, window.innerHeight - 150)}px`,
        }}
      >
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-xs min-w-[280px]">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16">
              <img 
                src={getPresidentImagePath(hoveredPeriod.presidentNick)}
                alt={`${hoveredPeriod.president} - Presidente do Brasil`}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                onError={(e) => {
                  // Fallback if image doesn't exist - show a placeholder
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const placeholder = target.nextElementSibling as HTMLElement;
                  if (placeholder) {
                    placeholder.style.display = 'flex';
                  }
                }}
              />
              <div 
                className="absolute inset-0 bg-gradient-to-br from-brazil-green-500 to-brazil-yellow-400 rounded-full border-2 border-gray-300 shadow-sm items-center justify-center text-white font-bold text-lg"
                style={{ display: 'none' }}
              >
                {hoveredPeriod.presidentNick.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-sm leading-tight">{hoveredPeriod.president}</h4>
              <p className="text-xs text-gray-600 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {hoveredPeriod.party}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                {hoveredPeriod.startYear} - {hoveredPeriod.endYear}
                <span className="text-gray-400">({hoveredPeriod.endYear - hoveredPeriod.startYear + 1} anos)</span>
              </p>
              {/* Debug info - remove later */}
              <p className="text-xs text-gray-400 mt-1">
                Debug: x:{tooltipPosition.x}, y:{tooltipPosition.y}
              </p>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default PresidencyTimeline;
