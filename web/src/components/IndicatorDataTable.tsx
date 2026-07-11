import Link from 'next/link';
import { indicatorSlug } from '../data/chartConfig';
import { dataService } from '../services/dataService';
import { ToggleOption } from '../types';

interface IndicatorDataTableProps {
  category: string;
  indicators: ToggleOption[];
}

const displayValue = (value: string | number | null) =>
  value === null || value === '' ? '—' : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 }).format(Number(value));

export default function IndicatorDataTable({ category, indicators }: IndicatorDataTableProps) {
  const publicIndicators = indicators.filter(indicator => !indicator.isGroup);

  return (
    <details className="mt-6 rounded-xl border border-white/20 bg-black/20 text-white">
      <summary className="cursor-pointer px-4 py-3 font-semibold hover:bg-white/5">
        Ver dados de {category} em tabela
      </summary>
      <div className="max-h-[36rem] overflow-auto border-t border-white/20">
        <table className="w-full border-collapse text-left text-xs">
          <caption className="sr-only">Séries históricas completas de {category}</caption>
          <thead className="sticky top-0 bg-brazil-navy">
            <tr>
              <th scope="col" className="px-3 py-2">Ano</th>
              <th scope="col" className="px-3 py-2">Indicador</th>
              <th scope="col" className="px-3 py-2">Valor Brasil</th>
              <th scope="col" className="px-3 py-2">Média global</th>
              <th scope="col" className="px-3 py-2">Fonte</th>
            </tr>
          </thead>
          <tbody>
            {publicIndicators.flatMap(indicator =>
              dataService.getIndicatorSeries(indicator.key).map(row => (
                <tr key={`${indicator.key}-${row.year}`} className="border-t border-white/10 odd:bg-white/[0.03]">
                  <th scope="row" className="whitespace-nowrap px-3 py-2 font-medium">{row.year}</th>
                  <td className="px-3 py-2">
                    <Link className="underline decoration-white/40 hover:decoration-white" href={`/indicadores/${indicatorSlug(indicator.key)}`}>
                      {indicator.title}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{displayValue(row.value)}</td>
                  <td className="whitespace-nowrap px-3 py-2">{displayValue(row.globalAverage)}</td>
                  <td className="max-w-sm px-3 py-2 text-white/70">{row.source || 'Não informada'}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </details>
  );
}
