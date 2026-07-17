'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
       CheckCircle2, Ban, Mail, Phone,
       MapPin, ExternalLink, X, Building, Info, Edit,
       CreditCard, FileText, Globe, Landmark, Eye, Check,
       ArrowLeft, Package, Star, Shield, Clock, Plus, Trash2, Gift, Tag, Download
} from 'lucide-react';
import { useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import { toast } from 'react-hot-toast';

export default function AdminTourPartnersPage() {
       const queryClient = useQueryClient();
       const [filter, setFilter] = useState('');
       const [statusFilter, setStatusFilter] = useState('All');
       const [dateFrom, setDateFrom] = useState('');
       const [dateTo, setDateTo] = useState('');
       const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
       const [activeTab, setActiveTab] = useState<'PROFILE' | 'PACKAGES' | 'HISTORY' | 'OFFERS'>('PROFILE');
       const [isAddPkgModalOpen, setIsAddPkgModalOpen] = useState(false);
       const [isEditPartnerModalOpen, setIsEditPartnerModalOpen] = useState(false);
       const [isEditPackageModalOpen, setIsEditPackageModalOpen] = useState(false);
       const [selectedPackage, setSelectedPackage] = useState<any>(null);

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

       const updatePartnerMutation = useMutation({
              mutationFn: async (data: any) => {
                     await api.patch(`/admin/tour-partners/${selectedPartnerId}`, data);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-partner-detail', selectedPartnerId] });
                     queryClient.invalidateQueries({ queryKey: ['admin-tour-partners'] });
                     setIsEditPartnerModalOpen(false);
                     toast.success('Partner profile updated successfully');
              }
       });

       const updatePackageMutation = useMutation({
              mutationFn: async ({ packageId, data }: { packageId: string, data: any }) => {
                     await api.patch(`/admin/tour-partners/packages/${packageId}`, data);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-partner-detail', selectedPartnerId] });
                     setIsEditPackageModalOpen(false);
                     toast.success('Tour package updated successfully');
              }
       });

       const filteredPartners = partners.filter((p: any) => {
              const matchesSearch = (p.companyName || p.name || '').toLowerCase().includes(filter.toLowerCase()) || p.email.toLowerCase().includes(filter.toLowerCase());
              let matchesDates = true;
              if (dateFrom) matchesDates = matchesDates && new Date(p.createdAt || Date.now()) >= new Date(dateFrom);
              if (dateTo) matchesDates = matchesDates && new Date(p.createdAt || Date.now()) <= new Date(dateTo);
              return matchesSearch && matchesDates;
       });

       const exportToCSV = () => {
              if (!filteredPartners.length) return toast.error('No partners to export');
              const headers = ['ID', 'Company Name', 'Email', 'Phone', 'Status', 'Created At'];
              const rows = filteredPartners.map((p: any) => [
                     p.id, p.companyName || p.name, p.email, p.phone || '', p.status, p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''
              ]);
              const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `tour_partners_${new Date().toISOString().slice(0,10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success(`Exported ${filteredPartners.length} partners`);
       };

       const headerAction = (
              <div className="flex items-center gap-2">
                     <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-foreground" />
                     <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-foreground" />
                     <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 rounded-xl text-xs font-black uppercase tracking-widest transition-all"><Download size={16} /> Export</button>
              </div>
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
                                          <div className="text-sm font-black text-foreground leading-none mb-1">{p.businessName || p.name}</div>
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
                                    <div className="ios-sheet rounded-[28px] w-full max-w-lg p-10 shadow-2xl animate-scaleUp">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black text-foreground tracking-tight">Post New Tour</h3>
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
                                                <input name="title" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" placeholder="e.g. Kerala Backwaters Tour" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                                                    <input name="duration" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" placeholder="5 Days / 4 Nights" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price</label>
                                                    <input name="price" type="number" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" placeholder="12000" />
                                                </div>
                                            </div>
                                            <button type="submit" disabled={addPkgMutation.isPending} className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center gap-2">
                                                {addPkgMutation.isPending ? 'Publishing...' : 'Publish Package'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Edit Partner Modal */}
                            {isEditPartnerModalOpen && (
                                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                    <div className="ios-sheet rounded-[28px] w-full max-w-lg p-10 shadow-2xl animate-scaleUp">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black text-foreground tracking-tight">Edit Partner Profile</h3>
                                            <button onClick={() => setIsEditPartnerModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={24} /></button>
                                        </div>
                                        <form className="space-y-6" onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            updatePartnerMutation.mutate({
                                                businessName: formData.get('businessName'),
                                            });
                                        }}>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Agency Name</label>
                                                <input name="businessName" defaultValue={selectedPartner.businessName || selectedPartner.name} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" />
                                            </div>
                                            <button type="submit" disabled={updatePartnerMutation.isPending} className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center gap-2">
                                                {updatePartnerMutation.isPending ? 'Saving...' : 'Save Details'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Edit Package Modal */}
                            {isEditPackageModalOpen && selectedPackage && (
                                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                    <div className="ios-sheet rounded-[28px] w-full max-w-lg p-10 shadow-2xl animate-scaleUp">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black text-foreground tracking-tight">Edit Tour Package</h3>
                                            <button onClick={() => setIsEditPackageModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={24} /></button>
                                        </div>
                                        <form className="space-y-6" onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            updatePackageMutation.mutate({
                                                packageId: selectedPackage.id,
                                                data: {
                                                    title: formData.get('title'),
                                                    duration: formData.get('duration'),
                                                    basePrice: Number(formData.get('price')),
                                                    salePrice: Number(formData.get('price')),
                                                }
                                            });
                                        }}>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Package Title</label>
                                                <input name="title" defaultValue={selectedPackage.title} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                                                    <input name="duration" defaultValue={selectedPackage.duration} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sale Price</label>
                                                    <input name="price" type="number" defaultValue={selectedPackage.salePrice} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" />
                                                </div>
                                            </div>
                                            <button type="submit" disabled={updatePackageMutation.isPending} className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center gap-2">
                                                {updatePackageMutation.isPending ? 'Saving...' : 'Save Package'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-8 px-2">
                                <button 
                                       onClick={() => setSelectedPartnerId(null)}
                                       className="flex items-center gap-2 text-muted-foreground hover:text-purple-500 font-bold text-xs uppercase tracking-widest transition-colors group"
                                >
                                       <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                                              <ArrowLeft size={16} />
                                       </div>
                                       Back to Agencies
                                </button>

                                <div className="flex bg-black/[0.02] dark:bg-white/[0.02] p-1.5 rounded-2xl shadow-inner border border-border/10">
                                    {(['PROFILE', 'PACKAGES', 'HISTORY', 'OFFERS'] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                   <div className="xl:col-span-1 space-y-6">
                                          <div className="ios-sheet rounded-[28px] p-8 border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
                                                 <div className="flex flex-col items-center text-center">
                                                        <div className="w-24 h-24 rounded-3xl bg-purple-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-purple-600/20 text-3xl font-black">
                                                               {selectedPartner.businessName?.charAt(0) || 'P'}
                                                        </div>
                                                        <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">{selectedPartner.businessName || selectedPartner.name}</h2>
                                                        <p className="text-slate-400 font-bold text-sm mb-6 uppercase tracking-widest">{selectedPartner.businessType || 'Tour Operator'}</p>
                                                        <button 
                                                            onClick={() => setIsEditPartnerModalOpen(true)}
                                                            className="w-full py-4 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Edit size={16} /> Edit Profile
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="xl:col-span-2">
                                          {activeTab === 'PACKAGES' && (
                                              <div className="ios-sheet rounded-[28px] p-10 border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)] space-y-10">
                                                  <div className="flex items-center justify-between">
                                                      <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
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
                                                                      <div className="text-lg font-black text-foreground truncate max-w-[250px]">{pkg.title}</div>
                                                                      <div className="flex items-center gap-4 mt-1">
                                                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pkg.duration}</span>
                                                                          <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded-lg">₹{Number(pkg.salePrice).toLocaleString()}</span>
                                                                      </div>
                                                                  </div>
                                                              </div>
                                                              <div className="flex items-center gap-2">
                                                                  <button 
                                                                      onClick={() => {
                                                                          setSelectedPackage(pkg);
                                                                          setIsEditPackageModalOpen(true);
                                                                      }}
                                                                      className="p-3 bg-white text-slate-400 hover:text-purple-600 hover:shadow-md rounded-xl transition-all"
                                                                  >
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
                                              <div className="ios-sheet rounded-[28px] p-10 border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)] space-y-10">
                                                  <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
                                                      <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Clock size={24} /></div>
                                                      Booking History
                                                  </h3>
                                                  <div className="space-y-4">
                                                      {selectedPartner.bookings?.map((booking: any, i: number) => (
                                                          <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-slate-900 transition-all duration-500">
                                                              <div className="flex items-center gap-6">
                                                                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-foreground group-hover:scale-110 transition-transform">
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
                            headerAction={headerAction}
                     />
              </div>
       );
}
