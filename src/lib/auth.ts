import { Permission, UserRole } from '@/types';
import { jwtDecode } from 'jwt-decode';

interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole | string;
    hotelId?: string;
    tourPartnerId?: string;
    hotel_id?: string;
    tour_partner_id?: string;
    busVendorId?: string;
    cabVendorId?: string;
    bus_vendor_id?: string;
    cab_vendor_id?: string;
    hotel_name?: string;
    permissions?: any;
    avatar?: string;
}

export function getAuthUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const decoded: any = jwtDecode(token);
        // Map backend payload to frontend AuthUser
        return {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name || decoded.email.split('@')[0],
            role: decoded.role,
            hotelId: decoded.hotelId,
            tourPartnerId: decoded.tourPartnerId,
            hotel_id: decoded.hotelId,
            tour_partner_id: decoded.tourPartnerId,
            busVendorId: decoded.busVendorId,
            cabVendorId: decoded.cabVendorId,
            bus_vendor_id: decoded.busVendorId,
            cab_vendor_id: decoded.cabVendorId,
            hotel_name: decoded.hotelName || 'My Business',
            permissions: decoded.permissions || {},
        };
    } catch (e) {
        console.error('Failed to decode token', e);
        return null;
    }
}

export function logout() {
    localStorage.removeItem('token');
    window.location.href = '/hotel/login';
}

export function hasPermission(key: string): boolean {
    const user = getAuthUser();
    if (!user || !user.permissions) return false;
    return !!user.permissions[key];
}
