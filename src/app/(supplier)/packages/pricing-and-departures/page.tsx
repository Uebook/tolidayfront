'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Calendar, Users, DollarSign, Plus, Trash2, Save, Map } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

export default function PricingDeparturesPage() {
    const queryClient = useQueryClient();
    const [selectedPackage, setSelectedPackage] = useState<string>('');

    // Fetch packages
    const { data: packages = [], isLoading: packagesLoading } = useQuery({
        queryKey: ['my-packages'],
        queryFn: async () => {
            const res = await api.get('/packages');
            return res.data;
        },
    });

    // Setup local state when a package is selected
    const { data: tiersData, isLoading: tiersLoading } = useQuery({
        queryKey: ['package-tiers', selectedPackage],
        queryFn: async () => {
            if (!selectedPackage) return [];
            const res = await api.get(`/packages/${selectedPackage}/tiers`);
            return res.data;
        },
        enabled: !!selectedPackage
    });

    const { data: departuresData, isLoading: departuresLoading } = useQuery({
        queryKey: ['package-departures', selectedPackage],
        queryFn: async () => {
            if (!selectedPackage) return [];
            const res = await api.get(`/packages/${selectedPackage}/departures`);
            return res.data;
        },
        enabled: !!selectedPackage
    });

    // Local mutable state
    const [tiers, setTiers] = useState<any[]>([]);
    const [departures, setDepartures] = useState<any[]>([]);

    // Sync query data to local state
    useState(() => {
        if (tiersData) setTiers(tiersData);
        if (departuresData) setDepartures(departuresData);
    });

    const updateTiersState = (data: any[]) => setTiers(data);
    const updateDeparturesState = (data: any[]) => setDepartures(data);

    // Mutations
    const saveTiersMutation = useMutation({
        mutationFn: async () => api.post(`/packages/${selectedPackage}/tiers`, tiers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['package-tiers', selectedPackage] });
            alert('Tiers saved successfully!');
        }
    });

    const saveDeparturesMutation = useMutation({
        mutationFn: async () => api.post(`/packages/${selectedPackage}/departures`, departures),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['package-departures', selectedPackage] });
            alert('Departures saved successfully!');
        }
    });

    if (packagesLoading) return <div className="p-10 text-center">Loading...</div>;

    // We do a hacky effect to sync data on fetch completion
    if (tiersData && tiers.length === 0 && tiersData.length > 0) setTiers(tiersData);
    if (departuresData && departures.length === 0 && departuresData.length > 0) setDepartures(departuresData);

    return (
        <div>
            <Topbar title="Pricing & Departures" subtitle="Manage tiered pax pricing and fixed group departure dates" />
            <div className="p-6 space-y-6 animate-fadeIn">

                <div className="glass-card p-5 flex items-center gap-4">
                    <Map className="text-[hsl(var(--accent))]" />
                    <div className="flex-1">
                        <label className="text-xs font-bold uppercase text-[hsl(var(--muted-foreground))]">Select Tour Package</label>
                        <select 
                            value={selectedPackage}
                            onChange={(e) => {
                                setSelectedPackage(e.target.value);
                                setTiers([]);
                                setDepartures([]);
                            }}
                            className="w-full mt-1 form-input text-sm font-medium"
                        >
                            <option value="">-- Choose a Package --</option>
                            {packages.map((pkg: any) => (
                                <option key={pkg.id} value={pkg.id}>{pkg.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedPackage && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Tiered Pricing Configurator */}
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2"><Users className="text-blue-500" /> Tiered Pricing</h3>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Set dynamic per-person pricing based on group size.</p>
                                </div>
                                <button 
                                    onClick={() => saveTiersMutation.mutate()}
                                    disabled={saveTiersMutation.isPending}
                                    className="btn-primary flex items-center gap-2 px-4 py-2 text-xs"
                                >
                                    <Save size={14} /> {saveTiersMutation.isPending ? 'Saving...' : 'Save Tiers'}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {tiers.map((tier, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-[var(--glass-border)] flex items-center gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Tier Name</label>
                                                <input 
                                                    type="text" 
                                                    value={tier.name} 
                                                    onChange={e => {
                                                        const newTiers = [...tiers];
                                                        newTiers[idx].name = e.target.value;
                                                        setTiers(newTiers);
                                                    }}
                                                    placeholder="e.g. Couple / Group 4+"
                                                    className="w-full form-input text-xs mt-1" 
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Min Pax</label>
                                                    <input type="number" value={tier.paxMin} onChange={e => { const t=[...tiers]; t[idx].paxMin=Number(e.target.value); setTiers(t); }} className="w-full form-input text-xs mt-1" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Max Pax</label>
                                                    <input type="number" value={tier.paxMax} onChange={e => { const t=[...tiers]; t[idx].paxMax=Number(e.target.value); setTiers(t); }} className="w-full form-input text-xs mt-1" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Price Per Person (₹)</label>
                                                <input type="number" value={tier.pricePerPerson} onChange={e => { const t=[...tiers]; t[idx].pricePerPerson=Number(e.target.value); setTiers(t); }} className="w-full form-input text-xs mt-1 focus:ring-blue-500" />
                                            </div>
                                        </div>
                                        <button onClick={() => setTiers(tiers.filter((_, i) => i !== idx))} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}

                                <button 
                                    onClick={() => setTiers([...tiers, { name: 'New Tier', paxMin: 2, paxMax: 4, pricePerPerson: 0 }])}
                                    className="w-full py-3 border-2 border-dashed border-[var(--glass-border)] rounded-xl text-xs font-bold text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> Add Pricing Tier
                                </button>
                            </div>
                        </div>

                        {/* Fixed Departures Configurator */}
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2"><Calendar className="text-orange-500" /> Fixed Departures</h3>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Manage dates and inventory for group tours.</p>
                                </div>
                                <button 
                                    onClick={() => saveDeparturesMutation.mutate()}
                                    disabled={saveDeparturesMutation.isPending}
                                    className="btn-primary flex items-center gap-2 px-4 py-2 text-xs"
                                >
                                    <Save size={14} /> {saveDeparturesMutation.isPending ? 'Saving...' : 'Save Dates'}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {departures.map((dep, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-[var(--glass-border)] flex items-center gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Departure Date</label>
                                                <input 
                                                    type="date" 
                                                    value={dep.date} 
                                                    onChange={e => {
                                                        const newDeps = [...departures];
                                                        newDeps[idx].date = e.target.value;
                                                        setDepartures(newDeps);
                                                    }}
                                                    className="w-full form-input text-xs mt-1" 
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Total Seats</label>
                                                    <input type="number" value={dep.totalSeats} onChange={e => { const d=[...departures]; d[idx].totalSeats=Number(e.target.value); setDepartures(d); }} className="w-full form-input text-xs mt-1" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Available</label>
                                                    <input type="number" value={dep.availableSeats} onChange={e => { const d=[...departures]; d[idx].availableSeats=Number(e.target.value); setDepartures(d); }} className="w-full form-input text-xs mt-1" />
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setDepartures(departures.filter((_, i) => i !== idx))} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}

                                <button 
                                    onClick={() => setDepartures([...departures, { date: format(new Date(), 'yyyy-MM-dd'), totalSeats: 20, availableSeats: 20 }])}
                                    className="w-full py-3 border-2 border-dashed border-[var(--glass-border)] rounded-xl text-xs font-bold text-[hsl(var(--muted-foreground))] hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> Add Departure Date
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
