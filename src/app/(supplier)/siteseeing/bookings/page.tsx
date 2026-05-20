'use client';

import Topbar from '@/components/layout/Topbar';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
       Search, Filter, Download,
       Calendar, User, MapPin, MoreVertical,
       Clock, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
       const map: Record<string, string> = {
              confirmed: 'badge-accent',
              completed: 'badge-success',
              cancelled: 'badge-destructive',
              pending: 'badge-warning',
       };
       const labels: Record<string, string> = {
              confirmed: 'Confirmed',
              completed: 'Completed',
              cancelled: 'Cancelled',
              pending: 'Pending',
       };
       return <span className={`badge ${map[status] || 'badge-muted'}`}>{labels[status] || status}</span>;
}

export default function SiteSeeingBookingsPage() {
       const { data: bookings = [], isLoading } = useQuery({
              queryKey: ['siteseeing-bookings'],
              queryFn: async () => {
                     // Mock data for now
                     return [
                            { id: 'BK-1001', customer: 'Vansh Sharma', email: 'vansh@example.com', tour: 'Mysore Palace Walk', date: '2024-03-25', slot: '09:00 AM', pax: '2 Adults', amount: '₹2,400', status: 'confirmed' },
                            { id: 'BK-1002', customer: 'Rahul Gupta', email: 'rahul@example.com', tour: 'Varanasi Boat Ride', date: '2024-03-26', slot: '06:30 AM', pax: '4 Adults', amount: '₹3,200', status: 'pending' },
                            { id: 'BK-1003', customer: 'Priya Singh', email: 'priya@example.com', tour: 'Old Delhi Food', date: '2024-03-27', slot: '12:00 PM', pax: '1 Adult, 1 Child', amount: '₹2,100', status: 'completed' },
                            { id: 'BK-1004', customer: 'Amit Kumar', email: 'amit@example.com', tour: 'Mysore Palace Walk', date: '2024-03-28', slot: '03:30 PM', pax: '3 Adults', amount: '₹3,600', status: 'cancelled' },
                     ];
              }
       });

       return (
              <div>
                     <Topbar title="Tour Bookings" subtitle="Manage and track all guest reservations" />

                     <div className="p-8 space-y-6 animate-fadeIn">
                            {/* Filters Row */}
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                                   <div className="flex gap-4 w-full md:w-auto">
                                          <div className="relative flex-1 md:w-80">
                                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                 <input type="text" placeholder="Search by ID or customer..." className="form-input !pl-12" />
                                          </div>
                                          <button className="btn-secondary px-5 py-3 flex items-center gap-2">
                                                 <Filter size={18} /> Filters
                                          </button>
                                   </div>
                                   <button className="btn-secondary px-5 py-3 flex items-center gap-2 w-full md:w-auto">
                                          <Download size={18} /> Export List
                                   </button>
                            </div>

                            {/* Bookings Table */}
                            <div className="glass-card overflow-hidden">
                                   <div className="overflow-x-auto">
                                          <table className="data-table">
                                                 <thead>
                                                        <tr>
                                                               <th>Booking ID</th>
                                                               <th>Customer & Contact</th>
                                                               <th>Tour / Experience</th>
                                                               <th>Date & Slot</th>
                                                               <th>Guests (Pax)</th>
                                                               <th>Total Amount</th>
                                                               <th>Status</th>
                                                               <th>Actions</th>
                                                        </tr>
                                                 </thead>
                                                 <tbody>
                                                        {bookings.map((b: any) => (
                                                               <tr key={b.id} className="hover:bg-muted/30 transition-colors group">
                                                                      <td className="font-mono text-xs font-bold text-accent">{b.id}</td>
                                                                      <td>
                                                                             <div className="flex flex-col">
                                                                                    <span className="font-bold text-foreground">{b.customer}</span>
                                                                                    <span className="text-[10px] text-muted-foreground">{b.email}</span>
                                                                             </div>
                                                                      </td>
                                                                      <td className="text-sm font-medium">{b.tour}</td>
                                                                      <td>
                                                                             <div className="flex flex-col gap-1">
                                                                                    <div className="flex items-center gap-1.5 text-xs">
                                                                                           <Calendar size={12} className="text-accent" />
                                                                                           {b.date}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                                           <Clock size={12} />
                                                                                           {b.slot}
                                                                                    </div>
                                                                             </div>
                                                                      </td>
                                                                      <td className="text-xs font-medium">{b.pax}</td>
                                                                      <td className="font-bold">{b.amount}</td>
                                                                      <td><StatusBadge status={b.status} /></td>
                                                                      <td>
                                                                             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                    <button className="p-2 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors">
                                                                                           <CheckCircle2 size={16} />
                                                                                    </button>
                                                                                    <button className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors">
                                                                                           <XCircle size={16} />
                                                                                    </button>
                                                                             </div>
                                                                      </td>
                                                               </tr>
                                                        ))}
                                                 </tbody>
                                          </table>
                                   </div>
                            </div>
                     </div>
              </div>
       );
}
