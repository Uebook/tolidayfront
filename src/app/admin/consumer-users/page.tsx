'use client';

import React, { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import DataTable from '@/components/admin/DataTable';
import { 
  Users, ShieldCheck, ShieldAlert, Ban, Clock, Download, Eye, 
  Phone, Mail, Plus, X, Pencil, Trash2, CheckCircle2, UserCheck, UserX
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

function exportToCSV(data: any[]) {
  if (!data.length) { toast.error('No data to export'); return; }
  const headers = ['Name', 'Email', 'Phone', 'Total Bookings', 'LTV (₹)', 'Join Date', 'Status'];
  const rows = data.map((u: any) => [
    u.name || '', u.email || '', u.phone || '',
    u.totalBookings || 0, u.ltv || 0,
    u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '',
    u.status || 'active',
  ]);
  const csv = [headers, ...rows].map(r => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `consumers_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
  toast.success(`Exported ${data.length} consumers`);
}

type UserForm = { name: string; email: string; phone: string; password: string };
const emptyForm: UserForm = { name: '', email: '', phone: '', password: '' };

export default function ConsumerUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['admin-consumers'],
    queryFn: async () => {
      const res = await api.get('/bookings/admin/consumers');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    }
  });
  const consumers: any[] = rawData || [];

  // Add User mutation
  const addMutation = useMutation({
    mutationFn: (data: UserForm) => api.post('/auth/register', { ...data, role: 'user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-consumers'] });
      toast.success('User added successfully');
      setShowAddModal(false);
      setForm(emptyForm);
    },
    onError: () => toast.error('Failed to add user. Check email/phone uniqueness.')
  });

  // Edit User mutation
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserForm> }) =>
      api.patch(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-consumers'] });
      toast.success('User updated');
      setEditUser(null);
      setForm(emptyForm);
    },
    onError: () => toast.error('Failed to update user')
  });

  // Suspend / Activate mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, suspend }: { id: string; suspend: boolean }) =>
      api.patch(`/users/${id}/status`, { status: suspend ? 'suspended' : 'active' }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-consumers'] });
      toast.success(vars.suspend ? 'User suspended' : 'User activated');
    },
    onError: () => toast.error('Failed to update status')
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-consumers'] });
      toast.success('User deleted');
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Failed to delete user')
  });

  const filtered = consumers.filter((c: any) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Consumer',
      accessor: 'name',
      render: (u: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: u.status === 'suspended' ? '#fee2e2' : 'hsl(var(--primary) / 0.1)',
            color: u.status === 'suspended' ? '#ef4444' : 'hsl(var(--primary))',
            fontWeight: 700, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {u.name ? u.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: 'hsl(var(--foreground))' }}>{u.name || 'Unknown'}</div>
            <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
              <Mail size={10} /> {u.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (u: any) => (
        <div style={{ fontSize: 13, color: u.phone ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>
          {u.phone ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Phone size={11} /> {u.phone}
            </span>
          ) : '—'}
        </div>
      )
    },
    {
      header: 'Bookings',
      accessor: 'totalBookings',
      render: (u: any) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{u.totalBookings || 0}</div>
          <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>trips booked</div>
        </div>
      )
    },
    {
      header: 'LTV',
      accessor: 'ltv',
      render: (u: any) => (
        <div style={{ fontWeight: 700, fontSize: 13, color: '#16a34a' }}>
          ₹{Number(u.ltv || 0).toLocaleString('en-IN')}
        </div>
      )
    },
    {
      header: 'KYC',
      accessor: 'kycStatus',
      render: (u: any) => {
        const map: Record<string, string> = {
          VERIFIED: 'badge badge-success',
          PENDING: 'badge badge-warning',
          REJECTED: 'badge badge-danger',
        };
        const icons: Record<string, any> = {
          VERIFIED: <ShieldCheck size={11} />,
          PENDING: <Clock size={11} />,
          REJECTED: <ShieldAlert size={11} />,
        };
        return (
          <span className={map[u.kycStatus] || 'badge badge-muted'} style={{ gap: 4 }}>
            {icons[u.kycStatus]}
            {u.kycStatus || 'N/A'}
          </span>
        );
      }
    },
    {
      header: 'Account Status',
      accessor: 'status',
      render: (u: any) => (
        <span className={`badge ${u.status === 'suspended' ? 'badge-danger' : 'badge-success'}`}>
          {u.status === 'suspended' ? 'Suspended' : 'Active'}
        </span>
      )
    },
  ];

  const actions = (u: any) => (
    <div style={{ display: 'flex', gap: 4 }}>
      <Link href={`/admin/consumer-users/${u.id}`} className="btn btn-ghost btn-icon" title="View Profile">
        <Eye size={14} />
      </Link>
      <button
        onClick={() => { setEditUser(u); setForm({ name: u.name || '', email: u.email || '', phone: u.phone || '', password: '' }); }}
        className="btn btn-ghost btn-icon"
        title="Edit User"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={() => statusMutation.mutate({ id: u.id, suspend: u.status !== 'suspended' })}
        className="btn btn-ghost btn-icon"
        title={u.status === 'suspended' ? 'Activate' : 'Suspend'}
        style={{ color: u.status === 'suspended' ? '#16a34a' : '#f59e0b' }}
      >
        {u.status === 'suspended' ? <UserCheck size={14} /> : <UserX size={14} />}
      </button>
      <button
        onClick={() => setDeleteConfirm(u.id)}
        className="btn btn-ghost btn-icon"
        title="Delete User"
        style={{ color: '#ef4444' }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  const headerAction = (
    <div style={{ display: 'flex', gap: 8 }}>
      <button className="btn btn-primary" onClick={() => { setShowAddModal(true); setForm(emptyForm); }} style={{ gap: 6 }}>
        <Plus size={14} /> Add User
      </button>
      <button className="btn btn-success" onClick={() => exportToCSV(filtered)} style={{ gap: 6 }}>
        <Download size={14} /> Export CSV
      </button>
    </div>
  );

  const verified = consumers.filter((c: any) => c.kycStatus === 'VERIFIED').length;
  const pending = consumers.filter((c: any) => c.kycStatus === 'PENDING').length;
  const suspended = consumers.filter((c: any) => c.status === 'suspended').length;
  const totalLTV = consumers.reduce((s: number, c: any) => s + Number(c.ltv || 0), 0);

  return (
    <div>
      <Topbar title="User Management" subtitle="View, add, edit, suspend or delete consumer accounts" />

      <div className="admin-page animate-fadeIn">

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Users', value: consumers.length, iconBg: '#dbeafe', iconColor: '#1d4ed8', Icon: Users },
            { label: 'KYC Verified', value: verified, iconBg: '#dcfce7', iconColor: '#16a34a', Icon: ShieldCheck },
            { label: 'Pending KYC', value: pending, iconBg: '#fef9c3', iconColor: '#ca8a04', Icon: Clock },
            { label: 'Suspended', value: suspended, iconBg: '#fee2e2', iconColor: '#ef4444', Icon: Ban },
            { label: 'Total LTV', value: `₹${totalLTV >= 100000 ? (totalLTV / 100000).toFixed(1) + 'L' : totalLTV.toLocaleString('en-IN')}`, iconBg: '#f3e8ff', iconColor: '#9333ea', Icon: CheckCircle2 },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ padding: '14px 16px' }}>
              <div>
                <div className="stat-card-label" style={{ fontSize: 11 }}>{s.label}</div>
                <div className="stat-card-value" style={{ fontSize: 22 }}>{isLoading ? '...' : s.value}</div>
              </div>
              <div className="stat-card-icon" style={{ width: 36, height: 36, borderRadius: 8, background: s.iconBg, color: s.iconColor }}>
                <s.Icon size={16} />
              </div>
            </div>
          ))}
        </div>

        {error ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <ShieldAlert size={36} style={{ color: '#dc2626', margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 600, fontSize: 15 }}>Error loading consumers</div>
            <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>Please try refreshing the page.</div>
          </div>
        ) : (
          <DataTable
            title="Consumer Directory"
            description={`${filtered.length} users registered`}
            columns={columns}
            data={filtered}
            onSearch={setSearch}
            isLoading={isLoading}
            actions={actions}
            headerAction={headerAction}
            emptyMessage="No consumers found"
          />
        )}
      </div>

      {/* Add / Edit User Modal */}
      {(showAddModal || editUser) && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 460, padding: 32, position: 'relative' }}>
            <button
              onClick={() => { setShowAddModal(false); setEditUser(null); setForm(emptyForm); }}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}
            >
              <X size={18} />
            </button>

            <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>
              {editUser ? 'Edit User' : 'Add New User'}
            </h2>
            <p style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 24 }}>
              {editUser ? 'Update the consumer account details.' : 'Create a new consumer account on the platform.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Rahul Sharma' },
                { label: 'Email Address', key: 'email', type: 'email', placeholder: 'user@example.com' },
                { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 9876543210' },
                ...(!editUser ? [{ label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' }] : []),
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={(form as any)[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 14px',
                      background: 'hsl(var(--muted) / 0.4)',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 10, fontSize: 13,
                      color: 'hsl(var(--foreground))',
                      outline: 'none',
                    }}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => {
                    if (editUser) {
                      editMutation.mutate({ id: editUser.id, data: { name: form.name, email: form.email, phone: form.phone } });
                    } else {
                      addMutation.mutate(form);
                    }
                  }}
                  disabled={addMutation.isPending || editMutation.isPending}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {(addMutation.isPending || editMutation.isPending) ? 'Saving...' : editUser ? 'Save Changes' : 'Create User'}
                </button>
                <button
                  onClick={() => { setShowAddModal(false); setEditUser(null); setForm(emptyForm); }}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32, textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={22} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Delete User?</h2>
            <p style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', marginBottom: 24 }}>
              This action is irreversible. All associated data will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                style={{ flex: 1, padding: '10px 0', background: '#ef4444', color: 'white', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
