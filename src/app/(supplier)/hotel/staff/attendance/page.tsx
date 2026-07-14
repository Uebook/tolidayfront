'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { ArrowLeft, Clock, LogIn, LogOut, CalendarDays, Filter, Calendar, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

export default function StaffAttendancePage() {
    const queryClient = useQueryClient();
    const [selectedStaff, setSelectedStaff] = useState('');
    
    // Filters
    const [filterDate, setFilterDate] = useState('');
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    // Fetch staff list
    const { data: staffList = [], isLoading: staffLoading } = useQuery({
        queryKey: ['hotel-staff'],
        queryFn: async () => {
            const profileRes = await api.get('/hotel/my-hotel');
            const hotelId = profileRes.data.id;
            const res = await api.get(`/staff?hotelId=${hotelId}`);
            return res.data;
        }
    });

    // Fetch attendance logs
    const { data: logs = [], isLoading: logsLoading } = useQuery({
        queryKey: ['staff-attendance-logs'],
        queryFn: async () => {
            const res = await api.get('/staff/attendance/all');
            return res.data;
        }
    });

    // Clock Mutation
    const clockMutation = useMutation({
        mutationFn: async (vars: { staffId: string; action: 'IN' | 'OUT' }) => {
            return api.post('/staff/attendance/clock', vars);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff-attendance-logs'] });
            setSelectedStaff('');
            alert('Attendance logged successfully!');
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to log attendance');
        }
    });

    const handleClock = (action: 'IN' | 'OUT') => {
        if (!selectedStaff) {
            alert('Please select a staff member.');
            return;
        }
        clockMutation.mutate({ staffId: selectedStaff, action });
    };

    // Filter Logic
    const filteredLogs = useMemo(() => {
        return logs.filter((log: any) => {
            if (!log.clockIn) return false;
            const logDate = new Date(log.clockIn);
            const logMonthStr = logDate.toISOString().slice(0, 7);
            const logDateStr = logDate.toISOString().slice(0, 10);
            
            if (filterDate && logDateStr !== filterDate) return false;
            if (!filterDate && filterMonth && logMonthStr !== filterMonth) return false;
            return true;
        });
    }, [logs, filterDate, filterMonth]);

    // Summary Calculations (Monthly/Filtered)
    const summary = useMemo(() => {
        const uniqueStaffPresent = new Set();
        let activeShifts = 0;
        let totalLogs = filteredLogs.length;

        filteredLogs.forEach((log: any) => {
            if (log.staff?.id) uniqueStaffPresent.add(log.staff.id);
            if (!log.clockOut) activeShifts++;
        });

        return {
            totalPresent: uniqueStaffPresent.size,
            activeShifts,
            totalLogs
        };
    }, [filteredLogs]);

    if (staffLoading || logsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 size={32} className="animate-spin text-[hsl(var(--accent))]" />
            </div>
        );
    }

    return (
        <div>
            <Topbar title="Staff Attendance Roster" subtitle="Manage and track employee shifts" />
            <div className="p-6 space-y-6 animate-fadeIn max-w-[1400px] mx-auto">
                <div className="flex items-center justify-between">
                    <Link href="/hotel/staff" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-[hsl(var(--foreground))] text-[hsl(var(--muted-foreground))]">
                        <ArrowLeft size={16} /> Back to Staff Management
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-5 border-l-4 border-l-blue-500">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <CalendarDays size={20} />
                            </div>
                            <h3 className="font-bold text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Filtered Logs</h3>
                        </div>
                        <p className="text-3xl font-black text-[hsl(var(--foreground))]">{summary.totalLogs}</p>
                    </div>
                    <div className="glass-card p-5 border-l-4 border-l-green-500">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                                <Users size={20} />
                            </div>
                            <h3 className="font-bold text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Unique Staff Present</h3>
                        </div>
                        <p className="text-3xl font-black text-[hsl(var(--foreground))]">{summary.totalPresent} <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">staff</span></p>
                    </div>
                    <div className="glass-card p-5 border-l-4 border-l-orange-500">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                <Clock size={20} />
                            </div>
                            <h3 className="font-bold text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Active Shifts</h3>
                        </div>
                        <p className="text-3xl font-black text-[hsl(var(--foreground))]">{summary.activeShifts} <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">currently working</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Log Card */}
                    <div className="glass-card p-6 space-y-6 h-fit bg-[var(--table-header)] shadow-lg">
                        <h3 className="font-bold text-lg text-[hsl(var(--foreground))] flex items-center gap-2 border-b border-[var(--glass-border-light)] pb-4">
                            <Clock size={20} className="text-[hsl(var(--accent))]" /> Quick Action: Clock-In/Out
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Select Staff Member</label>
                                <select 
                                    value={selectedStaff}
                                    onChange={(e) => setSelectedStaff(e.target.value)}
                                    className="form-input w-full bg-[var(--card)] border border-[var(--glass-border)] shadow-sm"
                                >
                                    <option value="">Choose Staff...</option>
                                    {staffList.map((st: any) => (
                                        <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button 
                                    onClick={() => handleClock('IN')}
                                    disabled={clockMutation.isPending}
                                    className="px-4 py-3.5 rounded-xl border border-green-500 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-sm disabled:opacity-50"
                                >
                                    <LogIn size={18} /> Clock In
                                </button>
                                <button 
                                    onClick={() => handleClock('OUT')}
                                    disabled={clockMutation.isPending}
                                    className="px-4 py-3.5 rounded-xl border border-rose-500 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-sm disabled:opacity-50"
                                >
                                    <LogOut size={18} /> Clock Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="xl:col-span-2 glass-card overflow-hidden shadow-lg flex flex-col h-[600px]">
                        <div className="p-5 border-b border-[var(--glass-border-light)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--table-header)]">
                            <h3 className="font-bold text-lg text-[hsl(var(--foreground))] flex items-center gap-2">
                                <Calendar size={20} className="text-[hsl(var(--accent))]" /> Attendance History
                            </h3>
                            
                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 bg-[var(--card)] px-3 py-1.5 rounded-lg border border-[var(--glass-border-light)]">
                                    <Filter size={14} className="text-[hsl(var(--muted-foreground))]" />
                                    <input 
                                        type="month" 
                                        value={filterMonth}
                                        onChange={(e) => { setFilterMonth(e.target.value); setFilterDate(''); }}
                                        className="bg-transparent text-sm font-medium outline-none text-[hsl(var(--foreground))]"
                                        title="Filter by Month"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-[var(--card)] px-3 py-1.5 rounded-lg border border-[var(--glass-border-light)]">
                                    <CalendarDays size={14} className="text-[hsl(var(--muted-foreground))]" />
                                    <input 
                                        type="date" 
                                        value={filterDate}
                                        onChange={(e) => { setFilterDate(e.target.value); setFilterMonth(''); }}
                                        className="bg-transparent text-sm font-medium outline-none text-[hsl(var(--foreground))]"
                                        title="Filter by Specific Date"
                                    />
                                </div>
                                {(filterDate || filterMonth) && (
                                    <button 
                                        onClick={() => { setFilterDate(''); setFilterMonth(''); }}
                                        className="text-xs font-bold text-rose-500 hover:underline"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            <table className="w-full text-left text-sm relative">
                                <thead className="bg-[var(--table-header)] text-[hsl(var(--muted-foreground))] text-[11px] uppercase tracking-wider sticky top-0 z-10 shadow-sm border-b border-[var(--glass-border-light)]">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Staff Member</th>
                                        <th className="px-6 py-4 font-bold text-center">Clock In</th>
                                        <th className="px-6 py-4 font-bold text-center">Clock Out</th>
                                        <th className="px-6 py-4 font-bold text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--glass-border-light)]">
                                    {filteredLogs.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--accent))] to-blue-600 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                                                        {log.staff?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-[hsl(var(--foreground))]">{log.staff?.name}</p>
                                                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase font-bold tracking-wider">{log.staff?.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold text-center text-[hsl(var(--foreground))]">
                                                {log.clockIn ? new Date(log.clockIn).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold text-center text-[hsl(var(--foreground))]">
                                                {log.clockOut ? new Date(log.clockOut).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded-full animate-pulse">Active Shift</span>}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${log.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-[var(--glass-border-light)] text-[hsl(var(--foreground))]'}`}>{log.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-16">
                                                <div className="flex flex-col items-center justify-center text-[hsl(var(--muted-foreground))]">
                                                    <CalendarDays size={32} className="mb-3 opacity-20" />
                                                    <p className="font-medium text-sm">No attendance logs found for the selected filter.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
