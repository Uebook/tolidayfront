'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Tag, Trash2, CheckCircle2, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions?.map((offer: any, i: number) => (
                <div key={i} className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                        <Tag size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex flex-col gap-1">
                                <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-orange-400 border border-white/5 w-fit">
                                    {offer.type}
                                </span>
                                {offer.isVerified ? (
                                    <span className="flex items-center gap-1 text-[8px] font-black text-emerald-400 uppercase tracking-widest mt-1">
                                        <ShieldCheck size={10} /> Verified by Admin
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[8px] font-black text-amber-400 uppercase tracking-widest mt-1">
                                        <ShieldAlert size={10} /> Awaiting Audit
                                    </span>
                                )}
                            </div>
                            <span className="text-3xl font-black text-white">{offer.discountPercentage}% <span className="text-xs uppercase opacity-40">OFF</span></span>
                        </div>
                        <h4 className="text-xl font-black tracking-tight mb-2 truncate pr-10">{offer.name}</h4>
                        <div className="flex items-center gap-2 mt-8">
                            <button 
                                onClick={() => verifyMutation.mutate({ id: offer.id, isVerified: !offer.isVerified })}
                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                                    offer.isVerified 
                                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'
                                }`}
                            >
                                {offer.isVerified ? 'Revoke Verification' : 'Verify Promotion'}
                            </button>
                            <button className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"><Trash2 size={16} /></button>
                        </div>
                    </div>
                </div>
            ))}
            {promotions?.length === 0 && (
                <div className="col-span-full py-20 bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                    <Tag size={48} className="opacity-20 mb-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">No Active Promotions</span>
                </div>
            )}
        </div>
    );
}
