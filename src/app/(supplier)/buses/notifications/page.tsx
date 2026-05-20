'use client';

import Topbar from '@/components/layout/Topbar';
import { Bell, Check, Trash2, Calendar, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { getAuthUser } from '@/lib/auth';

const typeIcons: Record<string, any> = {
    BOOKING: <Calendar size={18} className="text-blue-500" />,
    SYSTEM: <ShieldCheck size={18} className="text-purple-500" />,
    SUPPORT: <MessageSquare size={18} className="text-orange-500" />,
    ALERT: <AlertTriangle size={18} className="text-red-500" />,
};

export default function BusNotificationsPage() {
    const queryClient = useQueryClient();
    const user = getAuthUser();
    const partnerId = user?.hotelId || user?.tourPartnerId || user?.busVendorId || user?.cabVendorId;

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications', partnerId],
        queryFn: async () => {
            if (!partnerId) return [];
            const res = await api.get(`/notifications?partnerId=${partnerId}`);
            return res.data;
        },
        enabled: !!partnerId,
    });

    const markReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/notifications/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
            </div>
        );
    }

    const unreadCount = notifications.filter((n: any) => !n.read).length;

    return (
        <div>
            <Topbar title="Notifications" subtitle="Stay updated with bookings, system alerts and messages" />
            <div className="p-6 space-y-6 animate-fadeIn">

                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="glass-card px-4 py-2 min-w-[120px] text-center">
                            <div className="text-xl font-black text-blue-500">{notifications.length}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Total</div>
                        </div>
                        <div className="glass-card px-4 py-2 min-w-[120px] text-center">
                            <div className="text-xl font-black text-orange-500">{unreadCount}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Unread</div>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                            <Check size={14} /> Mark all as read
                        </button>
                    )}
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="divide-y divide-white/05">
                        {notifications.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground">
                                <Bell size={48} className="mx-auto mb-4 opacity-10" />
                                <p className="font-medium text-sm">No notifications found</p>
                            </div>
                        ) : (
                            notifications.map((n: any) => (
                                <div key={n.id} className={`flex items-start gap-4 p-5 transition-colors hover:bg-white/05 ${!n.read ? 'bg-accent/05 border-l-2 border-accent' : ''}`}>
                                    <div className="w-10 h-10 rounded-xl bg-white/05 flex items-center justify-center flex-shrink-0 mt-1">
                                        {typeIcons[n.type] || <Bell size={18} className="text-muted-foreground" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className={`text-sm font-bold truncate ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</h4>
                                            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{n.message}</p>
                                        <div className="flex items-center gap-4">
                                            {!n.read && (
                                                <button
                                                    onClick={() => markReadMutation.mutate(n.id)}
                                                    className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-accent/80 transition-colors"
                                                >
                                                    Mark as Read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteMutation.mutate(n.id)}
                                                className="text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
