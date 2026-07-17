'use client';

import React, { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import DataTable from '@/components/admin/DataTable';
import {
  TrendingUp, TrendingDown, IndianRupee, Activity,
  Building2, Download, BarChart2, Users, Percent
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type Period = '7d' | '30d' | '90d' | 'month' | 'year' | 'fy';

const PERIODS: { label: string; value: Period }[] = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'Financial Year', value: 'fy' },
];

function exportToCSV(data: any, period: string) {
  if (!data?.dailyData?.length) { toast.error('No data to export'); return; }
  const headers = ['Date', 'Revenue (₹)', 'Bookings', 'Cancellations', 'Occupancy %'];
  const rows = data.dailyData.map((d: any) => [d.date, d.revenue, d.bookings, d.cancellations, d.occupancy]);
  const csv = [headers, ...rows].map((r: any[]) => r.map((c: any) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `hotel_analytics_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
  toast.success('Report exported');
}

export default function HotelsAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');

  // Get all hotels to pick one for stats
  const { data: hotels = [] } = useQuery({
    queryKey: ['admin-hotels-list'],
    queryFn: async () => {
      const res = await api.get('/admin/hotels');
      return res.data;
    }
  });

  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const hotelId = selectedHotelId || hotels[0]?.id || '';

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['hotel-summary', hotelId],
    queryFn: async () => {
      if (!hotelId) return null;
      const res = await api.get(`/stats/summary?hotelId=${hotelId}`);
      return res.data;
    },
    enabled: !!hotelId,
  });

  const { data: reports, isLoading: loadingReports } = useQuery({
    queryKey: ['hotel-reports', hotelId, period],
    queryFn: async () => {
      if (!hotelId) return null;
      const res = await api.get(`/stats/reports?hotelId=${hotelId}&period=${period}`);
      return res.data;
    },
    enabled: !!hotelId,
  });

  const isLoading = loadingSummary || loadingReports;

  const formatCurrency = (val: number) => {
    if (!val) return '₹0';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const statCards = [
    {
      label: 'Revenue Generated',
      value: formatCurrency(reports?.totalRevenue || summary?.revenue || 0),
      change: '+12.4%',
      up: true,
      iconBg: '#dbeafe',
      iconColor: '#1d4ed8',
      Icon: IndianRupee,
    },
    {
      label: 'Total Bookings',
      value: reports?.totalBookings || summary?.totalBookings || 0,
      change: '+8.1%',
      up: true,
      iconBg: '#dcfce7',
      iconColor: '#16a34a',
      Icon: Activity,
    },
    {
      label: 'Avg Occupancy',
      value: `${reports?.avgOccupancy || 0}%`,
      change: '+5.2%',
      up: true,
      iconBg: '#f3e8ff',
      iconColor: '#9333ea',
      Icon: Percent,
    },
    {
      label: 'Avg Daily Rate (ADR)',
      value: `₹${summary?.adr || 0}`,
      change: `RevPAR: ₹${summary?.revpar || 0}`,
      up: true,
      iconBg: '#ffedd5',
      iconColor: '#ea580c',
      Icon: BarChart2,
    },
  ];

  const tableColumns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (d: any) => <span style={{ fontWeight: 600, fontSize: 13 }}>{d.date}</span>
    },
    {
      header: 'Revenue',
      accessor: 'revenue',
      render: (d: any) => (
        <span style={{ fontWeight: 700, color: '#16a34a' }}>
          ₹{Number(d.revenue).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Bookings',
      accessor: 'bookings',
      render: (d: any) => <span style={{ fontWeight: 600 }}>{d.bookings}</span>
    },
    {
      header: 'Cancellations',
      accessor: 'cancellations',
      render: (d: any) => (
        <span style={{ color: d.cancellations > 0 ? '#dc2626' : 'hsl(var(--muted-foreground))' }}>
          {d.cancellations}
        </span>
      )
    },
    {
      header: 'Occupancy',
      accessor: 'occupancy',
      render: (d: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            height: 6, width: 80,
            background: 'hsl(var(--muted))',
            borderRadius: 3, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${d.occupancy}%`,
              background: d.occupancy >= 70 ? '#16a34a' : d.occupancy >= 40 ? '#ca8a04' : '#dc2626',
              borderRadius: 3,
              transition: 'width 0.3s',
            }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{d.occupancy}%</span>
        </div>
      )
    },
  ];

  const topbarActions = (
    <div style={{ display: 'flex', gap: 8 }}>
      {hotels.length > 1 && (
        <select
          value={selectedHotelId}
          onChange={e => setSelectedHotelId(e.target.value)}
          style={{
            padding: '6px 10px',
            border: '1px solid hsl(var(--border))',
            borderRadius: 7,
            fontSize: 12,
            background: 'white',
            color: 'hsl(var(--foreground))',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {hotels.map((h: any) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      )}
      <button className="btn btn-success" onClick={() => exportToCSV(reports, period)} style={{ gap: 6 }}>
        <Download size={14} /> Export
      </button>
    </div>
  );

  return (
    <div>
      <Topbar title="Hotel Analytics & Reports" subtitle="Performance metrics, revenue insights, and occupancy data" actions={topbarActions} />

      <div className="admin-page animate-fadeIn">

        {/* Period filter */}
        <div style={{ marginBottom: 20 }}>
          <div className="period-pills">
            {PERIODS.map(p => (
              <button
                key={p.value}
                className={`period-pill ${period === p.value ? 'active' : ''}`}
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          {statCards.map((s, i) => (
            <div key={i} className="stat-card">
              <div>
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-value">
                  {isLoading
                    ? <div style={{ width: 80, height: 26, background: 'hsl(var(--muted))', borderRadius: 6 }} />
                    : s.value}
                </div>
                <div style={{ marginTop: 6 }}>
                  {s.up !== undefined && (
                    <span className={`stat-badge ${s.up ? 'stat-badge-up' : 'stat-badge-down'}`}>
                      {s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {s.change}
                    </span>
                  )}
                </div>
              </div>
              <div className="stat-card-icon" style={{ background: s.iconBg, color: s.iconColor }}>
                <s.Icon size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* No hotel found */}
        {!hotelId && !isLoading && (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <Building2 size={36} style={{ color: 'hsl(var(--muted-foreground))', margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 600, fontSize: 15 }}>No Hotels Found</div>
            <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>
              Add hotels first to view analytics.
            </div>
          </div>
        )}

        {/* Daily breakdown table */}
        {hotelId && (
          <DataTable
            title="Daily Performance Breakdown"
            description={`${reports?.dailyData?.length || 0} data points for selected period`}
            columns={tableColumns}
            data={reports?.dailyData || []}
            isLoading={isLoading}
            emptyMessage="No data for this period"
            pageSize={14}
          />
        )}

        {/* Booking sources */}
        {reports?.sourceData && (
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header">
              <div className="card-title">Booking Sources</div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                {reports.sourceData.map((s: any, i: number) => {
                  const colors = ['#dbeafe', '#dcfce7', '#f3e8ff', '#ffedd5'];
                  const textColors = ['#1d4ed8', '#16a34a', '#9333ea', '#ea580c'];
                  return (
                    <div key={i} style={{
                      padding: '14px 16px',
                      background: colors[i % colors.length],
                      borderRadius: 9,
                      display: 'flex', flexDirection: 'column', gap: 4,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: textColors[i % textColors.length] }}>{s.name}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: textColors[i % textColors.length] }}>{s.value}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
