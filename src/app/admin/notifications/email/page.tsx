'use client';

import React, { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { Mail, Send, Users, BarChart2, Eye, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CAMPAIGNS = [
  { name: 'Welcome Email', status: 'Active', sent: 1240, opens: 820, clicks: 340, date: '2026-07-01' },
  { name: 'Summer Deals 2026', status: 'Sent', sent: 3200, opens: 1860, clicks: 920, date: '2026-06-15' },
  { name: 'Re-engagement Campaign', status: 'Draft', sent: 0, opens: 0, clicks: 0, date: '2026-07-10' },
  { name: 'Loyalty Rewards Newsletter', status: 'Sent', sent: 980, opens: 540, clicks: 210, date: '2026-05-28' },
];

export default function EmailCampaignsPage() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [to, setTo] = useState('All Users');
  const [showCompose, setShowCompose] = useState(false);

  return (
    <div>
      <Topbar title="Email Campaigns" subtitle="Create and manage email marketing campaigns"
        actions={
          <button onClick={() => setShowCompose(true)} className="btn btn-primary" style={{ gap: 6 }}>
            <Mail size={14} /> New Campaign
          </button>
        }
      />
      <div className="admin-page animate-fadeIn space-y-6">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: 'Total Campaigns', value: CAMPAIGNS.length, Icon: Mail, color: '#3b82f6', bg: '#dbeafe' },
            { label: 'Total Sent', value: CAMPAIGNS.reduce((s, c) => s + c.sent, 0).toLocaleString(), Icon: Send, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Avg Open Rate', value: '61%', Icon: Eye, color: '#8b5cf6', bg: '#f3e8ff' },
            { label: 'Avg Click Rate', value: '28%', Icon: BarChart2, color: '#f59e0b', bg: '#fef9c3' },
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
            <div className="card-title">Email Campaigns</div>
            <button onClick={() => setShowCompose(true)} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
              <Mail size={12} /> New Campaign
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table w-full">
              <thead><tr><th>Campaign</th><th>Status</th><th>Sent</th><th>Opens</th><th>Clicks</th><th>Date</th></tr></thead>
              <tbody>
                {CAMPAIGNS.map((c, i) => (
                  <tr key={i}>
                    <td className="font-bold">{c.name}</td>
                    <td>
                      <span className={`badge ${c.status === 'Active' ? 'badge-success' : c.status === 'Draft' ? 'badge-muted' : 'badge-info'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{c.sent.toLocaleString()}</td>
                    <td>
                      <div>{c.opens.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: '#16a34a' }}>{c.sent ? Math.round((c.opens / c.sent) * 100) : 0}%</div>
                    </td>
                    <td>
                      <div>{c.clicks.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: '#3b82f6' }}>{c.sent ? Math.round((c.clicks / c.sent) * 100) : 0}%</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div className="card" style={{ width: '100%', maxWidth: 560, padding: 32, position: 'relative' }}>
              <button onClick={() => setShowCompose(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', fontSize: 18 }}>✕</button>
              <div className="card-title mb-6">Compose Email Campaign</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Recipients', type: 'select', value: to, onChange: setTo, options: ['All Users', 'Hotel Guests', 'Inactive Users', 'Premium Members'] },
                  { label: 'Subject Line', type: 'text', value: subject, onChange: setSubject, placeholder: 'e.g. Exclusive Summer Deals 🌟' },
                ].map((f: any, i) => (
                  <div key={i}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={f.value} onChange={e => f.onChange(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))', outline: 'none' }}>
                        {f.options.map((o: string) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={f.type} value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))', outline: 'none' }} />
                    )}
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Email Body (HTML / Text)</label>
                  <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} placeholder="Write your email content here..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))', outline: 'none', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { toast.success('Campaign saved as draft'); setShowCompose(false); }} className="btn btn-outline" style={{ flex: 1 }}>Save Draft</button>
                  <button onClick={() => { toast.success('Campaign scheduled & sent!'); setShowCompose(false); }} className="btn btn-primary" style={{ flex: 1, gap: 8 }}><Send size={14} /> Send Campaign</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
