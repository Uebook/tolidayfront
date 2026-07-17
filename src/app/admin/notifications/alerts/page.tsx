'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { AlertCircle, CheckCircle2, Clock, XCircle, Bell, RefreshCw } from 'lucide-react';

const ALERT_TYPES = [
  { id: 'all', label: 'All Alerts' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'pending', label: 'Pending' },
  { id: 'cancelled', label: 'Cancelled' },
];

const statusIcon: Record<string, any> = {
  CONFIRMED: <CheckCircle2 size={13} color="#16a34a" />,
  PENDING: <Clock size={13} color="#f59e0b" />,
  CANCELLED: <XCircle size={13} color="#ef4444" />,
};

const statusColor: Record<string, string> = {
  CONFIRMED: '#16a34a',
  PENDING: '#f59e0b',
  CANCELLED: '#ef4444',
};

export default function BookingAlertsPage() {
  const [filter, setFilter] = useState('all');

  const { data: rawBookings = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['booking-alerts'],
    queryFn: async () => {
      const res = await api.get('/bookings/admin/all');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    },
    refetchInterval: 30000, // auto refresh every 30s
  });

  const bookings: any[] = rawBookings;

  const filtered = bookings.filter((b: any) => {
    if (filter === 'all') return true;
    return b.status?.toLowerCase() === filter;
  });

  const confirmed = bookings.filter((b: any) => b.status === 'CONFIRMED').length;
  const pending = bookings.filter((b: any) => b.status === 'PENDING').length;
  const cancelled = bookings.filter((b: any) => b.status === 'CANCELLED').length;

  return (
    <div>
      <Topbar title="Booking Alerts" subtitle="Real-time feed of all booking status events"
        actions={
          <button onClick={() => refetch()} className="btn btn-outline" style={{ gap: 6 }}>
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />
      <div className="admin-page animate-fadeIn space-y-6">

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: 'Total Bookings', value: bookings.length, Icon: Bell, color: '#3b82f6', bg: '#dbeafe' },
            { label: 'Confirmed', value: confirmed, Icon: CheckCircle2, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Pending Review', value: pending, Icon: Clock, color: '#f59e0b', bg: '#fef9c3' },
            { label: 'Cancellations', value: cancelled, Icon: XCircle, color: '#ef4444', bg: '#fee2e2' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ padding: '14px 16px' }}>
              <div>
                <div className="stat-card-label" style={{ fontSize: 11 }}>{s.label}</div>
                <div className="stat-card-value" style={{ fontSize: 22 }}>{isLoading ? '...' : s.value}</div>
              </div>
              <div className="stat-card-icon" style={{ width: 36, height: 36, borderRadius: 8, background: s.bg, color: s.color }}>
                <s.Icon size={16} />
              </div>
            </div>
          ))}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 8 }}>
          {ALERT_TYPES.map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)}
              className={`badge ${filter === t.id ? 'badge-info' : 'badge-muted'}`}
              style={{ cursor: 'pointer', padding: '6px 14px', fontSize: 11 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Alert Feed */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Booking Alert Feed</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="status-dot status-dot-green" />
              <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>Live</span>
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>Loading booking alerts...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <AlertCircle size={24} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>No alerts for selected filter</div>
            </div>
          ) : (
            <div style={{ padding: 0 }}>
              {filtered.slice(0, 30).map((b: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                  borderBottom: '1px solid hsl(var(--border) / 0.4)',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'hsl(var(--muted) / 0.3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Status icon */}
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: `${statusColor[b.status] || '#64748b'}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {statusIcon[b.status] || <Bell size={13} />}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                        {b.guestName || 'Guest'}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', fontFamily: 'monospace' }}>
                        #{b.bookingReference || b.id?.slice(0, 8)}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
                      {b.hotelName || b.propertyName || 'Booking'} · ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Time + Status */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : b.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                      {b.status}
                    </span>
                    <div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', marginTop: 3 }}>
                      {b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
