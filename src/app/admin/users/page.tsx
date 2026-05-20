'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
       Users, Search, Shield, Building2,
       Mail, Phone, ShieldCheck, ShieldAlert,
       MoreVertical, AlertCircle, UserPlus,
       Lock, Unlock, MapPin, Zap
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminUsersPage() {
       const queryClient = useQueryClient();
       const [filter, setFilter] = useState('');

       const { data: users = [], isLoading } = useQuery({
              queryKey: ['admin-users'],
              queryFn: async () => {
                     const res = await api.get('/admin/users');
                     return res.data;
              }
       });

       const toggleStatusMutation = useMutation({
              mutationFn: async ({ id, active }: { id: string, active: boolean }) => {
                     // Assuming we have an endpoint for this, or using a patch
                     return api.patch(`/admin/users/${id}/status`, { isActive: !active });
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-users'] });
                     toast.success('User access status updated');
              }
       });

       const filteredUsers = users.filter((u: any) =>
              (u.name || '').toLowerCase().includes(filter.toLowerCase()) ||
              (u.email || '').toLowerCase().includes(filter.toLowerCase()) ||
              (u.hotel?.name || '').toLowerCase().includes(filter.toLowerCase()) ||
              (u.role || '').toLowerCase().includes(filter.toLowerCase())
       );

       if (isLoading) {
              return <div className="p-20 text-center font-black text-slate-400 animate-pulse uppercase tracking-[0.3em]">Decoding User Matrix...</div>;
       }

       return (
              <div className="p-8 lg:p-12 animate-fadeIn">
                     <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div>
                                   <div className="flex items-center gap-3 mb-2">
                                          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                                                 <Users size={20} />
                                          </div>
                                          <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Access Control</span>
                                   </div>
                                   <h1 className="text-4xl font-black text-slate-900 tracking-tight">Identity Directory</h1>
                                   <p className="text-slate-400 font-bold mt-2">Manage permissions and system access for all staff and admins</p>
                            </div>
                            <button className="px-8 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl active:scale-95 group">
                                   <UserPlus size={18} className="group-hover:rotate-12 transition-transform" /> Register Admin
                            </button>
                     </header>

                     <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl mb-12 flex flex-col md:flex-row items-center gap-6">
                            <div className="relative flex-1 w-full group">
                                   <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                   <input
                                          type="text"
                                          placeholder="Search Identities by name, email, or role..."
                                          value={filter}
                                          onChange={(e) => setFilter(e.target.value)}
                                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-16 pr-6 text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                   />
                            </div>
                            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                                   <Zap size={16} className="text-amber-500" />
                                   <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{filteredUsers.length} Active Records</span>
                            </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredUsers.map((user: any) => (
                                   <div key={user.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-indigo-600/10 transition-all group relative overflow-hidden">
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                                          
                                          <div className="flex items-start justify-between mb-8 relative z-10">
                                                 <div className="flex gap-5">
                                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                                               {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                               <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{user.name}</h3>
                                                               <div className="flex items-center gap-2 mt-1.5">
                                                                      <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{user.role}</span>
                                                               </div>
                                                        </div>
                                                 </div>
                                                 <button className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
                                          </div>

                                          <div className="space-y-4 relative z-10">
                                                 <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-indigo-100 transition-colors">
                                                        <div className="p-2 bg-white rounded-lg text-slate-400"><Mail size={14} /></div>
                                                        <span className="text-xs text-slate-600 font-bold truncate">{user.email}</span>
                                                 </div>

                                                 <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-indigo-100 transition-colors">
                                                        <div className="p-2 bg-white rounded-lg text-slate-400"><Building2 size={14} /></div>
                                                        <span className="text-xs text-slate-600 font-bold truncate">{user.hotel?.name || user.tourPartner?.companyName || user.busVendor?.companyName || 'Global Management'}</span>
                                                 </div>
                                          </div>

                                          <div className="mt-8 flex items-center justify-between pt-8 border-t border-slate-50 relative z-10">
                                                 <div className="flex items-center gap-2">
                                                        <ShieldCheck size={16} className={user.isActive ? 'text-emerald-500' : 'text-slate-200'} />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Protocol</span>
                                                 </div>
                                                 <button
                                                        onClick={() => toast.error('Security Protocol: Status modification requires Root Access')}
                                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${user.isActive
                                                                       ? 'text-red-500 bg-red-50 hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/10'
                                                                       : 'text-emerald-500 bg-emerald-50 hover:bg-emerald-500 hover:text-white shadow-lg shadow-emerald-500/10'
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
                                   <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-xl mb-6">
                                          <Search size={40} />
                                   </div>
                                   <h4 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Zero Results</h4>
                                   <p className="text-slate-400 font-bold mt-2 text-sm uppercase tracking-tighter">The system found no identities matching your query</p>
                            </div>
                     )}
              </div>
       );
}
