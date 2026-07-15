import React from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { LoadingSkeleton } from './LoadingSkeleton';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T, index: number) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  pagination?: React.ReactNode;
}

export function DataTable<T>({ data, columns, loading, emptyState, pagination }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200/75 rounded-2xl overflow-hidden shadow-sm">
        <LoadingSkeleton />
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="bg-white border border-slate-200/75 rounded-2xl overflow-hidden shadow-sm">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/75 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75">
              {columns.map((col, index) => (
                <th 
                  key={col.key || index} 
                  className={`p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap ${col.headerClassName || ''}`}
                >
                  <div className="inline-flex items-center gap-1.5">
                    {col.header} 
                    {index !== 0 && index !== columns.length - 1 && (
                       <ChevronsUpDown size={12} className="text-slate-300" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                {columns.map((col, colIndex) => (
                  <td 
                    key={col.key || colIndex} 
                    className={`p-4 text-sm ${col.cellClassName || ''}`}
                  >
                    {col.cell(item, rowIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination}
    </div>
  );
}
