'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { FileText, Download, Search, Users, Bus, Clock, MapPin } from 'lucide-react';
import { useState } from 'react';
import { getAuthUser } from '@/lib/auth';

export default function TripManifestPage() {
    const [user] = useState(() => getAuthUser());
    const [selectedTrip, setSelectedTrip] = useState<string>('');

    // Fetch schedules/trips
    const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
        queryKey: ['bus-schedules', user?.busVendorId || user?.bus_vendor_id],
        queryFn: async () => {
            const vendorId = user?.busVendorId || user?.bus_vendor_id;
            if (!vendorId) return [];
            // In a real app, we'd fetch active schedules for this vendor
            const res = await api.get(`/buses/vendors/${vendorId}/buses`);
            // Mocking trips for now based on buses
            return res.data.map((b: any) => ({
                id: `trip-${b.id}`,
                bus: b,
                departureTime: '10:00 PM',
                route: { source: 'Delhi', destination: 'Manali' }
            }));
        },
        enabled: !!user
    });

    const { data: manifest = [], isLoading: manifestLoading } = useQuery({
        queryKey: ['trip-manifest', selectedTrip],
        queryFn: async () => {
            if (!selectedTrip) return [];
            // In a real app, fetch bookings for this schedule
            const res = await api.get('/buses/bookings'); 
            return res.data;
        },
        enabled: !!selectedTrip
    });

    return (
        <div>
            <Topbar title="Trip Manifests" subtitle="Generate and download passenger boarding lists for active trips" />
            <div className="p-6 space-y-6 animate-fadeIn">

                <div className="glass-card p-6 flex items-center gap-6">
                    <div className="p-3 rounded-2xl bg-accent/10 text-accent">
                        <Bus size={24} />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Select Active Trip</label>
                        <select 
                            value={selectedTrip}
                            onChange={(e) => setSelectedTrip(e.target.value)}
                            className="w-full mt-1 form-input text-sm font-medium appearance-none"
                        >
                            <option value="">-- Choose a Scheduled Trip --</option>
                            {schedules.map((s: any) => (
                                <option key={s.id} value={s.id}>
                                    {s.bus?.registrationNumber} - {s.route?.source} to {s.route?.destination} ({s.departureTime})
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedTrip && (
                        <button className="btn-primary flex items-center gap-2 px-6 py-3 font-bold shadow-lg shadow-accent/20">
                            <Download size={18} /> Download PDF
                        </button>
                    )}
                </div>

                {selectedTrip ? (
                    <div className="glass-card overflow-hidden animate-fadeIn">
                        <div className="px-6 py-4 border-b border-white/05 flex items-center justify-between bg-white/02">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <Users size={18} className="text-muted-foreground" /> 
                                Boarding List ({manifest.length} Passengers)
                            </h3>
                            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                <span className="flex items-center gap-1.5"><Clock size={14} /> DEP: 10:00 PM</span>
                                <span className="flex items-center gap-1.5"><MapPin size={14} /> PLATFORM 4</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/05 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Seat</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Passenger Details</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">PNR / Ticket</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Boarding Pt.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/05">
                                    {manifest.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <FileText size={48} className="mx-auto text-muted-foreground opacity-10 mb-4" />
                                                <p className="text-muted-foreground text-sm">No passengers booked for this trip yet.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        manifest.map((m: any) => (
                                            <tr key={m.id} className="hover:bg-white/02 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center font-black text-accent text-xs">
                                                        {m.seatNumber}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-foreground">{m.passengerName}</div>
                                                    <div className="text-xs text-muted-foreground">{m.passengerPhone}</div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs tracking-tight">{m.pnr}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`badge ${m.status === 'CONFIRMED' ? 'badge-success' : 'badge-muted'}`}>
                                                        {m.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-muted-foreground">Kashmiri Gate ISBT</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="glass-card py-40 text-center">
                        <FileText size={64} className="mx-auto text-muted-foreground opacity-10 mb-6" />
                        <h3 className="text-xl font-black text-foreground">No Trip Selected</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                            Choose an active trip from the dropdown to generate and view the passenger manifest.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
