'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { DollarSign, Plus, Map, Clock, Plane, Trash2, Save } from 'lucide-react';
import { useState } from 'react';

export default function RatesPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'OUTSTATION' | 'LOCAL_RENTAL' | 'AIRPORT_TRANSFER'>('OUTSTATION');

    const { data: pricing = [], isLoading } = useQuery({
        queryKey: ['cabs-pricing'],
        queryFn: async () => {
            const res = await api.get('/cabs/pricing');
            return res.data;
        },
    });

    const [newPricing, setNewPricing] = useState({
        model: 'OUTSTATION',
        category: 'SEDAN',
        perKmRate: 12,
        driverAllowancePerDay: 300,
        minKmPerDay: 250,
        packageHours: 8,
        packageKms: 80,
        basePackageRate: 2000,
        extraHourRate: 200,
        extraKmRate: 15,
        pickupLocation: '',
        dropLocation: '',
        flatRate: 1500
    });

    const createMutation = useMutation({
        mutationFn: async () => api.post('/cabs/pricing', { ...newPricing, model: activeTab }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cabs-pricing'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => api.delete(`/cabs/pricing/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cabs-pricing'] })
    });

    const filteredPricing = pricing.filter((p: any) => p.model === activeTab);

    return (
        <div>
            <Topbar title="Rate Manager" subtitle="Configure pricing for Outstation, Local Rentals, and Airport Drops" />
            <div className="p-6 space-y-6 animate-fadeIn">

                <div className="flex border-b border-[var(--glass-border)]">
                    <button 
                        onClick={() => setActiveTab('OUTSTATION')}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'OUTSTATION' ? 'border-[hsl(var(--accent))] text-[hsl(var(--accent))]' : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
                    >
                        <Map size={16} className="inline mr-2" /> Outstation (Per Km)
                    </button>
                    <button 
                        onClick={() => setActiveTab('LOCAL_RENTAL')}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'LOCAL_RENTAL' ? 'border-[hsl(var(--accent))] text-[hsl(var(--accent))]' : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
                    >
                        <Clock size={16} className="inline mr-2" /> Local Rentals
                    </button>
                    <button 
                        onClick={() => setActiveTab('AIRPORT_TRANSFER')}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'AIRPORT_TRANSFER' ? 'border-[hsl(var(--accent))] text-[hsl(var(--accent))]' : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
                    >
                        <Plane size={16} className="inline mr-2" /> Airport Transfers
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Active Rules List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-bold text-lg">Active {activeTab.replace('_', ' ').toLowerCase()} rates</h3>
                        
                        {isLoading ? (
                            <div className="text-center p-10">Loading...</div>
                        ) : filteredPricing.length === 0 ? (
                            <div className="text-center py-12 glass-card border-dashed">
                                <DollarSign size={40} className="mx-auto text-[hsl(var(--muted-foreground))] opacity-30 mb-4" />
                                <h4 className="font-bold">No Rates Configured</h4>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">Configure your pricing on the right to start receiving bookings.</p>
                            </div>
                        ) : (
                            filteredPricing.map((rate: any) => (
                                <div key={rate.id} className="glass-card p-5 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] text-xs font-bold px-2 py-1 rounded">
                                                {rate.category}
                                            </span>
                                            {rate.isActive && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                                        </div>
                                        
                                        {activeTab === 'OUTSTATION' && (
                                            <div className="text-sm">
                                                <span className="font-bold text-lg">₹{rate.perKmRate}</span> / km 
                                                <span className="text-[hsl(var(--muted-foreground))] mx-2">|</span>
                                                Min {rate.minKmPerDay} km/day
                                                <span className="text-[hsl(var(--muted-foreground))] mx-2">|</span>
                                                Driver: ₹{rate.driverAllowancePerDay}/day
                                            </div>
                                        )}

                                        {activeTab === 'LOCAL_RENTAL' && (
                                            <div className="text-sm">
                                                <span className="font-bold">{rate.packageHours} Hrs / {rate.packageKms} Kms</span>
                                                <span className="mx-2">&rarr;</span>
                                                <span className="font-bold text-lg text-green-500">₹{rate.basePackageRate}</span>
                                                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                                                    Extra: ₹{rate.extraHourRate}/hr &bull; ₹{rate.extraKmRate}/km
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'AIRPORT_TRANSFER' && (
                                            <div className="text-sm">
                                                <span className="font-bold">{rate.pickupLocation || 'City'}</span> to <span className="font-bold">{rate.dropLocation || 'Airport'}</span>
                                                <span className="mx-2">&rarr;</span>
                                                <span className="font-bold text-lg text-blue-500">Flat ₹{rate.flatRate}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => deleteMutation.mutate(rate.id)}
                                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* New Rate Form */}
                    <div className="glass-card p-6 h-fit sticky top-24">
                        <h3 className="font-bold text-lg mb-6">Add New Rate</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">Vehicle Category</label>
                                <select 
                                    value={newPricing.category} 
                                    onChange={e => setNewPricing({...newPricing, category: e.target.value})} 
                                    className="form-input"
                                >
                                    <option value="HATCHBACK">Hatchback</option>
                                    <option value="SEDAN">Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="PREMIUM_SUV">Premium SUV</option>
                                    <option value="LUXURY">Luxury</option>
                                </select>
                            </div>

                            {activeTab === 'OUTSTATION' && (
                                <>
                                    <div>
                                        <label className="text-xs font-bold block mb-1">Per Km Rate (₹)</label>
                                        <input type="number" value={newPricing.perKmRate} onChange={e => setNewPricing({...newPricing, perKmRate: Number(e.target.value)})} className="form-input" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold block mb-1">Driver Allowance / Day (₹)</label>
                                        <input type="number" value={newPricing.driverAllowancePerDay} onChange={e => setNewPricing({...newPricing, driverAllowancePerDay: Number(e.target.value)})} className="form-input" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold block mb-1">Min Billed Kms / Day</label>
                                        <input type="number" value={newPricing.minKmPerDay} onChange={e => setNewPricing({...newPricing, minKmPerDay: Number(e.target.value)})} className="form-input" />
                                    </div>
                                </>
                            )}

                            {activeTab === 'LOCAL_RENTAL' && (
                                <>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-bold block mb-1">Package Hrs</label>
                                            <input type="number" value={newPricing.packageHours} onChange={e => setNewPricing({...newPricing, packageHours: Number(e.target.value)})} className="form-input" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold block mb-1">Package Kms</label>
                                            <input type="number" value={newPricing.packageKms} onChange={e => setNewPricing({...newPricing, packageKms: Number(e.target.value)})} className="form-input" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold block mb-1">Base Rate (₹)</label>
                                        <input type="number" value={newPricing.basePackageRate} onChange={e => setNewPricing({...newPricing, basePackageRate: Number(e.target.value)})} className="form-input" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--glass-border)]">
                                        <div>
                                            <label className="text-xs font-bold block mb-1">Extra Hr (₹)</label>
                                            <input type="number" value={newPricing.extraHourRate} onChange={e => setNewPricing({...newPricing, extraHourRate: Number(e.target.value)})} className="form-input" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold block mb-1">Extra Km (₹)</label>
                                            <input type="number" value={newPricing.extraKmRate} onChange={e => setNewPricing({...newPricing, extraKmRate: Number(e.target.value)})} className="form-input" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'AIRPORT_TRANSFER' && (
                                <>
                                    <div>
                                        <label className="text-xs font-bold block mb-1">Pickup Zone/City</label>
                                        <input type="text" value={newPricing.pickupLocation} onChange={e => setNewPricing({...newPricing, pickupLocation: e.target.value})} placeholder="e.g. Bangalore City" className="form-input" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold block mb-1">Drop Airport</label>
                                        <input type="text" value={newPricing.dropLocation} onChange={e => setNewPricing({...newPricing, dropLocation: e.target.value})} placeholder="e.g. KIA Airport" className="form-input" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold block mb-1">Flat Rate (₹)</label>
                                        <input type="number" value={newPricing.flatRate} onChange={e => setNewPricing({...newPricing, flatRate: Number(e.target.value)})} className="form-input text-lg font-bold text-blue-500" />
                                    </div>
                                </>
                            )}

                            <button 
                                onClick={() => createMutation.mutate()}
                                disabled={createMutation.isPending}
                                className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4 font-bold"
                            >
                                <Save size={16} /> Save Rate
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
