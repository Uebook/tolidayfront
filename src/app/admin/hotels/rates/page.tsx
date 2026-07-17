'use client';

import React, { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Building2, Calendar as CalendarIcon, IndianRupee, Search, Save, ArrowRight, ChevronDown, Check, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function HotelsRatesPage() {
       const [search, setSearch] = useState('');
       const [filterType, setFilterType] = useState('ALL');
       const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
       const [isDropdownOpen, setIsDropdownOpen] = useState(false);
       
       // Query real hotels from database
       const { data: hotels = [] } = useQuery({
              queryKey: ['admin-hotels-rates-dropdown'],
              queryFn: async () => {
                     const res = await api.get('/admin/hotels');
                     return res.data;
              }
       });

       // Query real hotel details (to get its room types) + global inventory
       const { data: inventory = [], isLoading } = useQuery({
              queryKey: ['inventory-rates-matrix', selectedVendor],
              queryFn: async () => {
                     if (!selectedVendor) return [];
                     
                     // Fetch both hotel details (for room types) and existing inventory overrides
                     const [hotelRes, invRes] = await Promise.all([
                            api.get(`/admin/hotels/${selectedVendor}`),
                            api.get(`/global-inventory/admin/vendor/${selectedVendor}?vertical=HOTEL`)
                     ]);

                     const hotel = hotelRes.data;
                     const overrides = invRes.data || [];

                     // If no room types exist on the hotel, return empty
                     if (!hotel.roomTypes || hotel.roomTypes.length === 0) {
                            return [];
                     }

                     // For each room type, map it to a matrix item
                     return hotel.roomTypes.map((room: any) => {
                            // Look for existing inventory override record
                            const override = overrides.find((o: any) => o.resourceId === room.id);
                            return {
                                   id: room.id,
                                   name: room.name,
                                   basePrice: override ? Number(override.basePrice) : Number(room.price),
                                   available: override ? override.availableUnits : room.totalRooms || 10,
                                   total: room.totalRooms || 10,
                                   isOverride: !!override,
                                   overrideId: override?.id || null
                            };
                     });
              },
              enabled: !!selectedVendor
       });

       const filteredInventory = inventory.filter((item: any) => {
              const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
              const matchesFilter = filterType === 'ALL' || (filterType === 'LOW' && item.available < 5);
              return matchesSearch && matchesFilter;
       });

       const handleSave = () => {
              toast.success('Rates and availability updated successfully');
       };

       const activeVendor = hotels.find((h: any) => h.id === selectedVendor);

       return (
              <div className="p-6 md:p-8 space-y-6 md:space-y-8 animate-fadeIn max-w-[1600px] mx-auto min-h-full">
                     <Topbar title="Rates & Availability" subtitle="Manage daily pricing, inventory allocation, and restrictions" />

                     {/* Top Filter Panel */}
                     <div className="ios-sheet rounded-[24px] p-6 border border-border/10 flex flex-wrap items-end gap-6 justify-between relative z-20">
                            <div className="flex flex-wrap items-center gap-6">
                                   {/* Property Selection */}
                                   <div className="relative">
                                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Property Partner</label>
                                          <div 
                                                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                 className={`bg-black/5 dark:bg-white/5 border border-border/10 cursor-pointer transition-all rounded-xl px-4 py-3 flex items-center justify-between gap-4 w-[280px] hover:border-blue-500/30 ${isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/10' : ''}`}
                                          >
                                                 {activeVendor ? (
                                                        <div>
                                                               <div className="text-xs font-black text-foreground">{activeVendor.name}</div>
                                                               <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{activeVendor.city || activeVendor.address || 'India'}</div>
                                                        </div>
                                                 ) : (
                                                        <span className="text-xs font-bold text-slate-400">Select a property...</span>
                                                 )}
                                                 <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                          </div>

                                          {isDropdownOpen && (
                                                 <div className="absolute top-full left-0 mt-2 w-full bg-slate-900 border border-border/10 shadow-2xl rounded-2xl overflow-hidden z-30 animate-fadeIn max-h-[300px] overflow-y-auto">
                                                        <div className="p-1.5 space-y-1">
                                                               {hotels.map((vendor: any) => (
                                                                      <div 
                                                                             key={vendor.id}
                                                                             onClick={() => {
                                                                                    setSelectedVendor(vendor.id);
                                                                                    setIsDropdownOpen(false);
                                                                             }}
                                                                             className={`p-3 rounded-xl cursor-pointer flex items-center justify-between transition-all ${selectedVendor === vendor.id ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-300'}`}
                                                                      >
                                                                             <div>
                                                                                    <div className="text-xs font-black">{vendor.name}</div>
                                                                                    <div className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${selectedVendor === vendor.id ? 'text-white/80' : 'text-slate-400'}`}>{vendor.city || vendor.address || 'India'}</div>
                                                                             </div>
                                                                             {selectedVendor === vendor.id && <Check size={14} />}
                                                                      </div>
                                                               ))}
                                                        </div>
                                                 </div>
                                          )}
                                   </div>

                                   {/* Date Picker Range (Horizontal Row) */}
                                   <div>
                                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Date Range</label>
                                          <div className="flex items-center gap-2">
                                                 <button className="px-4 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all">
                                                        <CalendarIcon size={14} /> Today - Next 7 Days
                                                 </button>
                                                 <button className="px-4 py-3 bg-black/5 dark:bg-white/5 border border-border/10 text-slate-300 hover:border-blue-500/30 text-xs font-black uppercase tracking-widest rounded-xl transition-all">
                                                        Custom Range
                                                 </button>
                                          </div>
                                   </div>

                                   {/* Quick Filters */}
                                   <div>
                                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Quick Filters</label>
                                          <div className="flex gap-2">
                                                 <span onClick={() => setFilterType('ALL')} className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all border ${filterType === 'ALL' ? 'bg-blue-600/10 text-blue-500 border-blue-500/30' : 'bg-black/5 dark:bg-white/5 text-slate-400 border-transparent hover:border-slate-400/20'}`}>All Rooms</span>
                                                 <span onClick={() => setFilterType('LOW')} className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all border ${filterType === 'LOW' ? 'bg-blue-600/10 text-blue-500 border-blue-500/30' : 'bg-black/5 dark:bg-white/5 text-slate-400 border-transparent hover:border-slate-400/20'}`}>Low Inventory</span>
                                          </div>
                                   </div>
                            </div>

                            {/* Search bar inside header panel */}
                            {selectedVendor && (
                                   <div className="relative w-full md:w-auto">
                                          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                          <input type="text" placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-border/10 rounded-xl text-xs font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none w-full md:w-64 transition-all text-foreground" />
                                   </div>
                            )}
                     </div>

                     {/* Full Width Matrix Container */}
                     {!selectedVendor ? (
                            <div className="card rounded-[24px] border-dashed border-2 border-border/10 bg-transparent flex flex-col items-center justify-center p-20 text-center">
                                   <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                                          <Building2 size={28} />
                                   </div>
                                   <h3 className="text-lg font-black text-foreground mb-2">No Property Selected</h3>
                                   <p className="text-slate-400 font-bold max-w-sm text-xs leading-relaxed">Please select a hotel partner from the dropdown above to view and manage their specific rates and availability matrix.</p>
                            </div>
                     ) : (
                            <div className="card rounded-[24px] border border-border/10 overflow-hidden animate-fadeIn">
                                   <div className="bg-slate-50/50 dark:bg-white/5 border-b border-border/5 p-6 flex items-center justify-between">
                                          <div className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                                 <Filter size={14} /> Inventory & Rates Matrix
                                          </div>
                                          <button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20">
                                                 <Save size={12} /> Save Matrix Changes
                                          </button>
                                   </div>
                                   
                                   <div className="overflow-x-auto">
                                          {isLoading ? (
                                                 <div className="p-20 flex items-center justify-center">
                                                        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
                                                 </div>
                                          ) : inventory.length === 0 ? (
                                                 <div className="p-20 text-center text-slate-400 font-bold text-xs">
                                                        No inventory categories found for this property.
                                                 </div>
                                          ) : (
                                                 <table className="w-full text-left whitespace-nowrap">
                                                        <thead>
                                                               <tr className="bg-black/5 dark:bg-white/5 border-b border-border/5">
                                                                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Type</th>
                                                                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mon 15</th>
                                                                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tue 16</th>
                                                                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Wed 17</th>
                                                               </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/5">
                                                               {filteredInventory.map((item: any) => (
                                                                      <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                                             <td className="p-5">
                                                                                    <div className="text-sm font-black text-foreground">{item.name}</div>
                                                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Base: ₹{item.basePrice} | Total Units: {item.total}</div>
                                                                             </td>
                                                                             {[15, 16, 17].map(day => (
                                                                                    <td key={day} className="p-4 text-center">
                                                                                           <div className="inline-flex flex-col gap-2">
                                                                                                  <div className="relative">
                                                                                                         <IndianRupee size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                                                                         <input type="number" defaultValue={item.basePrice + (day % 2 === 0 ? 20 : 0)} className="w-24 pl-8 pr-3 py-2 bg-black/5 dark:bg-white/5 border border-border/10 rounded-xl text-xs font-black focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-foreground text-center" />
                                                                                                  </div>
                                                                                                  <div className="flex items-center gap-2">
                                                                                                         <input type="number" defaultValue={item.available} className={`w-24 px-3 py-2 bg-black/5 dark:bg-white/5 border rounded-xl text-xs font-black text-center outline-none ${item.available < 5 ? 'border-red-200 text-red-500 bg-red-500/10' : 'border-border/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-foreground'}`} />
                                                                                                  </div>
                                                                                           </div>
                                                                                    </td>
                                                                             ))}
                                                                      </tr>
                                                               ))}
                                                        </tbody>
                                                 </table>
                                          )}
                                   </div>
                            </div>
                     )}
              </div>
       );
}
