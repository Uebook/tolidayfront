'use client';

import React, { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import DataTable from '@/components/admin/DataTable';
import {
  Calendar, CheckCircle, XCircle, Clock,
  Building2, Map, Bus, CarFront, Download, Eye, FileText
} from 'lucide-react';
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

function exportToCSV(data: any[]) {
  if (!data.length) {
    toast.error('No data to export');
    return;
  }
  const headers = ['Booking Ref', 'Guest Name', 'Guest Email', 'Guest Phone', 'Vendor', 'Type', 'Check-In', 'Check-Out', 'Amount (₹)', 'Status', 'Booked On'];
  const rows = data.map((b: any) => {
    const vendor = b.hotel?.name || b.tourPartner?.companyName || b.busVendor?.companyName || b.cabVendor?.companyName || 'N/A';
    const type = b.hotel ? 'HOTEL' : b.tourPartner ? 'TOUR' : b.busVendor ? 'BUS' : b.cabVendor ? 'CAB' : 'N/A';
    return [
      b.bookingReference || '',
      b.guestName || '',
      b.guestEmail || '',
      b.guestPhone || '',
      vendor,
      type,
      b.startDate || '',
      b.endDate || '',
      b.totalAmount || '0',
      b.status || '',
      b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : '',
    ];
  });

  const csvContent = [headers, ...rows]
    .map(r => r.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${data.length} bookings`);
}

export default function MasterBookingsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<Period>('month');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  
  // Advanced filters state
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [verticalFilter, setVerticalFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['global-bookings', period],
    queryFn: async () => {
      const res = await api.get(`/bookings/admin/all?period=${period}`);
      return res.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      return api.patch(`/bookings/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-bookings'] });
      toast.success('Booking status updated');
    }
  });

  const filteredBookings = bookings.filter((b: any) => {
    const matchSearch =
      (b.guestName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.bookingReference || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.guestEmail || '').toLowerCase().includes(search.toLowerCase());
    
    // Status Filter
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    
    // Vertical Filter
    let matchesVertical = true;
    if (verticalFilter !== 'ALL') {
      if (verticalFilter === 'HOTEL') matchesVertical = !!b.hotelId;
      if (verticalFilter === 'CAB') matchesVertical = !!b.cabVendorId;
      if (verticalFilter === 'BUS') matchesVertical = !!b.busVendorId;
      if (verticalFilter === 'TOUR') matchesVertical = !!b.tourPartnerId;
      if (verticalFilter === 'FLIGHT') matchesVertical = !!b.flightDetails;
    }

    // Location Filter
    let matchesLocation = true;
    if (locationFilter) {
      const loc = (b.hotel?.city || b.hotel?.address || b.tourPartner?.city || '').toLowerCase();
      matchesLocation = loc.includes(locationFilter.toLowerCase());
    }

    // Date Filters
    let matchesDates = true;
    if (startDateFilter) {
      matchesDates = matchesDates && new Date(b.startDate) >= new Date(startDateFilter);
    }
    if (endDateFilter) {
      matchesDates = matchesDates && new Date(b.endDate) <= new Date(endDateFilter);
    }

    return matchSearch && matchesStatus && matchesVertical && matchesLocation && matchesDates;
  });

  const getVerticalDetails = (booking: any) => {
    if (booking.hotel) return { type: 'Hotel', Icon: Building2, iconBg: '#dbeafe', iconColor: '#1d4ed8', name: booking.hotel.name };
    if (booking.tourPartner) return { type: 'Tour', Icon: Map, iconBg: '#dcfce7', iconColor: '#16a34a', name: booking.tourPartner.companyName };
    if (booking.busVendor) return { type: 'Bus', Icon: Bus, iconBg: '#fef9c3', iconColor: '#ca8a04', name: booking.busVendor.companyName };
    if (booking.cabVendor) return { type: 'Cab', Icon: CarFront, iconBg: '#fee2e2', iconColor: '#dc2626', name: booking.cabVendor.companyName };
    return { type: 'Unknown', Icon: Calendar, iconBg: '#f3f4f7', iconColor: '#6b7280', name: 'Unknown' };
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; icon: any }> = {
      CONFIRMED: { cls: 'badge badge-success', icon: <CheckCircle size={11} /> },
      PENDING: { cls: 'badge badge-warning', icon: <Clock size={11} /> },
      CANCELLED: { cls: 'badge badge-danger', icon: <XCircle size={11} /> },
      CHECKED_IN: { cls: 'badge badge-info', icon: <CheckCircle size={11} /> },
      CHECKED_OUT: { cls: 'badge badge-muted', icon: <CheckCircle size={11} /> },
    };
    const s = map[status] || { cls: 'badge badge-muted', icon: null };
    return (
      <span className={s.cls} style={{ gap: 4 }}>
        {s.icon}{status}
      </span>
    );
  };

  const columns = [
    {
      header: 'Booking Ref',
      accessor: 'bookingReference',
      render: (b: any) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'hsl(var(--primary))' }}>
            {b.bookingReference || `#${b.id?.slice(0, 8).toUpperCase()}`}
          </div>
          <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>
            {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : ''}
          </div>
        </div>
      )
    },
    {
      header: 'Guest',
      accessor: 'guestName',
      render: (b: any) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{b.guestName || '—'}</div>
          <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{b.guestEmail}</div>
        </div>
      )
    },
    {
      header: 'Vendor / Type',
      accessor: 'vendor',
      render: (b: any) => {
        const d = getVerticalDetails(b);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32,
              borderRadius: 7,
              background: d.iconBg,
              color: d.iconColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <d.Icon size={15} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'hsl(var(--foreground))' }}>{d.name}</div>
              <span className="badge badge-muted" style={{ fontSize: 10, padding: '1px 6px' }}>{d.type}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Dates',
      accessor: 'dates',
      render: (b: any) => (
        <div style={{ fontSize: 12 }}>
          <div style={{ fontWeight: 600 }}>{b.startDate ? new Date(b.startDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</div>
          <div style={{ color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>
            → {b.endDate ? new Date(b.endDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          </div>
        </div>
      )
    },
    {
      header: 'Amount',
      accessor: 'totalAmount',
      render: (b: any) => (
        <div style={{ fontWeight: 700, fontSize: 14 }}>
          ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
        </div>
      )
    },
    {
      header: 'Source',
      accessor: 'source',
      render: (b: any) => (
        <span className="badge badge-info" style={{ textTransform: 'uppercase', fontSize: 10 }}>
          {b.source || 'Website'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (b: any) => statusBadge(b.status)
    },
  ];

  const actions = (b: any) => (
    <div style={{ display: 'flex', gap: 4 }}>
      <Link href={`/admin/bookings/${b.id}`} className="btn btn-ghost btn-icon" title="View Details">
        <Eye size={14} />
      </Link>
      <Link href={`/admin/bookings/${b.id}/invoice`} className="btn btn-ghost btn-icon" title="Guest Invoice">
        <FileText size={14} />
      </Link>
      {b.status !== 'CANCELLED' && b.status !== 'CHECKED_OUT' && (
        <button
          onClick={() => updateStatusMutation.mutate({ id: b.id, status: 'CANCELLED' })}
          disabled={updateStatusMutation.isPending}
          className="btn btn-ghost btn-icon"
          title="Cancel Booking"
          style={{ color: '#ef4444' }}
          onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <XCircle size={14} />
        </button>
      )}
    </div>
  );

  const headerAction = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      <input
        type="text"
        value={locationFilter}
        onChange={(e) => setLocationFilter(e.target.value)}
        placeholder="Location..."
        style={{
          background: 'hsl(var(--muted))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 8,
          fontSize: 11,
          padding: '6px 12px',
          width: 110,
          color: 'hsl(var(--foreground))',
        }}
      />
      <input
        type="date"
        value={startDateFilter}
        onChange={(e) => setStartDateFilter(e.target.value)}
        style={{
          background: 'hsl(var(--muted))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 8,
          fontSize: 11,
          padding: '6px 12px',
          color: 'hsl(var(--foreground))',
        }}
      />
      <input
        type="date"
        value={endDateFilter}
        onChange={(e) => setEndDateFilter(e.target.value)}
        style={{
          background: 'hsl(var(--muted))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 8,
          fontSize: 11,
          padding: '6px 12px',
          color: 'hsl(var(--foreground))',
        }}
      />
      <select
        value={verticalFilter}
        onChange={(e) => setVerticalFilter(e.target.value)}
        style={{
          background: 'hsl(var(--muted))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 8,
          fontSize: 11,
          padding: '6px 12px',
          color: 'hsl(var(--foreground))',
        }}
      >
        <option value="ALL">All Verticals</option>
        <option value="HOTEL">Hotels</option>
        <option value="CAB">Cabs</option>
        <option value="BUS">Bus</option>
        <option value="TOUR">Tours</option>
        <option value="FLIGHT">Flights</option>
      </select>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        style={{
          background: 'hsl(var(--muted))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 8,
          fontSize: 11,
          padding: '6px 12px',
          color: 'hsl(var(--foreground))',
        }}
      >
        <option value="ALL">All Status</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="PENDING">Pending</option>
        <option value="CANCELLED">Cancelled</option>
      </select>

      <button
        className="btn btn-success animate-fadeIn"
        onClick={() => exportToCSV(filteredBookings)}
        style={{ gap: 6, fontSize: 11, padding: '7px 14px' }}
      >
        <Download size={12} /> Export CSV
      </button>
    </div>
  );

  return (
    <div>
      <Topbar title="Master Bookings" subtitle="Global oversight of all reservations across all verticals" />

      <div className="admin-page animate-fadeIn">

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total', value: bookings.length, iconBg: '#dbeafe', iconColor: '#1d4ed8', Icon: Calendar },
            { label: 'Confirmed', value: bookings.filter((b: any) => b.status === 'CONFIRMED').length, iconBg: '#dcfce7', iconColor: '#16a34a', Icon: CheckCircle },
            { label: 'Pending', value: bookings.filter((b: any) => b.status === 'PENDING').length, iconBg: '#fef9c3', iconColor: '#ca8a04', Icon: Clock },
            { label: 'Cancelled', value: bookings.filter((b: any) => b.status === 'CANCELLED').length, iconBg: '#fee2e2', iconColor: '#dc2626', Icon: XCircle },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ padding: '14px 16px' }}>
              <div>
                <div className="stat-card-label" style={{ fontSize: 11 }}>{s.label}</div>
                <div className="stat-card-value" style={{ fontSize: 22 }}>{isLoading ? '...' : s.value}</div>
              </div>
              <div className="stat-card-icon" style={{ width: 36, height: 36, borderRadius: 8, background: s.iconBg, color: s.iconColor }}>
                <s.Icon size={16} />
              </div>
            </div>
          ))}
        </div>

        {/* Period filter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
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

        {/* Data Table */}
        <DataTable
          title="All Reservations"
          description={`${filteredBookings.length} bookings found`}
          columns={columns}
          data={filteredBookings}
          onSearch={setSearch}
          isLoading={isLoading}
          actions={actions}
          headerAction={headerAction}
          emptyMessage="No bookings found"
        />
      </div>
    </div>
  );
}
