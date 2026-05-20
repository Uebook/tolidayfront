'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Search, Filter, Eye, Plus } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

type Status = 'all' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'PENDING';

const statusConfig: Record<string, { label: string; cls: string }> = {
    CONFIRMED: { label: 'Confirmed', cls: 'badge-accent' },
    CHECKED_IN: { label: 'Checked In', cls: 'badge-success' },
    CHECKED_OUT: { label: 'Checked Out', cls: 'badge-muted' },
    CANCELLED: { label: 'Cancelled', cls: 'badge-destructive' },
    PENDING: { label: 'Pending', cls: 'badge-warning' },
};

const tabs: { key: Status; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'CHECKED_IN', label: 'In-House' },
    { key: 'CHECKED_OUT', label: 'Checked Out' },
    { key: 'CANCELLED', label: 'Cancelled' },
];

export default function BookingsPage() {
    const [activeTab, setActiveTab] = useState<Status>('all');
    const [search, setSearch] = useState('');

    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['bookings'],
        queryFn: async () => {
            const res = await api.get('/bookings');
            return res.data;
        },
    });

    const filtered = bookings.filter((b: any) => {
        const matchTab = activeTab === 'all' || b.status === activeTab;
        const matchSearch = !search ||
            b.guestName.toLowerCase().includes(search.toLowerCase()) ||
            (b.id && b.id.toLowerCase().includes(search.toLowerCase()));
        return matchTab && matchSearch;
    });

    const counts: Record<string, number> = {};
    tabs.forEach((t) => {
        counts[t.key] = t.key === 'all' ? bookings.length : bookings.filter((b: any) => b.status === t.key).length;
    });

    return (
        <div>
            <Topbar title="Bookings" subtitle="Manage all hotel reservations" />
            <div className="p-6 space-y-5 animate-fadeIn">

                {/* Tab + Search row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--glass-border-light)', border: '1px solid var(--glass-border-light)' }}>
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    background: activeTab === t.key ? 'var(--glass-border)' : 'transparent',
                                    color: activeTab === t.key ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                                }}
                            >
                                {t.label}
                                <span className="px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: 'var(--glass-border)' }}>
                                    {counts[t.key] || 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input
                            placeholder="Search guest name..."
                            className="form-input"
                            style={{ width: 260 }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Link href="/hotel/bookings/add">
                            <button className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-bold">
                                <Plus size={16} /> Add Booking
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden">
                    {isLoading ? (
                        <div className="py-20 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Booking ID</th>
                                        <th>Guest</th>
                                        <th>Room Category</th>
                                        <th>Check-in</th>
                                        <th>Check-out</th>
                                        <th>Guests</th>
                                        <th>Total Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((b: any) => {
                                        const cfg = statusConfig[b.status] || { label: b.status, cls: 'badge-muted' };
                                        return (
                                            <tr key={b.id}>
                                                <td className="font-mono text-[10px] font-semibold" style={{ color: 'hsl(var(--accent))' }}>
                                                    {b.id.substring(0, 8).toUpperCase()}
                                                </td>
                                                <td>
                                                    <div className="font-medium text-[hsl(var(--foreground))] text-sm">{b.guestName}</div>
                                                    <div className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{b.guestContact}</div>
                                                </td>
                                                <td>
                                                    <div className="text-sm text-[hsl(var(--foreground))]">{b.roomType?.name || 'N/A'}</div>
                                                </td>
                                                <td className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{b.startDate}</td>
                                                <td className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{b.endDate}</td>
                                                <td className="text-sm text-[hsl(var(--foreground))] font-medium">{b.numberOfGuests}</td>
                                                <td className="text-sm font-bold text-[hsl(var(--foreground))]">₹{Number(b.totalAmount).toLocaleString()}</td>
                                                <td><span className={`badge ${cfg.cls}`}>{cfg.label}</span></td>
                                                <td>
                                                    <Link href={`/hotel/bookings/${b.id}`}>
                                                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--table-header)] transition-colors" style={{ border: '1px solid var(--glass-border)', color: 'hsl(var(--muted-foreground))' }}>
                                                            <Eye size={12} /> View
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!isLoading && filtered.length === 0 && (
                        <div className="text-center py-16" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            No bookings found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
