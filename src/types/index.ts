export type UserRole = 'owner' | 'manager' | 'staff';
export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';

export interface Permission {
    bookings_view: boolean;
    bookings_modify: boolean;
    bookings_cancel: boolean;
    inventory_edit: boolean;
    rates_edit: boolean;
    reports_view: boolean;
    staff_manage: boolean;
    media_upload: boolean;
    settings_edit: boolean;
}

export interface StaffMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    status: 'active' | 'inactive';
    permissions: Permission;
    last_login?: string;
    created_at: string;
}

export interface RoomCategory {
    id: string;
    name: string;
    description: string;
    max_occupancy: number;
    bed_type: string;
    size_sqft: number;
    base_price: number;
    total_rooms: number;
    amenities: string[];
    images: string[];
    status: 'active' | 'inactive';
}

export interface Booking {
    id: string;
    booking_ref: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    room_category: string;
    room_number?: string;
    check_in: string;
    check_out: string;
    nights: number;
    adults: number;
    children: number;
    total_amount: number;
    paid_amount: number;
    status: BookingStatus;
    source: string;
    created_at: string;
    special_requests?: string;
}

export interface InventoryDay {
    date: string;
    available: number;
    total: number;
    stop_sale: boolean;
    rate: number;
}

export interface RateRule {
    id: string;
    name: string;
    room_category_id: string;
    start_date: string;
    end_date: string;
    rate: number;
    min_nights?: number;
    type: 'seasonal' | 'special' | 'weekend';
}

export interface Notification {
    id: string;
    type: 'booking' | 'payment' | 'system' | 'reminder';
    title: string;
    message: string;
    read: boolean;
    created_at: string;
}

export interface SalesReport {
    date: string;
    bookings: number;
    revenue: number;
    cancellations: number;
    occupancy: number;
}

export interface Package {
    id: string;
    name: string;
    destination: string;
    duration: string;
    base_price: number;
    sale_price?: number;
    status: 'active' | 'inactive' | 'draft';
    description: string;
    inclusions: string[];
    exclusions: string[];
    itinerary: {
        day: number;
        title: string;
        description: string;
    }[];
    images: string[];
    created_at: string;
}
