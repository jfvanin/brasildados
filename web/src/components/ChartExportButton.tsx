import React, { useState } from 'react';
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
  const { exportChart, copyUrlToClipboard, downloadImage, isExporting } = useChartExport();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (action: 'copy' | 'download') => {
    try {
      const url = await exportChart(chartId, chartData, { fileName });
      
      if (action === 'copy') {
        await copyUrlToClipboard(url);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else if (action === 'download') {
        downloadImage(url, fileName || `brasil-dados-chart-${Date.now()}`);
      }
      
      setShowMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Falha ao exportar gráfico. Tente novamente.');
    }
  };

  return (
    <div className={`relative ${className}`} data-export-button>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className={`
          absolute top-2 right-2 z-10
          bg-white border border-gray-300 rounded-lg shadow-sm
          hover:bg-gray-50 hover:shadow-md
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          flex items-center gap-2 px-3 py-2
          text-sm font-medium text-gray-700
        `}
        title="Exportar gráfico como imagem"
      >
        {isExporting ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Exportando...</span>
          </>
        ) : (
          <>
            <svg 
              className="w-4 h-4" 
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
            <span>Exportar</span>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </>
        )}
      </button>

      {/* Export Options Menu */}
      {showMenu && !isExporting && (
        <div className="absolute top-14 right-2 z-20 bg-white border border-gray-300 rounded-lg shadow-lg py-1 min-w-48">
          <button
            onClick={() => handleExport('download')}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Baixar imagem
          </button>
          <button
            onClick={() => handleExport('copy')}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Copiar como Data URL
          </button>
        </div>
      )}

      {showSuccess && (
        <div className="absolute top-14 right-2 z-20 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
            <span className="text-sm">Data URL copiada!</span>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};
