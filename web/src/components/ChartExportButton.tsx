import React from 'react';
import { useChartExport } from '../hooks/useChartExport';

interface ChartExportButtonProps {
  chartId: string;
  chartData: any;
  fileName?: string;
  className?: string;
}

export const ChartExportButton: React.FC<ChartExportButtonProps> = ({
  chartId,
  chartData,
  fileName,
  className = '',
}) => {
  const { exportChart, downloadImage, isExporting } = useChartExport();

  const handleExport = async () => {
    try {
      const url = await exportChart(chartId, chartData, { fileName });
      downloadImage(url, fileName || `brasil-dados-chart-${Date.now()}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Falha ao exportar gráfico. Tente novamente.');
    }
  };

  return (
    <div className={`absolute ${className}`} data-export-button>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`
          bg-brazil-navy border border-white/30 rounded-lg shadow-sm
          hover:bg-blue-900 hover:shadow-md
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          flex items-center justify-center p-2
          text-gray-200
        `}
        title="Exportar gráfico"
      >
        {isExporting ? (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <svg 
              className="w-3 h-3 sm:w-4 sm:h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <span className="ml-2 text-[9px] sm:text-xs">Exportar Gráfico</span>
          </>
        )}
      </button>
    </div>
  );
};
