'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
       BarChart3, Search, Calendar,
       Building2, User, CreditCard,
       AlertCircle, Bus, CarFront, Package, Hotel as HotelIcon,
       MoreHorizontal, Eye, Filter, CheckCircle2, Clock
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import DataTable from '@/components/admin/DataTable';

export default function AdminBookingsPage() {
       const [filter, setFilter] = useState('');
       const [activeVertical, setActiveVertical] = useState('All');

       const { data: bookings = [], isLoading } = useQuery({
              queryKey: ['admin-bookings'],
              queryFn: async () => {
                     const res = await api.get('/admin/bookings');
                     return res.data;
              }
       });

       const verticals = [
              { id: 'All', label: 'All Transactions', icon: BarChart3 },
              { id: 'HOTEL', label: 'Hotels', icon: HotelIcon },
              { id: 'PACKAGE', label: 'Tours', icon: Package },
              { id: 'BUS', label: 'Buses', icon: Bus },
              { id: 'CAB', label: 'Cabs', icon: CarFront },
       ];

       const filteredBookings = bookings.filter((b: any) => {
              const matchFilter = 
                     b.id.toLowerCase().includes(filter.toLowerCase()) ||
                     (b.hotel?.name || '').toLowerCase().includes(filter.toLowerCase()) ||
                     (b.guestName || '').toLowerCase().includes(filter.toLowerCase()) ||
                     (b.bookingReference || '').toLowerCase().includes(filter.toLowerCase());
              
              const vertical = activeVertical.toUpperCase();
              const matchVertical = vertical === 'ALL' || b.vertical === vertical;
              
              return matchFilter && matchVertical;
       });

       const verticalIcons: any = {
              HOTEL: { icon: HotelIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
              PACKAGE: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
              BUS: { icon: Bus, color: 'text-orange-600', bg: 'bg-orange-50' },
              CAB: { icon: CarFront, color: 'text-emerald-600', bg: 'bg-emerald-50' },
       };

       const columns = [
              {
                     header: 'Booking Detail',
                     accessor: 'id',
                     render: (b: any) => {
                            const vCfg = verticalIcons[b.vertical] || verticalIcons.HOTEL;
                            const Icon = vCfg.icon;
                            return (
                                   <div className="flex items-center gap-4">
                                          <div className={`w-12 h-12 rounded-2xl ${vCfg.bg} ${vCfg.color} flex items-center justify-center shadow-sm`}>
                                                 <Icon size={20} />
                                          </div>
                                          <div>
                                                 <div className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase leading-none mb-1.5">Ref: {b.bookingReference || b.pnr || b.id.slice(0, 8)}</div>
                                                 <div className="text-sm font-black text-slate-900 leading-none">{format(new Date(b.createdAt), 'MMM dd, yyyy')}</div>
                                          </div>
                                   </div>
                            );
                     }
              },
              {
                     header: 'Service Partner',
                     accessor: 'vendor',
                     render: (b: any) => (
                            <div>
                                   <div className="text-sm font-black text-slate-900 leading-none mb-1.5">
                                          {b.hotel?.name || b.vendor?.name || b.packageName || 'Package Operator'}
                                   </div>
                                   <div className="flex items-center gap-2">
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                                                 {b.vertical}
                                          </span>
                                          <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">
                                                 {b.roomType?.name || b.vehicle?.model || 'Active Inventory'}
                                          </span>
                                   </div>
                            </div>
                     )
              },
              {
                     header: 'Economic Status',
                     accessor: 'isSettled',
                     render: (b: any) => (
                            <div className="flex flex-col gap-1.5">
                                   <div className="text-sm font-black text-slate-900">₹{Number(b.amount).toLocaleString()}</div>
                                   {b.isSettled ? (
                                          <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                                 <CheckCircle2 size={10} /> Settled
                                          </div>
                                   ) : (
                                          <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                                 <Clock size={10} /> Pending
                                          </div>
                                   )}
                            </div>
                     )
              },
              {
                     header: 'Status',
                     accessor: 'status',
                     render: (b: any) => (
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-[0.1em] ${
                                   b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                                   b.status === 'PENDING' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                                   'text-red-600 bg-red-50 border-red-100'
                            }`}>
                                   {b.status}
                            </span>
                     )
              }
       ];

       const actions = (b: any) => (
              <button 
                     onClick={() => alert(`Full Transaction Audit:\n\nReference: ${b.bookingReference || b.id}\nCustomer: ${b.guestName}\nTotal Volume: ₹${b.amount}\nVertical: ${b.vertical}\nSettlement: ${b.isSettled ? 'COMPLETED' : 'PENDING'}`)}
                     className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg rounded-2xl transition-all group"
              >
                     <Eye size={18} className="group-hover:scale-110 transition-transform" />
              </button>
       );

       return (
              <div className="p-8 lg:p-12 animate-fadeIn">
                     <header className="mb-12">
                            <div className="flex items-center gap-3 mb-2">
                                   <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                                          <BarChart3 size={20} />
                                   </div>
                                   <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Operations Center</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Global Reservations</h1>
                            <p className="text-slate-400 font-bold mt-2">End-to-end monitoring of all platform transactions</p>
                     </header>

                     {/* Vertical Quick Filters */}
                     <div className="flex flex-wrap gap-4 mb-10">
                            {verticals.map((v) => (
                                   <button
                                          key={v.id}
                                          onClick={() => setActiveVertical(v.id)}
                                          className={`flex items-center gap-3 px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${
                                                 activeVertical === v.id 
                                                 ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/30' 
                                                 : 'bg-white text-slate-400 border border-slate-100 hover:border-blue-200 hover:text-blue-600'
                                          }`}
                                   >
                                          <v.icon size={16} />
                                          {v.label}
                                   </button>
                            ))}
                     </div>

                     <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                            <DataTable
                                   title=""
                                   description=""
                                   columns={columns}
                                   data={filteredBookings}
                                   isLoading={isLoading}
                                   onSearch={setFilter}
                                   onFilter={() => {}} // Vertical handled above
                                   actions={actions}
                            />
                     </div>
              </div>
       );
}
