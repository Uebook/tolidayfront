'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import {
  BarChart2, FileText, DollarSign, Users, Store, RefreshCw,
  Receipt, Percent, MapPin, TrendingUp, Download, Calendar,
  Building2, Bus, CarFront, Map, ChevronDown, Filter, Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
type ReportTab =
  | 'sales' | 'booking' | 'revenue' | 'vendor' | 'customer'
  | 'refund' | 'tax' | 'commission' | 'destinations' | 'peak';

const TABS: { key: ReportTab; label: string; Icon: any }[] = [
  { key: 'sales', label: 'Sales Report', Icon: BarChart2 },
  { key: 'booking', label: 'Booking Report', Icon: FileText },
  { key: 'revenue', label: 'Revenue Report', Icon: DollarSign },
  { key: 'vendor', label: 'Vendor Report', Icon: Store },
  { key: 'customer', label: 'Customer Report', Icon: Users },
  { key: 'refund', label: 'Refund Report', Icon: RefreshCw },
  { key: 'tax', label: 'Tax Report', Icon: Receipt },
  { key: 'commission', label: 'Commission Report', Icon: Percent },
  { key: 'destinations', label: 'Top Destinations', Icon: MapPin },
  { key: 'peak', label: 'Peak Season Analysis', Icon: TrendingUp },
];

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const VERTICALS = ['All', 'Hotel', 'Packages', 'Buses', 'Cabs'];

function fmt(n: number) {
  if (!n) return '₹0';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function exportCSV(rows: any[][], filename: string) {
  const csv = rows.map(r => r.map((c: any) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success('Report exported');
}

// ─── Mini bar chart component ─────────────────────────────────────────────────
function MiniBar({ values, labels, color = '#3b82f6' }: { values: number[]; labels: string[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, padding: '8px 0' }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div
            style={{
              width: '100%', borderRadius: '4px 4px 0 0',
              background: `${color}33`,
              height: `${(v / max) * 90}px`,
              transition: 'all 0.5s',
              cursor: 'default',
              position: 'relative',
            }}
            title={`${labels[i]}: ${v}`}
          >
            <div style={{ position: 'absolute', inset: 0, background: color, borderRadius: '4px 4px 0 0', opacity: 0.85 }} />
          </div>
          <span style={{ fontSize: 9, color: 'hsl(var(--muted-foreground))', fontWeight: 700 }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value, sub, color = '#3b82f6' }: any) {
  return (
    <div style={{
      background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border))',
      borderRadius: 12, padding: '16px 20px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales');
  const [vertical, setVertical] = useState('All');
  const [year, setYear] = useState('2026');
  const [startMonth, setStartMonth] = useState('0');
  const [endMonth, setEndMonth] = useState('11');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all bookings
  const { data: rawBookings = [], isLoading: isBookingsLoading } = useQuery({
    queryKey: ['reports-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/admin/all');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    }
  });

  // Fetch hotels (vendors)
  const { data: hotels = [] } = useQuery({
    queryKey: ['reports-hotels'],
    queryFn: async () => {
      const res = await api.get('/admin/hotels');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    }
  });

  // Fetch consumers
  const { data: consumers = [] } = useQuery({
    queryKey: ['reports-consumers'],
    queryFn: async () => {
      const res = await api.get('/bookings/admin/consumers');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    }
  });

  // Filter bookings
  const bookings: any[] = useMemo(() => {
    return rawBookings.filter((b: any) => {
      const date = new Date(b.createdAt || b.startDate);
      const yr = date.getFullYear().toString();
      const mo = date.getMonth();
      const vertMatch = vertical === 'All' || (b.vertical || b.type || '').toLowerCase() === vertical.toLowerCase();
      const monthMatch = mo >= parseInt(startMonth) && mo <= parseInt(endMonth);
      
      const sq = searchQuery.toLowerCase();
      const searchMatch = !sq || 
        (b.guestName || '').toLowerCase().includes(sq) ||
        (b.bookingReference || '').toLowerCase().includes(sq) ||
        (b.hotelName || b.vendorName || '').toLowerCase().includes(sq) ||
        (b.location || b.city || b.hotelCity || '').toLowerCase().includes(sq);

      return yr === year && vertMatch && monthMatch && searchMatch;
    });
  }, [rawBookings, year, vertical, startMonth, endMonth, searchQuery]);

  // ─── Computed Metrics ───────────────────────────────────────────────────────
  const monthlyRevenue = useMemo(() => {
    const arr = Array(12).fill(0);
    bookings.forEach((b: any) => {
      const m = new Date(b.createdAt || b.startDate).getMonth();
      arr[m] += Number(b.totalAmount || 0);
    });
    return arr;
  }, [bookings]);

  const monthlyCount = useMemo(() => {
    const arr = Array(12).fill(0);
    bookings.forEach((b: any) => {
      const m = new Date(b.createdAt || b.startDate).getMonth();
      arr[m] += 1;
    });
    return arr;
  }, [bookings]);

  const totalRevenue = monthlyRevenue.reduce((a, b) => a + b, 0);
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b: any) => b.status === 'CONFIRMED').length;
  const cancelledBookings = bookings.filter((b: any) => b.status === 'CANCELLED').length;
  const pendingBookings = bookings.filter((b: any) => b.status === 'PENDING').length;
  const avgOrderValue = totalBookings ? Math.round(totalRevenue / totalBookings) : 0;
  const totalTax = Math.round(totalRevenue * 0.18);
  const totalCommission = Math.round(totalRevenue * 0.15);
  const totalRefunds = bookings.filter((b: any) => b.status === 'CANCELLED').reduce((s: number, b: any) => s + Number(b.totalAmount || 0), 0);

  // Top destinations
  const destinationMap: Record<string, number> = {};
  bookings.forEach((b: any) => {
    const loc = b.location || b.city || b.hotelCity || 'Unknown';
    destinationMap[loc] = (destinationMap[loc] || 0) + 1;
  });
  const topDestinations = Object.entries(destinationMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Peak months
  const peakMonths = monthlyRevenue
    .map((v, i) => ({ month: MONTH_LABELS[i], revenue: v, count: monthlyCount[i] }))
    .sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  // Vendor breakdown
  const vendorMap: Record<string, { name: string; bookings: number; revenue: number }> = {};
  bookings.forEach((b: any) => {
    const key = b.hotelId || b.vendorId || 'unknown';
    const name = b.hotelName || b.vendorName || 'Unknown Vendor';
    if (!vendorMap[key]) vendorMap[key] = { name, bookings: 0, revenue: 0 };
    vendorMap[key].bookings += 1;
    vendorMap[key].revenue += Number(b.totalAmount || 0);
  });
  const topVendors = Object.values(vendorMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Customer segments
  const topCustomers = consumers
    .slice()
    .sort((a: any, b: any) => Number(b.ltv || 0) - Number(a.ltv || 0))
    .slice(0, 10);

  // Refunds list
  const refundList = bookings.filter((b: any) => b.status === 'CANCELLED').slice(0, 20);

  // ─── Export helpers ─────────────────────────────────────────────────────────
  function doExport() {
    switch (activeTab) {
      case 'sales':
        exportCSV(
          [['Month', 'Revenue', 'Bookings', 'Avg Order Value'],
          ...monthlyRevenue.map((r, i) => [MONTH_LABELS[i], r, monthlyCount[i], monthlyCount[i] ? Math.round(r / monthlyCount[i]) : 0])],
          `sales_report_${year}.csv`
        );
        break;
      case 'booking':
        exportCSV(
          [['Reference', 'Guest', 'Type', 'Check-In', 'Check-Out', 'Amount', 'Status'],
          ...bookings.map((b: any) => [b.bookingReference, b.guestName, b.vertical || b.type || 'Hotel', b.startDate, b.endDate, b.totalAmount, b.status])],
          `booking_report_${year}.csv`
        );
        break;
      case 'vendor':
        exportCSV(
          [['Vendor Name', 'Total Bookings', 'Total Revenue'],
          ...topVendors.map(v => [v.name, v.bookings, v.revenue])],
          `vendor_report_${year}.csv`
        );
        break;
      case 'customer':
        exportCSV(
          [['Name', 'Email', 'Phone', 'LTV'],
          ...topCustomers.map((c: any) => [c.name, c.email, c.phone, c.ltv])],
          `customer_report_${year}.csv`
        );
        break;
      case 'revenue':
        exportCSV(
          [['Month', 'Gross Revenue', 'Tax', 'Commission', 'Net Revenue'],
          ...monthlyRevenue.map((r, i) => [MONTH_LABELS[i], r, Math.round(r * 0.18), Math.round(r * 0.15), Math.round(r * 0.67)])],
          `revenue_report_${year}.csv`
        );
        break;
      case 'refund':
        exportCSV(
          [['Reference', 'Guest', 'Amount', 'Status'],
          ...refundList.map((b: any) => [b.bookingReference, b.guestName, b.totalAmount, b.status])],
          `refund_report_${year}.csv`
        );
        break;
      case 'tax':
        exportCSV(
          [['Month', 'Revenue', 'Tax Amount'],
          ...monthlyRevenue.map((r, i) => [MONTH_LABELS[i], r, Math.round(r * 0.18)])],
          `tax_report_${year}.csv`
        );
        break;
      case 'commission':
        exportCSV(
          [['Month', 'Revenue', 'Commission Amount'],
          ...monthlyRevenue.map((r, i) => [MONTH_LABELS[i], r, Math.round(r * 0.15)])],
          `commission_report_${year}.csv`
        );
        break;
      case 'destinations':
        exportCSV(
          [['Destination', 'Bookings'],
          ...topDestinations.map(d => [d[0], d[1]])],
          `destinations_report_${year}.csv`
        );
        break;
      case 'peak':
        exportCSV(
          [['Month', 'Revenue', 'Bookings'],
          ...peakMonths.map(p => [p.month, p.revenue, p.count])],
          `peak_season_report_${year}.csv`
        );
        break;
      default:
        toast.error('Export not implemented for this tab');
    }
  }

  const topbarActions = (
    <button onClick={doExport} className="btn btn-outline" style={{ gap: 6 }}>
      <Download size={14} /> Export CSV
    </button>
  );

  return (
    <div>
      <Topbar title="Reports & Analytics" subtitle="Comprehensive business intelligence across all verticals" actions={topbarActions} />

      <div className="admin-page animate-fadeIn">

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
              background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))', outline: 'none',
            }}
          >
            {['2026', '2025', '2024', '2023'].map(y => <option key={y} value={y}>FY {y}</option>)}
          </select>
          <select
            value={startMonth}
            onChange={e => setStartMonth(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
              background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))', outline: 'none',
            }}
          >
            {MONTH_LABELS.map((m, i) => <option key={`start-${i}`} value={i}>From {m}</option>)}
          </select>
          <select
            value={endMonth}
            onChange={e => setEndMonth(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
              background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))', outline: 'none',
            }}
          >
            {MONTH_LABELS.map((m, i) => <option key={`end-${i}`} value={i}>To {m}</option>)}
          </select>
          <select
            value={vertical}
            onChange={e => setVertical(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
              background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))', outline: 'none',
            }}
          >
            {VERTICALS.map(v => <option key={v} value={v}>{v === 'All' ? 'All Verticals' : v}</option>)}
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-foreground"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', gap: 4, flexWrap: 'wrap',
          padding: '6px', background: 'hsl(var(--muted) / 0.3)',
          borderRadius: 14, border: '1px solid hsl(var(--border))',
          marginBottom: 24,
        }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                background: activeTab === tab.key ? 'hsl(var(--primary))' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'hsl(var(--muted-foreground))',
                transition: 'all 0.2s',
              }}
            >
              <tab.Icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Sales Report ── */}
        {activeTab === 'sales' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <StatPill label="Gross Sales" value={fmt(totalRevenue)} sub={`${totalBookings} orders`} color="#3b82f6" />
              <StatPill label="Avg Order Value" value={fmt(avgOrderValue)} sub="per booking" color="#8b5cf6" />
              <StatPill label="Confirmed" value={confirmedBookings} sub="bookings" color="#16a34a" />
              <StatPill label="Cancelled" value={cancelledBookings} sub="orders" color="#ef4444" />
            </div>
            <div className="card p-6">
              <div className="card-title mb-4">Monthly Sales Volume ({year})</div>
              <MiniBar values={monthlyRevenue} labels={MONTH_LABELS} color="#3b82f6" />
              <div className="overflow-x-auto mt-4">
                <table className="admin-table w-full">
                  <thead><tr><th>Month</th><th>Bookings</th><th>Revenue</th><th>Avg Value</th></tr></thead>
                  <tbody>
                    {monthlyRevenue.map((r, i) => (
                      <tr key={i}>
                        <td className="font-bold">{MONTH_LABELS[i]}</td>
                        <td>{monthlyCount[i]}</td>
                        <td className="font-black text-blue-500">{fmt(r)}</td>
                        <td>{monthlyCount[i] ? fmt(Math.round(r / monthlyCount[i])) : '—'}</td>
                      </tr>
                    ))}
                    <tr style={{ background: 'hsl(var(--muted) / 0.3)', fontWeight: 900 }}>
                      <td>TOTAL</td>
                      <td>{totalBookings}</td>
                      <td className="text-blue-500">{fmt(totalRevenue)}</td>
                      <td>{fmt(avgOrderValue)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Booking Report ── */}
        {activeTab === 'booking' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              <StatPill label="Total Bookings" value={totalBookings} color="#3b82f6" />
              <StatPill label="Confirmed" value={confirmedBookings} sub={`${totalBookings ? Math.round((confirmedBookings / totalBookings) * 100) : 0}%`} color="#16a34a" />
              <StatPill label="Pending" value={pendingBookings} color="#f59e0b" />
              <StatPill label="Cancelled" value={cancelledBookings} sub={`${totalBookings ? Math.round((cancelledBookings / totalBookings) * 100) : 0}%`} color="#ef4444" />
            </div>
            <div className="card p-6">
              <div className="card-title mb-4">Monthly Booking Volume ({year})</div>
              <MiniBar values={monthlyCount} labels={MONTH_LABELS} color="#8b5cf6" />
              <div className="overflow-x-auto mt-4">
                <table className="admin-table w-full">
                  <thead>
                    <tr><th>Ref</th><th>Guest</th><th>Type</th><th>Check-In</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 20).map((b: any, i) => (
                      <tr key={i}>
                        <td className="font-black text-blue-500 text-xs">{b.bookingReference || '—'}</td>
                        <td className="text-xs">{b.guestName || '—'}</td>
                        <td><span className="badge badge-muted text-[9px]">{(b.vertical || b.type || 'Hotel').toUpperCase()}</span></td>
                        <td className="text-xs text-zinc-400">{b.startDate || '—'}</td>
                        <td className="font-bold">{fmt(Number(b.totalAmount || 0))}</td>
                        <td><span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : b.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>{b.status}</span></td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-10 text-xs text-zinc-400">No bookings found for {year}.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Revenue Report ── */}
        {activeTab === 'revenue' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <StatPill label="Gross Revenue" value={fmt(totalRevenue)} color="#16a34a" />
              <StatPill label="Net Revenue" value={fmt(totalRevenue - totalTax)} sub="after GST" color="#3b82f6" />
              <StatPill label="Platform Commission" value={fmt(totalCommission)} sub="15%" color="#8b5cf6" />
              <StatPill label="Total Tax (GST)" value={fmt(totalTax)} sub="18% GST" color="#f59e0b" />
            </div>
            <div className="card p-6">
              <div className="card-title mb-4">Revenue Breakdown by Month ({year})</div>
              <MiniBar values={monthlyRevenue} labels={MONTH_LABELS} color="#16a34a" />
              <div className="overflow-x-auto mt-4">
                <table className="admin-table w-full">
                  <thead><tr><th>Month</th><th>Gross</th><th>GST (18%)</th><th>Commission (15%)</th><th>Net</th></tr></thead>
                  <tbody>
                    {monthlyRevenue.map((r, i) => (
                      <tr key={i}>
                        <td className="font-bold">{MONTH_LABELS[i]}</td>
                        <td className="font-black text-green-500">{fmt(r)}</td>
                        <td className="text-yellow-500">{fmt(Math.round(r * 0.18))}</td>
                        <td className="text-purple-500">{fmt(Math.round(r * 0.15))}</td>
                        <td className="font-black text-blue-500">{fmt(Math.round(r * 0.67))}</td>
                      </tr>
                    ))}
                    <tr style={{ background: 'hsl(var(--muted) / 0.3)', fontWeight: 900 }}>
                      <td>TOTAL</td>
                      <td className="text-green-500">{fmt(totalRevenue)}</td>
                      <td className="text-yellow-500">{fmt(totalTax)}</td>
                      <td className="text-purple-500">{fmt(totalCommission)}</td>
                      <td className="text-blue-500">{fmt(Math.round(totalRevenue * 0.67))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Vendor Report ── */}
        {activeTab === 'vendor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <StatPill label="Total Vendors" value={hotels.length} color="#3b82f6" />
              <StatPill label="Active Partners" value={topVendors.length} color="#16a34a" />
              <StatPill label="Top Partner Revenue" value={fmt(topVendors[0]?.revenue || 0)} color="#8b5cf6" />
            </div>
            <div className="card p-6">
              <div className="card-title mb-4">Vendor Performance Ranking ({year})</div>
              <div className="overflow-x-auto">
                <table className="admin-table w-full">
                  <thead><tr><th>#</th><th>Vendor / Hotel</th><th>Bookings</th><th>Revenue</th><th>Avg/Booking</th></tr></thead>
                  <tbody>
                    {topVendors.map((v, i) => (
                      <tr key={i}>
                        <td className="font-black text-zinc-400">#{i + 1}</td>
                        <td className="font-bold">{v.name}</td>
                        <td>{v.bookings}</td>
                        <td className="font-black text-green-500">{fmt(v.revenue)}</td>
                        <td>{fmt(v.bookings ? Math.round(v.revenue / v.bookings) : 0)}</td>
                      </tr>
                    ))}
                    {topVendors.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-10 text-xs text-zinc-400">No vendor data for {year}.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Customer Report ── */}
        {activeTab === 'customer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <StatPill label="Total Customers" value={consumers.length} color="#3b82f6" />
              <StatPill label="Repeat Buyers" value={consumers.filter((c: any) => (c.totalBookings || 0) > 1).length} color="#16a34a" />
              <StatPill label="Total LTV" value={fmt(consumers.reduce((s: number, c: any) => s + Number(c.ltv || 0), 0))} color="#8b5cf6" />
            </div>
            <div className="card p-6">
              <div className="card-title mb-4">Top 10 Customers by Lifetime Value</div>
              <div className="overflow-x-auto">
                <table className="admin-table w-full">
                  <thead><tr><th>#</th><th>Customer</th><th>Email</th><th>Bookings</th><th>LTV</th></tr></thead>
                  <tbody>
                    {topCustomers.map((c: any, i: number) => (
                      <tr key={i}>
                        <td className="font-black text-zinc-400">#{i + 1}</td>
                        <td className="font-bold">{c.name || '—'}</td>
                        <td className="text-xs text-zinc-400">{c.email || '—'}</td>
                        <td>{c.totalBookings || 0}</td>
                        <td className="font-black text-green-500">{fmt(Number(c.ltv || 0))}</td>
                      </tr>
                    ))}
                    {topCustomers.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-10 text-xs text-zinc-400">No customer data available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Refund Report ── */}
        {activeTab === 'refund' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <StatPill label="Total Refunds" value={cancelledBookings} color="#ef4444" />
              <StatPill label="Refund Amount" value={fmt(totalRefunds)} color="#ef4444" />
              <StatPill label="Refund Rate" value={`${totalBookings ? Math.round((cancelledBookings / totalBookings) * 100) : 0}%`} color="#f59e0b" />
            </div>
            <div className="card p-6">
              <div className="card-title mb-4">Refund & Cancellation Records ({year})</div>
              <div className="overflow-x-auto">
                <table className="admin-table w-full">
                  <thead><tr><th>Ref</th><th>Guest</th><th>Cancelled On</th><th>Refund Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {refundList.map((b: any, i) => (
                      <tr key={i}>
                        <td className="font-black text-red-400 text-xs">{b.bookingReference || '—'}</td>
                        <td className="text-xs">{b.guestName || '—'}</td>
                        <td className="text-xs text-zinc-400">{b.updatedAt ? new Date(b.updatedAt).toLocaleDateString('en-IN') : '—'}</td>
                        <td className="font-black text-red-500">{fmt(Number(b.totalAmount || 0))}</td>
                        <td><span className="badge badge-danger">CANCELLED</span></td>
                      </tr>
                    ))}
                    {refundList.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-10 text-xs text-zinc-400">No refunds for {year}.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Tax Report ── */}
        {activeTab === 'tax' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <StatPill label="Total Tax Collected" value={fmt(totalTax)} sub="18% GST" color="#f59e0b" />
              <StatPill label="CGST (9%)" value={fmt(Math.round(totalRevenue * 0.09))} color="#f59e0b" />
              <StatPill label="SGST (9%)" value={fmt(Math.round(totalRevenue * 0.09))} color="#f59e0b" />
              <StatPill label="Taxable Base" value={fmt(totalRevenue)} color="#3b82f6" />
            </div>
            <div className="card p-6">
              <div className="card-title mb-4">Monthly GST Summary ({year})</div>
              <MiniBar values={monthlyRevenue.map(r => Math.round(r * 0.18))} labels={MONTH_LABELS} color="#f59e0b" />
              <div className="overflow-x-auto mt-4">
                <table className="admin-table w-full">
                  <thead><tr><th>Month</th><th>Gross Revenue</th><th>CGST 9%</th><th>SGST 9%</th><th>Total GST</th></tr></thead>
                  <tbody>
                    {monthlyRevenue.map((r, i) => (
                      <tr key={i}>
                        <td className="font-bold">{MONTH_LABELS[i]}</td>
                        <td>{fmt(r)}</td>
                        <td className="text-yellow-500">{fmt(Math.round(r * 0.09))}</td>
                        <td className="text-yellow-500">{fmt(Math.round(r * 0.09))}</td>
                        <td className="font-black text-yellow-600">{fmt(Math.round(r * 0.18))}</td>
                      </tr>
                    ))}
                    <tr style={{ background: 'hsl(var(--muted) / 0.3)', fontWeight: 900 }}>
                      <td>TOTAL</td>
                      <td>{fmt(totalRevenue)}</td>
                      <td className="text-yellow-500">{fmt(Math.round(totalRevenue * 0.09))}</td>
                      <td className="text-yellow-500">{fmt(Math.round(totalRevenue * 0.09))}</td>
                      <td className="text-yellow-600">{fmt(totalTax)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Commission Report ── */}
        {activeTab === 'commission' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <StatPill label="Total Commission" value={fmt(totalCommission)} sub="15% rate" color="#8b5cf6" />
              <StatPill label="Gross Bookings" value={fmt(totalRevenue)} color="#3b82f6" />
              <StatPill label="Commission Rate" value="15%" color="#8b5cf6" />
              <StatPill label="Avg/Booking" value={fmt(totalBookings ? Math.round(totalCommission / totalBookings) : 0)} color="#16a34a" />
            </div>
            <div className="card p-6">
              <div className="card-title mb-4">Monthly Commission Breakdown ({year})</div>
              <MiniBar values={monthlyRevenue.map(r => Math.round(r * 0.15))} labels={MONTH_LABELS} color="#8b5cf6" />
              <div className="overflow-x-auto mt-4">
                <table className="admin-table w-full">
                  <thead><tr><th>Month</th><th>Gross Revenue</th><th>Commission (15%)</th><th>Vendor Payout</th></tr></thead>
                  <tbody>
                    {monthlyRevenue.map((r, i) => (
                      <tr key={i}>
                        <td className="font-bold">{MONTH_LABELS[i]}</td>
                        <td>{fmt(r)}</td>
                        <td className="font-black text-purple-500">{fmt(Math.round(r * 0.15))}</td>
                        <td className="text-green-500">{fmt(Math.round(r * 0.85))}</td>
                      </tr>
                    ))}
                    <tr style={{ background: 'hsl(var(--muted) / 0.3)', fontWeight: 900 }}>
                      <td>TOTAL</td>
                      <td>{fmt(totalRevenue)}</td>
                      <td className="text-purple-500">{fmt(totalCommission)}</td>
                      <td className="text-green-500">{fmt(Math.round(totalRevenue * 0.85))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Top Destinations ── */}
        {activeTab === 'destinations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <StatPill label="Unique Destinations" value={Object.keys(destinationMap).length} color="#3b82f6" />
              <StatPill label="Top Destination" value={topDestinations[0]?.[0] || 'N/A'} color="#16a34a" />
              <StatPill label="Top Dest. Bookings" value={topDestinations[0]?.[1] || 0} color="#8b5cf6" />
            </div>
            <div className="card p-6">
              <div className="card-title mb-4">Top 10 Destinations by Bookings ({year})</div>
              <MiniBar values={topDestinations.map(d => d[1] as number)} labels={topDestinations.map(d => d[0].slice(0, 6))} color="#10b981" />
              <div className="overflow-x-auto mt-4">
                <table className="admin-table w-full">
                  <thead><tr><th>#</th><th>Destination</th><th>Total Bookings</th><th>Share</th></tr></thead>
                  <tbody>
                    {topDestinations.map(([dest, cnt], i) => (
                      <tr key={i}>
                        <td className="font-black text-zinc-400">#{i + 1}</td>
                        <td className="font-bold flex items-center gap-2"><MapPin size={12} className="text-blue-400" />{dest}</td>
                        <td>{cnt}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'hsl(var(--muted) / 0.4)' }}>
                              <div style={{ width: `${Math.round((Number(cnt) / totalBookings) * 100)}%`, height: '100%', borderRadius: 3, background: '#3b82f6' }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700 }}>{totalBookings ? Math.round((Number(cnt) / totalBookings) * 100) : 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {topDestinations.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-10 text-xs text-zinc-400">No destination data for {year}.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Peak Season Analysis ── */}
        {activeTab === 'peak' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <StatPill label="Peak Month" value={peakMonths[0]?.month || 'N/A'} sub={fmt(peakMonths[0]?.revenue || 0)} color="#ef4444" />
              <StatPill label="Lowest Month" value={[...peakMonths].sort((a, b) => a.revenue - b.revenue)[0]?.month || 'N/A'} color="#3b82f6" />
              <StatPill label="Peak Bookings" value={peakMonths[0]?.count || 0} color="#f59e0b" />
            </div>
            <div className="card p-6">
              <div className="card-title mb-4">Monthly Revenue Heatmap ({year})</div>
              <MiniBar values={monthlyRevenue} labels={MONTH_LABELS} color="#ef4444" />
              <div className="overflow-x-auto mt-4">
                <table className="admin-table w-full">
                  <thead><tr><th>Rank</th><th>Month</th><th>Revenue</th><th>Bookings</th><th>Intensity</th></tr></thead>
                  <tbody>
                    {[...monthlyRevenue.map((r, i) => ({ month: MONTH_LABELS[i], revenue: r, count: monthlyCount[i] }))]
                      .sort((a, b) => b.revenue - a.revenue)
                      .map((m, i) => {
                        const max = Math.max(...monthlyRevenue, 1);
                        const pct = Math.round((m.revenue / max) * 100);
                        return (
                          <tr key={i}>
                            <td className="font-black text-zinc-400">#{i + 1}</td>
                            <td className="font-bold">{m.month}</td>
                            <td className="font-black text-red-500">{fmt(m.revenue)}</td>
                            <td>{m.count}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'hsl(var(--muted) / 0.4)' }}>
                                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#3b82f6' }} />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700 }}>{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
