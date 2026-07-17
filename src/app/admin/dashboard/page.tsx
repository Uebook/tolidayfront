'use client';

import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, Users, IndianRupee,
  Building2, Map, Bus, CarFront, CheckCircle2,
  Activity, DollarSign, ArrowUpRight, Download,
  Calendar, Clock, XCircle, AlertCircle, FileText, Check, AlertTriangle
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { useAdminFilter } from '@/context/AdminFilterContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

type Period = 'today' | 'week' | 'month' | 'year' | 'fy';

const PERIODS: { label: string; value: Period }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'Financial Year', value: 'fy' },
];

export default function SuperDashboardPage() {
  const queryClient = useQueryClient();
  const { serviceFilter } = useAdminFilter();
  const [period, setPeriod] = useState<Period>('month');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Stats query
  const { data: dbStats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats', period],
    queryFn: async () => {
      const res = await api.get(`/admin/stats?period=${period}`);
      return res.data;
    }
  });

  // Recent Bookings query
  const { data: bookings = [], isLoading: isBookingsLoading } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/admin/all');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      return api.patch(`/bookings/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recent-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      toast.success('Booking status updated');
    }
  });

  const formatCurrency = (val: number) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const formatNumber = (val: number) => {
    if (!val) return '0';
    return val.toLocaleString('en-IN');
  };

  const rev = dbStats?.revenue || {};
  const bookingsCount = dbStats?.bookingsCount || {};
  const consumers = dbStats?.consumersCount || {};

  const getFilterData = () => {
    if (serviceFilter === 'Hotel') {
      return {
        tgv: formatCurrency(rev.hotels || 0),
        bookings: formatNumber(bookingsCount.hotels || 0),
        consumers: formatNumber(consumers.hotels || 0),
        revenue: formatCurrency((rev.hotels || 0) * 0.15),
      };
    }
    if (serviceFilter === 'Packages') {
      return {
        tgv: formatCurrency(rev.packages || 0),
        bookings: formatNumber(bookingsCount.packages || 0),
        consumers: formatNumber(consumers.packages || 0),
        revenue: formatCurrency((rev.packages || 0) * 0.15),
      };
    }
    if (serviceFilter === 'Buses') {
      return {
        tgv: formatCurrency(rev.buses || 0),
        bookings: formatNumber(bookingsCount.buses || 0),
        consumers: formatNumber(consumers.buses || 0),
        revenue: formatCurrency((rev.buses || 0) * 0.15),
      };
    }
    if (serviceFilter === 'Cabs') {
      return {
        tgv: formatCurrency(rev.cabs || 0),
        bookings: formatNumber(bookingsCount.cabs || 0),
        consumers: formatNumber(consumers.cabs || 0),
        revenue: formatCurrency((rev.cabs || 0) * 0.15),
      };
    }
    return {
      tgv: formatCurrency(rev.total || 0),
      bookings: formatNumber(bookingsCount.total || 0),
      consumers: formatNumber(consumers.total || 0),
      revenue: formatCurrency((rev.total || 0) * 0.15),
    };
  };

  const currentData = getFilterData();

  const stats = [
    {
      label: 'Total Gross Volume',
      value: currentData.tgv,
      sub: 'All bookings combined',
      change: '+12%',
      up: true,
      iconBg: '#dbeafe',
      iconColor: '#1d4ed8',
      Icon: DollarSign,
    },
    {
      label: 'Total Bookings',
      value: currentData.bookings,
      sub: 'Across all verticals',
      change: '+8%',
      up: true,
      iconBg: '#dcfce7',
      iconColor: '#16a34a',
      Icon: CheckCircle2,
    },
    {
      label: 'Active Consumers',
      value: currentData.consumers,
      sub: 'Registered users',
      change: '+15%',
      up: true,
      iconBg: '#f3e8ff',
      iconColor: '#9333ea',
      Icon: Users,
    },
    {
      label: 'Net Platform Revenue',
      value: currentData.revenue,
      sub: '15% commission',
      change: '+9%',
      up: true,
      iconBg: '#ffedd5',
      iconColor: '#ea580c',
      Icon: Activity,
    },
  ];

  const verticalData = [
    { name: 'Hotel Operations', filterKey: 'Hotel', Icon: Building2, iconBg: '#dbeafe', iconColor: '#1d4ed8', rev: formatCurrency(rev.hotels || 0), bookings: formatNumber(bookingsCount.hotels || 0) },
    { name: 'Tour Operations', filterKey: 'Packages', Icon: Map, iconBg: '#dcfce7', iconColor: '#16a34a', rev: formatCurrency(rev.packages || 0), bookings: formatNumber(bookingsCount.packages || 0) },
    { name: 'Bus Operations', filterKey: 'Buses', Icon: Bus, iconBg: '#fef9c3', iconColor: '#ca8a04', rev: formatCurrency(rev.buses || 0), bookings: formatNumber(bookingsCount.buses || 0) },
    { name: 'Cab Operations', filterKey: 'Cabs', Icon: CarFront, iconBg: '#fee2e2', iconColor: '#dc2626', rev: formatCurrency(rev.cabs || 0), bookings: formatNumber(bookingsCount.cabs || 0) },
  ];

  const filteredVerticals = verticalData.filter(v =>
    serviceFilter === 'All' || v.filterKey === serviceFilter
  );


  // Helper to filter bookings by period on the client side
  const getBookingsFilteredByPeriod = () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    return bookings.filter((b: any) => {
      const date = new Date(b.createdAt || b.startDate).getTime();
      
      if (period === 'today') {
        return date >= startOfToday;
      }
      if (period === 'week') {
        const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;
        return date >= sevenDaysAgo;
      }
      if (period === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return date >= startOfMonth;
      }
      if (period === 'year' || period === 'fy') {
        const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
        return date >= startOfYear;
      }
      return true;
    });
  };

  const periodFilteredBookings = getBookingsFilteredByPeriod();

  // Cancellation Requests lists based on period selection (must be after periodFilteredBookings)
  const cancellationRequests = periodFilteredBookings.filter((b: any) => b.status === 'CANCELLED' || b.status === 'PENDING').slice(0, 4);

  // Compute real 12-month revenue dynamically from period-filtered bookings
  const monthlyRevenue = Array(12).fill(0);
  periodFilteredBookings.forEach((b: any) => {
    const bookingDate = new Date(b.createdAt || b.startDate);
    const bookingYear = bookingDate.getFullYear().toString();
    if (bookingYear === selectedYear) {
      const month = bookingDate.getMonth();
      monthlyRevenue[month] += Number(b.totalAmount || 0);
    }
  });

  const maxRevenue = Math.max(...monthlyRevenue, 1); // Avoid division by zero

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const salesGraphData = monthLabels.map((label, index) => {
    const revenue = monthlyRevenue[index];
    const percentage = Math.round((revenue / maxRevenue) * 100);
    return {
      label,
      val: percentage,
      revenue: formatCurrency(revenue)
    };
  });

  const topbarActions = (
    <button className="btn btn-outline" style={{ gap: 6 }}>
      <Download size={14} />
      Export Report
    </button>
  );

  return (
    <div>
      <Topbar
        title="Super Dashboard"
        subtitle={`Executive overview • Last updated: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
        actions={topbarActions}
      />

      <div className="admin-page animate-fadeIn space-y-6">

        {/* Period Filter */}
        <div>
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

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div>
                <div className="stat-card-label">{stat.label}</div>
                <div className="stat-card-value">
                  {isLoading ? (
                    <div style={{ width: 80, height: 28, background: 'hsl(var(--muted))', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
                  ) : stat.value}
                </div>
                <div className="stat-card-sub" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span className={`stat-badge ${stat.up ? 'stat-badge-up' : 'stat-badge-down'}`}>
                    {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {stat.change} vs last period
                  </span>
                </div>
              </div>
              <div
                className="stat-card-icon"
                style={{ background: stat.iconBg, color: stat.iconColor }}
              >
                <stat.Icon size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* Sales Graph - Interactive Visual Representation with Year Filter */}
        <div className="card p-6">
          <div className="card-header border-none pb-0 flex items-center justify-between">
            <div>
              <div className="card-title text-sm uppercase tracking-wider text-slate-400">Sales & Booking Trends</div>
              <div className="text-xl font-black text-foreground mt-1">Gross Revenue Chart</div>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-black/5 dark:bg-white/5 border border-border/10 rounded-xl py-2 px-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-foreground"
              >
                <option value="2026">Year 2026</option>
                <option value="2025">Year 2025</option>
                <option value="2024">Year 2024</option>
              </select>
              <span className="badge badge-info text-[9px] uppercase tracking-widest px-2.5 py-1">Real-time</span>
            </div>
          </div>
          
          <div className="mt-8 flex items-end justify-between h-48 px-4 border-b border-border/10 pb-2 gap-4">
            {salesGraphData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full relative flex items-end justify-center">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 bg-slate-900 border border-border/10 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20">
                    {data.revenue}
                  </div>
                  {/* Colored column */}
                  <div 
                    className="w-8 md:w-12 bg-blue-600/30 group-hover:bg-blue-600 rounded-t-lg transition-all duration-500" 
                    style={{ height: `${data.val * 1.5}px` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400">{data.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mid Section: Performance and Status */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {/* Vertical Performance */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Vertical Performance</div>
              <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{period.toUpperCase()}</span>
            </div>
            <div style={{ padding: 0 }}>
              {filteredVerticals.map((v, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom: i < filteredVerticals.length - 1 ? '1px solid hsl(var(--border) / 0.6)' : 'none',
                }} className="flex items-center justify-between">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38,
                      borderRadius: 9,
                      background: v.iconBg,
                      color: v.iconColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <v.Icon size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'hsl(var(--foreground))' }}>{v.name}</div>
                      <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{v.bookings} bookings</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--foreground))' }}>{isLoading ? '...' : v.rev}</div>
                    <div style={{ fontSize: 11, color: '#16a34a', marginTop: 1, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                      <TrendingUp size={10} /> Growing
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">System Status</div>
              <span className="badge badge-success" style={{ fontSize: 10 }}>All Operational</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Booking API Node', status: 'Operational', dot: 'green' },
                { label: 'Payment Gateway (Razorpay)', status: 'Operational', dot: 'green' },
                { label: 'Notification Service', status: 'Operational', dot: 'green' },
                { label: 'Database Cluster', status: 'Healthy', dot: 'green' },
                { label: 'GST Invoice Engine', status: 'Active', dot: 'green' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'hsl(var(--muted) / 0.4)',
                  borderRadius: 8,
                  border: '1px solid hsl(var(--border))',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`status-dot status-dot-${item.dot}`} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'hsl(var(--foreground))' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a' }}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lower Section: Recent Bookings Feed & Cancellation Requests */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          
          {/* Recent Bookings Feed */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Reservations</div>
              <Link href="/admin/bookings" className="text-xs text-blue-500 font-bold hover:underline">View All</Link>
            </div>
            <div className="p-0 divide-y divide-border/5">
              {isBookingsLoading ? (
                <div className="p-8 text-center text-slate-400 text-xs">Loading bookings...</div>
              ) : periodFilteredBookings.slice(0, 4).map((b: any, i: number) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/10 text-blue-500 rounded-lg">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-foreground">{b.guestName}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{b.bookingReference || `#${b.id.slice(0,6)}`}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-foreground">₹{Number(b.totalAmount).toLocaleString()}</div>
                    <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">{b.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Audits */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Pending Audits & Cancellation</div>
              <span className="badge badge-warning text-[9px] uppercase tracking-widest px-2 py-0.5">Alert</span>
            </div>
            <div className="p-0 divide-y divide-border/5">
              {cancellationRequests.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                  <AlertCircle size={20} className="opacity-30" />
                  No pending cancellation requests found.
                </div>
              ) : cancellationRequests.map((b: any, i: number) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-foreground">{b.guestName}</div>
                    <div className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mt-0.5">REF: {b.bookingReference}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateStatusMutation.mutate({ id: b.id, status: 'CANCELLED' })}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500 transition-colors"
                    >
                      Approve Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
