'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Tag, Plus, Target, Clock, MapPin, Zap, X, Save, MoreVertical, Edit2, Trash2, Power } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

type PromoType = 'BASIC' | 'EARLY_BIRD' | 'LAST_MINUTE' | 'GEO_TARGETED';

interface PromotionsManagerProps {
    verticalLabel: string; // e.g. "Hotel", "Package", "Bus", "Cab"
    dateTypeLabel: string; // e.g. "Stay", "Travel", "Journey"
}

export default function PromotionsManager({ verticalLabel, dateTypeLabel }: PromotionsManagerProps) {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    
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
        <div className="min-h-full">
            <Topbar title={`${verticalLabel} Promotions`} subtitle={`Manage targeted campaigns to increase your ${verticalLabel.toLowerCase()} sales.`} />
            <div className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-6 md:space-y-8 animate-fadeIn">

                <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-foreground uppercase tracking-wider">Active Campaigns</h3>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-4 py-2.5 text-xs transition-all ios-tap-scale shadow-[0_4px_12px_rgba(37,99,235,0.2)] flex items-center gap-2 cursor-pointer"
                    >
                        <Plus size={15} /> Create New Campaign
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {promotions.map((promo: any) => {
                        const config = typeConfig[promo.type as PromoType] || typeConfig.BASIC;
                        return (
                            <div key={promo.id} className="ios-platter rounded-[24px] border border-border/10 flex flex-col hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.01)] overflow-hidden group">
                                <div className="p-5 md:p-6 flex-1">
                                    <div className="flex items-start justify-between mb-5">
                                        <div className={`p-3 rounded-2xl shadow-inner ${config.bg} ${config.color}`}>
                                            <config.icon size={20} />
                                        </div>
                                        <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${promo.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
                                            {promo.isActive ? 'Active' : 'Paused'}
                                        </div>
                                    </div>

                                    <h4 className="text-base font-extrabold text-foreground mb-1 tracking-tight">{promo.name}</h4>
                                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">{config.label}</p>

                                    <div className="space-y-2.5 p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-border/5 rounded-2xl text-xs font-semibold text-foreground/80">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Discount</span>
                                            <span className="font-extrabold text-foreground">{promo.discountPercentage}% OFF</span>
                                        </div>
                                        {promo.type === 'EARLY_BIRD' && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Rule</span>
                                                <span className="font-bold text-foreground">Book {promo.minAdvanceDays}+ days prior</span>
                                            </div>
                                        )}
                                        {promo.type === 'LAST_MINUTE' && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Rule</span>
                                                <span className="font-bold text-foreground">Book within {promo.maxAdvanceDays} days</span>
                                            </div>
                                        )}
                                        {promo.type === 'GEO_TARGETED' && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Region</span>
                                                <span className="font-bold text-foreground">{promo.targetRegion}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="px-5 py-3.5 border-t border-border/10 flex gap-3 bg-black/[0.01] dark:bg-white/[0.01]">
                                    <button className="flex-1 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-border/10 text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all ios-tap-scale flex items-center justify-center gap-1.5 cursor-pointer">
                                        <Edit2 size={13} /> Edit
                                    </button>
                                    <button 
                                        onClick={() => toggleStatusMutation.mutate({ id: promo.id, isActive: !promo.isActive })}
                                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ios-tap-scale flex items-center justify-center gap-1.5 border cursor-pointer ${promo.isActive ? 'bg-white dark:bg-slate-800 border-rose-500/20 text-rose-500 hover:bg-rose-500/10' : 'bg-white dark:bg-slate-800 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'}`}
                                    >
                                        <Power size={13} /> {promo.isActive ? 'Pause' : 'Resume'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {promotions.length === 0 && !isCreating && (
                        <div className="col-span-full py-20 text-center ios-platter rounded-[28px] border-2 border-dashed border-border/20">
                            <Target size={44} className="mx-auto text-muted-foreground/40 mb-4" />
                            <h4 className="text-base font-extrabold text-foreground tracking-tight">No Active Campaigns</h4>
                            <p className="text-xs text-muted-foreground font-semibold max-w-sm mx-auto mt-2">Start creating targeted discounts to boost your conversion rates and occupancy.</p>
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                {mounted && isCreating && createPortal(
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-md p-4 cursor-pointer"
                        onClick={() => setIsCreating(false)}
                    >
                        <div 
                            className="bg-white dark:bg-slate-900 w-[450px] max-w-full p-6 rounded-[28px] border border-border/15 shadow-2xl space-y-5 animate-scaleIn cursor-default relative z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-border/10">
                                <h3 className="text-base font-extrabold text-foreground tracking-tight">Create Campaign</h3>
                                <button onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-foreground font-bold p-1 cursor-pointer">
                                    <X size={18} />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Campaign Name</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        placeholder="e.g. Early Bird Special" 
                                        className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 outline-none text-xs font-medium transition-all duration-300" 
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Campaign Type</label>
                                        <select 
                                            value={type} 
                                            onChange={(e) => setType(e.target.value as PromoType)} 
                                            className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 focus:bg-white dark:focus:bg-slate-955 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 outline-none text-xs font-bold text-foreground transition-all duration-300"
                                        >
                                            <option value="BASIC" className="text-slate-900 bg-white">Standard</option>
                                            <option value="EARLY_BIRD" className="text-slate-900 bg-white">Early Bird</option>
                                            <option value="LAST_MINUTE" className="text-slate-900 bg-white">Last Minute</option>
                                            <option value="GEO_TARGETED" className="text-slate-900 bg-white">Geo-Targeted</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Discount (%)</label>
                                        <input 
                                            type="number" 
                                            value={discount} 
                                            onChange={e => setDiscount(Number(e.target.value))} 
                                            className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 focus:bg-white dark:focus:bg-slate-955 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 outline-none text-xs font-medium transition-all duration-300" 
                                            min={1} 
                                            max={99} 
                                        />
                                    </div>
                                </div>

                                {type === 'EARLY_BIRD' && (
                                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-2 animate-fadeIn">
                                        <label className="block text-[10px] font-bold text-blue-500 uppercase tracking-wider">Minimum Advance Days</label>
                                        <input 
                                            type="number" 
                                            value={minAdvanceDays} 
                                            onChange={e => setMinAdvanceDays(Number(e.target.value))} 
                                            className="w-full px-4 py-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                        />
                                        <p className="text-[9px] text-blue-500/80 font-bold leading-normal">Guest must book at least this many days before {dateTypeLabel.toLowerCase()}.</p>
                                    </div>
                                )}

                                {type === 'LAST_MINUTE' && (
                                    <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl space-y-2 animate-fadeIn">
                                        <label className="block text-[10px] font-bold text-orange-500 uppercase tracking-wider">Maximum Advance Days</label>
                                        <input 
                                            type="number" 
                                            value={maxAdvanceDays} 
                                            onChange={e => setMaxAdvanceDays(Number(e.target.value))} 
                                            className="w-full px-4 py-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                        />
                                        <p className="text-[9px] text-orange-500/80 font-bold leading-normal">Guest must book within this many days of {dateTypeLabel.toLowerCase()}.</p>
                                    </div>
                                )}

                                {type === 'GEO_TARGETED' && (
                                    <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl space-y-2 animate-fadeIn">
                                        <label className="block text-[10px] font-bold text-purple-500 uppercase tracking-wider">Target Region / City</label>
                                        <input 
                                            type="text" 
                                            value={targetRegion} 
                                            onChange={e => setTargetRegion(e.target.value)} 
                                            className="w-full px-4 py-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                            placeholder="e.g. Delhi, Mumbai" 
                                        />
                                        <p className="text-[9px] text-purple-500/80 font-bold leading-normal">Only users from this region will see the discount.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border/10">
                                <button 
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all ios-tap-scale cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => createMutation.mutate()}
                                    disabled={!name || createMutation.isPending}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-5 py-2 text-xs transition-all ios-tap-scale shadow-[0_4px_12px_rgba(37,99,235,0.2)] disabled:opacity-50 cursor-pointer"
                                >
                                    {createMutation.isPending ? 'Launching...' : 'Launch Campaign'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
}
