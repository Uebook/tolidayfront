'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { CarFront, Plus, Search, MapPin, Settings, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import MediaSelector from '@/components/ui/MediaSelector';

export default function FleetPage() {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);

    const { data: fleet = [], isLoading } = useQuery({
        queryKey: ['cabs-fleet'],
        queryFn: async () => {
            const res = await api.get('/cabs/fleet');
            return res.data;
        },
    });

    const [newVehicle, setNewVehicle] = useState({
        registrationNumber: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        category: 'SEDAN',
        seatingCapacity: 4,
        hasAC: true,
        images: [] as string[]
    });

    const createMutation = useMutation({
        mutationFn: async () => api.post('/cabs/fleet', newVehicle),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cabs-fleet'] });
            setIsCreating(false);
            setNewVehicle({
                registrationNumber: '', make: '', model: '', year: 2024, category: 'SEDAN', seatingCapacity: 4, hasAC: true, images: []
            });
        }
    });

    return (
        <div>
            <Topbar title="Fleet Management" subtitle="Manage your vehicles, documents, and availability" />
            <div className="p-6 space-y-6 animate-fadeIn">

                <div className="flex items-center justify-between">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={16} />
                        <input type="text" placeholder="Search Registration no..." className="form-input pl-10 text-sm" />
                    </div>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-bold"
                    >
                        <Plus size={16} /> Add Vehicle
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center p-10">Loading fleet...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {fleet.map((vehicle: any) => (
                            <div key={vehicle.id} className="glass-card p-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-2">
                                    {vehicle.verificationStatus === 'APPROVED' ? (
                                        <div className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-bl-lg">
                                            <CheckCircle2 size={12} /> Verified
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-bl-lg">
                                            <AlertCircle size={12} /> Pending KYC
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] rounded-xl">
                                        <CarFront size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight uppercase">{vehicle.registrationNumber}</h3>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                                    <div className="bg-white/5 border border-[var(--glass-border)] rounded-lg p-2 text-center">
                                        <span className="block text-[10px] text-[hsl(var(--muted-foreground))] uppercase font-bold">Category</span>
                                        <span className="font-medium">{vehicle.category}</span>
                                    </div>
                                    <div className="bg-white/5 border border-[var(--glass-border)] rounded-lg p-2 text-center">
                                        <span className="block text-[10px] text-[hsl(var(--muted-foreground))] uppercase font-bold">Seats</span>
                                        <span className="font-medium">{vehicle.seatingCapacity} + 1</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)]">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-3 w-3">
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${vehicle.isActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                            <span className={`relative inline-flex rounded-full h-3 w-3 ${vehicle.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        </span>
                                        <span className="text-xs font-medium">{vehicle.isActive ? 'Available for Dispatch' : 'Out of Service'}</span>
                                    </div>
                                    <button className="text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/10 p-2 rounded-lg transition-colors">
                                        <Settings size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {fleet.length === 0 && !isCreating && (
                            <div className="col-span-full text-center py-20 glass-card border-dashed">
                                <CarFront size={48} className="mx-auto text-[hsl(var(--muted-foreground))] opacity-30 mb-4" />
                                <h3 className="text-lg font-bold">No Vehicles Found</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">Start building your fleet by adding your first vehicle.</p>
                            </div>
                        )}
                    </div>
                )}

                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="glass-card w-full max-w-lg p-6 animate-slideInUp">
                            <h3 className="font-bold text-xl mb-6">Add New Vehicle</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs font-bold block mb-1">Registration Number</label>
                                    <input type="text" value={newVehicle.registrationNumber} onChange={e => setNewVehicle({...newVehicle, registrationNumber: e.target.value.toUpperCase()})} placeholder="MH 01 AB 1234" className="form-input" />
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold block mb-1">Make / Brand</label>
                                    <input type="text" value={newVehicle.make} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})} placeholder="e.g. Toyota" className="form-input" />
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold block mb-1">Model</label>
                                    <input type="text" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} placeholder="e.g. Innova Crysta" className="form-input" />
                                </div>

                                <div>
                                    <label className="text-xs font-bold block mb-1">Category</label>
                                    <select value={newVehicle.category} onChange={e => setNewVehicle({...newVehicle, category: e.target.value})} className="form-input">
                                        <option value="HATCHBACK">Hatchback (Mini)</option>
                                        <option value="SEDAN">Sedan</option>
                                        <option value="SUV">SUV</option>
                                        <option value="PREMIUM_SUV">Premium SUV</option>
                                        <option value="LUXURY">Luxury</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-bold block mb-1">Seats</label>
                                        <input type="number" value={newVehicle.seatingCapacity} onChange={e => setNewVehicle({...newVehicle, seatingCapacity: Number(e.target.value)})} className="form-input" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold block mb-1">Year</label>
                                        <input type="number" value={newVehicle.year} onChange={e => setNewVehicle({...newVehicle, year: Number(e.target.value)})} className="form-input" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6">
                                <label className="text-xs font-bold block mb-2">Vehicle Images</label>
                                <MediaSelector 
                                    selectedImages={newVehicle.images} 
                                    onSelect={(urls) => setNewVehicle({...newVehicle, images: urls})}
                                    multiple={true}
                                    maxImages={5}
                                    category="Cab Vehicle"
                                />
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button onClick={() => setIsCreating(false)} className="flex-1 py-2 rounded-lg font-bold text-sm border border-[var(--glass-border)] hover:bg-white/5 transition-colors">Cancel</button>
                                <button 
                                    onClick={() => createMutation.mutate()}
                                    disabled={!newVehicle.registrationNumber || createMutation.isPending}
                                    className="flex-1 py-2 rounded-lg font-bold text-sm btn-primary"
                                >
                                    {createMutation.isPending ? 'Saving...' : 'Save Vehicle'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
