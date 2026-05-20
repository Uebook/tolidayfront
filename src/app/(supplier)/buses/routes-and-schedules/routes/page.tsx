'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { MapPin, Plus, Navigation, Clock, ChevronRight, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { getAuthUser } from '@/lib/auth';

export default function BusRoutesPage() {
    const queryClient = useQueryClient();
    const [user] = useState(() => getAuthUser());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { data: routes = [], isLoading } = useQuery({
        queryKey: ['bus-routes'],
        queryFn: async () => {
            const res = await api.get('/buses/routes');
            return res.data;
        }
    });

    const addRouteMutation = useMutation({
        mutationFn: async (data: any) => {
            return api.post('/buses/routes', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bus-routes'] });
            setIsAddModalOpen(false);
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
            </div>
        );
    }

    return (
        <div>
            <Topbar title="Route Network" subtitle="Define and manage your bus service routes and stops" />
            <div className="p-6 space-y-6 animate-fadeIn">

                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div className="glass-card px-4 py-3 text-center min-w-[120px]">
                        <div className="text-xl font-bold text-foreground">{routes.length}</div>
                        <div className="text-xs mt-1 text-muted-foreground">Active Routes</div>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
                    >
                        <Plus size={16} /> Create New Route
                    </button>
                </div>

                {/* Routes Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {routes.length === 0 ? (
                        <div className="col-span-full py-20 glass-card border-dashed text-center">
                            <Navigation size={48} className="mx-auto text-muted-foreground opacity-10 mb-4" />
                            <p className="text-muted-foreground text-sm font-medium">No routes defined yet. Start by creating your first network path.</p>
                        </div>
                    ) : (
                        routes.map((route: any) => (
                            <div key={route.id} className="glass-card p-6 hover:scale-[1.01] transition-transform group">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-accent/10 text-accent">
                                            <Navigation size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                                                {route.source} <ChevronRight size={16} className="text-muted-foreground" /> {route.destination}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">Approx. {route.distanceKm} km • {route.durationHours}h {route.durationMinutes}m</p>
                                        </div>
                                    </div>
                                    <button className="p-2 rounded-lg hover:bg-white/05 text-muted-foreground">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 py-4 border-y border-white/05">
                                    <div className="flex -space-x-2">
                                        {route.stops?.map((stop: string, i: number) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-[var(--background)] flex items-center justify-center text-[10px] font-bold" title={stop}>
                                                {stop[0]}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground">+{route.stops?.length || 0} intermediate stops</span>
                                </div>

                                <div className="flex items-center justify-between mt-6">
                                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                        <span className="flex items-center gap-1.5"><Clock size={14} /> Regular Service</span>
                                        <span className="flex items-center gap-1.5"><MapPin size={14} /> {route.stops?.length || 0} Stops</span>
                                    </div>
                                    <button className="text-sm font-bold text-accent hover:underline">View Schedules</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Route Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                        <div className="glass-card w-full max-w-xl p-8 animate-scaleIn shadow-2xl border-white/10">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-accent/10 text-accent">
                                        <Navigation size={20} />
                                    </div>
                                    Define New Route
                                </h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-full hover:bg-white/05">
                                    <Plus size={20} className="rotate-45" />
                                </button>
                            </div>

                            <form className="space-y-6" onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                addRouteMutation.mutate({
                                    source: formData.get('source'),
                                    destination: formData.get('destination'),
                                    distanceKm: Number(formData.get('distanceKm')),
                                    durationHours: Number(formData.get('durationHours')),
                                    durationMinutes: Number(formData.get('durationMinutes')),
                                    stops: (formData.get('stops') as string).split(',').map(s => s.trim()).filter(Boolean),
                                });
                            }}>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Source City</label>
                                        <input name="source" required className="form-input !pl-4" placeholder="e.g. Bangalore" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Destination City</label>
                                        <input name="destination" required className="form-input !pl-4" placeholder="e.g. Hyderabad" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Distance (KM)</label>
                                        <input name="distanceKm" type="number" required className="form-input !pl-4" placeholder="570" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hours</label>
                                        <input name="durationHours" type="number" required className="form-input !pl-4" placeholder="9" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Minutes</label>
                                        <input name="durationMinutes" type="number" required className="form-input !pl-4" placeholder="30" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Intermediate Stops (Comma separated)</label>
                                    <textarea 
                                        name="stops" 
                                        rows={3}
                                        className="form-input !pl-4 py-3 resize-none" 
                                        placeholder="e.g. Kurnool, Anantapur, Devanahalli"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary flex-1 py-4">Cancel</button>
                                    <button type="submit" disabled={addRouteMutation.isPending} className="btn-primary flex-[2] py-4 font-black">
                                        {addRouteMutation.isPending ? 'Saving Route...' : 'Create Route Network'}
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
