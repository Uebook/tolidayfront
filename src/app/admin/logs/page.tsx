'use client';

import {
       Shield, Search, Filter, Clock,
       Terminal, User, Globe, AlertTriangle,
       Info, CheckCircle2, XCircle
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLogsPage() {
       const [filter, setFilter] = useState('');

       const logs = [
              { id: 1, type: 'AUTH', action: 'Admin login successful', user: 'admin@gmail.com', ip: '1.1.1.1', time: '2 mins ago', status: 'SUCCESS' },
              { id: 2, type: 'SECURITY', action: 'Failed password attempt', user: 'unknown@email.com', ip: '45.1.22.9', time: '15 mins ago', status: 'WARNING' },
              { id: 3, type: 'DATA', action: 'Hotel approved: Grand Luxury', user: 'admin@gmail.com', ip: '1.1.1.1', time: '1 hour ago', status: 'SUCCESS' },
              { id: 4, type: 'SYSTEM', action: 'S3 storage backup completed', user: 'SYSTEM', ip: 'INTERNAL', time: '3 hours ago', status: 'SUCCESS' },
              { id: 5, type: 'SECURITY', action: 'Suspicious IP blocked', user: 'SYSTEM', ip: '109.2.1.8', time: '5 hours ago', status: 'CRITICAL' },
       ];

       return (
              <div className="p-8 space-y-8 max-w-7xl mx-auto">
                     <header>
                            <div className="flex items-center gap-3 mb-2">
                                   <Shield className="text-blue-500" size={24} />
                                   <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs">System</span>
                            </div>
                            <h1 className="text-3xl font-bold text-foreground tracking-tight">Security Logs</h1>
                            <p className="text-muted-foreground mt-2">Monitor system-wide activity and audit trails</p>
                     </header>

                     <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border">
                            <div className="relative w-full md:w-96 group">
                                   <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                                   <input
                                          type="text"
                                          placeholder="Search logs..."
                                          value={filter}
                                          onChange={(e) => setFilter(e.target.value)}
                                          className="w-full bg-background border border-border rounded-xl py-3 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                   />
                            </div>

                            <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:border-blue-500/30 transition-all">
                                   <Filter size={14} /> Log Types
                            </button>
                     </div>

                     <div className="space-y-4">
                            {logs.map((log) => (
                                   <div key={log.id} className="bg-card border border-border p-5 rounded-3xl hover:bg-card-hover transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                          <div className="flex items-start gap-5">
                                                 <div className={`p-4 rounded-2xl shrink-0 ${log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' :
                                                               log.status === 'WARNING' ? 'bg-amber-500/10 text-amber-500' :
                                                                      'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {log.status === 'SUCCESS' ? <CheckCircle2 size={24} /> :
                                                               log.status === 'WARNING' ? <AlertTriangle size={24} /> :
                                                                      <XCircle size={24} />}
                                                 </div>
                                                 <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                               <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-500/5 px-2 py-0.5 rounded-lg border border-blue-500/10">
                                                                      {log.type}
                                                               </span>
                                                               <h3 className="text-base font-bold text-foreground/90">{log.action}</h3>
                                                        </div>
                                                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-medium">
                                                               <span className="flex items-center gap-1.5"><User size={12} className="opacity-50" /> {log.user}</span>
                                                               <span className="flex items-center gap-1.5"><Globe size={12} className="opacity-50" /> {log.ip}</span>
                                                               <span className="flex items-center gap-1.5"><Clock size={12} className="opacity-50" /> {log.time}</span>
                                                        </div>
                                                 </div>
                                          </div>

                                          <button className="hidden md:block px-4 py-2 bg-background border border-border rounded-xl text-[10px] font-bold text-muted-foreground hover:text-foreground transition-all uppercase tracking-widest opacity-0 group-hover:opacity-100">
                                                 Investigate
                                          </button>
                                   </div>
                            ))}
                     </div>

                     <div className="text-center py-6">
                            <button className="text-blue-500 text-xs font-bold uppercase tracking-widest hover:underline">
                                   Load older logs
                            </button>
                     </div>
              </div>
       );
}
