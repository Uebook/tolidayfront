'use client';

import React, { useState } from 'react';
import { 
    Search, 
    Filter, 
    ChevronLeft, 
    ChevronRight, 
    MoreHorizontal,
    Plus,
    FileText,
    Edit,
    Trash2,
    Eye
} from 'lucide-react';

interface Column {
    header: string;
    accessor: string;
    render?: (item: any) => React.ReactNode;
}

interface DataTableProps {
    title: string;
    description?: string;
    columns: Column[];
    data: any[];
    onSearch?: (query: string) => void;
    onFilter?: (filter: string) => void;
    onAdd?: () => void;
    isLoading?: boolean;
    actions?: (item: any) => React.ReactNode;
}

export default function DataTable({
    title,
    description,
    columns,
    data,
    onSearch,
    onFilter,
    onAdd,
    isLoading,
    actions
}: DataTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentData = data.slice(startIndex, endIndex);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">{title}</h1>
                    {description && <p className="text-slate-500 text-sm font-medium mt-1">{description}</p>}
                </div>
                {onAdd && (
                    <button 
                        onClick={onAdd}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Plus size={18} />
                        Add New {title.slice(0, -1)}
                    </button>
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                {/* Table Toolbar */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80 group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search identification, names..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    onSearch?.(e.target.value);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600/50 transition-all"
                            />
                        </div>
                        <button className="p-2.5 bg-slate-50 border border-slate-100 text-slate-500 hover:text-blue-600 rounded-xl transition-all">
                            <Filter size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Status Tabs Style filters */}
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            {['All', 'Pending', 'Approved', 'Blocked'].map((tab) => (
                                <button 
                                    key={tab}
                                    onClick={() => onFilter?.(tab)}
                                    className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:bg-white/50"
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {columns.map((col, i) => (
                                    <th key={i} className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        {col.header}
                                    </th>
                                ))}
                                {actions && <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {columns.map((_, j) => (
                                            <td key={j} className="px-6 py-5">
                                                <div className="h-4 bg-slate-100 rounded-full w-2/3"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : currentData.length > 0 ? (
                                currentData.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                        {columns.map((col, j) => (
                                            <td key={j} className="px-6 py-5">
                                                {col.render ? col.render(item) : (
                                                    <span className="text-sm font-bold text-slate-700">{item[col.accessor]}</span>
                                                )}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    {actions(item)}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                                                <Search size={32} />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900">No results found</h3>
                                            <p className="text-slate-500 text-sm font-medium">Try adjusting your filters or search query.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Results: {totalItems > 0 ? startIndex + 1 : 0} - {endIndex} of {totalItems}
                        </span>
                        <select 
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 focus:outline-none"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                                const page = i + 1;
                                return (
                                    <button 
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === page 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && <span className="px-2 text-slate-300">...</span>}
                        </div>

                        <button 
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
