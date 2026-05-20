'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Tag, Plus, Target, Clock, MapPin, Zap, X, Save, MoreVertical, Edit2, Trash2, Power } from 'lucide-react';
import { useState } from 'react';

type PromoType = 'BASIC' | 'EARLY_BIRD' | 'LAST_MINUTE' | 'GEO_TARGETED';

interface PromotionsManagerProps {
    verticalLabel: string; // e.g. "Hotel", "Package", "Bus", "Cab"
    dateTypeLabel: string; // e.g. "Stay", "Travel", "Journey"
}

export default function PromotionsManager({ verticalLabel, dateTypeLabel }: PromotionsManagerProps) {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [type, setType] = useState<PromoType>('BASIC');
    const [discount, setDiscount] = useState(10);
    const [minAdvanceDays, setMinAdvanceDays] = useState(30);
    const [maxAdvanceDays, setMaxAdvanceDays] = useState(3);
    const [targetRegion, setTargetRegion] = useState('');

    const { data: promotions = [], isLoading } = useQuery({
        queryKey: ['promotions'],
        queryFn: async () => {
            const res = await api.get('/promotions');
            return res.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            return api.post('/promotions', {
                name,
                type,
                discountPercentage: discount,
                minAdvanceDays: type === 'EARLY_BIRD' ? minAdvanceDays : 0,
                maxAdvanceDays: type === 'LAST_MINUTE' ? maxAdvanceDays : 0,
                targetRegion: type === 'GEO_TARGETED' ? targetRegion : null,
                isActive: true
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            setIsCreating(false);
            resetForm();
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
            return api.patch(`/promotions/${id}`, { isActive });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
        }
    });

    const resetForm = () => {
        setName('');
        setType('BASIC');
        setDiscount(10);
        setMinAdvanceDays(30);
        setMaxAdvanceDays(3);
        setTargetRegion('');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const typeConfig: Record<PromoType, any> = {
        BASIC: { label: 'Standard Discount', icon: Tag, color: 'text-blue-600', bg: 'bg-blue-50' },
        EARLY_BIRD: { label: 'Early Bird', icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
        LAST_MINUTE: { label: 'Last Minute', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
        GEO_TARGETED: { label: 'Geo-Targeted', icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Topbar title={`${verticalLabel} Promotions`} subtitle={`Manage targeted campaigns to increase your ${verticalLabel.toLowerCase()} sales.`} />
            <div className="max-w-7xl mx-auto p-8 space-y-8 animate-fadeIn">

                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">Active Campaigns</h3>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={18} /> Create New Campaign
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {promotions.map((promo: any) => {
                        const config = typeConfig[promo.type as PromoType] || typeConfig.BASIC;
                        return (
                            <div key={promo.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                                <div className="p-6 flex-1">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`p-3 rounded-xl ${config.bg} ${config.color}`}>
                                            <config.icon size={24} />
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${promo.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                            {promo.isActive ? 'Active' : 'Paused'}
                                        </div>
                                    </div>

                                    <h4 className="text-lg font-bold text-slate-900 mb-1">{promo.name}</h4>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">{config.label}</p>

                                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Discount</span>
                                            <span className="font-bold text-slate-900">{promo.discountPercentage}% OFF</span>
                                        </div>
                                        {promo.type === 'EARLY_BIRD' && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Rule</span>
                                                <span className="font-medium text-slate-900">Book {promo.minAdvanceDays}+ days prior</span>
                                            </div>
                                        )}
                                        {promo.type === 'LAST_MINUTE' && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Rule</span>
                                                <span className="font-medium text-slate-900">Book within {promo.maxAdvanceDays} days</span>
                                            </div>
                                        )}
                                        {promo.type === 'GEO_TARGETED' && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Region</span>
                                                <span className="font-medium text-slate-900">{promo.targetRegion}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                                    <button className="flex-1 py-2 text-xs font-bold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button 
                                        onClick={() => toggleStatusMutation.mutate({ id: promo.id, isActive: !promo.isActive })}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 border ${promo.isActive ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' : 'bg-white border-green-200 text-green-600 hover:bg-green-50'}`}
                                    >
                                        <Power size={14} /> {promo.isActive ? 'Pause' : 'Resume'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {promotions.length === 0 && !isCreating && (
                        <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <Target size={48} className="mx-auto text-slate-300 mb-4" />
                            <h4 className="text-lg font-bold text-slate-900">No Active Campaigns</h4>
                            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">Start creating targeted discounts to boost your conversion rates and occupancy.</p>
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCreating(false)} />
                        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
                            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900">Create Campaign</h3>
                                <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Name</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        placeholder="e.g. Early Bird Special" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Type</label>
                                        <select 
                                            value={type} 
                                            onChange={(e) => setType(e.target.value as PromoType)} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="BASIC">Standard</option>
                                            <option value="EARLY_BIRD">Early Bird</option>
                                            <option value="LAST_MINUTE">Last Minute</option>
                                            <option value="GEO_TARGETED">Geo-Targeted</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount (%)</label>
                                        <input 
                                            type="number" 
                                            value={discount} 
                                            onChange={e => setDiscount(Number(e.target.value))} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                            min={1} 
                                            max={99} 
                                        />
                                    </div>
                                </div>

                                {type === 'EARLY_BIRD' && (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                                        <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">Minimum Advance Days</label>
                                        <input 
                                            type="number" 
                                            value={minAdvanceDays} 
                                            onChange={e => setMinAdvanceDays(Number(e.target.value))} 
                                            className="w-full bg-white border border-blue-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                        />
                                        <p className="text-[10px] text-blue-600 font-medium">Guest must book at least this many days before {dateTypeLabel.toLowerCase()}.</p>
                                    </div>
                                )}

                                {type === 'LAST_MINUTE' && (
                                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-2">
                                        <label className="text-xs font-bold text-orange-700 uppercase tracking-wider">Maximum Advance Days</label>
                                        <input 
                                            type="number" 
                                            value={maxAdvanceDays} 
                                            onChange={e => setMaxAdvanceDays(Number(e.target.value))} 
                                            className="w-full bg-white border border-orange-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                        />
                                        <p className="text-[10px] text-orange-600 font-medium">Guest must book within this many days of {dateTypeLabel.toLowerCase()}.</p>
                                    </div>
                                )}

                                {type === 'GEO_TARGETED' && (
                                    <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl space-y-2">
                                        <label className="text-xs font-bold text-purple-700 uppercase tracking-wider">Target Region / City</label>
                                        <input 
                                            type="text" 
                                            value={targetRegion} 
                                            onChange={e => setTargetRegion(e.target.value)} 
                                            className="w-full bg-white border border-purple-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                            placeholder="e.g. Delhi, Mumbai" 
                                        />
                                        <p className="text-[10px] text-purple-600 font-medium">Only users from this region will see the discount.</p>
                                    </div>
                                )}
                            </div>

                            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <button 
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => createMutation.mutate()}
                                    disabled={!name || createMutation.isPending}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Launching...' : 'Launch Campaign'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
