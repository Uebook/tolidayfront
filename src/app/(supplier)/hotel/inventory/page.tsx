'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    eachDayOfInterval, getDay,
} from 'date-fns';

type DayData = { availableRooms: number; totalRooms: number; priceOverride?: number; stop_sale?: boolean };

function DayCell({
    date, data, total, onClick, selected,
}: {
    date: Date; data?: DayData; total: number; onClick: () => void; selected: boolean;
}) {
    if (!data) return <div onClick={onClick} className="h-16 rounded-lg cursor-pointer hover:bg-[var(--glass-border-light)]" style={{ background: 'var(--glass-border-light)', opacity: 0.3 }} />;

    const available = data.availableRooms;
    const pct = total > 0 ? (available / total) * 100 : 0;
    // stop_sale isn't in backend yet, we'll infer it from availableRooms === 0 for now or placeholder
    const isStopSale = data.stop_sale || available === 0;
    const color = isStopSale ? 'hsl(0 84% 60%)' : pct < 30 ? 'hsl(38 92% 50%)' : 'hsl(142 71% 45%)';

    return (
        <div
            onClick={onClick}
            className="h-16 rounded-lg p-1.5 cursor-pointer transition-all hover:scale-105"
            style={{
                background: selected ? 'rgba(99,153,255,0.2)' : 'var(--glass-border-light)',
                border: selected ? '1px solid hsl(225 70% 55%)' : isStopSale ? '1px solid hsl(0 84% 60% / 0.4)' : '1px solid transparent',
            }}
        >
            <div className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{format(date, 'd')}</div>
            {isStopSale && available === 0 ? (
                <div className="text-center mt-1">
                    <span className="text-[10px] font-bold" style={{ color: 'hsl(0 84% 60%)' }}>FULL</span>
                </div>
            ) : (
                <>
                    <div className="text-sm font-bold" style={{ color }}>{available}/{total}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>₹{((data.priceOverride || 0) / 1000).toFixed(1)}k</div>
                </>
            )}
        </div>
    );
}

export default function InventoryPage() {
    const queryClient = useQueryClient();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [editPanel, setEditPanel] = useState(false);

    // Form states
    const [available, setAvailable] = useState(10);
    const [rate, setRate] = useState(4500);

    // Fetch Room Types
    const { data: rooms = [] } = useQuery({
        queryKey: ['room-types'],
        queryFn: async () => {
            const res = await api.get('/room-types');
            if (res.data.length > 0 && !selectedRoom) {
                setSelectedRoom(res.data[0].id);
            }
            return res.data;
        },
    });

    const activeRoom = rooms.find((r: any) => r.id === selectedRoom);

    // Fetch Inventory for current month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDateStr = format(monthStart, 'yyyy-MM-dd');
    const endDateStr = format(monthEnd, 'yyyy-MM-dd');

    const { data: rawInventory = [], isLoading: invLoading } = useQuery({
        queryKey: ['inventory', selectedRoom, startDateStr],
        queryFn: async () => {
            if (!selectedRoom) return [];
            const res = await api.get(`/inventory?roomTypeId=${selectedRoom}&startDate=${startDateStr}&endDate=${endDateStr}`);
            return res.data;
        },
        enabled: !!selectedRoom,
    });

    // Map inventory to a date-keyed object
    const inventoryMap = useMemo(() => {
        const map: Record<string, DayData> = {};
        rawInventory.forEach((item: any) => {
            map[item.date] = item;
        });
        return map;
    }, [rawInventory]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any) => {
            return api.post('/inventory/update', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            setEditPanel(false);
        },
    });

    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startPadding = getDay(monthStart);

    const handleDayClick = (date: Date) => {
        const key = format(date, 'yyyy-MM-dd');
        setSelectedDay(key);
        const d = inventoryMap[key];
        setAvailable(d ? d.availableRooms : activeRoom?.totalRooms || 20);
        setRate(d ? d.priceOverride : activeRoom?.price || 4500);
        setEditPanel(true);
    };

    const handleSave = () => {
        if (!selectedDay || !selectedRoom) return;
        updateMutation.mutate({
            roomTypeId: selectedRoom,
            startDate: selectedDay,
            endDate: selectedDay,
            totalRooms: available, // Backend currently ties totalRooms to availability in its logic
            priceOverride: rate,
        });
    };

    return (
        <div>
            <Topbar title="Inventory Console" subtitle="Manage daily availability and price overrides" />
            <div className="p-6 space-y-5 animate-fadeIn">

                {/* Room Selector Tabs */}
                <div className="flex flex-wrap gap-2">
                    {rooms.map((r: any) => (
                        <button
                            key={r.id}
                            onClick={() => { setSelectedRoom(r.id); setSelectedDay(null); setEditPanel(false); }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: selectedRoom === r.id ? 'linear-gradient(135deg, hsl(225 70% 55%), hsl(199 89% 48%))' : 'var(--glass-border-light)',
                                color: selectedRoom === r.id ? 'white' : 'hsl(var(--muted-foreground))',
                                border: '1px solid var(--glass-border-light)',
                            }}
                        >
                            {r.name}
                        </button>
                    ))}
                </div>

                <div className="flex gap-5">
                    {/* Calendar */}
                    <div className="flex-1 glass-card p-5">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-semibold text-[hsl(var(--foreground))]">{format(currentMonth, 'MMMM yyyy')}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-[var(--table-header)] transition-colors">
                                    <ChevronLeft size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                </button>
                                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-[var(--table-header)] transition-colors">
                                    <ChevronRight size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                <div key={d} className="text-center text-[10px] uppercase font-bold py-2" style={{ color: 'hsl(var(--muted-foreground))' }}>{d}</div>
                            ))}
                        </div>

                        {invLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: startPadding }).map((_, i) => <div key={`pad-${i}`} />)}
                                {days.map((date) => (
                                    <DayCell
                                        key={format(date, 'yyyy-MM-dd')}
                                        date={date}
                                        data={inventoryMap[format(date, 'yyyy-MM-dd')]}
                                        total={activeRoom?.totalRooms || 20}
                                        selected={selectedDay === format(date, 'yyyy-MM-dd')}
                                        onClick={() => handleDayClick(date)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Edit Panel */}
                    {editPanel && selectedDay && (
                        <div className="w-64 glass-card p-5 h-fit animate-slideInRight">
                            <h4 className="font-semibold text-[hsl(var(--foreground))] mb-1">{format(new Date(selectedDay), 'dd MMM yyyy')}</h4>
                            <p className="text-xs mb-5" style={{ color: 'hsl(var(--muted-foreground))' }}>{activeRoom?.name}</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Total Rooms</label>
                                    <input type="number" value={available} onChange={(e) => setAvailable(Number(e.target.value))}
                                        className="form-input" />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Rate Override (₹)</label>
                                    <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="form-input" />
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending}
                                    className="btn-primary w-full py-2.5 text-sm"
                                >
                                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={() => setEditPanel(false)}
                                    className="w-full py-2.5 text-sm rounded-lg"
                                    style={{ border: '1px solid var(--glass-border)', color: 'hsl(var(--muted-foreground))' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
