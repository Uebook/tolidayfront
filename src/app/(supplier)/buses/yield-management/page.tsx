'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { TrendingUp, Users, Plus, Activity, Trash2, Bus, ShieldAlert, Zap, ChevronDown, Info, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { getAuthUser } from '@/lib/auth';

export default function YieldManagementPage() {
    const queryClient = useQueryClient();
    const [user] = useState(() => getAuthUser());
    const [selectedBus, setSelectedBus] = useState<string>('');
    const [newRule, setNewRule] = useState({ name: '', occupancyThreshold: 80, surgePercentage: 15 });

    // Fetch buses
    const { data: buses = [], isLoading: busesLoading } = useQuery({
        queryKey: ['bus-fleet', user?.busVendorId || user?.bus_vendor_id],
        queryFn: async () => {
            const vendorId = user?.busVendorId || user?.bus_vendor_id;
            if (!vendorId) return [];
            const res = await api.get(`/buses/vendors/${vendorId}/buses`);
            return res.data;
        },
        enabled: !!user,
    });

    const { data: rules = [], isLoading: rulesLoading } = useQuery({
        queryKey: ['yield-rules', selectedBus],
        queryFn: async () => {
            if (!selectedBus) return [];
            const res = await api.get(`/buses/${selectedBus}/yield-rules`);
            return res.data;
        },
        enabled: !!selectedBus
    });

    const createRuleMutation = useMutation({
        mutationFn: async () => {
            if (!selectedBus) throw new Error('No bus selected');
            return api.post(`/buses/${selectedBus}/yield-rules`, newRule);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['yield-rules', selectedBus] });
            setNewRule({ name: '', occupancyThreshold: 80, surgePercentage: 15 });
        }
    });

    const deleteRuleMutation = useMutation({
        mutationFn: async (ruleId: string) => {
            return api.delete(`/buses/yield-rules/${ruleId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['yield-rules', selectedBus] });
        }
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Topbar title="Dynamic Pricing" subtitle="Adjust ticket prices automatically based on bus occupancy." />
            <div className="max-w-7xl mx-auto p-8 space-y-8 animate-fadeIn">

                {/* Bus Selection */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Bus size={24} />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Select Vehicle</label>
                        <div className="relative mt-1">
                            <select 
                                value={selectedBus}
                                onChange={(e) => setSelectedBus(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500/10 transition-all"
                            >
                                <option value="">Choose a bus from your fleet...</option>
                                {buses.map((bus: any) => (
                                    <option key={bus.id} value={bus.id}>
                                        {bus.registrationNumber} • {bus.type.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {selectedBus ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Active Rules */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <Zap size={16} className="text-orange-500" /> Active Surge Rules
                                </h3>
                            </div>
                            
                            {rules.length === 0 ? (
                                <div className="py-32 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                        <ShieldAlert size={32} className="text-slate-300" />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900">No Rules Configured</h4>
                                    <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                                        Pricing is currently fixed. Add a rule to automatically increase prices when the bus fills up.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {rules.map((rule: any) => (
                                        <div key={rule.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg">
                                                    +{rule.surgePercentage}%
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-slate-900">{rule.name}</h4>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                    </div>
                                                    <p className="text-xs font-medium text-slate-500">
                                                        Triggers when occupancy reaches <span className="text-slate-900 font-bold">{rule.occupancyThreshold}%</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => deleteRuleMutation.mutate(rule.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Create Rule */}
                        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8 sticky top-24">
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                                    <Plus size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Add New Rule</h3>
                                <p className="text-xs font-medium text-slate-500 mt-1">Configure automated price surges.</p>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Rule Name</label>
                                    <input 
                                        type="text" 
                                        value={newRule.name}
                                        onChange={e => setNewRule({...newRule, name: e.target.value})}
                                        placeholder="e.g. Peak Season Surge" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all" 
                                    />
                                </div>
                                
                                <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users size={14} className="text-blue-600" />
                                            <label className="text-xs font-bold text-slate-600">Occupancy Target</label>
                                        </div>
                                        <span className="text-lg font-bold text-blue-600">{newRule.occupancyThreshold}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="50" max="95" step="5"
                                        value={newRule.occupancyThreshold}
                                        onChange={e => setNewRule({...newRule, occupancyThreshold: Number(e.target.value)})}
                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                                    />
                                </div>

                                <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Zap size={14} className="text-orange-600" />
                                            <label className="text-xs font-bold text-slate-600">Price Increase</label>
                                        </div>
                                        <span className="text-lg font-bold text-orange-600">+{newRule.surgePercentage}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="5" max="100" step="5"
                                        value={newRule.surgePercentage}
                                        onChange={e => setNewRule({...newRule, surgePercentage: Number(e.target.value)})}
                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500" 
                                    />
                                </div>

                                <button 
                                    onClick={() => createRuleMutation.mutate()}
                                    disabled={!newRule.name || createRuleMutation.isPending}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all"
                                >
                                    {createRuleMutation.isPending ? 'Saving Rule...' : 'Enable Rule'}
                                </button>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="bg-white py-32 rounded-3xl border border-slate-200 shadow-sm text-center animate-fadeIn px-8">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <TrendingUp size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Maximize Your Revenue</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
                            Select a bus from the unit control bar to set up dynamic pricing rules. Increase prices automatically as seats get booked.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
