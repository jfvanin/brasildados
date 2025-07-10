import React from 'react';

interface YearRangeControlsProps {
  selectedRange: { startYear: number; endYear: number };
  totalRange: { startYear: number; endYear: number };
  onReset: () => void;
}

const YearRangeControls: React.FC<YearRangeControlsProps> = ({ selectedRange, totalRange, onReset }) => {
  const isFiltered = selectedRange.startYear !== totalRange.startYear || selectedRange.endYear !== totalRange.endYear;
  const selectedYears = selectedRange.endYear - selectedRange.startYear + 1;
  const totalYears = totalRange.endYear - totalRange.startYear + 1;

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <div className="text-white/80">
        <span className="font-medium">Período selecionado:</span> {selectedRange.startYear} - {selectedRange.endYear}
        <span className="ml-2 text-white/60">({selectedYears} anos de {totalYears})</span>
      </div>
      
      {isFiltered && (
        <button
          onClick={onReset}
          className="px-2 py-1 -mb-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 border border-white/30 hover:border-white/50"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Resetar
          </span>
        </button>
      )}
    </div>
  );
};

export default YearRangeControls;
