'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Users, Plus, Search, FileText, CheckCircle2, AlertCircle, Phone } from 'lucide-react';
import { useState } from 'react';

export default function DriversPage() {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);

    const { data: drivers = [], isLoading } = useQuery({
        queryKey: ['cabs-drivers'],
        queryFn: async () => {
            const res = await api.get('/cabs/drivers');
            return res.data;
        },
    });

    const [newDriver, setNewDriver] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        licenseNumber: '',
        licenseExpiry: ''
    });

    const createMutation = useMutation({
        mutationFn: async () => api.post('/cabs/drivers', newDriver),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cabs-drivers'] });
            setIsCreating(false);
            setNewDriver({ firstName: '', lastName: '', phone: '', licenseNumber: '', licenseExpiry: '' });
        }
    });

    return (
        <div>
            <Topbar title="Driver Roster" subtitle="Manage your drivers and compliance documents" />
            <div className="p-6 space-y-6 animate-fadeIn">

                <div className="flex items-center justify-between">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={16} />
                        <input type="text" placeholder="Search driver name or phone..." className="form-input pl-10 text-sm" />
                    </div>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-bold"
                    >
                        <Plus size={16} /> Add Driver
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center p-10">Loading drivers...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {drivers.map((driver: any) => (
                            <div key={driver.id} className="glass-card p-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-2">
                                    {driver.verificationStatus === 'APPROVED' ? (
                                        <div className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-bl-lg">
                                            <CheckCircle2 size={12} /> KYC Verified
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-bl-lg">
                                            <AlertCircle size={12} /> Pending KYC
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-full bg-[hsl(var(--accent))]/20 flex items-center justify-center text-xl font-bold text-[hsl(var(--accent))]">
                                        {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">{driver.firstName} {driver.lastName}</h3>
                                        <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] mt-1">
                                            <Phone size={12} /> {driver.phone}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4 text-xs bg-white/5 p-3 rounded-lg border border-[var(--glass-border)]">
                                    <div className="flex justify-between">
                                        <span className="text-[hsl(var(--muted-foreground))]">License No:</span>
                                        <span className="font-medium">{driver.licenseNumber || 'Not provided'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[hsl(var(--muted-foreground))]">Expiry:</span>
                                        <span className={`font-medium ${new Date(driver.licenseExpiry) < new Date() ? 'text-red-500 font-bold' : ''}`}>
                                            {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : 'Unknown'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)]">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-3 w-3">
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${driver.isActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                            <span className={`relative inline-flex rounded-full h-3 w-3 ${driver.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        </span>
                                        <span className="text-xs font-medium">{driver.isActive ? 'Active & Ready' : 'Inactive'}</span>
                                    </div>
                                    <button className="text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/10 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold flex items-center gap-1">
                                        <FileText size={14} /> Docs
                                    </button>
                                </div>
                            </div>
                        ))}

                        {drivers.length === 0 && !isCreating && (
                            <div className="col-span-full text-center py-20 glass-card border-dashed">
                                <Users size={48} className="mx-auto text-[hsl(var(--muted-foreground))] opacity-30 mb-4" />
                                <h3 className="text-lg font-bold">No Drivers Found</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">Add drivers to assign them to your fleet vehicles.</p>
                            </div>
                        )}
                    </div>
                )}

                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="glass-card w-full max-w-lg p-6 animate-slideInUp">
                            <h3 className="font-bold text-xl mb-6">Add New Driver</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold block mb-1">First Name</label>
                                    <input type="text" value={newDriver.firstName} onChange={e => setNewDriver({...newDriver, firstName: e.target.value})} className="form-input" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1">Last Name</label>
                                    <input type="text" value={newDriver.lastName} onChange={e => setNewDriver({...newDriver, lastName: e.target.value})} className="form-input" />
                                </div>
                                
                                <div className="col-span-2">
                                    <label className="text-xs font-bold block mb-1">Phone Number</label>
                                    <input type="tel" value={newDriver.phone} onChange={e => setNewDriver({...newDriver, phone: e.target.value})} className="form-input" />
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold block mb-1">License Number</label>
                                    <input type="text" value={newDriver.licenseNumber} onChange={e => setNewDriver({...newDriver, licenseNumber: e.target.value.toUpperCase()})} className="form-input" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1">License Expiry</label>
                                    <input type="date" value={newDriver.licenseExpiry} onChange={e => setNewDriver({...newDriver, licenseExpiry: e.target.value})} className="form-input" />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button onClick={() => setIsCreating(false)} className="flex-1 py-2 rounded-lg font-bold text-sm border border-[var(--glass-border)] hover:bg-white/5 transition-colors">Cancel</button>
                                <button 
                                    onClick={() => createMutation.mutate()}
                                    disabled={!newDriver.firstName || !newDriver.phone || createMutation.isPending}
                                    className="flex-1 py-2 rounded-lg font-bold text-sm btn-primary"
                                >
                                    {createMutation.isPending ? 'Saving...' : 'Save Driver'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
