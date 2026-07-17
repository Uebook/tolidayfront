'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Topbar from '@/components/layout/Topbar';
import api from '@/lib/api';
import {
       Users, Search, Shield, Building2,
       Mail, Phone, ShieldCheck, ShieldAlert,
       MoreVertical, AlertCircle, UserPlus,
       Lock, Unlock, MapPin, Zap, Download
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminUsersPage() {
       const queryClient = useQueryClient();
       const [filter, setFilter] = useState('');
       const [roleFilter, setRoleFilter] = useState('ALL');
       const [statusFilter, setStatusFilter] = useState('ALL');

       const { data: users = [], isLoading } = useQuery({
              queryKey: ['staff'],
              queryFn: async () => {
                     const res = await api.get('/staff');
                     return res.data;
              }
       });

       const toggleStatusMutation = useMutation({
              mutationFn: async ({ id, active }: { id: string, active: boolean }) => {
                     return api.patch(`/staff/${id}`, { isActive: !active });
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['staff'] });
                     toast.success('User access status updated');
              }
       });

       const [isModalOpen, setIsModalOpen] = useState(false);
       const [formData, setFormData] = useState({
              name: '', email: '', password: '', role: 'ADMIN', serviceType: 'global',
              permissions: {
                     global_dashboard: false,
                     hotels_manage: false,
                     tours_manage: false,
                     buses_manage: false,
                     cabs_manage: false,
                     finance_manage: false,
                     users_manage: false,
              }
       });

       const createStaffMutation = useMutation({
              mutationFn: async (data: any) => {
                     return api.post('/staff', data);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['staff'] });
                     toast.success('Admin registered successfully');
                     setIsModalOpen(false);
                     setFormData({
                            name: '', email: '', password: '', role: 'ADMIN', serviceType: 'global',
                            permissions: {
                                   global_dashboard: false, hotels_manage: false, tours_manage: false,
                                   buses_manage: false, cabs_manage: false, finance_manage: false, users_manage: false
                            }
                     });
              },
              onError: (err: any) => {
                     toast.error(err.response?.data?.message || 'Failed to register admin');
              }
       });

       const handleCreateStaff = (e: React.FormEvent) => {
              e.preventDefault();
              createStaffMutation.mutate(formData);
       };

       const filteredUsers = users.filter((u: any) => {
              const matchesSearch = (u.name || '').toLowerCase().includes(filter.toLowerCase()) ||
                     (u.email || '').toLowerCase().includes(filter.toLowerCase()) ||
                     (u.hotel?.name || '').toLowerCase().includes(filter.toLowerCase()) ||
                     (u.role || '').toLowerCase().includes(filter.toLowerCase());
              const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
              const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && u.isActive) || (statusFilter === 'INACTIVE' && !u.isActive);
              return matchesSearch && matchesRole && matchesStatus;
       });

       const exportToCSV = () => {
              if (!filteredUsers.length) {
                     toast.error('No users to export');
                     return;
              }
              const headers = ['Name', 'Email', 'Role', 'Status', 'Service Type'];
              const rows = filteredUsers.map((u: any) => [
                     u.name || '',
                     u.email || '',
                     u.role || '',
                     u.isActive ? 'Active' : 'Inactive',
                     u.serviceType || ''
              ]);
              const csvContent = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
              const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
              link.click();
              URL.revokeObjectURL(url);
              toast.success(`Exported ${filteredUsers.length} users`);
       };

       if (isLoading) {
              return <div className="p-20 text-center font-black text-muted-foreground animate-pulse uppercase tracking-[0.3em]">Decoding User Matrix...</div>;
       }

       return (
              <div className="p-6 md:p-8 space-y-6 md:space-y-8 animate-fadeIn max-w-[1600px] mx-auto min-h-full">
                     <Topbar title="Identity Directory" subtitle="Manage permissions and system access for all staff and admins" />

                     {isModalOpen && (
                            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                   <div className="bg-background/80 backdrop-blur-2xl border border-border/10 rounded-[28px] p-8 w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-fadeIn">
                                          <div className="flex items-center justify-between mb-6">
                                                 <h2 className="text-2xl font-black text-foreground tracking-tight">Register New Admin</h2>
                                                 <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><AlertCircle size={24} /></button>
                                          </div>
                                          <form onSubmit={handleCreateStaff} className="space-y-4">
                                                 <div>
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Full Name</label>
                                                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black/5 dark:bg-white/5 border border-transparent text-foreground rounded-xl py-3 px-4 font-bold focus:ring-2 focus:ring-indigo-500/20" />
                                                 </div>
                                                 <div>
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Email Address</label>
                                                        <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-black/5 dark:bg-white/5 border border-transparent text-foreground rounded-xl py-3 px-4 font-bold focus:ring-2 focus:ring-indigo-500/20" />
                                                 </div>
                                                 <div>
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Temporary Password</label>
                                                        <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-black/5 dark:bg-white/5 border border-transparent text-foreground rounded-xl py-3 px-4 font-bold focus:ring-2 focus:ring-indigo-500/20" />
                                                 </div>
                                                 
                                                 <div className="pt-2">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 block">Module Access Permissions</label>
                                                        <div className="grid grid-cols-2 gap-3">
                                                               {Object.keys(formData.permissions).map((key) => (
                                                                      <label key={key} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer hover:border-indigo-500/50 transition-colors">
                                                                             <input
                                                                                    type="checkbox"
                                                                                    checked={(formData.permissions as any)[key]}
                                                                                    onChange={(e) => setFormData({
                                                                                           ...formData,
                                                                                           permissions: { ...formData.permissions, [key]: e.target.checked }
                                                                                    })}
                                                                                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                                                             />
                                                                             <span className="text-xs font-bold text-muted-foreground capitalize">
                                                                                    {key.replace('_', ' ')}
                                                                             </span>
                                                                      </label>
                                                               ))}
                                                        </div>
                                                 </div>

                                                 <div className="pt-4 flex gap-4">
                                                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-muted-foreground font-black rounded-xl hover:bg-slate-200">CANCEL</button>
                                                        <button type="submit" disabled={createStaffMutation.isPending} className="flex-1 py-4 bg-indigo-600 text-foreground font-black rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
                                                               {createStaffMutation.isPending ? 'CREATING...' : 'REGISTER'}
                                                        </button>
                                                 </div>
                                          </form>
                                   </div>
                            </div>
                     )}

                     <div className="ios-sheet p-6 rounded-[28px] border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)] mb-12 flex flex-col md:flex-row items-center gap-6">
                            <div className="relative flex-1 w-full group">
                                   <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
                                   <input
                                          type="text"
                                          placeholder="Search Identities by name, email, or role..."
                                          value={filter}
                                          onChange={(e) => setFilter(e.target.value)}
                                          className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl text-foreground py-5 pl-16 pr-6 text-sm font-black text-foreground focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                   />
                            </div>
                            <div className="flex items-center gap-3">
                                   <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl py-5 px-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-foreground">
                                          <option value="ALL">All Roles</option><option value="ADMIN">Admin</option><option value="OWNER">Owner</option><option value="MANAGER">Manager</option>
                                   </select>
                                   <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl py-5 px-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-foreground">
                                          <option value="ALL">All Status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
                                   </select>
                                   <button onClick={exportToCSV} className="flex items-center gap-2 px-6 py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl text-sm font-black uppercase tracking-widest transition-all hover:opacity-90">
                                          <Download size={18} /> Export
                                   </button>
                            </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredUsers.map((user: any) => (
                                   <div key={user.id} className="ios-platter border border-border/10 rounded-[28px] p-8 hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-transform transition-all group relative overflow-hidden">
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                                          
                                          <div className="flex items-start justify-between mb-8 relative z-10">
                                                 <div className="flex gap-5">
                                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-foreground transition-all shadow-inner">
                                                               {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                               <h3 className="font-black text-foreground text-lg group-hover:text-indigo-600 transition-colors">{user.name}</h3>
                                                               <div className="flex items-center gap-2 mt-1.5">
                                                                      <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{user.role}</span>
                                                               </div>
                                                        </div>
                                                 </div>
                                                 <button className="p-3 text-muted-foreground/40 hover:text-foreground hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
                                          </div>

                                          <div className="space-y-4 relative z-10">
                                                 <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent text-foreground group-hover:border-indigo-100 transition-colors">
                                                        <div className="p-2 bg-white rounded-lg text-muted-foreground"><Mail size={14} /></div>
                                                        <span className="text-xs text-muted-foreground font-bold truncate">{user.email}</span>
                                                 </div>

                                                 <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent text-foreground group-hover:border-indigo-100 transition-colors">
                                                        <div className="p-2 bg-white rounded-lg text-muted-foreground"><Building2 size={14} /></div>
                                                        <span className="text-xs text-muted-foreground font-bold truncate">{user.hotel?.name || user.tourPartner?.companyName || user.busVendor?.companyName || 'Global Management'}</span>
                                                 </div>
                                          </div>

                                          <div className="mt-8 flex items-center justify-between pt-8 border-t border-slate-50 relative z-10">
                                                 <div className="flex items-center gap-2">
                                                        <ShieldCheck size={16} className={user.isActive ? 'text-emerald-500' : 'text-muted-foreground/20'} />
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Access Protocol</span>
                                                 </div>
                                                  <button
                                                         onClick={() => toggleStatusMutation.mutate({ id: user.id, active: user.isActive })}
                                                         disabled={toggleStatusMutation.isPending}
                                                         className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${user.isActive
                                                                        ? 'text-red-500 bg-red-50 hover:bg-red-500 hover:text-foreground shadow-lg shadow-red-500/10'
                                                                        : 'text-emerald-500 bg-emerald-50 hover:bg-emerald-500 hover:text-foreground shadow-lg shadow-emerald-500/10'
                                                                }`}
                                                  >
                                                         {user.isActive ? <Lock size={12} /> : <Unlock size={12} />}
                                                         {user.isActive ? 'Revoke' : 'Authorize'}
                                                  </button>
                                          </div>
                                   </div>
                            ))}
                     </div>

                     {filteredUsers.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-32 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                                   <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-muted-foreground/20 shadow-xl mb-6">
                                          <Search size={40} />
                                   </div>
                                   <h4 className="text-2xl font-black text-muted-foreground/40 uppercase tracking-widest">Zero Results</h4>
                                   <p className="text-muted-foreground font-bold mt-2 text-sm uppercase tracking-tighter">The system found no identities matching your query</p>
                            </div>
                     )}
              </div>
       );
}
