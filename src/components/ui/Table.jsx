import React from 'react';
import Spinner from './Spinner';

const Table = ({ columns, data, actions, isLoading, compact = false, headerBg = 'bg-slate-100 border-b border-slate-200 text-slate-700' }) => {
    return (
        <div className="overflow-x-auto relative min-h-[200px] rounded-xl border border-slate-200/80 shadow-2xs bg-white">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center transition-all duration-300">
                    <div className="flex flex-col items-center gap-3">
                        <Spinner size="lg" color="indigo" />
                        <span className="text-sm font-medium text-slate-500 animate-pulse">Loading data...</span>
                    </div>
                </div>
            )}

            <table className={`min-w-full divide-y divide-slate-200/80 ${isLoading ? 'opacity-30' : 'transition-opacity duration-300'}`}>
                <thead className={`${headerBg} border-b border-slate-200`}>
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={`text-left font-bold text-slate-800 tracking-tight ${
                                    compact ? 'px-3 py-2 text-[11px]' : 'px-3 sm:px-4 py-2.5 text-xs sm:text-sm'
                                }`}
                            >
                                {column.header}
                            </th>
                        ))}
                        {actions && (
                            <th className={`text-left font-bold text-slate-800 tracking-tight ${
                                compact ? 'px-3 py-2 text-[11px]' : 'px-3 sm:px-4 py-2.5 text-xs sm:text-sm'
                            }`}>
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-slate-50/80 transition-colors">
                            {columns.map((column, colIndex) => (
                                <td key={colIndex} className={`whitespace-nowrap text-slate-900 ${
                                    compact ? 'px-3 py-1.5 text-xs' : 'px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm'
                                }`}>
                                    {column.render 
                                        ? column.render(row, rowIndex) 
                                        : typeof column.accessor === 'function' 
                                            ? column.accessor(row, rowIndex) 
                                            : row[column.accessor]}
                                </td>
                            ))}
                            {actions && (
                                <td className={`whitespace-nowrap ${
                                    compact ? 'px-2.5 py-1 text-xs' : 'px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm'
                                }`}>
                                    <div className="flex gap-1.5 sm:gap-2">
                                        {actions(row)}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {!isLoading && data.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="font-medium">No results found</p>
                    <p className="text-sm">Try adjusting your filters or search query</p>
                </div>
            )}
        </div>
    );
};

export default Table;
