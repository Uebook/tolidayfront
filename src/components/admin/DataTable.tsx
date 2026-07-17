'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface Column {
  header: string;
  accessor: string;
  render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  title?: string;
  description?: string;
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  onSearch?: (val: string) => void;
  actions?: (row: any) => React.ReactNode;
  headerAction?: React.ReactNode;
  emptyMessage?: string;
  pageSize?: number;
}

export default function DataTable({
  title,
  description,
  columns,
  data,
  isLoading,
  onSearch,
  actions,
  headerAction,
  emptyMessage = 'No records found',
  pageSize = 15,
}: DataTableProps) {
  const [page, setPage] = useState(1);
  const [searchVal, setSearchVal] = useState('');

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const paginated = data.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (val: string) => {
    setSearchVal(val);
    setPage(1);
    onSearch?.(val);
  };

  const cols = actions
    ? [...columns, { header: 'Actions', accessor: '__actions' }]
    : columns;

  return (
    <div className="admin-table-wrapper">
      {/* Table header row */}
      {(title || onSearch || headerAction) && (
        <div className="admin-table-header">
          {/* Left: title + desc */}
          <div style={{ minWidth: 0 }}>
            {title && <div className="admin-table-title">{title}</div>}
            {description && <div className="admin-table-desc">{description}</div>}
          </div>

          {/* Right: search + action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {onSearch && (
              <div className="table-search">
                <Search size={13} style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }} />
                <input
                  value={searchVal}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Search..."
                />
              </div>
            )}
            {headerAction}
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              {cols.map((col, i) => (
                <th key={i}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={cols.length} style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 28, height: 28,
                      border: '2px solid hsl(var(--border))',
                      borderTopColor: 'hsl(var(--primary))',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={cols.length} style={{ textAlign: 'center', padding: '56px 20px' }}>
                  <div className="empty-state" style={{ padding: 0 }}>
                    <div style={{
                      width: 44, height: 44,
                      background: 'hsl(var(--muted))',
                      borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 10,
                    }}>
                      <Search size={18} style={{ color: 'hsl(var(--muted-foreground))' }} />
                    </div>
                    <div className="empty-state-title">{emptyMessage}</div>
                    <div className="empty-state-desc">Try adjusting your search or filters</div>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((row, ri) => (
                <tr key={row.id || ri}>
                  {columns.map((col, ci) => (
                    <td key={ci}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {actions && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          borderTop: '1px solid hsl(var(--border))',
          background: 'hsl(var(--muted) / 0.3)',
        }}>
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.length)} of {data.length}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-outline btn-icon"
              style={{ opacity: page === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (page <= 3) pageNum = i + 1;
                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`btn btn-icon ${page === pageNum ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: 12, fontWeight: 600 }}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-outline btn-icon"
              style={{ opacity: page === totalPages ? 0.4 : 1 }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
