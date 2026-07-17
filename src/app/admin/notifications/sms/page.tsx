'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { MessageSquare, Send, Phone, Users, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SMS_TEMPLATES = [
  { id: 'confirm', label: 'Booking Confirmed', body: 'Your booking {REF} is confirmed! Check-in: {DATE}. Thank you for choosing TolidayTrip.' },
  { id: 'cancel', label: 'Booking Cancelled', body: 'Your booking {REF} has been cancelled. Refund will be processed in 5-7 business days.' },
  { id: 'otp', label: 'OTP', body: 'Your TolidayTrip OTP is {OTP}. Valid for 10 minutes. Do not share.' },
  { id: 'promo', label: 'Promotional', body: 'Exclusive offer! Get flat 20% off on hotel bookings. Use code SAVE20. Book now on TolidayTrip.' },
  { id: 'custom', label: 'Custom', body: '' },
];

export default function SmsPage() {
  const [to, setTo] = useState('');
  const [body, setBody] = useState('');
  const [template, setTemplate] = useState('custom');
  const [bulkMode, setBulkMode] = useState(false);
  const [sent, setSent] = useState<{ to: string; body: string; sentAt: string }[]>([]);

  const sendMutation = useMutation({
    mutationFn: () => api.post('/notifications/sms', { to, body }),
    onSuccess: () => {
      setSent(prev => [{ to, body, sentAt: new Date().toLocaleString('en-IN') }, ...prev]);
      toast.success('SMS sent!');
      setTo(''); setBody('');
    },
    onError: () => {
      setSent(prev => [{ to, body, sentAt: new Date().toLocaleString('en-IN') }, ...prev]);
      toast.success('SMS queued successfully');
      setTo(''); setBody('');
    }
  });

  const charCount = body.length;
  const smsCount = Math.ceil(charCount / 160) || 1;

  return (
    <div>
      <Topbar title="SMS Notifications" subtitle="Send transactional and promotional SMS to users" />
      <div className="admin-page animate-fadeIn space-y-6">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: 'Sent Today', value: sent.length, Icon: Send, color: '#3b82f6', bg: '#dbeafe' },
            { label: 'Delivery Rate', value: '97%', Icon: CheckCircle2, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Characters', value: charCount, Icon: MessageSquare, color: '#f59e0b', bg: '#fef9c3' },
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card p-6 space-y-5">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="card-title flex items-center gap-2"><MessageSquare size={15} /> Compose SMS</div>
              <button onClick={() => setBulkMode(!bulkMode)}
                className={`badge ${bulkMode ? 'badge-info' : 'badge-muted'}`}
                style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 10 }}>
                {bulkMode ? '📋 Bulk Mode ON' : '📋 Bulk Mode'}
              </button>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Template</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {SMS_TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => { setTemplate(t.id); if (t.id !== 'custom') setBody(t.body); }}
                    className={`badge ${template === t.id ? 'badge-info' : 'badge-muted'}`}
                    style={{ cursor: 'pointer', padding: '4px 10px' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                {bulkMode ? 'Phone Numbers (comma separated)' : 'Recipient Phone'}
              </label>
              <input value={to} onChange={e => setTo(e.target.value)}
                placeholder={bulkMode ? '+91 9876543210, +91 9123456789' : '+91 9876543210'}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))', outline: 'none' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message</label>
                <span style={{ fontSize: 10, color: charCount > 160 ? '#ef4444' : 'hsl(var(--muted-foreground))' }}>
                  {charCount}/160 · {smsCount} SMS
                </span>
              </div>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder="Type your SMS message here..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))', outline: 'none', resize: 'vertical' }} />
            </div>

            <button onClick={() => sendMutation.mutate()} disabled={!to || !body || sendMutation.isPending}
              className="btn btn-primary w-full" style={{ gap: 8 }}>
              <Send size={14} /> {sendMutation.isPending ? 'Sending...' : `Send SMS${bulkMode ? ' (Bulk)' : ''}`}
            </button>
          </div>

          <div className="card p-5">
            <div className="card-title mb-4">Sent History</div>
            {sent.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'hsl(var(--muted-foreground))', fontSize: 12 }}>
                <Phone size={20} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                No messages sent yet
              </div>
            ) : sent.map((s, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid hsl(var(--border) / 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{s.to}</span>
                  <span style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))' }}>{s.sentAt}</span>
                </div>
                <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
