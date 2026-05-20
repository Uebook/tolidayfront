'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Star, MessageSquare, ThumbsUp, TrendingUp, AlertCircle, Send, CheckCircle2, Building2 } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

export default function ReputationManagementPage() {
    const queryClient = useQueryClient();
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const { data: reviews = [], isLoading } = useQuery({
        queryKey: ['hotel-reviews'],
        queryFn: async () => {
            const res = await api.get('/hotel/my-hotel/reviews');
            return res.data;
        },
    });

    const replyMutation = useMutation({
        mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
            return api.patch(`/hotel/reviews/${id}/reply`, { reply });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hotel-reviews'] });
            setReplyingTo(null);
            setReplyText('');
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
            </div>
        );
    }

    // Stats calculations
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / totalReviews).toFixed(1) : 0;
    const pendingReplies = reviews.filter((r: any) => !r.vendorReply).length;
    const positivePercentage = totalReviews > 0 ? Math.round((reviews.filter((r: any) => r.rating >= 4).length / totalReviews) * 100) : 0;

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        size={14} 
                        className={star <= rating ? 'fill-yellow-500 text-yellow-500' : 'fill-white/10 text-transparent'} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div>
            <Topbar title="Reputation Management" subtitle="Monitor guest feedback and maintain your property rating" />
            <div className="p-6 space-y-6 animate-fadeIn">

                {/* KPI Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card p-5 border-l-4" style={{ borderLeftColor: 'hsl(var(--accent))' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-[hsl(var(--accent))/0.1] text-[hsl(var(--accent))]">
                                <Star size={24} className="fill-[hsl(var(--accent))]" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{avgRating} <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">/ 5</span></div>
                                <div className="text-xs uppercase font-bold text-[hsl(var(--muted-foreground))]">Average Rating</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{totalReviews}</div>
                                <div className="text-xs uppercase font-bold text-[hsl(var(--muted-foreground))]">Total Reviews</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                                <ThumbsUp size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{positivePercentage}%</div>
                                <div className="text-xs uppercase font-bold text-[hsl(var(--muted-foreground))]">Positive Sentiment</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-5 border-l-4" style={{ borderLeftColor: pendingReplies > 0 ? 'hsl(0 84% 60%)' : 'hsl(142 71% 45%)' }}>
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${pendingReplies > 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                {pendingReplies > 0 ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{pendingReplies}</div>
                                <div className="text-xs uppercase font-bold text-[hsl(var(--muted-foreground))]">Pending Replies</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg mb-2">Recent Guest Feedback</h3>
                    
                    {reviews.length === 0 ? (
                        <div className="text-center py-20 glass-card">
                            <MessageSquare size={48} className="mx-auto text-[hsl(var(--muted-foreground))] opacity-20 mb-4" />
                            <h4 className="font-bold">No Reviews Yet</h4>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">When guests complete their stay, their reviews will appear here.</p>
                        </div>
                    ) : (
                        reviews.map((review: any) => (
                            <div key={review.id} className="glass-card p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                                            {review.guestName?.charAt(0) || 'G'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[hsl(var(--foreground))]">{review.guestName || 'Anonymous Guest'}</h4>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                                {format(new Date(review.createdAt), 'dd MMM yyyy')} • Booking Ref: {review.bookingId?.slice(0, 8)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {renderStars(review.rating)}
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${review.rating >= 4 ? 'bg-green-500/20 text-green-500' : review.rating <= 2 ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                                            {review.rating >= 4 ? 'Excellent' : review.rating <= 2 ? 'Poor' : 'Average'}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-sm leading-relaxed text-[hsl(var(--foreground))] opacity-90 mb-4">
                                    "{review.comment}"
                                </p>

                                {/* Vendor Reply Section */}
                                {review.vendorReply ? (
                                    <div className="ml-8 p-4 rounded-xl bg-white/5 border-l-4 border-[hsl(var(--accent))] relative">
                                        <div className="absolute -left-[22px] top-4 w-5 h-5 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center border-4 border-[var(--background)]">
                                            <Building2 size={8} className="text-white" />
                                        </div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-[hsl(var(--accent))] uppercase">Your Official Reply</span>
                                            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{format(new Date(review.vendorReplyAt), 'dd MMM yyyy')}</span>
                                        </div>
                                        <p className="text-sm opacity-80 italic">{review.vendorReply}</p>
                                    </div>
                                ) : (
                                    <div className="ml-8 mt-4">
                                        {replyingTo === review.id ? (
                                            <div className="space-y-3 animate-fadeIn">
                                                <textarea 
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                    placeholder="Write your official public response..."
                                                    className="w-full form-input resize-none min-h-[100px] text-sm"
                                                    autoFocus
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button 
                                                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                                        className="px-4 py-2 text-xs border border-[var(--glass-border)] rounded-lg hover:bg-white/5"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        onClick={() => replyMutation.mutate({ id: review.id, reply: replyText })}
                                                        disabled={!replyText.trim() || replyMutation.isPending}
                                                        className="btn-primary flex items-center gap-2 px-6 py-2 text-xs"
                                                    >
                                                        <Send size={14} /> {replyMutation.isPending ? 'Sending...' : 'Publish Reply'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setReplyingTo(review.id)}
                                                className="text-xs font-bold text-[hsl(var(--accent))] hover:underline flex items-center gap-1.5"
                                            >
                                                <MessageSquare size={12} /> Add Public Reply
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
