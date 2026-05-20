'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import api from '@/lib/api';

export default function AdminLoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            router.push('/admin/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100 blur-[150px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100 blur-[150px]" />

            <div className="w-full max-w-[460px] z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-8 bg-white border border-slate-200 shadow-xl relative group overflow-hidden">
                        <Shield size={48} className="text-blue-600 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">ADMIN OS</h1>
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-px w-8 bg-blue-200" />
                            <p className="text-blue-600 text-xs font-black uppercase tracking-[0.4em]">Secure Access Node</p>
                            <div className="h-px w-8 bg-blue-200" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                    
                    <form onSubmit={handleLogin} className="space-y-8">
                        {error && (
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold animate-in fade-in zoom-in-95 duration-300">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Identification</label>
                            <div className="relative group">
                                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ADMIN IDENTIFIER"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 pl-14 pr-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-bold tracking-tight"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Security Key</label>
                                <Link href="#" className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors">Recover</Link>
                            </div>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 pl-14 pr-14 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-bold"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 p-5 rounded-[2rem] bg-slate-50 border border-slate-100">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">System Access Key</p>
                            <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-slate-600">
                                <code>admin@toliday.com</code>
                                <code>adminpassword123</code>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 group transition-all duration-300 transform active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    INITIALIZE SESSION <Zap size={18} className="group-hover:scale-125 group-hover:text-yellow-300 transition-all" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 flex items-start gap-4 p-5 bg-slate-50 border border-slate-100 rounded-3xl group/note hover:border-blue-100 transition-all">
                        <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase tracking-wider transition-colors">
                            Session activity is encrypted and logged. Unauthorized access attempts will trigger security protocols.
                        </p>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-[10px] font-black uppercase tracking-[0.2em] transition-all group">
                        <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                        Return to Public Portal
                    </Link>
                </div>
            </div>
        </div>
    );
}

