'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Tag, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Promotion {
    id: string;
    name: string;
    type: string;
    discountPercentage: number;
    isVerified: boolean;
}

export default function PromotionManager({ promotions, vendorId }: { promotions: Promotion[], vendorId: string }) {
    const queryClient = useQueryClient();

    const verifyMutation = useMutation({
        mutationFn: async ({ id, isVerified }: { id: string, isVerified: boolean }) => {
            return api.patch(`/admin/promotions/${id}/verify`, { isVerified });
        },
        onSuccess: () => {
            queryClient.invalidateQueries();
            toast.success('Promotion status updated');
        }
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotions?.map((offer: any, i: number) => (
                <div key={i} className="card p-5 border border-border/10 flex flex-col justify-between gap-4 group hover:border-blue-500/30 transition-all relative overflow-hidden">
                    <div className="absolute -right-2 -top-2 p-4 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                        <Tag size={60} />
                    </div>
                    
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-[9px] font-black uppercase tracking-widest text-orange-400 border border-white/5 w-fit">
                                    {offer.type}
                                </span>
                                {offer.isVerified ? (
                                    <span className="flex items-center gap-1 text-[8px] font-black text-emerald-400 uppercase tracking-widest mt-0.5">
                                        <ShieldCheck size={9} /> Verified
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[8px] font-black text-amber-400 uppercase tracking-widest mt-0.5">
                                        <ShieldAlert size={9} /> Awaiting Audit
                                    </span>
                                )}
                            </div>
                            <span className="text-xl font-black text-foreground">{offer.discountPercentage}% <span className="text-[9px] uppercase opacity-40">OFF</span></span>
                        </div>
                        
                        <h4 className="text-sm font-black tracking-tight line-clamp-1 pr-6">{offer.name}</h4>
                        
                        <div className="flex items-center gap-2 pt-2 border-t border-border/5">
                            <button 
                                onClick={() => verifyMutation.mutate({ id: offer.id, isVerified: !offer.isVerified })}
                                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-md ${
                                    offer.isVerified 
                                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/10'
                                }`}
                            >
                                {offer.isVerified ? 'Revoke' : 'Verify'}
                            </button>
                            <button className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"><Trash2 size={12} /></button>
                        </div>
                    </div>
                </div>
            ))}
            {promotions?.length === 0 && (
                <div className="col-span-full py-12 bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-border/10 flex flex-col items-center justify-center text-slate-400">
                    <Tag size={32} className="opacity-20 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">No Active Promotions</span>
                </div>
            )}
        </div>
    );
}
