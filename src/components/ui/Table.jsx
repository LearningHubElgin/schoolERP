import React from 'react';
import Spinner from './Spinner';

const Table = ({ columns, data, actions, isLoading }) => {
    return (
        <div className="overflow-x-auto relative min-h-[200px]">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center transition-all duration-300">
                    <div className="flex flex-col items-center gap-3">
                        <Spinner size="lg" color="indigo" />
                        <span className="text-sm font-medium text-slate-500 animate-pulse">Loading data...</span>
                    </div>
                </div>
            )}

            <table className={`min-w-full divide-y divide-gray-200 ${isLoading ? 'opacity-30' : 'transition-opacity duration-300'}`}>
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider"
                            >
                                {column.header}
                            </th>
                        ))}
                        {actions && (
                            <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                            {columns.map((column, colIndex) => (
                                <td key={colIndex} className="px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                    {column.render ? column.render(row, rowIndex) : row[column.accessor]}
                                </td>
                            ))}
                            {actions && (
                                <td className="px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap text-xs sm:text-sm">
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
