'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
       CheckCircle2, Ban, Mail, Phone,
       MapPin, ExternalLink, X, Building, Info, Edit,
       CreditCard, FileText, Globe, Landmark, Eye, Check,
       ArrowLeft, Package, Star, Shield, Clock, Plus, Trash2, Gift, Tag
} from 'lucide-react';
import { useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import { toast } from 'react-hot-toast';

export default function AdminTourPartnersPage() {
       const queryClient = useQueryClient();
       const [filter, setFilter] = useState('');
       const [statusFilter, setStatusFilter] = useState('All');
       const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
       const [activeTab, setActiveTab] = useState<'PROFILE' | 'PACKAGES' | 'HISTORY' | 'OFFERS'>('PROFILE');
       const [isAddPkgModalOpen, setIsAddPkgModalOpen] = useState(false);

       const { data: partners = [], isLoading } = useQuery({
              queryKey: ['admin-tour-partners', statusFilter],
              queryFn: async () => {
                     const status = statusFilter.toUpperCase();
                     const url = status === 'ALL' ? '/admin/tour-partners' : `/admin/tour-partners?status=${status}`;
                     const res = await api.get(url);
                     return res.data;
              }
       });

       const { data: selectedPartner, isLoading: isPartnerLoading } = useQuery({
              queryKey: ['admin-partner-detail', selectedPartnerId],
              queryFn: async () => {
                     if (!selectedPartnerId) return null;
                     const res = await api.get(`/admin/tour-partners/${selectedPartnerId}`);
                     return res.data;
              },
              enabled: !!selectedPartnerId
       });

       const deletePkgMutation = useMutation({
              mutationFn: async (id: string) => {
                     await api.delete(`/admin/tour-partners/packages/${id}`);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-partner-detail', selectedPartnerId] });
                     toast.success('Package removed successfully');
              }
       });

       const addPkgMutation = useMutation({
              mutationFn: async (data: any) => {
                     await api.post(`/admin/tour-partners/${selectedPartnerId}/packages`, data);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-partner-detail', selectedPartnerId] });
                     setIsAddPkgModalOpen(false);
                     toast.success('New package published successfully');
              }
       });

       const updateStatus = useMutation({
              mutationFn: async ({ id, status }: { id: string, status: string }) => {
                     await api.patch(`/admin/tour-partners/${id}/status`, { status });
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-tour-partners'] });
                     if (selectedPartnerId) {
                         queryClient.invalidateQueries({ queryKey: ['admin-partner-detail', selectedPartnerId] });
                     }
              }
       });

       const filteredPartners = partners.filter((p: any) =>
              (p.businessName || p.name || '').toLowerCase().includes(filter.toLowerCase()) ||
              p.email.toLowerCase().includes(filter.toLowerCase())
       );

       const columns = [
              {
                     header: 'Agency Details',
                     accessor: 'businessName',
                     render: (p: any) => (
                            <div className="flex items-center gap-4">
                                   <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center font-black text-purple-600 group-hover:scale-110 transition-transform text-lg">
                                          {p.businessName?.charAt(0) || 'P'}
                                   </div>
                                   <div>
                                          <div className="text-sm font-black text-slate-900 leading-none mb-1">{p.businessName || p.name}</div>
                                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{p.businessType || 'Tour Operator'}</div>
                                   </div>
                            </div>
                     )
              },
              {
                     header: 'Status',
                     accessor: 'status',
                     render: (p: any) => (
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${
                                   p.status === 'APPROVED' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                                   p.status === 'PENDING' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                                   'text-slate-400 bg-slate-50 border-slate-100'
                            }`}>
                                   {p.status}
                            </span>
                     )
              }
       ];

       const actions = (p: any) => (
              <div className="flex items-center gap-2">
                     <button
                            onClick={() => setSelectedPartnerId(p.id)}
                            className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                     >
                            <Eye size={18} />
                     </button>
              </div>
       );

       if (selectedPartnerId && selectedPartner) {
              return (
                     <div className="p-8 animate-fadeIn">
                            {/* Add Package Modal */}
                            {isAddPkgModalOpen && (
                                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-scaleUp">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Post New Tour</h3>
                                            <button onClick={() => setIsAddPkgModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={24} /></button>
                                        </div>
                                        <form className="space-y-6" onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            addPkgMutation.mutate({
                                                title: formData.get('title'),
                                                duration: formData.get('duration'),
                                                basePrice: Number(formData.get('price')),
                                                salePrice: Number(formData.get('price')),
                                            });
                                        }}>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Package Title</label>
                                                <input name="title" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" placeholder="e.g. Kerala Backwaters Tour" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                                                    <input name="duration" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" placeholder="5 Days / 4 Nights" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price</label>
                                                    <input name="price" type="number" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" placeholder="12000" />
                                                </div>
                                            </div>
                                            <button type="submit" disabled={addPkgMutation.isPending} className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center gap-2">
                                                {addPkgMutation.isPending ? 'Publishing...' : 'Publish Package'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-8">
                                <button 
                                       onClick={() => setSelectedPartnerId(null)}
                                       className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-colors group"
                                >
                                       <div className="p-2 rounded-xl bg-white group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                              <ArrowLeft size={16} />
                                       </div>
                                       Back to Agencies
                                </button>

                                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                                    {(['PROFILE', 'PACKAGES', 'HISTORY', 'OFFERS'] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                   <div className="xl:col-span-1 space-y-6">
                                          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                                                 <div className="flex flex-col items-center text-center">
                                                        <div className="w-24 h-24 rounded-3xl bg-purple-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-purple-600/20 text-3xl font-black">
                                                               {selectedPartner.businessName?.charAt(0) || 'P'}
                                                        </div>
                                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{selectedPartner.businessName || selectedPartner.name}</h2>
                                                        <p className="text-slate-400 font-bold text-sm mb-6 uppercase tracking-widest">{selectedPartner.businessType || 'Tour Operator'}</p>
                                                        <button className="w-full py-4 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                                            <Edit size={16} /> Edit Profile
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="xl:col-span-2">
                                          {activeTab === 'PACKAGES' && (
                                              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl space-y-10">
                                                  <div className="flex items-center justify-between">
                                                      <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                                          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Package size={24} /></div>
                                                          Posted Tour Packages
                                                      </h3>
                                                      <button 
                                                            onClick={() => setIsAddPkgModalOpen(true)}
                                                            className="px-6 py-3 bg-slate-900 hover:bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"
                                                      >
                                                          <Plus size={16} /> Post New Tour
                                                      </button>
                                                  </div>
                                                  <div className="space-y-4">
                                                      {selectedPartner.packages?.map((pkg: any, i: number) => (
                                                          <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-purple-500/30 transition-all">
                                                              <div className="flex items-center gap-6">
                                                                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-sm relative">
                                                                      <Package size={32} />
                                                                      <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded-full uppercase tracking-tighter">Live</div>
                                                                  </div>
                                                                  <div className="min-w-0">
                                                                      <div className="text-lg font-black text-slate-900 truncate max-w-[250px]">{pkg.title}</div>
                                                                      <div className="flex items-center gap-4 mt-1">
                                                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pkg.duration}</span>
                                                                          <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded-lg">₹{Number(pkg.salePrice).toLocaleString()}</span>
                                                                      </div>
                                                                  </div>
                                                              </div>
                                                              <div className="flex items-center gap-2">
                                                                  <button className="p-3 bg-white text-slate-400 hover:text-purple-600 hover:shadow-md rounded-xl transition-all">
                                                                      <Edit size={18} />
                                                                  </button>
                                                                  <button 
                                                                        onClick={() => {
                                                                            if(confirm('Are you sure you want to delete this package?')) {
                                                                                deletePkgMutation.mutate(pkg.id);
                                                                            }
                                                                        }}
                                                                        className="p-3 bg-white text-slate-400 hover:text-red-500 hover:shadow-md rounded-xl transition-all"
                                                                  >
                                                                      <Trash2 size={18} />
                                                                  </button>
                                                              </div>
                                                          </div>
                                                      ))}
                                                  </div>
                                              </div>
                                          )}

                                          {activeTab === 'HISTORY' && (
                                              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl space-y-10">
                                                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                                      <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Clock size={24} /></div>
                                                      Booking History
                                                  </h3>
                                                  <div className="space-y-4">
                                                      {selectedPartner.bookings?.map((booking: any, i: number) => (
                                                          <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-slate-900 transition-all duration-500">
                                                              <div className="flex items-center gap-6">
                                                                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
                                                                      <CreditCard size={24} />
                                                                  </div>
                                                                  <div>
                                                                      <div className="text-sm font-black group-hover:text-white transition-colors">{booking.guestName}</div>
                                                                      <div className="text-[10px] font-bold text-slate-400 group-hover:text-white/40 uppercase tracking-widest mt-1">Ref: {booking.bookingReference}</div>
                                                                  </div>
                                                              </div>
                                                              <div className="text-right">
                                                                  <div className="text-sm font-black group-hover:text-white transition-colors">₹{Number(booking.totalAmount).toLocaleString()}</div>
                                                                  <div className="text-[10px] font-bold text-slate-400 group-hover:text-white/40 uppercase tracking-widest mt-1">{new Date(booking.createdAt).toLocaleDateString()}</div>
                                                              </div>
                                                          </div>
                                                      ))}
                                                  </div>
                                              </div>
                                          )}
                                   </div>
                            </div>
                     </div>
              );
       }

       return (
              <div className="p-8">
                     <DataTable
                            title="Tour Partner Requests"
                            description="Review and approve sightseeing and holiday package operators"
                            columns={columns}
                            data={filteredPartners}
                            isLoading={isLoading}
                            onSearch={setFilter}
                            onFilter={setStatusFilter}
                            actions={actions}
                     />
              </div>
       );
}
