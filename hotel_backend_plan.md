# Hotel Supplier Portal - Backend Development Plan

This document provides a comprehensive technical specification for the Hotel Backend Panel (Supplier Portal), detailng all pages, API requirements, and database architecture.

## 1. Core Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Relational integrity for bookings/inventory)
- **ORM**: Prisma (Type-safe data access)
- **Auth**: NextAuth.js (Session management with JWT)
- **API**: Next.js Route Handlers (`/api/hotel/*`)

---

## 2. Database Schema (Prisma Models)

```prisma
model Hotel {
  id            String    @id @default(cuid())
  name          String
  description   String?   @db.Text
  email         String    @unique
  phone         String
  website       String?
  address       String
  city          String
  pincode       String
  starRating    Int
  checkInTime   String
  checkOutTime  String
  maxAdults     Int       @default(4)
  maxChildren   Int       @default(2)
  childPolicy   String?   @db.Text
  cancelPolicy  String?   @db.Text
  petPolicy     String?   @db.Text
  amenities     String[]  // IDs from amenityOptions
  longitude     Float?
  latitude      Float?
  v             String    @default("hotel")
  rooms         RoomType[]
  staff         Staff[]
  bookings      Booking[]
  bankAccount   BankAccount?
  documents     Document[]
  media         Media[]
}

model Media {
  id          String    @id @default(cuid())
  hotelId     String
  hotel       Hotel     @relation(fields: [hotelId], references: [id])
  name        String
  category    String    // Lobby, Rooms, Pool & Spa, etc.
  size        String?
  url         String
  createdAt   DateTime  @default(now())
}

model BankAccount {
  id                String    @id @default(cuid())
  hotelId           String    @unique
  hotel             Hotel     @relation(fields: [hotelId], references: [id])
  accountHolderName String
  bankName          String
  accountNumber     String    // Encrypted
  ifscCode          String
}

model Document {
  id          String    @id @default(cuid())
  hotelId     String
  hotel       Hotel     @relation(fields: [hotelId], references: [id])
  type        String    // GST, PAN, LICENSE
  fileUrl     String
  status      String    @default("PENDING") // PENDING, VERIFIED, REJECTED
  createdAt   DateTime  @default(now())
}

model RoomType {
  id            String    @id @default(cuid())
  hotelId       String
  hotel         Hotel     @relation(fields: [hotelId], references: [id])
  name          String    // e.g., Deluxe King
  bedType       String?   // e.g., King Bed
  sizeSqft      Int?
  baseRate      Float
  totalRooms    Int
  maxOccupancy  Int
  amenities     String[]  // e.g., ["AC", "WiFi"]
  status        String    @default("active")
  inventory     Inventory[]
  bookings      Booking[]
}

model Inventory {
  id            String    @id @default(cuid())
  roomTypeId    String
  roomType      RoomType  @relation(fields: [roomTypeId], references: [id])
  date          DateTime
  available     Int
  rate          Float
  stopSale      Boolean   @default(false)
}

model Booking {
  id            String    @id @default(cuid())
  ref           String    @unique // e.g., TLD-8821
  hotelId       String
  hotel         Hotel     @relation(fields: [hotelId], references: [id])
  roomTypeId    String
  roomType      RoomType  @relation(fields: [roomTypeId], references: [id])
  guestName     String
  guestEmail    String
  guestPhone    String
  checkIn       DateTime
  checkOut      DateTime
  status        String    // CONFIRMED, CHECKED_IN, CANCELLED, etc.
  totalAmount   Float
  paidAmount    Float
  createdAt     DateTime  @default(now())
}

model Staff {
  id            String    @id @default(cuid())
  hotelId       String
  hotel         Hotel     @relation(fields: [hotelId], references: [id])
  name          String
  email         String    @unique
  role          String    // OWNER, MANAGER, STAFF
  permissions   Json      // Detailed access flags
  status        String    @default("ACTIVE")
  sessions      Session[]
}

model Session {
  id          String    @id @default(cuid())
  staffId     String
  staff       Staff     @relation(fields: [staffId], references: [id])
  device      String    // e.g., MacBook Pro (Chrome)
  location    String    // e.g., New Delhi, IN
  ip          String?
  lastUsed    DateTime  @default(now())
  userAgent   String?
  createdAt   DateTime  @default(now())
}
```

---

## 3. Page List & API Mapping

### Navigation Layer
- **Layout**: `(supplier)/hotel/layout.tsx` (Shared Sidebar/Topbar)

### Core Dashboards
| Page | Route | Description | API Endpoints Needed |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `/hotel/dashboard` | Overview of today's stats | `GET /api/hotel/stats/summary` |
| **Bookings** | `/hotel/bookings` | List/Filter all reservations | `GET /api/hotel/bookings` |
| **Booking Detail**| `/hotel/bookings/[id]` | Full guest info & actions | `GET /api/hotel/bookings/:id`, `PATCH /api/hotel/bookings/:id/status` |
| **Inventory** | `/hotel/inventory` | Calendar-based availability | `GET /api/hotel/inventory`, `PATCH /api/hotel/inventory/bulk` |
| **Rate Manager** | `/hotel/rates` | Seasonal & Special pricing | `GET /api/hotel/rates`, `POST /api/hotel/rates/apply` |

### Property & Content Management
| Page | Route | Description | Status | API Endpoints Needed |
| :--- | :--- | :--- | :--- | :--- |
| **Property Details** | `/hotel/property` | Info, Policies, Tech | [READY] | `GET /api/hotel/profile`, `PUT /api/hotel/profile` |
| **Room Types** | `/hotel/rooms` | Category management | [READY] | `GET /api/hotel/rooms`, `POST /api/hotel/rooms` |
| **Media Gallery** | `/hotel/media` | Photo management | [READY] | `GET /api/hotel/media`, `POST /api/hotel/media/presigned-url` |

### Operations & Analytics
| Page | Route | Description | Status | API Endpoints Needed |
| :--- | :--- | :--- | :--- | :--- |
| **Notifications** | `/hotel/notifications`| System/Booking alerts | [READY] | `GET /api/hotel/notifications`, `PATCH /api/hotel/notifications/read` |
| **Reports** | `/hotel/reports` | Revenue/Inventory logs | [READY] | `GET /api/hotel/reports/revenue`, `GET /api/hotel/reports/occupancy` |
| **Support** | `/hotel/support` | Help tickets/FAQ | [READY] | `POST /api/hotel/support/ticket`, `GET /api/hotel/support/faqs` |

### Administration
| Page | Route | Description | Status | API Endpoints Needed |
| :--- | :--- | :--- | :--- | :--- |
| **Staff List** | `/hotel/staff` | Team management | [READY] | `GET /api/hotel/staff`, `DELETE /api/hotel/staff/:id` |
| **Add Staff** | `/hotel/staff/new` | onboarding form | [READY] | `POST /api/hotel/staff` |
| **Permissions** | `/hotel/staff/permissions` | RBAC matrix | [READY] | `GET /api/hotel/permissions`, `PUT /api/hotel/permissions` |
| **Settings** | `/hotel/settings` | System configuration | [READY] | `GET /api/hotel/settings`, `PATCH /api/hotel/settings` |

---

## 4. Detailed API Specifications

### GET `/api/hotel/stats/summary`
Returns all data required for the main dashboard view.

**Response Structure:**
```json
{
  "stats": {
    "revenue": { "value": 118500, "change": "+18%", "trend": "up" },
    "checkIns": { "value": 23, "change": "+5", "trend": "up" },
    "pending": { "value": 8, "attention": 2, "trend": "down" },
    "cancellations": { "value": 3, "change": "-2", "trend": "up" },
    "inHouse": { "value": 64, "occupancy": 87 },
    "checkOuts": { "value": 11, "cleaningDue": 11 }
  },
  "charts": {
    "revenue7d": [
      { "day": "Mon", "revenue": 42000, "bookings": 8 },
      ...
    ],
    "occupancy6m": [
      { "month": "Oct", "deluxe": 72, "suite": 55, "executive": 68 },
      ...
    ]
  },
  "recentBookings": [
    {
      "id": "b001",
      "ref": "TLD-8821",
      "guest": "Priya Mehta",
      "room": "Deluxe King",
      "checkIn": "2026-03-10",
      "status": "confirmed",
      "amount": 8500
    },
    ...
  ]
}
```

### POST `/api/hotel/auth/login`
Authenticates a staff member and initiates a session.

**Request Body:**
```json
{
  "email": "staff@hotel.com",
  "password": "••••••••",
  "vertical": "hotel"
}
```

**Response (Success):**
```json
{
  "user": {
    "id": "usr_001",
    "name": "Rajesh Sharma",
    "email": "rajesh@hotelgrand.com",
    "role": "owner",
    "hotelId": "htl_001"
  },
  "token": "eyJhbG..." 
}
```

### JWT Session Object (Auth.js)
The decrypted session token will contain these essential claims:
```json
{
  "uid": "usr_001",
  "name": "Rajesh Sharma",
  "role": "OWNER",
  "hid": "htl_001",
  "hname": "The Grand Palace Hotel",
  "v": "hotel",
  "p": {
    "bookings_view": true,
    "bookings_modify": true,
    "bookings_cancel": true,
    "inventory_edit": true,
    "rates_edit": true,
    "reports_view": true,
    "staff_manage": true,
    "media_upload": true,
    "settings_edit": true
  }
}
```

### POST `/api/hotel/auth/signup`
Creates a new hotel profile and the initial 'OWNER' staff account.

**Request Body:**
```json
{
  "contact": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@hotelbrand.com",
    "phone": "+91 98765 43210"
  },
  "business": {
    "name": "Grand Luxury Hotels Pvt Ltd",
    "propertyType": "Hotel",
    "city": "New Delhi",
    "address": "Plot 12, Sector 44, Gurgaon"
  },
  "banking": {
    "accountHolderName": "Grand Luxury Hotels",
    "bankName": "HDFC Bank",
    "accountNumber": "501002345678",
    "ifscCode": "HDFC0001234"
  },
  "legal": {
    "gstNumber": "07AADCG1234F1Z1",
    "documents": [
      { "type": "GST", "fileUrl": "s3://..." },
      { "type": "PAN", "fileUrl": "s3://..." },
      { "type": "LICENSE", "fileUrl": "s3://..." }
    ]
  },
  "security": {
    "password": "••••••••"
  }
}
```

### GET `/api/hotel/auth/sessions`
Returns a list of all active device sessions for the authenticated staff member.

**Response Structure:**
```json
[
  {
    "id": "sess_001",
    "device": "MacBook Pro (Chrome)",
    "location": "New Delhi, IN",
    "lastUsed": "2026-03-10T11:50:00Z",
    "isCurrent": true
  },
  ...
]
```

### DELETE `/api/hotel/auth/sessions/:id`
Revokes a specific session (Sign out from that device).

### DELETE `/api/hotel/auth/sessions/purge`
Signs out from all devices except the current one.

---

## 5. "Add" Pages Specification (Forms & Creation)

These pages focus on data entry and will require `POST` API endpoints.

| Page Name | Frontend Route | Required Form Fields | Backend API |
| :--- | :--- | :--- | :--- |
| **Add Staff** | `/hotel/staff/new` | Name, Email, Role, Permissions | `POST /api/hotel/staff` |
| **Add Room Type** | `/hotel/rooms/new` | Name, Base Rate, Total, Occupancy | `POST /api/hotel/rooms` |
| **Add Booking** | `/hotel/bookings/new` | Guest Name, Email, Dates, Room | `POST /api/hotel/bookings` |
| **Add Rate Rule** | `/hotel/rates` (Modal/Form) | Rule Name, Dates, Rate, Room Type | `POST /api/hotel/rates` |
| **Upload Media** | `/hotel/media` (Dropzone) | Category, Room Association, Files | `POST /api/hotel/media` |

---

## 5. Development Implementation Phases

### Phase 1: Authentication & Identity
- Implement `NextAuth` custom adapter for Hotel Staff.
- Create `/api/auth/login` and session management.

### Phase 2: Property & Inventory Setup
- Build APIs for Room Types (`/api/hotel/rooms`).
- Implement the Inventory Console with bulk update support.
- Setup AWS S3 for Media uploads.

### Phase 3: Booking Engine Integration
- Build the real-time booking fetcher for the dashboard.
- Implement booking status transition logic (Check-in/Check-out).

### Phase 4: Reports & Analytics
- Aggregate data for Revenue and Occupancy charts.
- Export functionality for booking lists (CSV/PDF).
