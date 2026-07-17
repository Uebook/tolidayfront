'use client';

import React, { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { Tag, Send, Percent, Calendar, Clock, Users, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PROMOS = [
  { title: 'Monsoon Special 30% Off', channel: 'Push + SMS', audience: 'All Users', starts: '2026-07-15', ends: '2026-07-31', status: 'Active', reach: 4200 },
  { title: 'Early Bird Hotel Deal', channel: 'Email + Push', audience: 'Hotel Guests', starts: '2026-08-01', ends: '2026-08-15', status: 'Scheduled', reach: 1800 },
  { title: 'Refer & Earn', channel: 'Push', audience: 'All Users', starts: '2026-06-01', ends: '2026-06-30', status: 'Expired', reach: 3900 },
];

export default function PromotionalPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', channel: 'Push', audience: 'All Users', starts: '', ends: '', discount: '' });

  return (
    <div>
      <Topbar title="Promotional Notifications" subtitle="Schedule and manage promotional offers across all channels"
        actions={
          <button onClick={() => setShowCreate(true)} className="btn btn-primary" style={{ gap: 6 }}>
            <Tag size={14} /> Create Promotion
          </button>
        }
      />
      <div className="admin-page animate-fadeIn space-y-6">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: 'Active Promos', value: PROMOS.filter(p => p.status === 'Active').length, Icon: Tag, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Total Reach', value: PROMOS.reduce((s, p) => s + p.reach, 0).toLocaleString(), Icon: Users, color: '#3b82f6', bg: '#dbeafe' },
            { label: 'Scheduled', value: PROMOS.filter(p => p.status === 'Scheduled').length, Icon: Calendar, color: '#8b5cf6', bg: '#f3e8ff' },
            { label: 'Expired', value: PROMOS.filter(p => p.status === 'Expired').length, Icon: Clock, color: '#64748b', bg: 'hsl(var(--muted))' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ padding: '14px 16px' }}>
              <div>
                <div className="stat-card-label" style={{ fontSize: 11 }}>{s.label}</div>
                <div className="stat-card-value" style={{ fontSize: 22 }}>{s.value}</div>
              </div>
              <div className="stat-card-icon" style={{ width: 36, height: 36, borderRadius: 8, background: s.bg, color: s.color }}>
                <s.Icon size={16} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">All Promotions</div>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-sm" style={{ gap: 6 }}><Tag size={12} /> New</button>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table w-full">
              <thead><tr><th>Title</th><th>Channel</th><th>Audience</th><th>Duration</th><th>Reach</th><th>Status</th></tr></thead>
              <tbody>
                {PROMOS.map((p, i) => (
                  <tr key={i}>
                    <td className="font-bold">{p.title}</td>
                    <td><span className="badge badge-muted text-[9px]">{p.channel}</span></td>
                    <td style={{ fontSize: 12 }}>{p.audience}</td>
                    <td style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{p.starts} → {p.ends}</td>
                    <td className="font-bold">{p.reach.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${p.status === 'Active' ? 'badge-success' : p.status === 'Scheduled' ? 'badge-info' : 'badge-muted'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showCreate && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div className="card" style={{ width: '100%', maxWidth: 500, padding: 32, position: 'relative' }}>
              <button onClick={() => setShowCreate(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'hsl(var(--muted-foreground))' }}>✕</button>
              <div className="card-title mb-6">Create Promotion</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Promo Title', key: 'title', type: 'text', placeholder: 'e.g. Monsoon Special Deal' },
                  { label: 'Discount %', key: 'discount', type: 'number', placeholder: '20' },
                  { label: 'Start Date', key: 'starts', type: 'date' },
                  { label: 'End Date', key: 'ends', type: 'date' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder || ''} value={(form as any)[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))', outline: 'none' }} />
                  </div>
                ))}
                {[
                  { label: 'Channel', key: 'channel', options: ['Push', 'SMS', 'Email', 'Push + SMS', 'Email + Push', 'All Channels'] },
                  { label: 'Audience', key: 'audience', options: ['All Users', 'Hotel Guests', 'Inactive Users', 'Premium Members'] },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <select value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))', outline: 'none' }}>
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <button onClick={() => { toast.success('Promotion created & scheduled!'); setShowCreate(false); }}
                  className="btn btn-primary" style={{ gap: 8, marginTop: 8 }}>
                  <Send size={14} /> Launch Promotion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
