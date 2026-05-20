'use client';

import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import {
       Plus, Map, Star, Clock, Users,
       MoreVertical, Edit2, Calendar, Eye, Trash2, Search, Filter
} from 'lucide-react';

export default function AllToursPage() {
       // Mock data
       const tours = [
              {
                     id: 1,
                     name: 'Mysore Heritage Palace Walk',
                     category: 'Heritage',
                     price: 1200,
                     duration: '3 Hours',
                     rating: 4.8,
                     reviews: 124,
                     status: 'Active',
                     image: '/api/placeholder/400/250'
              },
              {
                     id: 2,
                     name: 'Varanasi Morning Boat Ride',
                     category: 'Cultural',
                     price: 800,
                     duration: '2 Hours',
                     rating: 4.9,
                     reviews: 350,
                     status: 'Active',
                     image: '/api/placeholder/400/250'
              },
              {
                     id: 3,
                     name: 'Old Delhi Street Food Crawl',
                     category: 'Food',
                     price: 1500,
                     duration: '4 Hours',
                     rating: 4.7,
                     reviews: 89,
                     status: 'Pending',
                     image: '/api/placeholder/400/250'
              }
       ];

       return (
              <div>
                     <Topbar
                            title="My Tours"
                            subtitle="Manage your listed sightseeing packages and experiences"
                     />

                     <div className="p-8 space-y-8 animate-fadeIn max-w-[1400px] mx-auto">
                            {/* Actions Row */}
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                                   <div className="relative w-full md:w-96">
                                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                          <input
                                                 type="text"
                                                 placeholder="Search tours..."
                                                 className="form-input !pl-12"
                                          />
                                   </div>
                                   <div className="flex gap-4 w-full md:w-auto">
                                          <button className="btn-secondary px-5 py-3 flex items-center gap-2 flex-1 md:flex-none">
                                                 <Filter size={18} /> Filters
                                          </button>
                                          <Link
                                                 href="/siteseeing/listing/add"
                                                 className="btn-primary px-6 py-3 flex items-center gap-2 flex-1 md:flex-none"
                                          >
                                                 <Plus size={18} /> Add New Tour
                                          </Link>
                                   </div>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                   {tours.map((tour) => (
                                          <div key={tour.id} className="glass-card overflow-hidden group">
                                                 <div className="relative h-48 bg-muted overflow-hidden">
                                                        <img
                                                               src={tour.image}
                                                               alt={tour.name}
                                                               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                        <div className="absolute top-4 right-4">
                                                               <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tour.status === 'Active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                                                      }`}>
                                                                      {tour.status}
                                                               </span>
                                                        </div>
                                                 </div>

                                                 <div className="p-6">
                                                        <div className="flex justify-between items-start mb-2">
                                                               <p className="text-xs font-bold text-accent uppercase tracking-widest">{tour.category}</p>
                                                               <div className="flex items-center gap-1 text-amber-500">
                                                                      <Star size={14} fill="currentColor" />
                                                                      <span className="text-xs font-bold">{tour.rating}</span>
                                                               </div>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-foreground mb-4 line-clamp-1">{tour.name}</h3>

                                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                                               <div className="flex items-center gap-2 text-muted-foreground">
                                                                      <Clock size={16} />
                                                                      <span className="text-xs">{tour.duration}</span>
                                                               </div>
                                                               <div className="flex items-center gap-2 text-muted-foreground">
                                                                      <Users size={16} />
                                                                      <span className="text-xs">Upto 15 pax</span>
                                                               </div>
                                                        </div>

                                                        <div className="flex items-end justify-between border-t border-muted pt-6">
                                                               <div>
                                                                      <p className="text-[10px] uppercase text-muted-foreground font-bold mb-0.5">Starting at</p>
                                                                      <p className="text-xl font-black text-foreground">₹{tour.price}</p>
                                                               </div>
                                                               <div className="flex gap-2">
                                                                      <Link
                                                                             href={`/siteseeing/listing/${tour.id}`}
                                                                             className="p-3 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
                                                                             title="View Details"
                                                                      >
                                                                             <Eye size={18} />
                                                                      </Link>
                                                                      <button
                                                                             className="p-3 rounded-xl hover:bg-accent/10 text-accent transition-colors"
                                                                             title="Edit Tour"
                                                                      >
                                                                             <Edit2 size={18} />
                                                                      </button>
                                                                      <button
                                                                             className="p-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                                                                             title="Delete"
                                                                      >
                                                                             <Trash2 size={18} />
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>
                                   ))}
                            </div>
                     </div>
              </div>
       );
}
