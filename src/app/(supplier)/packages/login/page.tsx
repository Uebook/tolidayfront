'use client';

import Link from 'next/link';
import { Map, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function LoginPage() {
       const router = useRouter();
       const [isLoading, setIsLoading] = useState(false);
       const [email, setEmail] = useState('');
       const [password, setPassword] = useState('');
       const [showPassword, setShowPassword] = useState(false);
       const [error, setError] = useState('');

       const handleLogin = async (e: React.FormEvent) => {
              e.preventDefault();
              setIsLoading(true);
              setError('');
              try {
                     const res = await api.post('/auth/login', { email, password });
                     localStorage.setItem('token', res.data.token);
                     router.push('/packages/dashboard');
              } catch (err: any) {
                     setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
              } finally {
                     setIsLoading(false);
              }
       };

       return (
              <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
                     {/* Background elements */}
                     <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
                     <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/15 blur-[120px]" />

                     <div className="w-full max-w-[440px] z-10">
                            {/* Logo & Header */}
                            <div className="text-center mb-10">
                                   <div
                                          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-2xl"
                                          style={{
                                                 background: 'linear-gradient(135deg, hsl(142 70% 45%), hsl(162 80% 40%))',
                                                 boxShadow: '0 8px 30px rgba(20, 180, 100, 0.4)'
                                          }}
                                   >
                                          <Map size={32} color="white" />
                                   </div>
                                   <h1 className="text-3xl font-extrabold text-[hsl(var(--foreground))] tracking-tight mb-2">Tour Operator Portal</h1>
                                   <p style={{ color: 'hsl(var(--muted-foreground))' }}>Login to manage your sightseeing packages</p>
                            </div>

                            {/* Login Card */}
                            <div className="glass-card p-8 md:p-10 border-[var(--glass-border-light)] shadow-2xl relative">
                                   <form onSubmit={handleLogin} className="space-y-6">
                                          {error && (
                                                 <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                                                        <AlertCircle size={16} />
                                                        {error}
                                                 </div>
                                          )}
                                          <div className="space-y-2">
                                                 <label className="text-sm font-medium text-[hsl(var(--foreground))]/90 ml-1">Email Address</label>
                                                 <div className="relative group">
                                                        <Mail
                                                               className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-accent"
                                                               size={18}
                                                               style={{ color: 'hsl(var(--muted-foreground) / 0.6)' }}
                                                        />
                                                        <input
                                                               type="email"
                                                               value={email ?? ''}
                                                               onChange={(e) => setEmail(e.target.value)}
                                                               placeholder="name@company.com"
                                                               className="form-input !pl-12 bg-[var(--table-header)] hover:bg-[var(--table-hover)] transition-all"
                                                               required
                                                        />
                                                 </div>
                                          </div>

                                          <div className="space-y-2">
                                                 <div className="flex justify-between items-center px-1">
                                                        <label className="text-sm font-medium text-[hsl(var(--foreground))]/90">Password</label>
                                                        <Link
                                                               href="/forgot-password"
                                                               className="text-xs font-semibold text-accent hover:underline"
                                                        >
                                                               Forgot Password?
                                                        </Link>
                                                 </div>
                                                 <div className="relative group">
                                                        <Lock
                                                               className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-accent"
                                                               size={18}
                                                               style={{ color: 'hsl(var(--muted-foreground) / 0.6)' }}
                                                        />
                                                        <input
                                                               type={showPassword ? 'text' : 'password'}
                                                               value={password ?? ''}
                                                               onChange={(e) => setPassword(e.target.value)}
                                                               placeholder="••••••••"
                                                               className="form-input !pl-12 bg-[var(--table-header)] hover:bg-[var(--table-hover)] transition-all"
                                                               required
                                                        />
                                                        <button
                                                               type="button"
                                                               onClick={() => setShowPassword(!showPassword)}
                                                               className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                                                        >
                                                               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button> <div className="mt-6 p-4 rounded-xl bg-accent/5 border border-accent/10"><p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Test Credentials</p><div className="flex justify-between items-center text-xs"><code className="text-foreground/70">package@test.com</code><code className="text-foreground/70">test123</code></div></div>
                                                 </div>
                                          </div>

                                          <button
                                                 type="submit"
                                                 disabled={isLoading}
                                                 className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 group mt-2"
                                          >
                                                 {isLoading ? (
                                                        <div className="w-5 h-5 border-2 border-[var(--glass-border-light)] border-t-white rounded-full animate-spin" />
                                                 ) : (
                                                        <>
                                                               Sign In <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                                        </>
                                                 )}
                                          </button> <div className="mt-6 p-4 rounded-xl bg-accent/5 border border-accent/10"><p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Test Credentials</p><div className="flex justify-between items-center text-xs"><code className="text-foreground/70">package@test.com</code><code className="text-foreground/70">test123</code></div></div>
                                   </form>
                            </div>

                            <p className="text-center mt-8 text-sm text-[hsl(var(--foreground))]/60">
                                   Don't have an account? {' '}
                                   <Link href="/packages/signup" className="text-accent font-bold hover:underline transition-all">
                                          Register Tour Agency
                                   </Link>
                            </p>
                     </div>
              </div>
       );
}
