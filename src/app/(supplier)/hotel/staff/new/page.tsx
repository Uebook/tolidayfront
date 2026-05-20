'use client';

import Topbar from '@/components/layout/Topbar';
import { ArrowLeft, UserPlus, Shield, Mail, Phone, Building, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AddStaffPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'staff',
        password: '',
        confirmPassword: '',
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            setError(null);
            // Get hotelId
            const profileRes = await api.get('/hotel/my-hotel');
            const hotelId = profileRes.data.id;

            // Combine first and last name for the expected `name` field if backend expects it
            const payload = {
                name: `${data.firstName} ${data.lastName}`.trim(),
                email: data.email,
                phone: data.phone,
                role: data.role === 'staff' ? 'RECEPTIONIST' : 'MANAGER',
                password: data.password,
                hotelId,
                isActive: true,
                permissions: {
                    dashboard_view: true,
                    notifications_view: true,
                    bookings_view: true,
                    bookings_modify: data.role === 'manager',
                    bookings_cancel: data.role === 'manager',
                    inventory_edit: data.role === 'manager',
                    rates_edit: data.role === 'manager',
                    property_view: true,
                    media_upload: true,
                    payments_view: data.role === 'manager',
                    reports_view: data.role === 'manager',
                    staff_manage: data.role === 'manager',
                    settings_edit: data.role === 'manager',
                    profile_view: true,
                    support_view: true,
                }
            };
            await api.post('/staff', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hotel-staff'] });
            alert('Staff member added successfully!');
            router.push('/hotel/staff');
        },
        onError: (err: any) => {
            console.error('Staff creation failed:', err);
            setError(err.response?.data?.message || 'Failed to create staff member. Please try again.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        mutation.mutate(formData);
    };

    return (
        <div>
            <Topbar title="Add New Staff" subtitle="Create a new login for your team member" />

            <div className="p-8 space-y-6 animate-fadeIn max-w-[1000px] mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <Link href="/hotel/staff" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-[hsl(var(--foreground))] text-[hsl(var(--muted-foreground))]">
                        <ArrowLeft size={16} /> Back to Staff Management
                    </Link>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-sm animate-shake">
                            {error}
                        </div>
                    )}
                    {/* Basic Info */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-[var(--glass-border-light)] pb-4">
                            <div className="p-2 rounded-lg bg-[hsl(195,90%,50%,0.1)]">
                                <UserPlus size={18} className="text-[hsl(var(--accent))]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Personal Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-2 block">First Name</label>
                                <input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="e.g. Rahul" className="form-input" required />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-2 block">Last Name</label>
                                <input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="e.g. Verma" className="form-input" required />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-2 block">Email Address</label>
                                <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} type="email" placeholder="rahul@hotel.com" className="form-input" required />
                                <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1.5">An invitation link will be sent to this email.</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-2 block">Mobile Number</label>
                                <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} type="tel" placeholder="+91 98765 43210" className="form-input" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-2 block">Password</label>
                                <div className="relative">
                                    <input
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="form-input pr-12"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-2 block">Confirm Password</label>
                                <input
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="form-input"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Role & Access */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-[var(--glass-border-light)] pb-4">
                            <div className="p-2 rounded-lg bg-[hsl(285,70%,65%,0.1)]">
                                <Shield size={18} className="text-[hsl(285,70%,65%)]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Role & Access Level</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-3 block">Select Role</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'manager', label: 'Hotel Manager', desc: 'Full operational access but restricted financials' },
                                        { id: 'staff', label: 'Reception Staff', desc: 'Limited to booking management and check-ins' },
                                    ].map((role) => (
                                        <label key={role.id} className="relative cursor-pointer group">
                                            <input type="radio" name="role" value={role.id} checked={formData.role === role.id} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="peer sr-only" />
                                            <div className="p-4 rounded-xl border border-[var(--glass-border-light)] bg-[var(--table-header)] hover:bg-[var(--table-header)] transition-all peer-checked:border-[hsl(var(--accent))] peer-checked:bg-[hsl(195,90%,50%,0.05)] text-center h-full">
                                                <div className="w-4 h-4 rounded-full border border-[hsl(var(--muted-foreground))] absolute top-3 right-3 flex items-center justify-center peer-checked:border-[hsl(var(--accent))] transition-colors">
                                                    <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] scale-0 peer-checked:scale-100 transition-transform" />
                                                </div>
                                                <p className="font-semibold text-[hsl(var(--foreground))] text-sm mb-1 mt-1">{role.label}</p>
                                                <p className="text-xs text-[hsl(var(--muted-foreground))]">{role.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {/* Skipping matrix link here since it's redundant */}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Link href="/hotel/staff" className="px-6 py-2.5 text-sm font-medium rounded-xl border border-[var(--glass-border-light)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[var(--table-header)] transition-colors">
                            Cancel
                        </Link>
                        <button type="submit" disabled={mutation.isPending} className="btn-primary px-8 py-2.5 text-sm">
                            {mutation.isPending ? 'Sending...' : 'Send Invite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
