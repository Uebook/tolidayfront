'use client';

import { use, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Printer, Download, ArrowLeft, Mail, Phone, Calendar, MapPin, ShieldCheck, Info } from 'lucide-react';
import Link from 'next/link';

export default function StandaloneHotelVoucherPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const { data: booking, isLoading, error } = useQuery({
        queryKey: ['booking', id],
        queryFn: async () => {
            const res = await api.get(`/bookings/${id}`);
            return res.data;
        }
    });

    // Auto-trigger print when fully loaded
    useEffect(() => {
        if (booking) {
            const timer = setTimeout(() => {
                window.print();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [booking]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-zinc-600 font-medium">Generating Voucher Preview...</p>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
                    <Info size={32} />
                </div>
                <h1 className="text-xl font-bold text-zinc-900 mb-2">Voucher Not Found</h1>
                <p className="text-zinc-500 mb-6 max-w-sm">We couldn't retrieve the booking details for this voucher.</p>
                <Link href={`/hotel/bookings/${id}`} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Booking Details
                </Link>
            </div>
        );
    }

    const hotel = booking.hotel || {};
    const roomType = booking.roomType || {};

    const checkIn = new Date(booking.startDate);
    const checkOut = new Date(booking.endDate);
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));

    // Format dates
    const checkInStr = checkIn.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const checkOutStr = checkOut.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const bookedAtStr = new Date(booking.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

    // Mock confirmation numbers for realistic PDF look
    const confirmationNo = booking.bookingReference || `TB${id.substring(0, 8).toUpperCase()}`;
    const hotelConfirmationNo = `1779${booking.id.charCodeAt(0) || '2806'}${booking.id.charCodeAt(1) || '2290'}`;

    return (
        <div className="min-h-screen bg-zinc-100 text-zinc-800 font-sans print:bg-white print:p-0">
            {/* Top Toolbar (Hidden during print) */}
            <div className="bg-white border-b border-zinc-200 py-4 px-6 sticky top-0 z-50 shadow-sm flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Link href={`/hotel/bookings/${id}`} className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900">
                        <ArrowLeft size={16} /> Back to Booking Details
                    </Link>
                    <span className="text-zinc-300">|</span>
                    <span className="text-sm font-bold text-zinc-800">Hotel Voucher Preview</span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.print()} 
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow transition-colors"
                    >
                        <Printer size={16} /> Print Voucher
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-700 rounded-lg text-sm font-bold shadow-sm transition-colors"
                    >
                        <Download size={16} /> Download PDF
                    </button>
                </div>
            </div>

            {/* Voucher Page Container */}
            <div className="max-w-[850px] mx-auto my-8 bg-white shadow-lg border border-zinc-200 p-8 print:shadow-none print:border-none print:my-0 print:p-0">
                
                {/* Main Table Layout */}
                <div className="border border-[#002f6c] w-full text-xs">
                    
                    {/* Header Row */}
                    <div className="bg-[#002f6c] text-white py-2 px-4 text-center font-bold text-sm tracking-wider uppercase">
                        Hotel Voucher
                    </div>

                    {/* Confirmation Codes Row */}
                    <div className="grid grid-cols-2 border-b border-zinc-200">
                        <div className="p-3 border-r border-zinc-200 bg-slate-50">
                            <span className="font-bold block text-indigo-900 mb-0.5">Confirmation No</span>
                            <span className="font-semibold text-sm">{confirmationNo}</span>
                        </div>
                        <div className="p-3 bg-slate-50">
                            <span className="font-bold block text-indigo-900 mb-0.5">Hotel Confirmation No</span>
                            <span className="font-semibold text-sm">{hotelConfirmationNo}</span>
                        </div>
                    </div>

                    {/* Address block */}
                    <div className="grid grid-cols-2 border-b border-zinc-200">
                        <div className="p-4 border-r border-zinc-200">
                            <span className="font-bold text-[#002f6c] text-xs block mb-1.5 uppercase tracking-wide">Hotel Address Details</span>
                            <span className="font-bold text-sm text-zinc-900 block mb-1">{hotel.name || 'Fabhotel Bharat Continental'}</span>
                            <p className="text-zinc-600 leading-relaxed">
                                {hotel.address || 'R-548, Rajinder Nagar'}<br />
                                {hotel.city || 'New Delhi'}, {hotel.pinCode || '110060'}, IN
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50/50">
                            <span className="font-bold text-[#002f6c] text-xs block mb-1.5 uppercase tracking-wide">Agency Address Details</span>
                            <span className="font-bold text-sm text-zinc-900 block mb-1">Toliday Trip Pvt. Ltd(API)</span>
                            <p className="text-zinc-600 leading-relaxed mb-2">
                                Sector P3<br />
                                Greater Noida, UP, IN
                            </p>
                            <div className="flex flex-col gap-0.5 text-zinc-500 font-medium">
                                <span className="flex items-center gap-1"><Phone size={12} className="text-zinc-400" /> 8447804043</span>
                                <span className="flex items-center gap-1"><Mail size={12} className="text-zinc-400" /> ceo@toliday.in</span>
                            </div>
                        </div>
                    </div>

                    {/* Lead Passenger & Dates */}
                    <div className="p-4 border-b border-zinc-200 bg-slate-50/30">
                        <div className="text-sm mb-3">
                            <span className="font-bold text-zinc-900">Lead Passenger Name:</span>
                            <span className="ml-2 font-bold text-indigo-600">{booking.guestName}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-t border-dashed border-zinc-200 pt-3">
                            <div>
                                <span className="text-zinc-400 font-bold block text-[10px] uppercase">Check In Date</span>
                                <span className="font-bold text-indigo-900 text-sm">{checkInStr}</span>
                            </div>
                            <div>
                                <span className="text-zinc-400 font-bold block text-[10px] uppercase">Check Out Date</span>
                                <span className="font-bold text-indigo-900 text-sm">{checkOutStr}</span>
                            </div>
                            <div>
                                <span className="text-zinc-400 font-bold block text-[10px] uppercase">No of Nights</span>
                                <span className="font-bold text-zinc-800 text-sm">{nights} Night{nights > 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    </div>

                    {/* Room details header */}
                    <div className="grid grid-cols-12 bg-slate-100 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-200">
                        <div className="col-span-1 p-2 text-center border-r border-zinc-200">S.No</div>
                        <div className="col-span-7 p-2 border-r border-zinc-200">Room Type</div>
                        <div className="col-span-4 p-2">Guests Type</div>
                    </div>

                    {/* Room Type Details row */}
                    <div className="grid grid-cols-12 border-b border-zinc-200">
                        <div className="col-span-1 p-4 text-center font-bold border-r border-zinc-200">1</div>
                        <div className="col-span-7 p-4 border-r border-zinc-200 space-y-3">
                            <div>
                                <span className="font-bold text-sm text-zinc-950 block">{roomType.name || 'Deluxe Room'}</span>
                                <span className="text-xs text-zinc-500 font-semibold block mt-0.5">Incl : Room Only</span>
                            </div>

                            {/* Room Description details */}
                            <div className="space-y-1 pt-2 border-t border-zinc-100">
                                <span className="font-bold text-zinc-800 block text-[10px] uppercase tracking-wider">Room Description:</span>
                                <p className="text-zinc-500 mb-2">{roomType.description || 'Luxurious and spacious room designed to deliver extreme comfort.'}</p>
                                <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-zinc-600 font-medium">
                                    <span>• <strong>Size:</strong> {roomType.size || '280'} sq feet</span>
                                    <span>• <strong>Bed Type:</strong> 1 Double Bed</span>
                                    <span>• <strong>Internet:</strong> Free WiFi 25+ Mbps</span>
                                    <span>• <strong>Entertainment:</strong> 55-inch TV with cable</span>
                                    <span>• <strong>Food & Drink:</strong> Free bottled water</span>
                                    <span>• <strong>Sleep:</strong> Egyptian cotton sheets</span>
                                    <span>• <strong>Comfort:</strong> Air conditioning</span>
                                    <span>• <strong>Accessibility:</strong> Tile flooring</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-4 p-4 space-y-2 bg-slate-50/20">
                            <div>
                                <span className="font-bold text-zinc-900 block">{booking.numberOfGuests} Adult(s)</span>
                                <span className="text-zinc-500 font-semibold block mt-1">Adults : {booking.guestName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Package details */}
                    <div className="p-4 border-b border-zinc-200 space-y-1">
                        <span className="font-bold text-zinc-800 text-[10px] uppercase block tracking-wider">Package Details:</span>
                        <div className="text-zinc-600 font-medium">
                            <span className="font-bold text-zinc-700">Special Service Request:</span> None
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="p-4 border-b border-zinc-200 bg-slate-50/40">
                        <span className="font-bold text-zinc-800 text-[10px] uppercase block tracking-wider mb-1">Remarks</span>
                        <p className="text-zinc-500 leading-relaxed">
                            Please note that while your booking had been confirmed and is guaranteed, the rooming list with your name may not be adjusted in the hotel's reservation system until closer to arrival.
                        </p>
                    </div>

                    {/* Agent Remarks */}
                    <div className="p-4 border-b border-zinc-200">
                        <span className="font-bold text-zinc-800 text-[10px] uppercase block tracking-wider mb-1">Agent Remarks</span>
                        <p className="text-zinc-400 italic">No Remarks</p>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="p-4 bg-slate-50/20">
                        <span className="font-bold text-zinc-800 text-[10px] uppercase block tracking-wider mb-2">Booking Terms & Conditions</span>
                        <ul className="list-disc pl-4 space-y-1.5 text-zinc-500 leading-relaxed font-medium">
                            <li>You must present a photo ID at the time of check in. Hotel may ask for credit card or cash deposit for the extra services at the time of check in.</li>
                            <li>All extra charges should be collected directly from clients prior to departure such as parking, phone calls, room service, city tax, etc.</li>
                            <li>We don't accept any responsibility for additional expenses due to the changes or delays in air, road, rail, sea or indeed of any other causes, all such expenses will have to be borne by passengers.</li>
                            <li>In case of wrong residency & nationality selected by user at the time of booking; the supplement charges may be applicable and need to be paid to the hotel by guest on check in/ check out.</li>
                            <li>Any special request for bed type, early check in, late check out, smoking rooms, etc are not guaranteed as subject to availability at the time of check in.</li>
                            <li>Early check out will attract full cancellation charges unless otherwise specified.</li>
                            <li>In case of a late check-in by the guest, it is essential to inform us or the hotel in advance to avoid the booking being marked as a no-show.</li>
                        </ul>
                    </div>

                </div>

                {/* Hotel Policies block */}
                <div className="border border-[#002f6c] w-full text-xs mt-6">
                    <div className="bg-[#002f6c] text-white py-1.5 px-4 font-bold text-xs uppercase tracking-wider">
                        Hotel Policies
                    </div>
                    <div className="p-4 space-y-3">
                        <ul className="list-disc pl-4 space-y-1.5 text-zinc-500 leading-relaxed font-medium">
                            <li>Early check out will attract full cancellation charge unless otherwise specified.</li>
                            <li>Please note that this is a special rate which should be sold only with an airline ticket as part of a package.</li>
                            <li>CheckIn Time-Begin: 12:00 PM</li>
                            <li>CheckOut Time: 11:00 AM</li>
                            <li>CheckIn Instructions: Government-issued photo identification and a credit card, debit card, or cash deposit may be required at check-in for incidental charges. Special requests are subject to availability upon check-in.</li>
                            <li>Special Instructions: This property doesn't offer after-hours check-in. Front desk staff will greet guests on arrival.</li>
                            <li>Minimum CheckIn Age: 18</li>
                            <li>No pets and no service animals are allowed at this property.</li>
                        </ul>
                    </div>
                </div>

                {/* Contact details footer */}
                <div className="border border-[#002f6c] w-full text-xs mt-6">
                    <div className="bg-[#002f6c] text-white py-1.5 px-4 font-bold text-xs uppercase tracking-wider">
                        Contact Details
                    </div>
                    <div className="p-4 flex gap-8 text-zinc-600 font-bold">
                        <span className="flex items-center gap-1.5"><Phone size={14} className="text-zinc-400" /> Phone: 8447804043</span>
                        <span className="flex items-center gap-1.5"><Mail size={14} className="text-zinc-400" /> Email: ceo@toliday.in</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
