'use client';

import Topbar from '@/components/layout/Topbar';
import { ArrowLeft, UserPlus, Shield, Mail, Phone, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
       const { id } = use(params);
       const router = useRouter();
       const queryClient = useQueryClient();
       const [error, setError] = useState<string | null>(null);
       const [newPassword, setNewPassword] = useState('');
       const [showPassword, setShowPassword] = useState(false);

       const { data: staff, isLoading } = useQuery({
              queryKey: ['staff-member', id],
              queryFn: async () => {
                     const res = await api.get(`/staff/${id}`);
                     return res.data;
              }
       });

       const [formData, setFormData] = useState({
              name: '',
              email: '',
              phone: '',
              role: 'RECEPTIONIST',
              isActive: true,
              permissions: {} as Record<string, boolean>
       });

       useEffect(() => {
              if (staff) {
                     setFormData({
                            name: staff.name,
                            email: staff.email,
                            phone: staff.phone || '',
                            role: staff.role,
                            isActive: staff.isActive,
                            permissions: staff.permissions || {}
                     });
              }
       }, [staff]);

       const updateMutation = useMutation({
              mutationFn: async (data: any) => {
                     setError(null);
                     await api.patch(`/staff/${id}`, data);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['hotel-staff'] });
                     queryClient.invalidateQueries({ queryKey: ['staff-member', id] });
                     alert('Staff member updated successfully!');
                     router.push('/hotel/staff');
              },
              onError: (err: any) => {
                     console.error('Update failed:', err);
                     setError(err.response?.data?.message || 'Failed to update staff member.');
              }
       });

       const deleteMutation = useMutation({
              mutationFn: async () => {
                     if (!confirm('Are you sure you want to permanently delete this staff member? This action cannot be undone.')) return;
                     await api.delete(`/staff/${id}`);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['hotel-staff'] });
                     alert('Staff member deleted successfully.');
                     router.push('/hotel/staff');
              },
              onError: (err: any) => {
                     setError(err.response?.data?.message || 'Failed to delete staff member.');
              }
       });

       const resetPasswordMutation = useMutation({
              mutationFn: async () => {
                     if (newPassword.length < 8) {
                            setError('Password must be at least 8 characters long');
                            return;
                     }
                     await api.patch(`/staff/${id}/reset-password`, { password: newPassword });
              },
              onSuccess: () => {
                     alert('Password reset successfully!');
                     setNewPassword('');
              },
              onError: (err: any) => {
                     setError(err.response?.data?.message || 'Failed to reset password.');
              }
       });

       const handleSubmit = (e: React.FormEvent) => {
              e.preventDefault();
              updateMutation.mutate(formData);
       };

       const togglePermission = (key: string) => {
              setFormData(prev => ({
                     ...prev,
                     permissions: {
                            ...prev.permissions,
                            [key]: !prev.permissions[key]
                     }
              }));
       };

       if (isLoading) return <div className="p-8 text-center">Loading staff details...</div>;

       const permissions = [
              { key: 'dashboard_view', label: 'View Dashboard' },
              { key: 'notifications_view', label: 'View Notifications' },
              { key: 'bookings_view', label: 'View Bookings' },
              { key: 'bookings_modify', label: 'Modify Bookings' },
              { key: 'bookings_cancel', label: 'Cancel Bookings' },
              { key: 'inventory_edit', label: 'Edit Inventory' },
              { key: 'rates_edit', label: 'Edit Rates' },
              { key: 'property_view', label: 'View Property Details' },
              { key: 'media_upload', label: 'Upload Media' },
              { key: 'payments_view', label: 'View Payments' },
              { key: 'reports_view', label: 'View Reports' },
              { key: 'staff_manage', label: 'Manage Staff' },
              { key: 'settings_edit', label: 'Edit Settings' },
              { key: 'profile_view', label: 'View Profile' },
              { key: 'support_view', label: 'Support & Help' },
       ];

       return (
              <div>
                     <Topbar title="Edit Staff Member" subtitle={`Update profile and permissions for ${formData.name}`} />

                     <div className="p-8 space-y-6 animate-fadeIn max-w-[1000px] mx-auto">
                            <div className="flex items-center justify-between mb-4">
                                   <Link href="/hotel/staff" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-[hsl(var(--foreground))] text-[hsl(var(--muted-foreground))]">
                                          <ArrowLeft size={16} /> Back to Staff Management
                                   </Link>
                            </div>

                            <form className="grid grid-cols-1 lg:grid-cols-3 gap-6" onSubmit={handleSubmit}>
                                   <div className="lg:col-span-2 space-y-6">
                                          {error && (
                                                 <div className="p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-sm">
                                                        {error}
                                                 </div>
                                          )}

                                          {/* Basic Info */}
                                          <div className="glass-card p-6">
                                                 <h3 className="text-lg font-semibold mb-6">Staff Profile</h3>
                                                 <div className="grid grid-cols-2 gap-5">
                                                        <div className="col-span-2 md:col-span-1">
                                                               <label className="text-xs font-medium mb-2 block">Full Name</label>
                                                               <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="form-input" required />
                                                        </div>
                                                        <div className="col-span-2 md:col-span-1">
                                                               <label className="text-xs font-medium mb-2 block">Phone Number</label>
                                                               <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="form-input" />
                                                        </div>
                                                        <div className="col-span-2">
                                                               <label className="text-xs font-medium mb-2 block">Email Address (Read-only)</label>
                                                               <input value={formData.email} disabled className="form-input opacity-60 cursor-not-allowed" />
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Permissions Matrix */}
                                          <div className="glass-card p-6">
                                                 <h3 className="text-lg font-semibold mb-6">Access Permissions</h3>
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                                        {permissions.map((p) => (
                                                               <div key={p.key} className="flex items-center justify-between p-3 rounded-lg bg-[var(--table-header)]/50 border border-[var(--glass-border-light)]">
                                                                      <span className="text-sm font-medium">{p.label}</span>
                                                                      <label className="toggle">
                                                                             <input type="checkbox" checked={formData.permissions[p.key] || false} onChange={() => togglePermission(p.key)} />
                                                                             <span className="toggle-slider" />
                                                                      </label>
                                                               </div>
                                                        ))}
                                                 </div>
                                          </div>

                                          {/* Password Reset */}
                                          <div className="glass-card p-6 border-t-2 border-amber-500/20">
                                                 <h3 className="text-lg font-semibold mb-4 text-amber-500">Reset Password</h3>
                                                 <p className="text-xs text-muted-foreground mb-4 italic">Setting a new password will immediately update this user's login credentials.</p>
                                                 <div className="flex gap-3">
                                                        <div className="flex-1 relative">
                                                               <input
                                                                      type={showPassword ? 'text' : 'password'}
                                                                      value={newPassword}
                                                                      onChange={e => setNewPassword(e.target.value)}
                                                                      placeholder="Enter new password"
                                                                      className="form-input pr-12"
                                                               />
                                                               <button
                                                                      type="button"
                                                                      onClick={() => setShowPassword(!showPassword)}
                                                                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                                                               >
                                                                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                               </button>
                                                        </div>
                                                        <button
                                                               type="button"
                                                               onClick={() => resetPasswordMutation.mutate()}
                                                               disabled={resetPasswordMutation.isPending || !newPassword}
                                                               className="btn-primary px-6 whitespace-nowrap"
                                                        >
                                                               {resetPasswordMutation.isPending ? 'Updating...' : 'Reset'}
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="space-y-6">
                                          {/* Status & Role */}
                                          <div className="glass-card p-6">
                                                 <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Internal Settings</h3>
                                                 <div className="space-y-5">
                                                        <div>
                                                               <label className="text-xs font-medium mb-2 block">Role</label>
                                                               <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="form-input">
                                                                      <option value="RECEPTIONIST">Reception Staff</option>
                                                                      <option value="MANAGER">Hotel Manager</option>
                                                                      <option value="ADMIN">Admin</option>
                                                               </select>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--accent)/.05)] border border-[hsl(var(--accent)/0.1)]">
                                                               <span className="text-sm font-semibold">Active Status</span>
                                                               <label className="toggle">
                                                                      <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                                                                      <span className="toggle-slider" />
                                                               </label>
                                                        </div>
                                                 </div>
                                          </div>

                                          <div className="space-y-3">
                                                 <button type="submit" disabled={updateMutation.isPending} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                                                        <Save size={18} /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                                 </button>
                                                 <button type="button" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/5 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                                                        <Trash2 size={16} /> {deleteMutation.isPending ? 'Deleting...' : 'Delete Account'}
                                                 </button>
                                          </div>
                                   </div>
                            </form>
                     </div>
              </div>
       );
}
