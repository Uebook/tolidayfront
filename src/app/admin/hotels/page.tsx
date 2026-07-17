'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
    CheckCircle2, Ban, Eye, Check, 
    ArrowLeft, Building2, User, Home, Zap, X, Star,
    Clock, CreditCard, Edit, Gift, Trash2, Plus,
    ImageIcon, Settings, MessageSquare,
    AlertTriangle, Download
} from 'lucide-react';
import { useState } from 'react';
import DataTable from '@/components/admin/DataTable';
import PromotionManager from '@/components/admin/PromotionManager';
import { toast } from 'react-hot-toast';

const AMENITY_OPTIONS = [
  'Free WiFi', 'Air Conditioning', 'Gym', 'Swimming Pool', 'Restaurant',
  'Room Service', 'Parking', 'TV', 'Bathtub', 'Garden',
  'Business Center', 'Spa', 'Laundry', 'Concierge', 'Bar', 'Airport Shuttle',
];

type ActiveTab = 'PROFILE' | 'INVENTORY' | 'BOOKINGS' | 'OFFERS' | 'AMENITIES' | 'IMAGES' | 'POLICIES' | 'REVIEWS';

export default function AdminHotelsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('PROFILE');
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isEditHotelModalOpen, setIsEditHotelModalOpen] = useState(false);
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
  const [isAddHotelModalOpen, setIsAddHotelModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [amenityDraft, setAmenityDraft] = useState<string[] | null>(null);

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: async () => { const res = await api.get('/admin/hotels'); return res.data; }
  });

  const { data: selectedHotel } = useQuery({
    queryKey: ['admin-hotel-detail', selectedHotelId],
    queryFn: async () => {
      if (!selectedHotelId) return null;
      const res = await api.get(`/admin/hotels/${selectedHotelId}`);
      return res.data;
    },
    enabled: !!selectedHotelId
  });

  const { data: hotelReviews = [] } = useQuery({
    queryKey: ['admin-hotel-reviews', selectedHotelId],
    queryFn: async () => {
      if (!selectedHotelId) return [];
      const res = await api.get(`/admin/hotels/${selectedHotelId}/reviews`);
      return res.data;
    },
    enabled: !!selectedHotelId && activeTab === 'REVIEWS'
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: string) => { await api.delete(`/admin/hotels/rooms/${roomId}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hotel-detail', selectedHotelId] }); toast.success('Room deleted'); }
  });

  const addRoomMutation = useMutation({
    mutationFn: async (roomData: any) => { await api.post(`/admin/hotels/${selectedHotelId}/rooms`, roomData); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hotel-detail', selectedHotelId] }); setIsAddRoomModalOpen(false); toast.success('Room added'); }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => { await api.patch(`/admin/hotels/${selectedHotelId}/status`, { status }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hotel-detail', selectedHotelId] }); queryClient.invalidateQueries({ queryKey: ['admin-hotels'] }); toast.success('Status updated'); }
  });

  const updateHotelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { await api.patch(`/admin/hotels/${id}`, data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hotel-detail'] }); queryClient.invalidateQueries({ queryKey: ['admin-hotels'] }); setIsEditHotelModalOpen(false); toast.success('Hotel updated'); }
  });

  const updateRoomMutation = useMutation({
    mutationFn: async ({ roomId, data }: { roomId: string; data: any }) => { await api.patch(`/admin/hotels/rooms/${roomId}`, data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hotel-detail', selectedHotelId] }); setIsEditRoomModalOpen(false); toast.success('Room updated'); }
  });

  const createHotelMutation = useMutation({
    mutationFn: async (data: any) => { const res = await api.post('/admin/hotels', data); return res.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hotels'] }); setIsAddHotelModalOpen(false); toast.success('Hotel created'); },
    onError: (err: any) => { toast.error(err?.response?.data?.message || 'Failed to create hotel'); }
  });

  const deleteHotelMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/admin/hotels/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hotels'] }); setDeleteConfirmId(null); if (selectedHotelId) setSelectedHotelId(null); toast.success('Hotel deleted'); },
    onError: (err: any) => { toast.error(err?.response?.data?.message || 'Failed to delete'); }
  });

  const updateAmenitiesMutation = useMutation({
    mutationFn: async (amenities: string[]) => { await api.patch(`/admin/hotels/${selectedHotelId}`, { amenities }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hotel-detail', selectedHotelId] }); setAmenityDraft(null); toast.success('Amenities updated'); }
  });

  const updatePoliciesMutation = useMutation({
    mutationFn: async (data: any) => { await api.patch(`/admin/hotels/${selectedHotelId}`, data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hotel-detail', selectedHotelId] }); toast.success('Policies saved'); }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => { await api.delete(`/reviews/admin/${reviewId}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hotel-reviews', selectedHotelId] }); toast.success('Review deleted'); }
  });

  const toggleReviewMutation = useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: string; status: string }) => { await api.patch(`/reviews/admin/${reviewId}/status`, { status }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-hotel-reviews', selectedHotelId] }); toast.success('Review visibility updated'); }
  });

  const filteredHotels = hotels.filter((h: any) => {
    const matchesSearch = h.name.toLowerCase().includes(filter.toLowerCase()) || h.email.toLowerCase().includes(filter.toLowerCase());
    const matchesLocation = !locationFilter || (h.city || h.address || '').toLowerCase().includes(locationFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (h.status || '').toUpperCase() === statusFilter.toUpperCase();
    const matchesFeatured = featuredFilter === 'ALL' || (featuredFilter === 'FEATURED' && h.isFeatured) || (featuredFilter === 'REGULAR' && !h.isFeatured);
    
    let matchesDates = true;
    if (dateFrom) matchesDates = matchesDates && new Date(h.createdAt || Date.now()) >= new Date(dateFrom);
    if (dateTo) matchesDates = matchesDates && new Date(h.createdAt || Date.now()) <= new Date(dateTo);

    return matchesSearch && matchesLocation && matchesStatus && matchesFeatured && matchesDates;
  });

  const exportToCSV = () => {
    if (!filteredHotels.length) {
      toast.error('No hotels to export');
      return;
    }
    const headers = ['ID', 'Hotel Name', 'Email', 'Contact Number', 'City', 'Status', 'Featured', 'Created At'];
    const rows = filteredHotels.map((h: any) => [
      h.id, h.name, h.email, h.contactNumber || '', h.city || '', h.status, h.isFeatured ? 'Yes' : 'No', h.createdAt ? new Date(h.createdAt).toLocaleDateString() : ''
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hotels_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredHotels.length} hotels`);
  };

  const columns = [
    {
      header: 'Property Details',
      accessor: 'name',
      render: (hotel: any) => (
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600 group-hover:scale-110 transition-transform">{hotel.name.charAt(0)}</div>
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
            <input type="number" defaultValue={hotel.rank || 0} className="w-12 text-sm font-black text-slate-900 bg-transparent border-none focus:outline-none text-center"
              onBlur={(e) => { const newRank = parseInt(e.target.value) || 0; if (newRank !== (hotel.rank || 0)) { updateHotelMutation.mutate({ id: hotel.id, data: { rank: newRank } }); } }} />
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" defaultChecked={hotel.isFeatured} onChange={(e) => { updateHotelMutation.mutate({ id: hotel.id, data: { isFeatured: e.target.checked } }); }} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Featured</span>
          </label>
        </div>
      )
    },
    {
      header: 'Audit Status',
      accessor: 'status',
      render: (hotel: any) => (
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${hotel.status === 'APPROVED' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : hotel.status === 'PENDING' ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>{hotel.status}</span>
      )
    }
  ];

  const actions = (hotel: any) => (
    <div className="flex items-center gap-2">
      <button onClick={() => { setSelectedHotelId(hotel.id); setActiveTab('PROFILE'); }} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all" title="View Details"><Eye size={18} /></button>
      <button onClick={() => setDeleteConfirmId(hotel.id)} className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all" title="Delete Hotel"><Trash2 size={18} /></button>
    </div>
  );

  const ALL_TABS: ActiveTab[] = ['PROFILE', 'INVENTORY', 'BOOKINGS', 'OFFERS', 'AMENITIES', 'IMAGES', 'POLICIES', 'REVIEWS'];

  // ========= HOTEL DETAIL VIEW =========
  if (selectedHotelId && selectedHotel) {
    const currentAmenities: string[] = amenityDraft ?? (selectedHotel.amenities || []);

    return (
      <div className="p-8 animate-fadeIn">

        {/* ---- MODALS ---- */}
        {isAddRoomModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="ios-sheet rounded-[28px] w-full max-w-lg p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-8"><h3 className="text-2xl font-black text-foreground">Add New Room</h3><button onClick={() => setIsAddRoomModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={24} /></button></div>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); addRoomMutation.mutate({ name: fd.get('name'), price: Number(fd.get('price')), capacity: Number(fd.get('capacity')) }); }}>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Category Name</label><input name="name" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Executive Suite" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price / Night</label><input name="price" type="number" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="5000" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Guests</label><input name="capacity" type="number" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="2" /></div>
                </div>
                <button type="submit" disabled={addRoomMutation.isPending} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all">{addRoomMutation.isPending ? 'Creating...' : 'Create Room'}</button>
              </form>
            </div>
          </div>
        )}

        {isEditHotelModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="ios-sheet rounded-[28px] w-full max-w-lg p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-8"><h3 className="text-2xl font-black text-foreground">Edit Hotel Details</h3><button onClick={() => setIsEditHotelModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={24} /></button></div>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); updateHotelMutation.mutate({ id: selectedHotelId!, data: { name: fd.get('name'), sortOrder: Number(fd.get('sortOrder')) } }); }}>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hotel Name</label><input name="name" defaultValue={selectedHotel.name} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sort Order</label><input name="sortOrder" type="number" defaultValue={selectedHotel.sortOrder || 0} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                <button type="submit" disabled={updateHotelMutation.isPending} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all">{updateHotelMutation.isPending ? 'Saving...' : 'Save Details'}</button>
              </form>
            </div>
          </div>
        )}

        {isEditRoomModalOpen && selectedRoom && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="ios-sheet rounded-[28px] w-full max-w-lg p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-8"><h3 className="text-2xl font-black text-foreground">Edit Room</h3><button onClick={() => setIsEditRoomModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={24} /></button></div>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); updateRoomMutation.mutate({ roomId: selectedRoom.id, data: { name: fd.get('name'), price: Number(fd.get('price')), capacity: Number(fd.get('capacity')) } }); }}>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Name</label><input name="name" defaultValue={selectedRoom.name} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price / Night</label><input name="price" type="number" defaultValue={selectedRoom.price} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Guests</label><input name="capacity" type="number" defaultValue={selectedRoom.capacity} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                </div>
                <button type="submit" disabled={updateRoomMutation.isPending} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all">{updateRoomMutation.isPending ? 'Saving...' : 'Save Room'}</button>
              </form>
            </div>
          </div>
        )}

        {/* ---- HEADER ---- */}
        <div className="card p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">{selectedHotel.name.charAt(0)}</div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black text-foreground">{selectedHotel.name}</h2>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${selectedHotel.status === 'APPROVED' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : selectedHotel.status === 'PENDING' ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>{selectedHotel.status}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 mb-1">{[1,2,3,4,5].map(i => <Star key={i} size={13} fill="currentColor" />)}</div>
                <p className="text-xs text-slate-400">Commission: <span className="font-black text-blue-600">10%</span> | Verified: {selectedHotel.isVerified ? '✅' : '⏳'}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {selectedHotel.status === 'PENDING' ? (
                <button onClick={() => updateStatusMutation.mutate('APPROVED')} className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-500 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"><CheckCircle2 size={16} /> Approve</button>
              ) : (
                <button onClick={() => updateStatusMutation.mutate('PENDING')} className="px-6 py-3 bg-amber-500 text-white hover:bg-amber-400 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"><Ban size={16} /> Suspend</button>
              )}
              <button onClick={() => setIsEditHotelModalOpen(true)} className="px-6 py-3 bg-black/5 dark:bg-white/5 text-slate-500 hover:bg-foreground hover:text-background rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"><Edit size={16} /> Edit</button>
              <button onClick={() => setDeleteConfirmId(selectedHotelId)} className="px-6 py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"><Trash2 size={16} /> Delete</button>
            </div>
          </div>
        </div>

        {/* ---- TAB BAR ---- */}
        <div className="flex flex-col gap-4 mb-8 px-2">
          <button onClick={() => setSelectedHotelId(null)} className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 font-bold text-xs uppercase tracking-widest transition-colors group w-fit">
            <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"><ArrowLeft size={16} /></div>
            Back to Properties
          </button>
          <div className="flex flex-wrap gap-1.5 bg-black/[0.02] dark:bg-white/[0.02] p-1.5 rounded-2xl shadow-inner border border-border/10 w-fit">
            {ALL_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}>{tab}</button>
            ))}
          </div>
        </div>

        {/* ---- TAB CONTENT ---- */}
        <div className="space-y-6">

          {/* PROFILE */}
          {activeTab === 'PROFILE' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="card p-8 xl:col-span-2">
                <h3 className="text-xl font-black text-foreground flex items-center gap-3 mb-6"><div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Building2 size={24} /></div>Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Description', value: selectedHotel.description },
                    { label: 'Address', value: selectedHotel.address },
                    { label: 'City & Pincode', value: `${selectedHotel.city || 'N/A'}, ${selectedHotel.pinCode || ''}` },
                    { label: 'Contact Email', value: selectedHotel.email },
                    { label: 'Contact Number', value: selectedHotel.contactNumber },
                    { label: 'GST Number', value: selectedHotel.gstNumber },
                    { label: 'Stars', value: `${selectedHotel.stars || 3} Stars` },
                    { label: 'Website', value: selectedHotel.website },
                  ].map(f => (
                    <div key={f.label} className="space-y-1">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</div>
                      <div className="text-sm font-bold text-foreground">{f.value || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="card p-8">
                  <h3 className="text-xl font-black text-foreground flex items-center gap-3 mb-6"><div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><User size={24} /></div>Owner Details</h3>
                  {[{ label: 'Full Name', value: `${selectedHotel.ownerFirstName || ''} ${selectedHotel.ownerLastName || ''}`.trim() }, { label: 'Phone', value: selectedHotel.ownerPhone }, { label: 'Business Name', value: selectedHotel.businessName }, { label: 'Business Type', value: selectedHotel.businessType }].map(f => (
                    <div key={f.label} className="space-y-1 mb-4"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</div><div className="text-sm font-bold text-foreground">{f.value || 'N/A'}</div></div>
                  ))}
                </div>
                <div className="card p-8">
                  <h3 className="text-xl font-black text-foreground flex items-center gap-3 mb-6"><div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><CreditCard size={24} /></div>Bank Information</h3>
                  {[{ label: 'Account Name', value: selectedHotel.bankHolder }, { label: 'Bank Name', value: selectedHotel.bankName }, { label: 'Account Number', value: selectedHotel.bankAccount }, { label: 'IFSC Code', value: selectedHotel.bankIfsc }].map(f => (
                    <div key={f.label} className="space-y-1 mb-4"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</div><div className="text-sm font-bold text-foreground">{f.value || 'N/A'}</div></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* INVENTORY */}
          {activeTab === 'INVENTORY' && (
            <div className="ios-sheet rounded-[28px] p-10 border border-border/10 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-foreground flex items-center gap-3"><div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Home size={24} /></div>Room Inventory</h3>
                <button onClick={() => setIsAddRoomModalOpen(true)} className="px-6 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all flex items-center gap-2"><Plus size={16} /> Add Room</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(selectedHotel.roomTypes || []).map((room: any, i: number) => (
                  <div key={i} className="card p-5 flex flex-col justify-between gap-4 hover:border-blue-500/30 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 relative"><Home size={22} /><div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-emerald-500 text-white text-[7px] font-black rounded-full">LIVE</div></div>
                        <div><div className="text-sm font-black text-foreground">{room.name}</div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{room.capacity} GUESTS</div></div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedRoom(room); setIsEditRoomModalOpen(true); }} className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={14} /></button>
                        <button onClick={() => { if (confirm('Delete this room?')) deleteRoomMutation.mutate(room.id); }} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border/5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price / Night</span>
                      <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">₹{room.price}/Night</span>
                    </div>
                  </div>
                ))}
                {(!selectedHotel.roomTypes || selectedHotel.roomTypes.length === 0) && (
                  <div className="col-span-3 text-center py-16 text-slate-400"><Home size={48} className="mx-auto mb-4 opacity-30" /><p className="font-bold">No room types added yet</p></div>
                )}
              </div>
            </div>
          )}

          {/* BOOKINGS */}
          {activeTab === 'BOOKINGS' && (
            <div className="ios-sheet rounded-[28px] p-10 border border-border/10 space-y-8">
              <h3 className="text-xl font-black text-foreground flex items-center gap-3"><div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Clock size={24} /></div>Booking History</h3>
              {(selectedHotel.bookings || []).length > 0 ? (
                <div className="space-y-4">
                  {selectedHotel.bookings.map((booking: any, i: number) => (
                    <div key={i} className="p-6 bg-black/5 dark:bg-white/5 rounded-3xl flex items-center justify-between group hover:bg-slate-900 dark:hover:bg-slate-800 transition-all duration-300">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center text-foreground group-hover:scale-110 transition-transform"><CreditCard size={24} /></div>
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
              ) : (
                <div className="text-center py-16 text-slate-400"><CreditCard size={48} className="mx-auto mb-4 opacity-30" /><p className="font-bold">No bookings yet</p></div>
              )}
            </div>
          )}

          {/* OFFERS */}
          {activeTab === 'OFFERS' && (
            <div className="ios-sheet rounded-[28px] p-10 border border-border/10 space-y-8">
              <h3 className="text-xl font-black text-foreground flex items-center gap-3"><div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Gift size={24} /></div>Vendor Promotions</h3>
              <PromotionManager promotions={selectedHotel.offers} vendorId={selectedHotelId} />
            </div>
          )}

          {/* AMENITIES */}
          {activeTab === 'AMENITIES' && (
            <div className="ios-sheet rounded-[28px] p-10 border border-border/10 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-foreground flex items-center gap-3"><div className="p-3 bg-violet-50 text-violet-600 rounded-2xl"><Zap size={24} /></div>Hotel Amenities</h3>
                {amenityDraft !== null && (
                  <div className="flex gap-3">
                    <button onClick={() => setAmenityDraft(null)} className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                    <button onClick={() => updateAmenitiesMutation.mutate(currentAmenities)} disabled={updateAmenitiesMutation.isPending} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all flex items-center gap-2"><Check size={14} />{updateAmenitiesMutation.isPending ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-400">Click any amenity to toggle it. Save when done.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {AMENITY_OPTIONS.map((key) => {
                  const isActive = currentAmenities.includes(key);
                  return (
                    <button key={key} onClick={() => {
                      const base = amenityDraft ?? [...(selectedHotel.amenities || [])];
                      const updated = base.includes(key) ? base.filter((a: string) => a !== key) : [...base, key];
                      setAmenityDraft(updated);
                    }} className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 font-bold text-xs transition-all duration-200 ${isActive ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/25' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-400 hover:border-violet-300 hover:text-violet-500'}`}>
                      <Zap size={20} />
                      <span className="text-center leading-tight">{key}</span>
                    </button>
                  );
                })}
              </div>
              {currentAmenities.filter((a: string) => !AMENITY_OPTIONS.includes(a)).length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Custom Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {currentAmenities.filter((a: string) => !AMENITY_OPTIONS.includes(a)).map((a: string) => (
                      <span key={a} className="px-3 py-1.5 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* IMAGES */}
          {activeTab === 'IMAGES' && (
            <div className="ios-sheet rounded-[28px] p-10 border border-border/10 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-foreground flex items-center gap-3"><div className="p-3 bg-pink-50 text-pink-600 rounded-2xl"><ImageIcon size={24} /></div>Hotel Images</h3>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 py-1.5 bg-slate-100 dark:bg-white/10 rounded-lg">{selectedHotel.images?.length || 0} Photos</span>
              </div>
              {selectedHotel.images && selectedHotel.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedHotel.images.map((img: string, i: number) => (
                    <div key={i} className="relative group rounded-2xl overflow-hidden aspect-square bg-slate-100 dark:bg-white/5 border border-border/10">
                      <img src={img} alt={`Hotel image ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-3"><span className="text-white text-[10px] font-black uppercase tracking-widest">Photo {i + 1}</span></div>
                      <a href={img} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 p-2 bg-white/90 text-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white" title="Open full size"><Eye size={14} /></a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 text-slate-400"><ImageIcon size={56} className="mx-auto mb-4 opacity-20" /><p className="font-black text-lg mb-1">No Images Uploaded</p><p className="text-sm">The hotel partner has not uploaded any photos yet.</p></div>
              )}
            </div>
          )}

          {/* POLICIES */}
          {activeTab === 'POLICIES' && (
            <div className="ios-sheet rounded-[28px] p-10 border border-border/10 space-y-8">
              <h3 className="text-xl font-black text-foreground flex items-center gap-3"><div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Settings size={24} /></div>Hotel Policies</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const rulesRaw = (fd.get('propertyRules') as string || '').trim();
                updatePoliciesMutation.mutate({
                  checkInTime: fd.get('checkInTime'),
                  checkOutTime: fd.get('checkOutTime'),
                  maxAdults: Number(fd.get('maxAdults')),
                  maxChildren: Number(fd.get('maxChildren')),
                  cancellationPolicy: fd.get('cancellationPolicy'),
                  petPolicy: fd.get('petPolicy'),
                  childPolicy: fd.get('childPolicy'),
                  propertyRules: rulesRaw ? rulesRaw.split('\n').map((r: string) => r.trim()).filter(Boolean) : [],
                });
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-in Time</label><input name="checkInTime" type="time" defaultValue={selectedHotel.checkInTime || '14:00'} className="w-full px-6 py-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-out Time</label><input name="checkOutTime" type="time" defaultValue={selectedHotel.checkOutTime || '11:00'} className="w-full px-6 py-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Adults</label><input name="maxAdults" type="number" defaultValue={selectedHotel.maxAdults || 4} className="w-full px-6 py-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Children</label><input name="maxChildren" type="number" defaultValue={selectedHotel.maxChildren || 2} className="w-full px-6 py-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancellation Policy</label><textarea name="cancellationPolicy" defaultValue={selectedHotel.cancellationPolicy || ''} rows={4} placeholder="Describe cancellation terms..." className="w-full px-6 py-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pet Policy</label><textarea name="petPolicy" defaultValue={selectedHotel.petPolicy || ''} rows={4} placeholder="e.g. Pets not allowed..." className="w-full px-6 py-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Child Policy</label><textarea name="childPolicy" defaultValue={selectedHotel.childPolicy || ''} rows={4} placeholder="e.g. Children under 5 stay free..." className="w-full px-6 py-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Rules (one per line)</label><textarea name="propertyRules" defaultValue={(selectedHotel.propertyRules || []).join('\n')} rows={4} placeholder={"No smoking\nNo parties\nQuiet hours after 10pm"} className="w-full px-6 py-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none" /></div>
                </div>
                <button type="submit" disabled={updatePoliciesMutation.isPending} className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-600/20 transition-all flex items-center justify-center gap-2"><Settings size={16} />{updatePoliciesMutation.isPending ? 'Saving...' : 'Save All Policies'}</button>
              </form>
            </div>
          )}

          {/* REVIEWS */}
          {activeTab === 'REVIEWS' && (
            <div className="ios-sheet rounded-[28px] p-10 border border-border/10 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-foreground flex items-center gap-3"><div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl"><MessageSquare size={24} /></div>Guest Reviews</h3>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 py-1.5 bg-slate-100 dark:bg-white/10 rounded-lg">{hotelReviews.length} Reviews</span>
              </div>
              {hotelReviews.length > 0 ? (
                <div className="space-y-4">
                  {hotelReviews.map((review: any) => (
                    <div key={review.id} className={`p-6 rounded-2xl border transition-all ${review.isVisible ? 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10' : 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 opacity-70'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-black text-lg shrink-0">{review.guestName?.charAt(0) || 'G'}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <span className="font-black text-foreground text-sm">{review.guestName}</span>
                              {!review.isVisible && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">Hidden</span>}
                              {review.isReported && <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><AlertTriangle size={10} /> Reported</span>}
                            </div>
                            <div className="flex items-center gap-1 mb-2">{[1,2,3,4,5].map(s => <Star key={s} size={13} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />)}<span className="text-[10px] font-bold text-slate-400 ml-2 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</span></div>
                            <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
                            {review.vendorReply && (
                              <div className="mt-3 pl-4 border-l-2 border-blue-300"><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Hotel Reply</p><p className="text-xs text-slate-600 dark:text-slate-300">{review.vendorReply}</p></div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => toggleReviewMutation.mutate({ reviewId: review.id, status: review.isVisible ? 'hidden' : 'visible' })} className={`p-2 rounded-xl transition-all ${review.isVisible ? 'bg-slate-100 text-slate-500 hover:bg-orange-100 hover:text-orange-600' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`} title={review.isVisible ? 'Hide review' : 'Show review'}><Eye size={15} /></button>
                          <button onClick={() => { if (confirm('Delete this review permanently?')) deleteReviewMutation.mutate(review.id); }} className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-500 transition-all" title="Delete review"><Trash2 size={15} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 text-slate-400"><MessageSquare size={56} className="mx-auto mb-4 opacity-20" /><p className="font-black text-lg mb-1">No Reviews Yet</p><p className="text-sm">Guest reviews will appear here after bookings are completed.</p></div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========= HOTELS LIST VIEW =========
  const headerAction = (
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={() => setIsAddHotelModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all"><Plus size={16} /> Add Hotel</button>
      <input type="text" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} placeholder="City / Location..." className="bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-foreground w-[120px]" />
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 rounded-xl py-2 px-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-foreground">
        <option value="All">All Status</option><option value="APPROVED">Approved</option><option value="PENDING">Pending</option><option value="SUSPENDED">Suspended</option>
      </select>
      <select value={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.value)} className="bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 rounded-xl py-2 px-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-foreground">
        <option value="ALL">All Featured</option><option value="FEATURED">Featured</option><option value="REGULAR">Regular</option>
      </select>
      <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-foreground" />
      <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-black/[0.02] dark:bg-white/[0.03] border border-border/10 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-foreground" />
      <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 rounded-xl text-xs font-black uppercase tracking-widest transition-all"><Download size={16} /> Export CSV</button>
    </div>
  );

  return (
    <div className="p-8">
      {/* Add Hotel Modal */}
      {isAddHotelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="ios-sheet rounded-[28px] w-full max-w-2xl p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div><h3 className="text-2xl font-black text-foreground">Add New Hotel</h3><p className="text-sm text-slate-400 mt-1">Auto-approved &amp; verified on creation.</p></div>
              <button onClick={() => setIsAddHotelModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={24} /></button>
            </div>
            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createHotelMutation.mutate({
                name: fd.get('name'), email: fd.get('email'), contactNumber: fd.get('contactNumber'),
                city: fd.get('city'), address: fd.get('address'), pinCode: fd.get('pinCode'),
                stars: Number(fd.get('stars')), checkInTime: fd.get('checkInTime') || '14:00',
                checkOutTime: fd.get('checkOutTime') || '11:00', ownerFirstName: fd.get('ownerFirstName'),
                ownerLastName: fd.get('ownerLastName'), ownerPhone: fd.get('ownerPhone'), description: fd.get('description'),
              });
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hotel Name *</label><input name="name" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Grand Palace Hotel" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email *</label><input name="email" type="email" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="hotel@example.com" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label><input name="contactNumber" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="+91 98765 43210" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label><input name="city" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Mumbai" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pin Code</label><input name="pinCode" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="400001" /></div>
                <div className="space-y-2 col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label><input name="address" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="123 Hotel Street, Marine Drive" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stars</label><select name="stars" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20">{[1,2,3,4,5].map(s => <option key={s} value={s}>{s} Star{s > 1 ? 's' : ''}</option>)}</select></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Check-in Time</label><input name="checkInTime" type="time" defaultValue="14:00" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Owner First Name</label><input name="ownerFirstName" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Raj" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Owner Last Name</label><input name="ownerLastName" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Sharma" /></div>
                <div className="space-y-2 col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label><textarea name="description" rows={3} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" placeholder="Brief description of the hotel..." /></div>
              </div>
              <button type="submit" disabled={createHotelMutation.isPending} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all">{createHotelMutation.isPending ? 'Creating...' : '✦ Create Hotel'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="ios-sheet rounded-[28px] w-full max-w-md p-10 shadow-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6"><AlertTriangle size={36} className="text-red-500" /></div>
            <h3 className="text-2xl font-black text-foreground mb-2">Delete Hotel?</h3>
            <p className="text-sm text-slate-400 mb-8">This will permanently remove the hotel and all its data. This action <span className="font-black text-red-500">cannot be undone</span>.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Cancel</button>
              <button onClick={() => deleteHotelMutation.mutate(deleteConfirmId)} disabled={deleteHotelMutation.isPending} className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all">{deleteHotelMutation.isPending ? 'Deleting...' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}

      <DataTable
        title="Hotel Partners"
        description="Review and manage onboarded hospitality properties"
        columns={columns}
        data={filteredHotels}
        isLoading={isLoading}
        onSearch={setFilter}
        actions={actions}
        headerAction={headerAction}
      />
    </div>
  );
}
