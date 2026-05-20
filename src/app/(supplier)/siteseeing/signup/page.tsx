'use client';

import Link from 'next/link';
import {
       Palmtree, User, Mail, Phone, Building2, MapPin,
       CheckCircle2, ArrowRight, ArrowLeft, CreditCard,
       FileText, ShieldCheck, Upload, Landmark, Lock, AlertCircle, Eye, EyeOff, Map, Globe
} from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function SiteSeeingSignupPage() {
       const router = useRouter();
       const [step, setStep] = useState(1);
       const [isLoading, setIsLoading] = useState(false);
       const [showAccount, setShowAccount] = useState(false);
       const [showPassword, setShowPassword] = useState(false);
       const [error, setError] = useState('');
       const [isSignedUp, setIsSignedUp] = useState(false);

       // Form State
       const [formData, setFormData] = useState({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              businessName: '',
              businessType: 'Sole Proprietor',
              website: '',
              yearsInOperation: '',
              city: '',
              operatingArea: '',
              address: '',
              // Banking
              accountHolder: '',
              bankName: '',
              accountNumber: '',
              ifsc: '',
              // Legal
              gstNumber: '',
              panNumber: '',
              tourismLicenseNumber: '',
              password: '',
              confirmPassword: '',
       });

       const [files, setFiles] = useState<{ [key: string]: File | null }>({
              gst: null,
              pan: null,
              license: null,
              cheque: null
       });

       const fileInputRefs = {
              gst: useRef<HTMLInputElement>(null),
              pan: useRef<HTMLInputElement>(null),
              license: useRef<HTMLInputElement>(null),
              cheque: useRef<HTMLInputElement>(null)
       };

       const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
              const { name, value } = e.target;
              setFormData(prev => ({ ...prev, [name]: value }));
       };

       const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files[0]) {
                     setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
              }
       };

       const nextStep = () => setStep(s => s + 1);
       const prevStep = () => setStep(s => s - 1);

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault();
              if (formData.password !== formData.confirmPassword) {
                     setError('Passwords do not match');
                     return;
              }

              setIsLoading(true);
              setError('');

              try {
                     const signupData = {
                            name: `${formData.firstName} ${formData.lastName}`.trim(),
                            email: formData.email,
                            password: formData.password,
                            contactNumber: formData.phone,
                            ownerFirstName: formData.firstName,
                            ownerLastName: formData.lastName,
                            ownerPhone: formData.phone,
                            businessName: formData.businessName,
                            businessType: formData.businessType,
                            website: formData.website,
                            yearsInOperation: formData.yearsInOperation,
                            city: formData.city,
                            operatingArea: formData.operatingArea,
                            address: formData.address,
                            bankHolder: formData.accountHolder,
                            bankName: formData.bankName,
                            bankAccount: formData.accountNumber,
                            bankIfsc: formData.ifsc,
                            gstNumber: formData.gstNumber,
                            panNumber: formData.panNumber,
                            tourismLicenseNumber: formData.tourismLicenseNumber,
                            partnerType: 'SITESEEING'
                     };

                     const formDataToSend = new FormData();

                     // Append all text fields
                     Object.entries(signupData).forEach(([key, value]) => {
                            if (value) formDataToSend.append(key, value as string);
                     });

                     // Append files
                     if (files.gst) formDataToSend.append('gst', files.gst);
                     if (files.pan) formDataToSend.append('pan', files.pan);
                     if (files.license) formDataToSend.append('license', files.license);
                     if (files.cheque) formDataToSend.append('cheque', files.cheque);

                     await api.post('/auth/signup', formDataToSend);

                     setIsSignedUp(true);
                     window.scrollTo(0, 0);
              } catch (err: any) {
                     setError(err.response?.data?.message || 'Registration failed. Please check all fields.');
                     console.error(err);
              } finally {
                     setIsLoading(false);
              }
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
                                          style={{ background: 'linear-gradient(135deg, hsl(228 80% 55%), hsl(195 90% 45%))' }}
                                   >
                                          <Map size={24} color="white" />
                                   </div>
                                   <div>
                                          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Sightseeing Partner Onboarding</h1>
                                          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Register your business to start listing tours</p>
                                   </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-10 group">
                                   <div className="flex justify-between mb-3 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--foreground))]/40">
                                          <span className={step >= 1 ? 'text-accent' : ''}>Contact</span>
                                          <span className={step >= 2 ? 'text-accent' : ''}>Business</span>
                                          <span className={step >= 3 ? 'text-accent' : ''}>Legal</span>
                                          <span className={step >= 4 ? 'text-accent' : ''}>Banking</span>
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
                                   {isSignedUp ? (
                                          <div className="text-center py-10 animate-fadeIn">
                                                 <div className="flex justify-center mb-6">
                                                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/20">
                                                               <CheckCircle2 size={40} />
                                                        </div>
                                                 </div>
                                                 <h2 className="text-3xl font-bold text-foreground mb-4">Application Submitted!</h2>
                                                 <p className="text-muted-foreground leading-relaxed mb-8 max-w-md mx-auto">
                                                        Thank you for registering as a Sightseeing partner. Our team is reviewing your documents.
                                                        <span className="block mt-2 font-bold text-accent">You'll be able to setup your tour packages once approved.</span>
                                                        We'll notify you via email (usually within 24-48 hours).
                                                 </p>
                                                 <div className="space-y-4">
                                                        <Link
                                                               href="/siteseeing/login"
                                                               className="btn-primary w-full py-4 flex items-center justify-center gap-2"
                                                        >
                                                               Go to Login <ArrowRight size={18} />
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground">
                                                               Need help? <Link href="/support" className="text-accent underline">Contact Support</Link>
                                                        </p>
                                                 </div>
                                          </div>
                                   ) : (
                                          <form onSubmit={handleSubmit}>
                                                 {error && (
                                                        <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                                                               <AlertCircle size={16} />
                                                               {error}
                                                        </div>
                                                 )}

                                                 {/* STEP 1: CONTACT INFO */}
                                                 {step === 1 && (
                                                        <div className="space-y-6 animate-fadeIn">
                                                               <div className="flex items-center gap-3 mb-2">
                                                                      <div className="p-2 rounded-lg bg-accent/10 text-accent"><User size={20} /></div>
                                                                      <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Contact Information</h2>
                                                               </div>
                                                               <div className="grid grid-cols-2 gap-4">
                                                                      <div className="space-y-2">
                                                                             <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">First Name</label>
                                                                             <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" className="form-input" required />
                                                                      </div>
                                                                      <div className="space-y-2">
                                                                             <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Last Name</label>
                                                                             <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" className="form-input" required />
                                                                      </div>
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Email Address</label>
                                                                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@tours.com" className="form-input" required />
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Mobile Number</label>
                                                                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" className="form-input" required />
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
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Registered Business Name</label>
                                                                      <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="Adventure Tours Pvt Ltd" className="form-input" required />
                                                               </div>
                                                               <div className="grid grid-cols-2 gap-4">
                                                                      <div className="space-y-2">
                                                                             <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Business Type</label>
                                                                             <select name="businessType" value={formData.businessType} onChange={handleInputChange} className="form-input">
                                                                                    <option>Sole Proprietor</option>
                                                                                    <option>Partnership</option>
                                                                                    <option>Pvt Ltd Company</option>
                                                                                    <option>LLP</option>
                                                                             </select>
                                                                      </div>
                                                                      <div className="space-y-2">
                                                                             <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Years in Operation</label>
                                                                             <input type="number" name="yearsInOperation" value={formData.yearsInOperation} onChange={handleInputChange} placeholder="e.g. 5" className="form-input" required />
                                                                      </div>
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Website URL (Optional)</label>
                                                                      <div className="relative group">
                                                                             <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground))]/30 group-focus-within:text-accent transition-colors" />
                                                                             <input type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://www.youragency.com" className="form-input pl-11" />
                                                                      </div>
                                                               </div>
                                                               <div className="grid grid-cols-2 gap-4">
                                                                      <div className="space-y-2">
                                                                             <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Base City / State</label>
                                                                             <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="New Delhi" className="form-input" required />
                                                                      </div>
                                                                      <div className="space-y-2">
                                                                             <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Operating Area</label>
                                                                             <input type="text" name="operatingArea" value={formData.operatingArea} onChange={handleInputChange} placeholder="North India, Kerala, etc." className="form-input" required />
                                                                      </div>
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Office Address</label>
                                                                      <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Address line 1, Area..." className="form-input min-h-[80px] resize-none"></textarea>
                                                               </div>
                                                               <div className="flex gap-4 mt-4">
                                                                      <button type="button" onClick={prevStep} className="flex-1 py-4 bg-[var(--table-header)] rounded-xl text-[hsl(var(--foreground))] font-medium border border-[var(--glass-border-light)] transition-all flex items-center justify-center gap-2">
                                                                             <ArrowLeft size={18} /> Back
                                                                      </button>
                                                                      <button type="button" onClick={nextStep} className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 group">
                                                                             Next: Legal & Tax <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 )}

                                                 {/* STEP 3: LEGAL & TAX */}
                                                 {step === 3 && (
                                                        <div className="space-y-6 animate-fadeIn">
                                                               <div className="flex items-center gap-3 mb-2">
                                                                      <div className="p-2 rounded-lg bg-accent/10 text-accent"><FileText size={20} /></div>
                                                                      <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Tax & Licensing</h2>
                                                               </div>
                                                               <div className="grid grid-cols-2 gap-4">
                                                                      <div className="space-y-2">
                                                                             <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">GST Number</label>
                                                                             <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="07AADCG1234F1Z1" className="form-input" required />
                                                                      </div>
                                                                      <div className="space-y-2">
                                                                             <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">PAN Number</label>
                                                                             <input type="text" name="panNumber" value={formData.panNumber} onChange={handleInputChange} placeholder="ABCDE1234F" className="form-input" required />
                                                                      </div>
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Tourism License / Registration No.</label>
                                                                      <input type="text" name="tourismLicenseNumber" value={formData.tourismLicenseNumber} onChange={handleInputChange} placeholder="ST-12345- Mysore" className="form-input" required />
                                                               </div>

                                                               <div className="grid grid-cols-1 gap-3">
                                                                      {[
                                                                             { key: 'gst', label: 'GST Certificate (PDF/JPG)', icon: FileText },
                                                                             { key: 'pan', label: 'PAN Card (Business/Owner)', icon: ShieldCheck },
                                                                             { key: 'license', label: 'Tourism License / Registration', icon: Upload }
                                                                      ].map((doc) => (
                                                                             <div
                                                                                    key={doc.key}
                                                                                    onClick={() => fileInputRefs[doc.key as keyof typeof fileInputRefs].current?.click()}
                                                                                    className="flex items-center justify-between p-4 rounded-xl bg-[var(--table-header)] border border-dashed border-[var(--glass-border-light)] hover:border-accent/40 transition-colors cursor-pointer group"
                                                                             >
                                                                                    <input
                                                                                           type="file"
                                                                                           ref={fileInputRefs[doc.key as keyof typeof fileInputRefs]}
                                                                                           className="hidden"
                                                                                           onChange={(e) => handleFileChange(doc.key, e)}
                                                                                    />
                                                                                    <div className="flex items-center gap-3">
                                                                                           <doc.icon size={18} className={`transition-colors ${files[doc.key] ? 'text-accent' : 'text-[hsl(var(--foreground))]/30 group-hover:text-accent'}`} />
                                                                                           <span className="text-sm font-medium text-[hsl(var(--foreground))]/80">
                                                                                                  {files[doc.key] ? files[doc.key]?.name : doc.label}
                                                                                           </span>
                                                                                    </div>
                                                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                                                                                           {files[doc.key] ? 'Change' : 'Upload'}
                                                                                    </span>
                                                                             </div>
                                                                      ))}
                                                               </div>

                                                               <div className="flex gap-4 mt-6">
                                                                      <button type="button" onClick={prevStep} className="flex-1 py-4 bg-[var(--table-header)] rounded-xl text-[hsl(var(--foreground))] font-medium border border-[var(--glass-border-light)] transition-all flex items-center justify-center gap-2">
                                                                             <ArrowLeft size={18} /> Back
                                                                      </button>
                                                                      <button type="button" onClick={nextStep} className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 group">
                                                                             Next: Banking <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 )}

                                                 {/* STEP 4: BANKING */}
                                                 {step === 4 && (
                                                        <div className="space-y-6 animate-fadeIn">
                                                               <div className="flex items-center gap-3 mb-2">
                                                                      <div className="p-2 rounded-lg bg-accent/10 text-accent"><Landmark size={20} /></div>
                                                                      <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Banking Details</h2>
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Account Holder Name</label>
                                                                      <input type="text" name="accountHolder" value={formData.accountHolder} onChange={handleInputChange} placeholder="Name as per Passbook" className="form-input" required />
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Bank Name</label>
                                                                      <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="e.g. HDFC Bank, ICICI Bank" className="form-input" required />
                                                               </div>
                                                               <div className="grid grid-cols-2 gap-4">
                                                                      <div className="space-y-2">
                                                                             <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Account Number</label>
                                                                             <div className="relative">
                                                                                    <input
                                                                                           type={showAccount ? 'text' : 'password'}
                                                                                           name="accountNumber"
                                                                                           value={formData.accountNumber}
                                                                                           onChange={handleInputChange}
                                                                                           placeholder="••••••••••••"
                                                                                           className="form-input pr-12"
                                                                                           required
                                                                                    />
                                                                                    <button type="button" onClick={() => setShowAccount(!showAccount)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                                                           {showAccount ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                                    </button>
                                                                             </div>
                                                                      </div>
                                                                      <div className="space-y-2">
                                                                             <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">IFSC Code</label>
                                                                             <input type="text" name="ifsc" value={formData.ifsc} onChange={handleInputChange} placeholder="HDFC0001234" className="form-input" required />
                                                                      </div>
                                                               </div>
                                                               <div
                                                                      onClick={() => fileInputRefs.cheque.current?.click()}
                                                                      className="flex items-center justify-between p-4 rounded-xl bg-[var(--table-header)] border border-dashed border-[var(--glass-border-light)] hover:border-accent/40 transition-colors cursor-pointer group"
                                                               >
                                                                      <input type="file" ref={fileInputRefs.cheque} className="hidden" onChange={(e) => handleFileChange('cheque', e)} />
                                                                      <div className="flex items-center gap-3">
                                                                             <Upload size={18} className={`transition-colors ${files.cheque ? 'text-accent' : 'text-[hsl(var(--foreground))]/30 group-hover:text-accent'}`} />
                                                                             <span className="text-sm font-medium text-[hsl(var(--foreground))]/80">
                                                                                    {files.cheque ? files.cheque.name : 'Cancelled Cheque / Passbook Copy'}
                                                                             </span>
                                                                      </div>
                                                               </div>

                                                               <div className="flex gap-4 mt-6">
                                                                      <button type="button" onClick={prevStep} className="flex-1 py-4 bg-[var(--table-header)] rounded-xl text-[hsl(var(--foreground))] font-medium border border-[var(--glass-border-light)] transition-all flex items-center justify-center gap-2">
                                                                             <ArrowLeft size={18} /> Back
                                                                      </button>
                                                                      <button type="button" onClick={nextStep} className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 group">
                                                                             Next: Password <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 )}

                                                 {/* STEP 5: PASSWORD */}
                                                 {step === 5 && (
                                                        <div className="space-y-6 animate-fadeIn">
                                                               <div className="flex items-center gap-3 mb-2">
                                                                      <div className="p-2 rounded-lg bg-accent/10 text-accent"><Lock size={20} /></div>
                                                                      <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Account Security</h2>
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Create Password</label>
                                                                      <div className="relative">
                                                                             <input
                                                                                    type={showPassword ? 'text' : 'password'}
                                                                                    name="password"
                                                                                    value={formData.password}
                                                                                    onChange={handleInputChange}
                                                                                    placeholder="••••••••"
                                                                                    className="form-input pr-12"
                                                                                    required
                                                                             />
                                                                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                             </button>
                                                                      </div>
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <label className="text-xs font-medium text-[hsl(var(--foreground))]/70 ml-1 uppercase tracking-wider">Confirm Password</label>
                                                                      <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" className="form-input" required />
                                                               </div>
                                                               <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 flex gap-4 items-start">
                                                                      <CheckCircle2 size={20} className="text-accent flex-shrink-0 mt-0.5" />
                                                                      <p className="text-[11px] leading-relaxed text-[hsl(var(--foreground))]/70">
                                                                             By registering, you agree to our <span className="text-accent underline cursor-pointer">Sightseeing Partner Terms</span>.
                                                                             Your details will be reviewed for verification.
                                                                      </p>
                                                               </div>
                                                               <div className="flex gap-4 mt-6">
                                                                      <button type="button" onClick={prevStep} className="flex-1 py-4 bg-[var(--table-header)] rounded-xl text-[hsl(var(--foreground))] font-medium border border-[var(--glass-border-light)] transition-all flex items-center justify-center gap-2">
                                                                             <ArrowLeft size={18} /> Back
                                                                      </button>
                                                                      <button type="submit" disabled={isLoading} className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 group">
                                                                             {isLoading ? (
                                                                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                                             ) : (
                                                                                    <>Complete Application <CheckCircle2 size={18} /></>
                                                                             )}
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 )}
                                          </form>
                                   )}
                            </div>

                            <p className="text-center mt-8 text-sm text-[hsl(var(--foreground))]/60">
                                   Already have an account? {' '}
                                   <Link href="/siteseeing/login" className="text-accent font-bold hover:underline">
                                          Login here
                                   </Link>
                            </p>
                     </div>
              </div>
       );
}
