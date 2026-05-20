'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { 
    Settings, Bell, Lock, Shield, Eye, EyeOff,
    UserX, Smartphone, Mail, Globe, Save,
    CheckCircle2, AlertTriangle, Key, ChevronRight
} from 'lucide-react';
import api from '@/lib/api';

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // In a real app, we'd have a /auth/me or similar
            // For now, let's get the ID from the token and fetch
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const payload = JSON.parse(atob(token.split('.')[1]));
            const res = await api.get(`/staff/${payload.sub}`);
            setProfile(res.data);
        } catch (err) {
            console.error('Failed to fetch settings', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSettings = async () => {
        setIsSaving(true);
        try {
            await api.patch(`/staff/${profile.id}`, {
                emailNotifications: profile.emailNotifications,
                smsNotifications: profile.smsNotifications,
                twoFactorEnabled: profile.twoFactorEnabled
            });
            alert('Settings updated successfully!');
        } catch (err) {
            alert('Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            alert('Passwords do not match');
            return;
        }
        try {
            await api.patch(`/staff/${profile.id}/reset-password`, {
                password: passwordData.new
            });
            alert('Password changed successfully!');
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (err) {
            alert('Failed to change password');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white text-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black">
            <Topbar 
                title="Account Settings" 
                subtitle="Manage your notification preferences, security and account access"
            />

            <div className="p-8 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
                
                {/* Notification Settings */}
                <section className="space-y-6">
                    <h3 className="text-xl font-black flex items-center gap-3 italic">
                        <Bell className="text-blue-600" /> Notifications
                    </h3>
                    <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 space-y-6">
                        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl group hover:border-black transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest">Email Alerts</p>
                                    <p className="text-[10px] font-bold text-slate-400">Receive booking updates and payment alerts via email</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={profile?.emailNotifications}
                                    onChange={(e) => setProfile({...profile, emailNotifications: e.target.checked})}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl group hover:border-black transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest">SMS Notifications</p>
                                    <p className="text-[10px] font-bold text-slate-400">Get instant SMS alerts for urgent booking requests</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={profile?.smsNotifications}
                                    onChange={(e) => setProfile({...profile, smsNotifications: e.target.checked})}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Password & Security */}
                <section className="space-y-6">
                    <h3 className="text-xl font-black flex items-center gap-3 italic">
                        <Lock className="text-blue-600" /> Security
                    </h3>
                    <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 space-y-8">
                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Current Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? 'text' : 'password'}
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-black font-bold text-sm"
                                            value={passwordData.current}
                                            onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div /> {/* Spacer */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Password</label>
                                    <input 
                                        type="password"
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-black font-bold text-sm"
                                        value={passwordData.new}
                                        onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm New Password</label>
                                    <input 
                                        type="password"
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-black font-bold text-sm"
                                        value={passwordData.confirm}
                                        onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                                    />
                                </div>
                            </div>
                            <button className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10">
                                <Key size={16} /> Update Password
                            </button>
                        </form>

                        <div className="pt-8 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-widest">Two-Factor Authentication</p>
                                        <p className="text-[10px] font-bold text-slate-400">Add an extra layer of security to your account</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={profile?.twoFactorEnabled}
                                        onChange={(e) => setProfile({...profile, twoFactorEnabled: e.target.checked})}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dangerous Area */}
                <section className="space-y-6">
                    <h3 className="text-xl font-black flex items-center gap-3 italic text-red-600">
                        <AlertTriangle className="text-red-600" /> Danger Zone
                    </h3>
                    <div className="border-2 border-red-100 rounded-[32px] p-8 flex items-center justify-between bg-red-50/30">
                        <div>
                            <p className="text-sm font-black uppercase tracking-widest text-red-600">Deactivate Account</p>
                            <p className="text-[10px] font-bold text-slate-400">Temporarily disable your account and listings from the platform</p>
                        </div>
                        <button className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
                            Deactivate
                        </button>
                    </div>
                </section>

                {/* Final Actions */}
                <div className="flex justify-end pt-10 border-t border-slate-100">
                    <button 
                        onClick={handleUpdateSettings}
                        disabled={isSaving}
                        className="px-12 py-4 bg-black text-white rounded-2xl font-black text-sm shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        Save All Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
