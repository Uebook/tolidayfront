'use client';

import Link from 'next/link';
import {
       Bus, User, Mail, Phone, Building2, MapPin,
       CheckCircle2, ArrowRight, ArrowLeft,
       FileText, ShieldCheck, Upload, Landmark, Lock
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
       const router = useRouter();
       const [step, setStep] = useState(1);
       const [isLoading, setIsLoading] = useState(false);

       const nextStep = () => setStep(s => s + 1);
       const prevStep = () => setStep(s => s - 1);

       const handleSubmit = (e: React.FormEvent) => {
              e.preventDefault();
              setIsLoading(true);
              // Simulate local registration success
              setTimeout(() => {
                     router.push('/buses/dashboard');
              }, 2000);
       };

       return (
              <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden backdrop-blur-3xl">
                     {/* Background elements */}
                     <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
                     <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/15 blur-[120px]" />

                     <div className="w-full max-w-[700px] z-10">
                            {/* Header */}
                            <div className="flex items-center gap-4 mb-8">
                                   <div
                                          className="flex items-center justify-center w-12 h-12 rounded-xl shadow-xl"
                                          style={{ background: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(25 90% 45%))' }}
                                   >
                                          <Bus size={24} color="white" />
                                   </div>
                                   <div>
                                          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Bus Operator Onboarding</h1>
                                          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Register your fleet and routes to start operations</p>
                                   </div>
                            </div>

                            {/* Progress Bar with Labels */}
                            <div className="mb-10 group">
                                   <div className="flex justify-between mb-3 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--foreground))]/40">
                                          <span className={step >= 1 ? 'text-accent' : ''}>Contact</span>
                                          <span className={step >= 2 ? 'text-accent' : ''}>Business</span>
                                          <span className={step >= 3 ? 'text-accent' : ''}>Banking</span>
                                          <span className={step >= 4 ? 'text-accent' : ''}>Documents</span>
                                          <span className={step >= 5 ? 'text-accent' : ''}>Account</span>
                                   </div>
                                   <div className="flex gap-2">
                                          {[1, 2, 3, 4, 5].map((s) => (
                                                 <div
                                                        key={s}
                                                        className="h-1.5 rounded-full flex-1 transition-all duration-500"
                                                        style={{
                                                               background: step >= s ? 'hsl(var(--accent))' : 'var(--glass-border)',
                                                               boxShadow: step >= s ? '0 0 10px hsl(var(--accent) / 0.4)' : 'none'
                                                        }}
                                                 />
                                          ))}
                                   </div>
                            </div>

                            <div className="glass-card p-8 md:p-10 shadow-2xl relative">
                                   <form onSubmit={handleSubmit}>
                                          {/* STEP 1: PERSONAL INFO */}
                                          {step === 1 && (
                                                 <div className="space-y-6 animate-fadeIn">
                                                        <div className="flex items-center gap-3 mb-2">
                                                               <div className="p-2 rounded-lg bg-accent/10 text-accent"><User size={20} /></div>
                                                               <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Contact Information</h2>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                               <div className="space-y-2">
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">First Name</label>
                                                                      <input type="text" placeholder="John" className="form-input" required />
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Last Name</label>
                                                                      <input type="text" placeholder="Doe" className="form-input" required />
                                                               </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Email Address</label>
                                                               <div className="relative group">
                                                                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground))]/30 group-focus-within:text-accent transition-colors" />
                                                                      <input type="email" placeholder="john@hotelbrand.com" className="form-input pl-11" required />
                                                               </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Mobile Number</label>
                                                               <div className="relative group">
                                                                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground))]/30 group-focus-within:text-accent transition-colors" />
                                                                      <input type="tel" placeholder="+91 98765 43210" className="form-input pl-11" required />
                                                               </div>
                                                        </div>
                                                        <button type="button" onClick={nextStep} className="btn-primary w-full py-4 flex items-center justify-center gap-2 group mt-4">
                                                               Next: Business Details <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                                        </button>
                                                 </div>
                                          )}

                                          {/* STEP 2: BUSINESS DETAILS */}
                                          {step === 2 && (
                                                 <div className="space-y-6 animate-fadeIn">
                                                        <div className="flex items-center gap-3 mb-2">
                                                               <div className="p-2 rounded-lg bg-accent/10 text-accent"><Building2 size={20} /></div>
                                                               <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Business Details</h2>
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Legal Business Name</label>
                                                               <input type="text" placeholder="Grand Luxury Hotels Pvt Ltd" className="form-input" required />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                               <div className="space-y-2">
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Property Type</label>
                                                                      <select className="form-input">
                                                                             <option>Hotel</option>
                                                                             <option>Resort</option>
                                                                             <option>Villa / Farmhouse</option>
                                                                             <option>Boutique Hotel</option>
                                                                      </select>
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">City</label>
                                                                      <div className="relative group">
                                                                             <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground))]/30 group-focus-within:text-accent transition-colors" />
                                                                             <input type="text" placeholder="New Delhi" className="form-input pl-11" required />
                                                                      </div>
                                                               </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Complete Address</label>
                                                               <textarea placeholder="Plot 12, Sector 44, Gurgaon..." className="form-input min-h-[80px] resize-none"></textarea>
                                                        </div>
                                                        <div className="flex gap-4 mt-4">
                                                               <button type="button" onClick={prevStep} className="flex-1 py-4 bg-[var(--table-header)] hover:bg-[var(--table-header)] rounded-xl text-[hsl(var(--foreground))] font-medium border border-[var(--glass-border-light)] transition-all flex items-center justify-center gap-2">
                                                                      <ArrowLeft size={18} /> Back
                                                               </button>
                                                               <button type="button" onClick={nextStep} className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 group">
                                                                      Next: Banking <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                                               </button>
                                                        </div>
                                                 </div>
                                          )}

                                          {/* STEP 3: BANKING */}
                                          {step === 3 && (
                                                 <div className="space-y-6 animate-fadeIn">
                                                        <div className="flex items-center gap-3 mb-2">
                                                               <div className="p-2 rounded-lg bg-accent/10 text-accent"><Landmark size={20} /></div>
                                                               <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Bank Account for Payouts</h2>
                                                        </div>
                                                        <p className="text-sm text-[hsl(var(--foreground))]/50 -mt-2">We transfer your earnings every 7 days to this account.</p>

                                                        <div className="space-y-2">
                                                               <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Account Holder Name</label>
                                                               <input type="text" placeholder="As per bank records" className="form-input" required />
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Bank Name</label>
                                                               <input type="text" placeholder="e.g. HDFC Bank, ICICI Bank" className="form-input" required />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                               <div className="space-y-2">
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Account Number</label>
                                                                      <input type="password" placeholder="••••••••••••" className="form-input" required />
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">IFSC Code</label>
                                                                      <input type="text" placeholder="HDFC0001234" className="form-input" required />
                                                               </div>
                                                        </div>

                                                        <div className="flex gap-4 mt-6">
                                                               <button type="button" onClick={prevStep} className="flex-1 py-4 bg-[var(--table-header)] hover:bg-[var(--table-header)] rounded-xl text-[hsl(var(--foreground))] font-medium border border-[var(--glass-border-light)] transition-all flex items-center justify-center gap-2">
                                                                      <ArrowLeft size={18} /> Back
                                                               </button>
                                                               <button type="button" onClick={nextStep} className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 group">
                                                                      Next: Documents <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                                               </button>
                                                        </div>
                                                 </div>
                                          )}

                                          {/* STEP 4: DOCUMENTS & GST */}
                                          {step === 4 && (
                                                 <div className="space-y-6 animate-fadeIn">
                                                        <div className="flex items-center gap-3 mb-2">
                                                               <div className="p-2 rounded-lg bg-accent/10 text-accent"><FileText size={20} /></div>
                                                               <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">GST & Legal Documents</h2>
                                                        </div>

                                                        <div className="space-y-2">
                                                               <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">GST Number</label>
                                                               <input type="text" placeholder="07AADCG1234F1Z1" className="form-input" required />
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-3">
                                                               {[
                                                                      { label: 'GST Certificate', icon: FileText },
                                                                      { label: 'PAN Card (Business/Owner)', icon: ShieldCheck },
                                                                      { label: 'Property License / Trade License', icon: Upload }
                                                               ].map((doc, idx) => (
                                                                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[var(--table-header)] border border-dashed border-[var(--glass-border-light)] hover:border-accent/40 transition-colors cursor-pointer group">
                                                                             <div className="flex items-center gap-3">
                                                                                    <doc.icon size={18} className="text-[hsl(var(--foreground))]/30 group-hover:text-accent transition-colors" />
                                                                                    <span className="text-sm font-medium text-[hsl(var(--foreground))]/80">{doc.label}</span>
                                                                             </div>
                                                                             <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Upload PDF/JPG</span>
                                                                      </div>
                                                               ))}
                                                        </div>

                                                        <div className="flex gap-4 mt-6">
                                                               <button type="button" onClick={prevStep} className="flex-1 py-4 bg-[var(--table-header)] hover:bg-[var(--table-header)] rounded-xl text-[hsl(var(--foreground))] font-medium border border-[var(--glass-border-light)] transition-all flex items-center justify-center gap-2">
                                                                      <ArrowLeft size={18} /> Back
                                                               </button>
                                                               <button type="button" onClick={nextStep} className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 group">
                                                                      Next: Account Settings <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                                               </button>
                                                        </div>
                                                 </div>
                                          )}

                                          {/* STEP 5: FINAL CREDENTIALS */}
                                          {step === 5 && (
                                                 <div className="space-y-6 animate-fadeIn">
                                                        <div className="flex items-center gap-3 mb-2">
                                                               <div className="p-2 rounded-lg bg-accent/10 text-accent"><Lock size={20} /></div>
                                                               <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Account Security</h2>
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Create Password</label>
                                                               <input type="password" placeholder="••••••••" className="form-input" required />
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Confirm Password</label>
                                                               <input type="password" placeholder="••••••••" className="form-input" required />
                                                        </div>
                                                        <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 flex gap-4 items-start">
                                                               <CheckCircle2 size={20} className="text-accent flex-shrink-0 mt-0.5" />
                                                               <p className="text-[11px] leading-relaxed text-[hsl(var(--foreground))]/70">
                                                                      By submitting, you agree to TolidayTrip's <span className="text-accent underline cursor-pointer">Supplier Agreement</span>. Your property registration will be reviewed within 24–48 hours.
                                                               </p>
                                                        </div>
                                                        <div className="flex gap-4 mt-6">
                                                               <button type="button" onClick={prevStep} className="flex-1 py-4 bg-[var(--table-header)] hover:bg-[var(--table-header)] rounded-xl text-[hsl(var(--foreground))] font-medium border border-[var(--glass-border-light)] transition-all flex items-center justify-center gap-2">
                                                                      <ArrowLeft size={18} /> Back
                                                               </button>
                                                               <button type="submit" disabled={isLoading} className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 group">
                                                                      {isLoading ? (
                                                                             <div className="w-5 h-5 border-2 border-[var(--glass-border-light)] border-t-white rounded-full animate-spin" />
                                                                      ) : (
                                                                             <>Register Operator <CheckCircle2 size={18} /></>
                                                                      )}
                                                               </button>
                                                        </div>
                                                 </div>
                                          )}
                                   </form>
                            </div>

                            <p className="text-center mt-8 text-sm text-[hsl(var(--foreground))]/60">
                                   Already registered? {' '}
                                   <Link href="/buses/login" className="text-accent font-bold hover:underline">
                                          Login to Portal
                                   </Link>
                            </p>
                     </div>
              </div>
       );
}
