'use client';

import Topbar from '@/components/layout/Topbar';
import { Bell, BookOpen, CreditCard, Info, Check, Settings } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

type NotifType = 'all' | 'booking' | 'payment' | 'system';

const typeIcons: Record<string, any> = {
    booking: BookOpen,
    payment: CreditCard,
    system: Info,
};
const typeColors: Record<string, string> = {
    booking: 'hsl(199 89% 48%)',
    payment: 'hsl(142 71% 45%)',
    system: 'hsl(38 92% 50%)',
};

function timeAgo(iso: string) {
    if (!iso) return '';
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return format(new Date(iso), 'MMM d');
}

export default function NotificationsPage() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<NotifType>('all');

    // Fetch hotel ID first
    const { data: myHotel } = useQuery({
        queryKey: ['my-hotel-notifs'],
        queryFn: async () => {
            const res = await api.get('/hotel/my-hotel');
            return res.data;
        }
    });

    const hotelId = myHotel?.id;

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications', hotelId],
        queryFn: async () => {
            const res = await api.get(`/notifications?hotelId=${hotelId}`);
            // Sorting to put newest first
            return res.data?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];
        },
        enabled: !!hotelId
    });

    const markReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const { data: settings, isLoading: settingsLoading } = useQuery({
        queryKey: ['notification-settings', hotelId],
        queryFn: async () => {
            const res = await api.get(`/notifications/settings?hotelId=${hotelId}`);
            return res.data;
        },
        enabled: !!hotelId
    });

    const updateSettingsMutation = useMutation({
        mutationFn: async (dto: any) => {
            await api.patch(`/notifications/settings?hotelId=${hotelId}`, dto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-settings', hotelId] });
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            await api.patch(`/notifications/read-all?hotelId=${hotelId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    if (isLoading || !hotelId) {
        return (
            <div>
                <Topbar title="Notifications" subtitle="Stay updated with bookings, payments and alerts" />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
                </div>
            </div>
        );
    }

    const filtered = notifications.filter((n: any) => filter === 'all' || n.type === filter);
    const unreadCount = notifications.filter((n: any) => !n.read).length;

    return (
        <div>
            <Topbar title="Notifications" subtitle="Stay updated with bookings, payments and alerts" />
            <div className="p-6 space-y-5 animate-fadeIn">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--glass-border-light)', border: '1px solid var(--glass-border-light)' }}>
                        {([
                            { key: 'all', label: `All (${notifications.length})` },
                            { key: 'booking', label: 'Bookings' },
                            { key: 'payment', label: 'Payments' },
                            { key: 'system', label: 'System' },
                        ] as const).map((tab) => (
                            <button key={tab.key} onClick={() => setFilter(tab.key as NotifType)}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                style={{ background: filter === tab.key ? 'var(--glass-border)' : 'transparent', color: 'hsl(var(--muted-foreground))' }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    {unreadCount > 0 && (
                        <button onClick={() => markAllReadMutation.mutate()} disabled={markAllReadMutation.isPending} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ border: '1px solid var(--glass-border)', color: 'hsl(var(--muted-foreground))' }}>
                            <Check size={12} /> Mark all read
                        </button>
                    )}
                </div>

                {/* Notifications list */}
                <div className="space-y-2">
                    {filtered.length === 0 ? (
                        <div className="glass-card p-8 text-center text-[hsl(var(--muted-foreground))]">
                            No notifications found.
                        </div>
                    ) : filtered.map((n: any) => {
                        const Icon = typeIcons[n.type] || Info;
                        const color = typeColors[n.type] || 'hsl(225 70% 65%)';
                        return (
                            <div
                                key={n.id}
                                onClick={() => !n.read && markReadMutation.mutate(n.id)}
                                className="glass-card p-4 flex items-start gap-4 cursor-pointer transition-all hover:scale-[1.005]"
                                style={{ opacity: n.read ? 0.6 : 1, borderColor: !n.read ? `${color}33` : undefined }}
                            >
                                <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: `${color}18` }}>
                                    <Icon size={16} style={{ color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">{n.title}</h4>
                                        {!n.read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />}
                                    </div>
                                    <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{n.message}</p>
                                </div>
                                <span className="text-xs flex-shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }}>{timeAgo(n.createdAt)}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Notification Settings */}
                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">Notification Preferences</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {settingsLoading ? (
                            <div className="col-span-2 py-8 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                            </div>
                        ) : [
                            { key: 'newBookings', label: 'New Bookings', subtext: 'Get notified when a new booking is made' },
                            { key: 'cancellations', label: 'Cancellations', subtext: 'Get notified when bookings are cancelled' },
                            { key: 'paymentUpdates', label: 'Payment Updates', subtext: 'Alerts for payments and refunds' },
                            { key: 'inventoryAlerts', label: 'Inventory Alerts', subtext: 'When rooms reach low availability' },
                            { key: 'checkInReminders', label: 'Check-in Reminders', subtext: '24hr reminder for upcoming check-ins' },
                            { key: 'rateSuggestions', label: 'Rate Suggestions', subtext: 'AI-powered pricing recommendations' },
                        ].map((pref) => (
                            <div key={pref.key} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--glass-border-light)' }}>
                                <div>
                                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">{pref.label}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{pref.subtext}</p>
                                </div>
                                <label className="toggle">
                                    <input
                                        type="checkbox"
                                        checked={(settings as any)?.[pref.key] || false}
                                        onChange={(e) => updateSettingsMutation.mutate({ [pref.key]: e.target.checked })}
                                        disabled={updateSettingsMutation.isPending}
                                    />
                                    <span className="toggle-slider" />
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
