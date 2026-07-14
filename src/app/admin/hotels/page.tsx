'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
    CheckCircle2, Ban, Mail, Phone, MapPin, Eye, Check, 
    ArrowLeft, Building2, User, Home, Shield, Zap, X, Star,
    Clock, CreditCard, Edit, List, Gift, Tag, Trash2, Plus
} from 'lucide-react';
import { useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import PromotionManager from '@/components/admin/PromotionManager';
import { toast } from 'react-hot-toast';

export default function AdminHotelsPage() {
       const queryClient = useQueryClient();
       const [filter, setFilter] = useState('');
       const [statusFilter, setStatusFilter] = useState('All');
       const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
       const [activeTab, setActiveTab] = useState<'PROFILE' | 'INVENTORY' | 'BOOKINGS' | 'OFFERS'>('PROFILE');
       const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
       const [isEditHotelModalOpen, setIsEditHotelModalOpen] = useState(false);
       const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
       const [selectedRoom, setSelectedRoom] = useState<any>(null);

       const { data: hotels = [], isLoading } = useQuery({
              queryKey: ['admin-hotels', statusFilter],
              queryFn: async () => {
                     const status = statusFilter.toUpperCase();
                     const url = status === 'ALL' ? '/admin/hotels' : `/admin/hotels?status=${status}`;
                     const res = await api.get(url);
                     return res.data;
              }
       });

       const { data: selectedHotel, isLoading: isHotelLoading } = useQuery({
              queryKey: ['admin-hotel-detail', selectedHotelId],
              queryFn: async () => {
                     if (!selectedHotelId) return null;
                     const res = await api.get(`/admin/hotels/${selectedHotelId}`);
                     return res.data;
              },
              enabled: !!selectedHotelId
       });

       const deleteRoomMutation = useMutation({
              mutationFn: async (roomId: string) => {
                     await api.delete(`/admin/hotels/rooms/${roomId}`);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-hotel-detail', selectedHotelId] });
                     toast.success('Room category deleted successfully');
              }
       });

       const addRoomMutation = useMutation({
              mutationFn: async (roomData: any) => {
                     await api.post(`/admin/hotels/${selectedHotelId}/rooms`, roomData);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-hotel-detail', selectedHotelId] });
                     setIsAddRoomModalOpen(false);
                     toast.success('Room category added successfully');
              }
       });

       const updateStatusMutation = useMutation({
              mutationFn: async (status: string) => {
                     await api.patch(`/admin/hotels/${selectedHotelId}/status`, { status });
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-hotel-detail', selectedHotelId] });
                     queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
                     toast.success('Property status updated');
              }
       });

       const updateHotelMutation = useMutation({
              mutationFn: async ({ id, data }: { id: string, data: any }) => {
                     await api.patch(`/admin/hotels/${id}`, data);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-hotel-detail'] });
                     queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
                     setIsEditHotelModalOpen(false);
                     toast.success('Hotel details updated successfully');
              }
       });

       const updateRoomMutation = useMutation({
              mutationFn: async ({ roomId, data }: { roomId: string, data: any }) => {
                     await api.patch(`/admin/hotels/rooms/${roomId}`, data);
              },
              onSuccess: () => {
                     queryClient.invalidateQueries({ queryKey: ['admin-hotel-detail', selectedHotelId] });
                     setIsEditRoomModalOpen(false);
                     toast.success('Room updated successfully');
              }
       });

       const filteredHotels = hotels.filter((h: any) =>
              h.name.toLowerCase().includes(filter.toLowerCase()) ||
              h.email.toLowerCase().includes(filter.toLowerCase())
       );

       const columns = [
              {
                     header: 'Property Details',
                     accessor: 'name',
                     render: (hotel: any) => (
                            <div className="flex items-center gap-4">
                                   <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600 group-hover:scale-110 transition-transform">
                                          {hotel.name.charAt(0)}
                                   </div>
                                   <div>
                                          <div className="text-sm font-black text-foreground leading-none mb-1">{hotel.name}</div>
                                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {hotel.id.slice(0, 8)}</div>
                                   </div>
                            </div>
                     )
              },
              {
                     header: 'Ranking & Visibility',
                     accessor: 'rank',
                     render: (hotel: any) => (
                            <div className="flex items-center gap-3">
                                   <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                                          <span className="text-[10px] font-bold text-slate-400">RANK</span>
                                          <input 
                                                 type="number" 
                                                 defaultValue={hotel.rank || 0}
                                                 className="w-12 text-sm font-black bg-transparent border-none focus:outline-none text-center"
                                                 onBlur={(e) => {
                                                        const newRank = parseInt(e.target.value) || 0;
                                                        if (newRank !== (hotel.rank || 0)) {
                                                               updateHotelMutation.mutate({ id: hotel.id, data: { rank: newRank } });
                                                        }
                                                 }}
                                          />
                                   </div>
                                   <label className="flex items-center gap-1.5 cursor-pointer">
                                          <input 
                                                 type="checkbox" 
                                                 defaultChecked={hotel.isFeatured}
                                                 onChange={(e) => {
                                                        updateHotelMutation.mutate({ id: hotel.id, data: { isFeatured: e.target.checked } });
                                                 }}
                                                 className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                          />
                                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Featured</span>
                                   </label>
                            </div>
                     )
              },
              {
                     header: 'Audit Status',
                     accessor: 'status',
                     render: (hotel: any) => (
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${
                                   hotel.status === 'APPROVED' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                                   hotel.status === 'PENDING' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                                   'text-slate-400 bg-slate-50 border-slate-100'
                            }`}>
                                   {hotel.status}
                            </span>
                     )
              }
       ];

       const actions = (hotel: any) => (
              <div className="flex items-center gap-2">
                     <button
                            onClick={() => setSelectedHotelId(hotel.id)}
                            className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                     >
                            <Eye size={18} />
                     </button>
              </div>
       );

       if (selectedHotelId && selectedHotel) {
              return (
                     <div className="p-8 animate-fadeIn">
                            {/* Add Room Modal */}
                            {isAddRoomModalOpen && (
                                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                    <div className="ios-sheet rounded-[28px] w-full max-w-lg p-10 shadow-2xl animate-scaleUp">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black text-foreground tracking-tight">Add New Room</h3>
                                            <button onClick={() => setIsAddRoomModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={24} /></button>
                                        </div>
                                        <form className="space-y-6" onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            addRoomMutation.mutate({
                                                name: formData.get('name'),
                                                price: Number(formData.get('price')),
                                                capacity: Number(formData.get('capacity')),
                                            });
                                        }}>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Category Name</label>
                                                <input name="name" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="e.g. Executive Club Room" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price / Night</label>
                                                    <input name="price" type="number" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="5000" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Guests</label>
                                                    <input name="capacity" type="number" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="2" />
                                                </div>
                                            </div>
                                            <button type="submit" disabled={addRoomMutation.isPending} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                                                {addRoomMutation.isPending ? 'Creating...' : 'Create Room Category'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Edit Hotel Modal */}
                            {isEditHotelModalOpen && (
                                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                    <div className="ios-sheet rounded-[28px] w-full max-w-lg p-10 shadow-2xl animate-scaleUp">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black text-foreground tracking-tight">Edit Hotel Details</h3>
                                            <button onClick={() => setIsEditHotelModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={24} /></button>
                                        </div>
                                        <form className="space-y-6" onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            updateHotelMutation.mutate({
                                                id: selectedHotelId!,
                                                data: {
                                                    name: formData.get('name'),
                                                    sortOrder: Number(formData.get('sortOrder')),
                                                }
                                            });
                                        }}>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hotel Name</label>
                                                <input name="name" defaultValue={selectedHotel.name} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sort Order (Higher = Top Show)</label>
                                                <input name="sortOrder" type="number" defaultValue={selectedHotel.sortOrder || 0} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                            </div>
                                            <button type="submit" disabled={updateHotelMutation.isPending} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                                                {updateHotelMutation.isPending ? 'Saving...' : 'Save Details'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Edit Room Modal */}
                            {isEditRoomModalOpen && selectedRoom && (
                                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                    <div className="ios-sheet rounded-[28px] w-full max-w-lg p-10 shadow-2xl animate-scaleUp">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black text-foreground tracking-tight">Edit Room Category</h3>
                                            <button onClick={() => setIsEditRoomModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={24} /></button>
                                        </div>
                                        <form className="space-y-6" onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            updateRoomMutation.mutate({
                                                roomId: selectedRoom.id,
                                                data: {
                                                    name: formData.get('name'),
                                                    price: Number(formData.get('price')),
                                                    capacity: Number(formData.get('capacity')),
                                                }
                                            });
                                        }}>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Category Name</label>
                                                <input name="name" defaultValue={selectedRoom.name} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price / Night</label>
                                                    <input name="price" type="number" defaultValue={selectedRoom.price} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Guests</label>
                                                    <input name="capacity" type="number" defaultValue={selectedRoom.capacity} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                                </div>
                                            </div>
                                            <button type="submit" disabled={updateRoomMutation.isPending} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                                                {updateRoomMutation.isPending ? 'Saving...' : 'Save Room Category'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-8 px-2">
                                <button 
                                       onClick={() => setSelectedHotelId(null)}
                                       className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 font-bold text-xs uppercase tracking-widest transition-colors group"
                                >
                                       <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                              <ArrowLeft size={16} />
                                       </div>
                                       Back to Properties
                                </button>

                                <div className="flex bg-black/[0.02] dark:bg-white/[0.02] p-1.5 rounded-2xl shadow-inner border border-border/10">
                                    {(['PROFILE', 'INVENTORY', 'BOOKINGS', 'OFFERS'] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}
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
                                                        <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-600/20 text-3xl font-black">
                                                               {selectedHotel.name.charAt(0)}
                                                        </div>
                                                        <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">{selectedHotel.name}</h2>
                                                        <div className="flex items-center gap-1 text-amber-400 mb-6">
                                                               {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                                                        </div>
                                                        
                                                        <div className="w-full space-y-3">
                                                            {selectedHotel.status === 'PENDING' ? (
                                                                <button 
                                                                    onClick={() => updateStatusMutation.mutate('APPROVED')}
                                                                    className="w-full py-4 bg-emerald-600 text-white hover:bg-emerald-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                                                                >
                                                                    <CheckCircle2 size={16} /> Approve Property
                                                                </button>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => updateStatusMutation.mutate('PENDING')}
                                                                    className="w-full py-4 bg-amber-500 text-white hover:bg-amber-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                                                                >
                                                                    <Ban size={16} /> Suspend Property
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => setIsEditHotelModalOpen(true)}
                                                                className="w-full py-4 bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-300 hover:bg-foreground hover:text-background rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Edit size={16} /> Edit Details
                                                            </button>
                                                        </div>
                                                 </div>
                                          </div>

                                          <div className="ios-sheet rounded-[28px] p-8 border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                    <Shield size={14} className="text-blue-600" /> Platform Audit
                                                </h4>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified Status</span>
                                                        {selectedHotel.isVerified ? <CheckCircle2 className="text-emerald-500" size={18} /> : <Clock className="text-amber-500" size={18} />}
                                                    </div>
                                                    <div className="flex justify-between items-center p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Commission Rate</span>
                                                        <span className="text-xs font-black text-blue-600">Global (10%)</span>
                                                    </div>
                                                </div>
                                          </div>
                                   </div>

                                   <div className="xl:col-span-2 space-y-6">
                                          {activeTab === 'PROFILE' && (
                                              <div className="space-y-6">
                                                  <div className="ios-sheet rounded-[28px] p-8 border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
                                                      <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3 mb-6">
                                                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Building2 size={24} /></div>
                                                          Property Details
                                                      </h3>
                                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                          <div className="space-y-1">
                                                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</div>
                                                              <div className="text-sm font-bold text-foreground">{selectedHotel.description || 'N/A'}</div>
                                                          </div>
                                                          <div className="space-y-1">
                                                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</div>
                                                              <div className="text-sm font-bold text-foreground">{selectedHotel.address || 'N/A'}</div>
                                                          </div>
                                                          <div className="space-y-1">
                                                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City & Pincode</div>
                                                              <div className="text-sm font-bold text-foreground">{selectedHotel.city || 'N/A'}, {selectedHotel.pinCode || ''}</div>
                                                          </div>
                                                          <div className="space-y-1">
                                                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Email</div>
                                                              <div className="text-sm font-bold text-foreground">{selectedHotel.email || 'N/A'}</div>
                                                          </div>
                                                          <div className="space-y-1">
                                                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</div>
                                                              <div className="text-sm font-bold text-foreground">{selectedHotel.contactNumber || 'N/A'}</div>
                                                          </div>
                                                          <div className="space-y-1">
                                                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST Number</div>
                                                              <div className="text-sm font-bold text-foreground">{selectedHotel.gstNumber || 'N/A'}</div>
                                                          </div>
                                                      </div>
                                                  </div>

                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                      <div className="ios-sheet rounded-[28px] p-8 border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
                                                          <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3 mb-6">
                                                              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><User size={24} /></div>
                                                              Owner Details
                                                          </h3>
                                                          <div className="space-y-4">
                                                              <div className="space-y-1">
                                                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</div>
                                                                  <div className="text-sm font-bold text-foreground">{selectedHotel.ownerFirstName} {selectedHotel.ownerLastName}</div>
                                                              </div>
                                                          </div>
                                                      </div>
                                                      <div className="ios-sheet rounded-[28px] p-8 border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
                                                          <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3 mb-6">
                                                              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><CreditCard size={24} /></div>
                                                              Bank Information
                                                          </h3>
                                                          <div className="space-y-4">
                                                              <div className="space-y-1">
                                                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Name</div>
                                                                  <div className="text-sm font-bold text-foreground">{selectedHotel.bankHolder || 'N/A'}</div>
                                                              </div>
                                                              <div className="space-y-1">
                                                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Name</div>
                                                                  <div className="text-sm font-bold text-foreground">{selectedHotel.bankName || 'N/A'}</div>
                                                              </div>
                                                              <div className="space-y-1">
                                                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Number</div>
                                                                  <div className="text-sm font-bold text-foreground">{selectedHotel.bankAccount || 'N/A'}</div>
                                                              </div>
                                                              <div className="space-y-1">
                                                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IFSC Code</div>
                                                                  <div className="text-sm font-bold text-foreground">{selectedHotel.bankIfsc || 'N/A'}</div>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          )}

                                          {activeTab === 'INVENTORY' && (
                                              <div className="ios-sheet rounded-[28px] p-10 border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)] space-y-10">
                                                  <div className="flex items-center justify-between">
                                                      <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
                                                          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Home size={24} /></div>
                                                          Room Inventory
                                                      </h3>
                                                      <button 
                                                            onClick={() => setIsAddRoomModalOpen(true)}
                                                            className="px-6 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"
                                                      >
                                                          <Plus size={16} /> Add New Room
                                                      </button>
                                                  </div>
                                                  <div className="space-y-4">
                                                      {selectedHotel.roomTypes?.map((room: any, i: number) => (
                                                          <div key={i} className="p-6 bg-black/5 dark:bg-white/5 rounded-3xl border border-transparent flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                                              <div className="flex items-center gap-6">
                                                                  <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm relative">
                                                                      <Home size={32} />
                                                                      <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded-full uppercase tracking-tighter">Live</div>
                                                                  </div>
                                                                  <div>
                                                                      <div className="text-lg font-black text-foreground">{room.name}</div>
                                                                      <div className="flex items-center gap-4 mt-1">
                                                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{room.capacity} GUESTS</span>
                                                                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg">₹{room.price}/Night</span>
                                                                      </div>
                                                                  </div>
                                                              </div>
                                                              <div className="flex items-center gap-2">
                                                                  <button 
                                                                      onClick={() => {
                                                                          setSelectedRoom(room);
                                                                          setIsEditRoomModalOpen(true);
                                                                      }}
                                                                      className="p-3 bg-white dark:bg-white/10 text-slate-400 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md rounded-xl transition-all"
                                                                  >
                                                                      <Edit size={18} />
                                                                  </button>
                                                                  <button 
                                                                        onClick={() => {
                                                                            if(confirm('Are you sure?')) deleteRoomMutation.mutate(room.id);
                                                                        }}
                                                                        className="p-3 bg-white dark:bg-white/10 text-slate-400 dark:text-slate-300 hover:text-red-500 hover:shadow-md rounded-xl transition-all"
                                                                  >
                                                                      <Trash2 size={18} />
                                                                  </button>
                                                              </div>
                                                          </div>
                                                      ))}
                                                  </div>
                                              </div>
                                          )}

                                          {activeTab === 'BOOKINGS' && (
                                              <div className="ios-sheet rounded-[28px] p-10 border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)] space-y-10">
                                                  <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
                                                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Clock size={24} /></div>
                                                      Full Booking History
                                                  </h3>
                                                  <div className="space-y-4">
                                                      {selectedHotel.bookings?.map((booking: any, i: number) => (
                                                          <div key={i} className="p-6 bg-black/5 dark:bg-white/5 rounded-3xl border border-transparent flex items-center justify-between group hover:bg-slate-900 dark:hover:bg-slate-800 transition-all duration-500">
                                                              <div className="flex items-center gap-6">
                                                                  <div className="w-14 h-14 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center text-foreground group-hover:scale-110 transition-transform">
                                                                      <CreditCard size={24} />
                                                                  </div>
                                                                  <div>
                                                                      <div className="text-sm font-black text-foreground group-hover:text-white transition-colors">{booking.guestName}</div>
                                                                      <div className="text-[10px] font-bold text-slate-400 group-hover:text-white/60 uppercase tracking-widest mt-1">Ref: {booking.bookingReference}</div>
                                                                  </div>
                                                              </div>
                                                              <div className="text-right">
                                                                  <div className="text-sm font-black text-foreground group-hover:text-white transition-colors">₹{Number(booking.totalAmount).toLocaleString()}</div>
                                                                  <div className="text-[10px] font-bold text-slate-400 group-hover:text-white/60 uppercase tracking-widest mt-1">{new Date(booking.createdAt).toLocaleDateString()}</div>
                                                              </div>
                                                          </div>
                                                      ))}
                                                  </div>
                                              </div>
                                          )}

                                          {activeTab === 'OFFERS' && (
                                              <div className="ios-sheet rounded-[28px] p-10 border border-border/10 shadow-[0_12px_40px_rgba(0,0,0,0.02)] space-y-10">
                                                  <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
                                                      <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Gift size={24} /></div>
                                                      Vendor Promotions
                                                  </h3>
                                                  <PromotionManager promotions={selectedHotel.offers} vendorId={selectedHotelId} />
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
                            title="Hotel Partners"
                            description="Review and manage onboarded hospitality properties"
                            columns={columns}
                            data={filteredHotels}
                            isLoading={isLoading}
                            onSearch={setFilter}
                            onFilter={setStatusFilter}
                            actions={actions}
                     />
              </div>
       );
}
