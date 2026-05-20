'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
    Bus, CheckCircle, XCircle, Shield, Search, Filter, Mail, Eye, Check, Ban, 
    ArrowLeft, Building2, MapPin, Phone, Calendar, User, Briefcase, Plus, Edit, Trash2, Clock, CreditCard, Gift, Tag, X
} from 'lucide-react';
import { useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import { toast } from 'react-hot-toast';

export default function AdminBusesPage() {
       const queryClient = useQueryClient();
       const [filter, setFilter] = useState('');
       const [statusFilter, setStatusFilter] = useState('All');
       const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
       const [activeTab, setActiveTab] = useState<'PROFILE' | 'FLEET' | 'BOOKINGS' | 'OFFERS'>('PROFILE');
       const [isAddBusModalOpen, setIsAddBusModalOpen] = useState(false);

       const { data: vendors = [], isLoading } = useQuery({
              queryKey: ['admin-buses', statusFilter],
              queryFn: async () => {
                     const status = statusFilter.toUpperCase();
                     const url = status === 'ALL' ? '/admin/buses' : `/admin/buses?status=${status}`;
                     const res = await api.get(url);
                     return res.data;
              }
       });

       const { data: selectedVendor, isLoading: isVendorLoading } = useQuery({
              queryKey: ['admin-bus-vendor', selectedVendorId],
              queryFn: async () => {
                     if (!selectedVendorId) return null;
                     const res = await api.get(`/admin/buses/${selectedVendorId}`);
                     return res.data;
              },
              enabled: !!selectedVendorId
       });

       const addBusMutation = useMutation({
              mutationFn: async (data: any) => {
                     await api.post(`/admin/buses/${selectedVendorId}/fleet`, data);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-bus-vendor', selectedVendorId] });
                     setIsAddBusModalOpen(false);
                     toast.success('Bus added to fleet');
              }
       });

       const deleteBusMutation = useMutation({
              mutationFn: async (id: string) => {
                     await api.delete(`/admin/buses/fleet/${id}`);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-bus-vendor', selectedVendorId] });
                     toast.success('Bus removed from fleet');
              }
       });

       const statusMutation = useMutation({
              mutationFn: async ({ id, status }: { id: string, status: string }) => {
                     return api.patch(`/admin/buses/${id}/status`, { status });
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-buses'] });
                     if (selectedVendorId) {
                         queryClient.invalidateQueries({ queryKey: ['admin-bus-vendor', selectedVendorId] });
                     }
              }
       });

       const filteredVendors = vendors.filter((v: any) =>
              (v.businessName || v.name || '').toLowerCase().includes(filter.toLowerCase()) ||
              v.email.toLowerCase().includes(filter.toLowerCase())
       );

       const columns = [
              {
                     header: 'Vendor Details',
                     accessor: 'businessName',
                     render: (v: any) => (
                            <div className="flex items-center gap-4">
                                   <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600 group-hover:scale-110 transition-transform">
                                          <Bus size={20} />
                                   </div>
                                   <div>
                                          <div className="text-sm font-black text-slate-900 leading-none mb-1">{v.businessName || v.name}</div>
                                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {v.id.slice(0, 8)}</div>
                                   </div>
                            </div>
                     )
              },
              {
                     header: 'Status',
                     accessor: 'status',
                     render: (v: any) => (
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${
                                   v.status === 'APPROVED' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                                   v.status === 'PENDING' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                                   'text-slate-400 bg-slate-50 border-slate-100'
                            }`}>
                                   {v.status}
                            </span>
                     )
              }
       ];

       const actions = (v: any) => (
              <div className="flex items-center gap-2">
                     <button
                            onClick={() => setSelectedVendorId(v.id)}
                            className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                     >
                            <Eye size={18} />
                     </button>
              </div>
       );

       if (selectedVendorId && selectedVendor) {
              return (
                     <div className="p-8 animate-fadeIn">
                            {/* Add Bus Modal */}
                            {isAddBusModalOpen && (
                                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-scaleUp">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add New Vehicle</h3>
                                            <button onClick={() => setIsAddBusModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={24} /></button>
                                        </div>
                                        <form className="space-y-6" onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            addBusMutation.mutate({
                                                registrationNumber: formData.get('reg'),
                                                type: formData.get('type'),
                                                totalSeats: Number(formData.get('seats')),
                                            });
                                        }}>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registration Number</label>
                                                <input name="reg" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="e.g. DL 01 BU 1234" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bus Type</label>
                                                    <select name="type" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                                                        <option value="AC_SLEEPER">AC Sleeper</option>
                                                        <option value="NON_AC_SLEEPER">Non-AC Sleeper</option>
                                                        <option value="AC_SEATER">AC Seater</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Seats</label>
                                                    <input name="seats" type="number" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="36" />
                                                </div>
                                            </div>
                                            <button type="submit" disabled={addBusMutation.isPending} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                                                {addBusMutation.isPending ? 'Registering...' : 'Add to Fleet'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-8">
                                <button 
                                       onClick={() => setSelectedVendorId(null)}
                                       className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-colors group"
                                >
                                       <div className="p-2 rounded-xl bg-white group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                              <ArrowLeft size={16} />
                                       </div>
                                       Back to List
                                </button>

                                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                                    {(['PROFILE', 'FLEET', 'BOOKINGS', 'OFFERS'] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
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
                                                        <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-600/20">
                                                               <Bus size={48} />
                                                        </div>
                                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{selectedVendor.businessName || selectedVendor.name}</h2>
                                                        <button className="w-full py-4 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                                            <Edit size={16} /> Edit Vendor
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="xl:col-span-2">
                                          {activeTab === 'FLEET' && (
                                              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl space-y-10">
                                                  <div className="flex items-center justify-between">
                                                      <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                                          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Bus size={24} /></div>
                                                          Posted Fleet Data
                                                      </h3>
                                                      <button 
                                                            onClick={() => setIsAddBusModalOpen(true)}
                                                            className="px-6 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"
                                                      >
                                                          <Plus size={16} /> Add Bus
                                                      </button>
                                                  </div>
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                      {selectedVendor.buses?.map((bus: any, i: number) => (
                                                          <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                                              <div className="flex items-center gap-4">
                                                                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm relative">
                                                                      <Bus size={24} />
                                                                      <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded-full uppercase tracking-tighter">Live</div>
                                                                  </div>
                                                                  <div>
                                                                      <div className="text-sm font-black text-slate-900">{bus.registrationNumber}</div>
                                                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{bus.type}</div>
                                                                  </div>
                                                              </div>
                                                              <div className="flex items-center gap-2">
                                                                  <button className="p-2.5 bg-white text-slate-400 hover:text-blue-600 hover:shadow-md rounded-xl transition-all">
                                                                      <Edit size={16} />
                                                                  </button>
                                                                  <button 
                                                                        onClick={() => {
                                                                            if(confirm('Delete this vehicle?')) deleteBusMutation.mutate(bus.id);
                                                                        }}
                                                                        className="p-2.5 bg-white text-slate-400 hover:text-red-500 hover:shadow-md rounded-xl transition-all"
                                                                  >
                                                                      <Trash2 size={16} />
                                                                  </button>
                                                              </div>
                                                          </div>
                                                      ))}
                                                  </div>
                                              </div>
                                          )}

                                          {activeTab === 'BOOKINGS' && (
                                              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl space-y-10">
                                                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Clock size={24} /></div>
                                                      Booking History
                                                  </h3>
                                                  <div className="space-y-4">
                                                      {selectedVendor.bookings?.map((booking: any, i: number) => (
                                                          <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-slate-900 transition-all duration-500">
                                                              <div className="flex items-center gap-6">
                                                                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
                                                                      <CreditCard size={24} />
                                                                  </div>
                                                                  <div>
                                                                      <div className="text-sm font-black group-hover:text-white transition-colors">PNR: {booking.pnr}</div>
                                                                      <div className="text-[10px] font-bold text-slate-400 group-hover:text-white/40 uppercase tracking-widest mt-1">Bus: {booking.schedule?.bus?.registrationNumber || 'N/A'}</div>
                                                                  </div>
                                                              </div>
                                                              <div className="text-right">
                                                                  <div className="text-sm font-black group-hover:text-white transition-colors">₹{Number(booking.totalFare).toLocaleString()}</div>
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
                            title="Bus Partners"
                            description="Verify and manage onboarded bus fleet operators"
                            columns={columns}
                            data={filteredVendors}
                            isLoading={isLoading}
                            onSearch={setFilter}
                            onFilter={setStatusFilter}
                            actions={actions}
                     />
              </div>
       );
}
