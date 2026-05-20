'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { ChevronLeft, ChevronRight, Save, RotateCcw, AlertCircle, Info } from 'lucide-react';
import { useState, useMemo } from 'react';
import { format, addDays, startOfToday, eachDayOfInterval } from 'date-fns';

export default function InventoryConsolePage() {
    const queryClient = useQueryClient();
    const [startDate, setStartDate] = useState(startOfToday());
    const [daysToShow] = useState(14); // Grid shows 14 days at a time

    const endDate = useMemo(() => addDays(startDate, daysToShow - 1), [startDate, daysToShow]);
    const dateRange = useMemo(() => eachDayOfInterval({ start: startDate, end: endDate }), [startDate, endDate]);

    // Fetch Room Types
    const { data: rooms = [], isLoading: roomsLoading } = useQuery({
        queryKey: ['room-types'],
        queryFn: async () => {
            const res = await api.get('/room-types');
            return res.data;
        },
    });

    // Fetch Inventory for the date range
    const { data: rawInventory = [], isLoading: invLoading } = useQuery({
        queryKey: ['inventory-grid', format(startDate, 'yyyy-MM-dd')],
        queryFn: async () => {
            const res = await api.get(`/inventory?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`);
            return res.data;
        },
    });

    // Local state for pending changes (to allow bulk saving)
    const [changes, setChanges] = useState<Record<string, any>>({});

    const inventoryMap = useMemo(() => {
        const map: Record<string, any> = {};
        rawInventory.forEach((item: any) => {
            map[`${item.roomTypeId}_${item.date}`] = item;
        });
        return map;
    }, [rawInventory]);

    const handleInputChange = (roomTypeId: string, date: string, field: string, value: any) => {
        const key = `${roomTypeId}_${date}`;
        setChanges(prev => ({
            ...prev,
            [key]: {
                ...(prev[key] || inventoryMap[key] || { roomTypeId, date }),
                [field]: Number(value)
            }
        }));
    };

    const bulkUpdateMutation = useMutation({
        mutationFn: async () => {
            const payloads = Object.values(changes);
            // In a real app, we'd have a bulk update endpoint. 
            // For now, we'll loop or assume the backend can handle an array if we update it.
            return Promise.all(payloads.map(p => api.post('/inventory/update', p)));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory-grid'] });
            setChanges({});
            alert('Inventory updated successfully!');
        }
    });

    if (roomsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
            </div>
        );
    }

    return (
        <div>
            <Topbar title="Inventory Console" subtitle="MMT-Grade bulk rate and availability management" />
            <div className="p-6 space-y-6 animate-fadeIn">

                {/* Legend & Controls */}
                <div className="flex items-center justify-between glass-card p-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setStartDate(addDays(startDate, -7))} className="p-2 rounded-lg hover:bg-[var(--table-header)] border border-[var(--glass-border)]">
                                <ChevronLeft size={18} />
                            </button>
                            <span className="font-bold text-sm min-w-[150px] text-center">
                                {format(startDate, 'dd MMM')} - {format(endDate, 'dd MMM yyyy')}
                            </span>
                            <button onClick={() => setStartDate(addDays(startDate, 7))} className="p-2 rounded-lg hover:bg-[var(--table-header)] border border-[var(--glass-border)]">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <div className="h-8 w-px bg-[var(--glass-border)]" />
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-green-500" />
                                <span>High Inventory</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-orange-500" />
                                <span>Low Inventory</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-red-500" />
                                <span>Stop Sale</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {Object.keys(changes).length > 0 && (
                            <button 
                                onClick={() => setChanges({})}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                            >
                                <RotateCcw size={16} /> Discard
                            </button>
                        )}
                        <button 
                            onClick={() => bulkUpdateMutation.mutate()}
                            disabled={Object.keys(changes).length === 0 || bulkUpdateMutation.isPending}
                            className="btn-primary flex items-center gap-2 px-6 py-2 text-sm disabled:opacity-50"
                        >
                            <Save size={16} /> {bulkUpdateMutation.isPending ? 'Saving...' : 'Save All Changes'}
                        </button>
                    </div>
                </div>

                {/* Grid Console */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="sticky left-0 z-20 bg-[var(--table-header)] p-4 text-left border-b border-r border-[var(--glass-border)] min-w-[200px]">
                                        Room Category
                                    </th>
                                    {dateRange.map(date => (
                                        <th key={date.toISOString()} className="p-3 bg-[var(--table-header)] border-b border-[var(--glass-border)] min-w-[100px]">
                                            <div className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">{format(date, 'EEE')}</div>
                                            <div className="text-sm font-bold">{format(date, 'dd MMM')}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map((room: any) => (
                                    <tr key={room.id} className="hover:bg-white/5 transition-colors">
                                        <td className="sticky left-0 z-10 bg-[var(--glass-card-bg)] backdrop-blur-md p-4 border-b border-r border-[var(--glass-border)]">
                                            <div className="font-bold text-sm">{room.name}</div>
                                            <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">Base: ₹{room.price}</div>
                                        </td>
                                        {dateRange.map(date => {
                                            const dateKey = format(date, 'yyyy-MM-dd');
                                            const inventoryKey = `${room.id}_${dateKey}`;
                                            const data = changes[inventoryKey] || inventoryMap[inventoryKey] || { availableRooms: room.totalRooms || 20, priceOverride: room.price };
                                            const isChanged = !!changes[inventoryKey];
                                            
                                            const availColor = data.availableRooms === 0 ? 'bg-red-500/20 text-red-500' : data.availableRooms < 5 ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500';

                                            return (
                                                <td key={dateKey} className={`p-2 border-b border-[var(--glass-border)] ${isChanged ? 'bg-[hsl(var(--accent))/0.05]' : ''}`}>
                                                    <div className="space-y-2">
                                                        {/* Rate Input */}
                                                        <div className="relative group">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[hsl(var(--muted-foreground))]">₹</span>
                                                            <input 
                                                                type="number"
                                                                value={data.priceOverride}
                                                                onChange={(e) => handleInputChange(room.id, dateKey, 'priceOverride', e.target.value)}
                                                                className="w-full pl-5 pr-2 py-1.5 text-xs font-bold bg-transparent border border-transparent hover:border-[var(--glass-border)] focus:border-[hsl(var(--accent))] focus:bg-white/5 rounded outline-none transition-all"
                                                            />
                                                        </div>
                                                        {/* Inventory Input */}
                                                        <div className={`flex items-center rounded overflow-hidden border border-transparent group-hover:border-[var(--glass-border)]`}>
                                                            <input 
                                                                type="number"
                                                                value={data.availableRooms}
                                                                onChange={(e) => handleInputChange(room.id, dateKey, 'availableRooms', e.target.value)}
                                                                className={`w-full px-2 py-1 text-[11px] font-bold text-center bg-transparent outline-none ${availColor}`}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bulk Actions Note */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold uppercase tracking-wider mb-1">Pro Tip: Bulk Management</p>
                        <p className="opacity-80">You can edit multiple rates and inventory counts across the grid and save them all at once. Changes are highlighted until they are saved to the server.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
