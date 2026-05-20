'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
    Car, CheckCircle, XCircle, Shield, Eye, Check, ArrowLeft, Mail, Phone, MapPin, 
    Building2, User, Briefcase, Zap, Plus, Edit, Trash2, Clock, CreditCard, Gift, Tag, X
} from 'lucide-react';
import { useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import { toast } from 'react-hot-toast';

export default function AdminCabsPage() {
       const queryClient = useQueryClient();
       const [filter, setFilter] = useState('');
       const [statusFilter, setStatusFilter] = useState('All');
       const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
       const [activeTab, setActiveTab] = useState<'PROFILE' | 'VEHICLES' | 'BOOKINGS' | 'OFFERS'>('PROFILE');
       const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);

       const { data: vendors = [], isLoading } = useQuery({
              queryKey: ['admin-cabs'],
              queryFn: async () => {
                     const res = await api.get('/admin/cabs');
                     return res.data;
              }
       });

       const { data: selectedVendor, isLoading: isVendorLoading } = useQuery({
              queryKey: ['admin-cab-vendor', selectedVendorId],
              queryFn: async () => {
                     if (!selectedVendorId) return null;
                     const res = await api.get(`/admin/cabs/${selectedVendorId}`);
                     return res.data;
              },
              enabled: !!selectedVendorId
       });

       const addVehicleMutation = useMutation({
              mutationFn: async (data: any) => {
                     await api.post(`/admin/cabs/${selectedVendorId}/vehicles`, data);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-cab-vendor', selectedVendorId] });
                     setIsAddVehicleModalOpen(false);
                     toast.success('Vehicle added to inventory');
              }
       });

       const deleteVehicleMutation = useMutation({
              mutationFn: async (id: string) => {
                     await api.delete(`/admin/cabs/vehicles/${id}`);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-cab-vendor', selectedVendorId] });
                     toast.success('Vehicle removed successfully');
              }
       });

       const filteredVendors = vendors.filter((v: any) =>
              (v.companyName || v.name || '').toLowerCase().includes(filter.toLowerCase()) ||
              v.email.toLowerCase().includes(filter.toLowerCase())
       );

       const columns = [
              {
                     header: 'Cab Vendor',
                     accessor: 'companyName',
                     render: (v: any) => (
                            <div className="flex items-center gap-4">
                                   <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center font-black text-emerald-600 group-hover:scale-110 transition-transform">
                                          <Car size={20} />
                                   </div>
                                   <div>
                                          <div className="text-sm font-black text-slate-900 leading-none mb-1">{v.companyName || v.name}</div>
                                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {v.id.slice(0, 8)}</div>
                                   </div>
                            </div>
                     )
              },
              {
                     header: 'Audit Status',
                     accessor: 'isVerified',
                     render: (v: any) => (
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${
                                   v.isVerified ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'
                            }`}>
                                   {v.isVerified ? 'Verified' : 'Pending Audit'}
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
                            {/* Add Vehicle Modal */}
                            {isAddVehicleModalOpen && (
                                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-scaleUp">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Register Vehicle</h3>
                                            <button onClick={() => setIsAddVehicleModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={24} /></button>
                                        </div>
                                        <form className="space-y-6" onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            addVehicleMutation.mutate({
                                                make: formData.get('make'),
                                                model: formData.get('model'),
                                                registrationNumber: formData.get('reg'),
                                                category: formData.get('category'),
                                            });
                                        }}>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Make</label>
                                                    <input name="make" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900" placeholder="Toyota" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model</label>
                                                    <input name="model" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900" placeholder="Innova" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registration</label>
                                                <input name="reg" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900" placeholder="DL 1C A 1234" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                                <select name="category" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900">
                                                    <option value="SEDAN">Sedan</option>
                                                    <option value="SUV">SUV</option>
                                                    <option value="LUXURY">Luxury</option>
                                                </select>
                                            </div>
                                            <button type="submit" disabled={addVehicleMutation.isPending} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2">
                                                {addVehicleMutation.isPending ? 'Processing...' : 'Add Vehicle'}
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
                                    {(['PROFILE', 'VEHICLES', 'BOOKINGS', 'OFFERS'] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
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
                                                        <div className="w-24 h-24 rounded-3xl bg-emerald-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-600/20">
                                                               <Car size={48} />
                                                        </div>
                                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{selectedVendor.companyName || selectedVendor.name}</h2>
                                                        <button className="w-full py-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                                            <Edit size={16} /> Edit Profile
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="xl:col-span-2">
                                          {activeTab === 'VEHICLES' && (
                                              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl space-y-10">
                                                  <div className="flex items-center justify-between">
                                                      <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                                          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Car size={24} /></div>
                                                          Posted Fleet Data
                                                      </h3>
                                                      <button 
                                                            onClick={() => setIsAddVehicleModalOpen(true)}
                                                            className="px-6 py-3 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"
                                                      >
                                                          <Plus size={16} /> Add Vehicle
                                                      </button>
                                                  </div>
                                                  <div className="space-y-4">
                                                      {selectedVendor.vehicles?.map((vehicle: any, i: number) => (
                                                          <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                                              <div className="flex items-center gap-6">
                                                                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm relative">
                                                                      <Car size={32} />
                                                                      <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded-full uppercase tracking-tighter">Live</div>
                                                                  </div>
                                                                  <div>
                                                                      <div className="text-lg font-black text-slate-900">{vehicle.make} {vehicle.model}</div>
                                                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{vehicle.registrationNumber} • {vehicle.category}</div>
                                                                  </div>
                                                              </div>
                                                              <div className="flex items-center gap-2">
                                                                  <button className="p-2.5 bg-white text-slate-400 hover:text-emerald-600 hover:shadow-md rounded-xl transition-all">
                                                                      <Edit size={16} />
                                                                  </button>
                                                                  <button 
                                                                        onClick={() => {
                                                                            if(confirm('Delete vehicle?')) deleteVehicleMutation.mutate(vehicle.id);
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
                                                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Clock size={24} /></div>
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
                                                                      <div className="text-sm font-black group-hover:text-white transition-colors">ID: {booking.bookingId}</div>
                                                                      <div className="text-[10px] font-bold text-slate-400 group-hover:text-white/40 uppercase tracking-widest mt-1">Vehicle: {booking.vehicle?.registrationNumber || 'N/A'}</div>
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
                            title="Cab Vendors"
                            description="Manage and verify individual cab service providers"
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
