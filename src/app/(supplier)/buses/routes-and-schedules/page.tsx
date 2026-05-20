'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { MapPin, Plus, Calendar, Clock, Bus, User, DollarSign, ChevronRight, Filter, Navigation, Compass, TrendingUp, Users, HeartPulse, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function RoutesAndTripsPage() {
    const queryClient = useQueryClient();
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
    const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);

    const { data: routes = [], isLoading: isRoutesLoading } = useQuery({
        queryKey: ['bus-routes'],
        queryFn: async () => {
            const res = await api.get('/buses/routes');
            return res.data;
        },
    });

    const { data: schedules = [], isLoading: isSchedulesLoading } = useQuery({
        queryKey: ['bus-schedules', selectedRoute?.id],
        queryFn: async () => {
            if (!selectedRoute?.id) return [];
            const res = await api.get(`/buses/routes/${selectedRoute.id}/schedules`);
            return res.data;
        },
        enabled: !!selectedRoute?.id,
    });

    const createRouteMutation = useMutation({
        mutationFn: async (data: any) => api.post('/buses/routes', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bus-routes'] });
            setIsAddRouteModalOpen(false);
        }
    });

    if (isRoutesLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
            </div>
        );
    }

    return (
        <div>
            <Topbar title="Network Operations" subtitle="Orchestrate your routes, schedules, and fleet deployment" />
            <div className="p-6 space-y-6 animate-fadeIn">

                <div className="flex gap-8 items-start">
                    {/* Routes Sidebar */}
                    <div className="w-[380px] flex-shrink-0 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Navigation size={14} className="text-accent" /> Active Network
                            </h3>
                            <button 
                                onClick={() => setIsAddRouteModalOpen(true)}
                                className="p-2 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-all border border-accent/20"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
                            {routes.length === 0 ? (
                                <div className="glass-card p-10 text-center border-dashed border-white/10 group hover:border-accent/30 transition-all">
                                    <Compass size={40} className="mx-auto text-muted-foreground opacity-20 mb-4 group-hover:rotate-45 transition-transform duration-500" />
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No Routes Defined</p>
                                    <button 
                                        onClick={() => setIsAddRouteModalOpen(true)}
                                        className="mt-6 text-xs font-black text-accent hover:underline"
                                    >
                                        Create First Route Network &rarr;
                                    </button>
                                </div>
                            ) : (
                                routes.map((route: any) => (
                                    <div
                                        key={route.id}
                                        onClick={() => setSelectedRoute(route)}
                                        className={`glass-card p-6 cursor-pointer transition-all relative overflow-hidden group ${selectedRoute?.id === route.id ? 'border-accent shadow-[0_10px_30px_rgba(20,80,255,0.15)] ring-1 ring-accent' : 'hover:bg-white/05'}`}
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                            <Navigation size={80} />
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational</span>
                                            </div>
                                            {selectedRoute?.id === route.id && (
                                                <div className="p-1 rounded-full bg-accent text-white">
                                                    <ChevronRight size={12} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-2 h-2 rounded-full border border-accent bg-background" />
                                                <div className="w-0.5 h-6 bg-gradient-to-b from-accent to-transparent" />
                                            </div>
                                            <div>
                                                <div className="font-black text-lg text-foreground tracking-tight">{route.originCity}</div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                                    To {route.destinationCity}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-white/05 flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                <span className="flex items-center gap-1.5"><TrendingUp size={12} /> {route.distanceKm || 0} KM</span>
                                                <span className="flex items-center gap-1.5"><Clock size={12} /> {route.estimatedDuration || '4h 30m'}</span>
                                            </div>
                                            <Trash2 size={14} className="text-red-500 opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Schedules Content */}
                    <div className="flex-1 min-h-[calc(100vh-200px)]">
                        {selectedRoute ? (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center justify-between bg-white/02 p-6 rounded-[2rem] border border-white/05">
                                    <div>
                                        <h3 className="text-2xl font-black text-foreground tracking-tight">
                                            Scheduled Trips
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                                            Active departures for <span className="text-accent font-bold">{selectedRoute.originCity} &rarr; {selectedRoute.destinationCity}</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/05 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all shadow-sm">
                                            <Filter size={16} /> Filters
                                        </button>
                                        <button 
                                            onClick={() => setIsAddTripModalOpen(true)}
                                            className="btn-primary flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black shadow-[0_15px_30px_rgba(20,80,255,0.3)]"
                                        >
                                            <Plus size={18} /> New Trip Deployment
                                        </button>
                                    </div>
                                </div>

                                {isSchedulesLoading ? (
                                    <div className="h-96 flex items-center justify-center glass-card">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-5">
                                        {schedules.map((trip: any) => (
                                            <div key={trip.id} className="glass-card p-6 hover:bg-white/02 transition-all relative overflow-hidden group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-10">
                                                        <div className="text-center px-6 py-2 rounded-2xl bg-white/05 border border-white/05">
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Departure</div>
                                                            <div className="text-2xl font-black text-foreground">{trip.departureTime}</div>
                                                            <div className="text-[10px] font-bold text-accent mt-1 uppercase tracking-widest">{trip.departureDate || 'Everyday'}</div>
                                                        </div>

                                                        <div className="h-10 w-px bg-white/10" />

                                                        <div>
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Fleet Deployment</div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 rounded-xl bg-accent/10 text-accent"><Bus size={20} /></div>
                                                                <div>
                                                                    <div className="text-sm font-black text-foreground">{trip.bus?.type?.replace(/_/g, ' ') || 'Premium AC Seater'}</div>
                                                                    <div className="text-xs font-bold text-muted-foreground tracking-tight">{trip.bus?.registrationNumber || 'TBP-XXXX-99'}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="h-10 w-px bg-white/10" />

                                                        <div>
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Assigned Squad</div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-[10px] font-bold text-foreground flex items-center gap-1.5"><User size={12} className="text-blue-500" /> {trip.driver?.name || 'Driver Alpha'}</span>
                                                                    <span className="text-[10px] font-bold text-foreground flex items-center gap-1.5"><Users size={12} className="text-green-500" /> {trip.conductor?.name || 'C-1 Unit'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-10 text-right">
                                                        <div>
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Revenue Node</div>
                                                            <div className="text-2xl font-black text-foreground">₹{parseFloat(trip.baseFare || '0').toLocaleString()}</div>
                                                            <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">Smart Surge Active</div>
                                                        </div>

                                                        <div>
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Load Factor</div>
                                                            <div className="flex items-center gap-3 justify-end mb-2">
                                                                <span className="text-xs font-black text-foreground">{Math.round((trip.seatsBooked / (trip.bus?.totalSeats || 40)) * 100)}%</span>
                                                            </div>
                                                            <div className="w-32 h-1.5 bg-white/05 rounded-full overflow-hidden border border-white/05">
                                                                <div 
                                                                    className="h-full bg-gradient-to-r from-accent to-blue-500" 
                                                                    style={{ width: `${(trip.seatsBooked / (trip.bus?.totalSeats || 40)) * 100}%` }} 
                                                                />
                                                            </div>
                                                            <div className="text-[9px] font-bold text-muted-foreground mt-2">{trip.seatsBooked} / {trip.bus?.totalSeats || 40} Units Sold</div>
                                                        </div>

                                                        <button className="p-4 rounded-2xl bg-white/05 border border-white/05 hover:bg-white/10 text-foreground transition-all">
                                                            <ChevronRight size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {schedules.length === 0 && (
                                            <div className="glass-card py-32 text-center flex flex-col items-center group">
                                                <div className="w-20 h-20 rounded-full bg-white/05 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                                    <Calendar size={32} className="text-muted-foreground opacity-20" />
                                                </div>
                                                <h4 className="text-lg font-black text-foreground tracking-tight">Zero Trip Density</h4>
                                                <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
                                                    No active departures detected for this segment. Schedule a trip to begin accepting unit bookings.
                                                </p>
                                                <button 
                                                    onClick={() => setIsAddTripModalOpen(true)}
                                                    className="mt-8 px-10 py-3 rounded-2xl bg-accent text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-accent/20 hover:translate-y-[-2px] transition-all"
                                                >
                                                    Deploy First Trip Unit
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-20 glass-card border-dashed bg-transparent">
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-accent/20 blur-[80px] rounded-full animate-pulse" />
                                    <div className="relative w-32 h-32 rounded-[2.5rem] bg-white/05 border border-white/10 flex items-center justify-center">
                                        <Compass size={64} className="text-accent opacity-20 animate-[spin_10s_linear_infinite]" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-foreground tracking-tight italic">Awaiting Destination Selection</h3>
                                <p className="text-muted-foreground text-sm mt-4 max-w-md mx-auto leading-relaxed font-medium">
                                    Select an operational route from your network library to manage active departures, real-time revenue nodes, and fleet load factors.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Route Modal - Midnight Luxury */}
                {isAddRouteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                        <div 
                            className="w-full max-w-xl overflow-hidden animate-scaleIn shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10"
                            style={{ 
                                background: 'linear-gradient(145deg, #1a1f35 0%, #0d101b 100%)',
                                borderRadius: '32px'
                            }}
                        >
                            <div 
                                className="px-10 py-8 flex items-center justify-between relative overflow-hidden"
                                style={{ background: 'linear-gradient(90deg, hsl(228 80% 55%) 0%, hsl(195 90% 45%) 100%)' }}
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full" />
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                                        <Navigation size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight text-white leading-none">Map Route</h2>
                                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic">Network Architecture</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsAddRouteModalOpen(false)} className="p-2.5 rounded-full hover:bg-white/10 text-white/80 transition-all">
                                    <Plus size={24} className="rotate-45" />
                                </button>
                            </div>

                            <form className="p-10 space-y-10" onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                createRouteMutation.mutate({
                                    originCity: formData.get('origin'),
                                    destinationCity: formData.get('destination'),
                                    distanceKm: Number(formData.get('distance')),
                                    estimatedDuration: formData.get('duration'),
                                });
                            }}>
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Departure Origin</label>
                                        <input name="origin" required className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-white/10 shadow-inner" placeholder="e.g. New Delhi" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Terminal Destination</label>
                                        <input name="destination" required className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-white/10 shadow-inner" placeholder="e.g. Manali" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Distance Matrix (KM)</label>
                                        <input name="distance" type="number" required className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all shadow-inner" placeholder="570" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Estd. Drive Time</label>
                                        <input name="duration" required className="w-full bg-white/05 border border-white/05 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-white/10 shadow-inner" placeholder="11h 30m" />
                                    </div>
                                </div>

                                <div className="flex gap-6 pt-6">
                                    <button type="button" onClick={() => setIsAddRouteModalOpen(false)} className="flex-1 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] border border-white/10 text-white/40 hover:text-white transition-all">Discard</button>
                                    <button 
                                        type="submit" 
                                        disabled={createRouteMutation.isPending} 
                                        className="flex-[2] py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_20px_50px_rgba(20,80,255,0.4)] relative overflow-hidden group"
                                        style={{ background: 'linear-gradient(135deg, hsl(228 80% 55%) 0%, hsl(195 90% 45%) 100%)' }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        <span className="relative z-10">{createRouteMutation.isPending ? 'Mapping...' : 'Establish Route'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

import { ChevronDown as LucideChevronDown } from 'lucide-react';
