# FundMyCampus Admin Panel

Admin dashboard for managing FundMyCampus loan applications, users, documents, counselors, referrals, payouts, and contact submissions.

## Architecture

```
fundmycampus.com          admin.fundmycampus.com
(User Next.js App)        (Admin Next.js App) ← THIS PROJECT
       │                          │
       └──────────┬───────────────┘
                  ▼
        api.fundmycampus.com
        (FastAPI Backend — shared)
                  │
                  ▼
        Supabase (DB, Auth, Storage)
```

- **Frontend**: Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **Backend**: Existing FastAPI backend (no BFF layer — direct browser → API calls)
- **Auth**: Supabase Auth (email/password login, JWT verification, admin role check)
- **State Management**: TanStack React Query (server state), React useState (UI state)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI Components | Shadcn/ui + Radix UI primitives |
| Styling | Tailwind CSS v4 |
| Data Tables | TanStack Table v8 |
| Charts | Recharts v3 |
| Server State | TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| Auth | @supabase/ssr |
| Icons | Lucide React |
| Toasts | Sonner |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Running FundMyCampus FastAPI backend
- Supabase project with Auth enabled

### Installation

```bash
cd fundmycampus-admin
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

| Variable | Description |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `NEXT_PUBLIC_API_URL` | FastAPI backend URL (default: `http://localhost:8000`) |

### Running Locally

```bash
# Start the FastAPI backend first
cd ../Fundmycampus_BE
python3 -m uvicorn app.main:app --reload --port 8000

# Then start the admin panel
cd ../fundmycampus-admin
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
fundmycampus-admin/
├── .env.local                          # Environment variables (not committed)
├── middleware.ts                        # Auth redirect middleware
├── next.config.ts                      # Next.js configuration
├── postcss.config.mjs                  # PostCSS + Tailwind config
├── tsconfig.json                       # TypeScript configuration
│
└── src/
    ├── app/
    │   ├── globals.css                 # Tailwind + theme variables
    │   ├── layout.tsx                  # Root layout (Providers wrapper)
    │   ├── login/
    │   │   └── page.tsx                # Login page
    │   └── (admin)/                    # Protected route group
    │       ├── layout.tsx              # Admin guard + AppShell
    │       ├── dashboard/page.tsx      # Dashboard with stats + charts
    │       ├── users/page.tsx          # User management (paginated)
    │       ├── loans/
    │       │   ├── page.tsx            # Loan list with filters
    │       │   └── [loanId]/page.tsx   # Loan detail + actions
    │       ├── documents/page.tsx      # Document review
    │       ├── counselors/page.tsx     # Counselor CRUD
    │       ├── referrals/page.tsx      # Referrals + Payouts (tabs)
    │       ├── contacts/page.tsx       # Contact submissions
    │       └── notifications/page.tsx  # Send notifications
    │
    ├── lib/
    │   ├── api-client.ts               # Fetch wrapper with JWT injection
    │   ├── constants.ts                # Enums mirrored from backend
    │   ├── utils.ts                    # Formatters (currency, date, status)
    │   └── supabase/
    │       ├── client.ts               # Browser Supabase client
    │       └── server.ts               # Server Supabase client (cookies)
    │
    ├── types/
    │   ├── admin.ts                    # AdminDashboardStats
    │   ├── bank.ts                     # Bank, BankOffer
    │   ├── common.ts                   # PaginatedResponse, SuccessResponse
    │   ├── contact.ts                  # ContactSubmission, ContactStatusUpdate
    │   ├── counselor.ts                # Counselor, CounselorCreate, CounselorUpdate
    │   ├── document.ts                 # Document, DocumentReview
    │   ├── loan.ts                     # LoanApplication, LoanStatusUpdate
    │   ├── notification.ts             # Notification, SendNotificationRequest
    │   ├── referral.ts                 # Referral, ReferralPayout, ProcessPayoutRequest
    │   └── user.ts                     # Profile
    │
    ├── hooks/
    │   ├── use-auth.ts                 # Auth context (session, isAdmin, signOut)
    │   ├── queries/                    # React Query GET hooks
    │   │   ├── use-contacts.ts
    │   │   ├── use-counselors.ts
    │   │   ├── use-dashboard.ts
    │   │   ├── use-documents.ts
    │   │   ├── use-loans.ts
    │   │   ├── use-referrals.ts
    │   │   └── use-users.ts
    │   └── mutations/                  # React Query POST/PATCH hooks
    │       ├── use-bank-mutations.ts
    │       ├── use-contact-mutations.ts
    │       ├── use-counselor-mutations.ts
    │       ├── use-notification-mutations.ts
    │       ├── use-referral-mutations.ts
    │       ├── use-review-document.ts
    │       ├── use-update-loan-status.ts
    │       └── use-update-user-role.ts
    │
    └── components/
        ├── providers.tsx               # QueryClient + Auth + Toaster
        ├── ui/                         # Shadcn UI primitives (15 components)
        │   ├── badge.tsx
        │   ├── button.tsx
        │   ├── card.tsx
        │   ├── dialog.tsx
        │   ├── dropdown-menu.tsx
        │   ├── input.tsx
        │   ├── label.tsx
        │   ├── scroll-area.tsx
        │   ├── select.tsx
        │   ├── separator.tsx
        │   ├── skeleton.tsx
        │   ├── switch.tsx
        │   ├── table.tsx
        │   ├── tabs.tsx
        │   └── textarea.tsx
        ├── layout/                     # App shell components
        │   ├── app-shell.tsx           # Sidebar + Header + main area
        │   ├── header.tsx              # Top bar with user dropdown
        │   └── sidebar.tsx             # Navigation sidebar
        └── shared/                     # Reusable business components
            ├── confirm-dialog.tsx
            ├── data-table.tsx          # TanStack Table wrapper
            ├── page-header.tsx
            └── stat-card.tsx
```

---

## Pages Documentation

### 1. Login (`/login`)

**Purpose**: Admin authentication gate.

**Flow**:
1. User enters email + password
2. Calls `supabase.auth.signInWithPassword()`
3. Fetches profile via `GET /api/v1/users/{user_id}`
4. If `role !== "admin"` → signs out + shows error toast
5. If admin → redirects to `/dashboard`

**API Endpoints Used**:
- Supabase Auth: `signInWithPassword`
- `GET /api/v1/users/{user_id}` (role check)

---

### 2. Dashboard (`/dashboard`)

**Purpose**: Overview of all FundMyCampus operations.

**Components**:
- 10 stat cards: Total users, new users this month, total applications, applications this month, total disbursed, disbursed amount, conversion rate, pending documents, active referrals, pending payouts
- 4 charts:
  - **Pie chart**: Applications by status
  - **Bar chart**: Top countries
  - **Horizontal bar chart**: Top banks
  - **Bar chart**: Counselor caseloads

**API Endpoints Used**:
- `GET /api/v1/admin/stats`

---

### 3. Users (`/users`)

**Purpose**: View and manage all registered users.

**Features**:
- Server-side paginated table (25 per page)
- Search by name, email, or phone
- Filter by role (user, counselor, admin)
- Change user role via dialog

**Table Columns**: Name, Email, Phone, Role (badge), Profile %, Created At, Actions

**API Endpoints Used**:
- `GET /api/v1/users?page=X&page_size=25&role=Y&search=Z`
- `PATCH /api/v1/users/{id}/role?role=X`

---

### 4. Loans (`/loans`)

**Purpose**: View all loan applications with filtering.

**Features**:
- Filter by loan status
- Filter by assigned counselor
- Click row to navigate to detail page

**Table Columns**: App ID, Name, Country, College, Amount, Status (badge), Counselor, Created At, Actions

**API Endpoints Used**:
- `GET /api/v1/loans?status=X&counselor_id=Y`
- `GET /api/v1/counselors` (for counselor names)

---

### 5. Loan Detail (`/loans/[loanId]`)

**Purpose**: Full loan application details with admin actions.

**Sections**:
- **Applicant Info**: Name, email, phone, gender, WhatsApp, assigned counselor
- **Course Details**: Country, college, course, level, start date, offer letter status
- **Financial Details**: Loan amount, collateral, co-applicant income, existing EMIs
- **Timeline**: Created, submitted, last status change, notes, source
- **Bank Offers Table**: All matched offers with rates, EMIs, and status

**Admin Actions**:
- **Update Status**: Dialog showing only valid next statuses (enforces state machine)
- **Assign Counselor**: Dialog with active counselors and their caseloads
- **Match Bank Offers**: Triggers bank matching algorithm

**Valid Loan Status Transitions**:
```
draft → applied, withdrawn
applied → docs_pending, rejected, withdrawn
docs_pending → docs_verified, rejected, withdrawn
docs_verified → under_review, rejected, withdrawn
under_review → approved, rejected, withdrawn
approved → documentation, rejected, withdrawn
documentation → disbursed, rejected, withdrawn
disbursed → (terminal)
rejected → (terminal)
withdrawn → (terminal)
```

**API Endpoints Used**:
- `GET /api/v1/loans/{loan_id}`
- `PATCH /api/v1/loans/{loan_id}/status`
- `GET /api/v1/banks/offers/{loan_id}`
- `POST /api/v1/banks/match-offers`
- `POST /api/v1/counselors/assign`
- `GET /api/v1/counselors`

---

### 6. Documents (`/documents`)

**Purpose**: Review uploaded user documents.

**Features**:
- Filter by document status (pending_review, under_review, verified, rejected, expired)
- Preview documents (images inline, PDFs in iframe)
- Approve or reject documents with rejection reason

**Table Columns**: File Name, Type, User ID, Status (badge), Uploaded At, Actions (preview, approve, reject)

**API Endpoints Used**:
- `GET /api/v1/documents/review?status=X`
- `PATCH /api/v1/documents/{doc_id}/review`

---

### 7. Counselors (`/counselors`)

**Purpose**: Manage counselor profiles.

**Features**:
- View all counselors with caseload info
- Create new counselor (dialog form)
- Edit existing counselor (dialog form)
- Toggle active/inactive status
- Manage specializations (comma-separated input)

**Table Columns**: Name, Email, Cases (current/max), Specializations (badges), Active (badge), Actions

**Form Fields**: Name, Email, Title, Phone, WhatsApp, Max Cases, Available Hours, Specializations, Active toggle

**API Endpoints Used**:
- `GET /api/v1/counselors`
- `POST /api/v1/counselors`
- `PATCH /api/v1/counselors/{counselor_id}`

---

### 8. Referrals & Payouts (`/referrals`)

**Purpose**: Manage referral program and process payouts.

**Tab 1 — Referrals**:
- View all referrals with status
- Process referral through stages: signed_up → applied → sanctioned → disbursed

**Tab 2 — Payouts**:
- Filter by payout status
- Process pending payouts with bank account details (account number, IFSC, holder name)

**Referral Table Columns**: Code, Referrer ID, Referee ID, Status (badge), Created At, Actions
**Payout Table Columns**: User ID, Amount, Bonus, Type, Status (badge), Created At, Actions

**API Endpoints Used**:
- `GET /api/v1/referrals`
- `POST /api/v1/referrals/process`
- `GET /api/v1/referrals/payouts?status=X`
- `POST /api/v1/referrals/payouts/process`

---

### 9. Contacts (`/contacts`)

**Purpose**: Manage contact form submissions.

**Features**:
- Filter by status (new, contacted, resolved, spam)
- Update status via dialog
- Add admin notes

**Table Columns**: Name, Email, Phone, Message (truncated), Loan Type, Status (badge), Created At, Actions

**API Endpoints Used**:
- `GET /api/v1/contacts?status=X`
- `PATCH /api/v1/contacts/{submission_id}`

---

### 10. Notifications (`/notifications`)

**Purpose**: Send notifications to specific users.

**Features**:
- User search (searches by name, email, phone)
- Select notification type
- Set title and message
- Optional link
- Toggle to also send via email

**Form Fields**: User search, Type (dropdown), Title, Message (textarea), Link (optional), Send via email (toggle)

**API Endpoints Used**:
- `GET /api/v1/users?search=X` (user search)
- `POST /api/v1/notifications/send`

---

## Authentication Flow

### Middleware (`middleware.ts`)
- Runs on every request (except static assets)
- No session + not on `/login` → redirect to `/login`
- Has session + on `/login` → redirect to `/dashboard`
- Root `/` → redirect to `/dashboard` (if logged in) or `/login`

### Auth Provider (`components/providers.tsx`)
- Listens to Supabase auth state changes
- On session change, fetches user profile to check admin role
- Provides `session`, `user`, `isAdmin`, `isLoading`, `signOut` via React Context

### Admin Guard (`(admin)/layout.tsx`)
- Client-side check: if not admin after loading, signs out and redirects to `/login`
- Shows loading skeleton while checking

### API Client (`lib/api-client.ts`)
- Injects `Authorization: Bearer <token>` on every request
- On 401 response → auto signs out and redirects to `/login`

---

## API Client

All API calls go through `lib/api-client.ts`:

```typescript
import { api } from "@/lib/api-client";

// GET with query params
const users = await api.get<PaginatedResponse<Profile>>("/api/v1/users", {
  page: 1,
  page_size: 25,
  search: "john",
});

// POST with body
const result = await api.post("/api/v1/counselors", {
  name: "John Doe",
  email: "john@example.com",
});

// PATCH with body
const updated = await api.patch(`/api/v1/loans/${loanId}/status`, {
  status: "approved",
  notes: "All documents verified",
});
```

**Features**:
- Auto JWT injection from Supabase session
- Auto sign-out on 401
- Query param serialization (skips undefined values)
- JSON error extraction

---

## React Query Hooks

### Query Hooks (GET requests)

| Hook | Endpoint | Returns |
|------|----------|---------|
| `useDashboardStats()` | `GET /admin/stats` | `AdminDashboardStats` |
| `useUsers(params)` | `GET /users?...` | `PaginatedResponse<Profile>` |
| `useUser(userId)` | `GET /users/{id}` | `Profile` |
| `useLoans(params)` | `GET /loans?...` | `LoanApplication[]` |
| `useLoan(loanId)` | `GET /loans/{id}` | `LoanApplication` |
| `useBankOffers(loanId)` | `GET /banks/offers/{id}` | `BankOffer[]` |
| `useDocumentsForReview(status)` | `GET /documents/review?...` | `Document[]` |
| `useCounselors()` | `GET /counselors` | `Counselor[]` |
| `useReferrals()` | `GET /referrals` | `Referral[]` |
| `usePayouts(status)` | `GET /referrals/payouts?...` | `ReferralPayout[]` |
| `useContacts(status)` | `GET /contacts?...` | `ContactSubmission[]` |

### Mutation Hooks (POST/PATCH requests)

| Hook | Endpoint | Invalidates |
|------|----------|-------------|
| `useUpdateUserRole()` | `PATCH /users/{id}/role` | `["users"]` |
| `useUpdateLoanStatus()` | `PATCH /loans/{id}/status` | `["loans"]` |
| `useReviewDocument()` | `PATCH /documents/{id}/review` | `["documents"]` |
| `useCreateCounselor()` | `POST /counselors` | `["counselors"]` |
| `useUpdateCounselor()` | `PATCH /counselors/{id}` | `["counselors"]` |
| `useAssignCounselor()` | `POST /counselors/assign` | `["loans", "counselors"]` |
| `useMatchBankOffers()` | `POST /banks/match-offers` | `["bank-offers"]` |
| `useProcessReferral()` | `POST /referrals/process` | `["referrals"]` |
| `useProcessPayout()` | `POST /referrals/payouts/process` | `["payouts"]` |
| `useUpdateContact()` | `PATCH /contacts/{id}` | `["contacts"]` |
| `useSendNotification()` | `POST /notifications/send` | — |

---

## TypeScript Types

All types in `src/types/` mirror the backend Pydantic schemas:

| File | Types | Backend Schema |
|------|-------|---------------|
| `user.ts` | `Profile` | `ProfileOut` |
| `loan.ts` | `LoanApplication`, `LoanStatusUpdate` | `LoanApplicationOut`, `LoanStatusUpdate` |
| `document.ts` | `Document`, `DocumentReview` | `DocumentOut`, `DocumentReview` |
| `counselor.ts` | `Counselor`, `CounselorCreate`, `CounselorUpdate`, `AssignCounselorRequest` | Matching schemas |
| `referral.ts` | `Referral`, `ReferralPayout`, `ProcessReferralRequest`, `ProcessPayoutRequest` | Matching schemas |
| `contact.ts` | `ContactSubmission`, `ContactStatusUpdate` | `ContactSubmissionOut`, `ContactStatusUpdate` |
| `notification.ts` | `Notification`, `SendNotificationRequest` | `NotificationOut`, `SendNotificationRequest` |
| `bank.ts` | `Bank`, `BankOffer` | `BankOut`, `BankOfferOut` |
| `admin.ts` | `AdminDashboardStats` | `AdminDashboardStats` |
| `common.ts` | `PaginatedResponse<T>`, `SuccessResponse` | Paginated/success wrappers |

---

## Constants

`src/lib/constants.ts` mirrors all backend enums:

| Constant | Values |
|----------|--------|
| `LoanStatus` | draft, applied, docs_pending, docs_verified, under_review, approved, documentation, disbursed, rejected, withdrawn |
| `VALID_LOAN_TRANSITIONS` | Maps each status → valid next statuses |
| `DocumentStatus` | pending_review, under_review, verified, rejected, expired |
| `DocumentType` | passport, pan_card, aadhar, offer_letter, transcript, sop, lor, resume, bank_statement, itr, salary_slip, property_docs, co_applicant_docs, photo, other |
| `UserRole` | user, counselor, admin |
| `ContactStatus` | new, contacted, resolved, spam |
| `ReferralStatus` | signed_up, applied, sanctioned, disbursed, paid, expired |
| `PayoutStatus` | pending, processing, completed, failed, reversed |
| `NotificationType` | welcome, application_update, document_update, counselor_assigned, bank_offers, referral_update, payout_update, general |
| `BankOfferStatus` | pending, presented, accepted, rejected |

---

## Utility Functions

`src/lib/utils.ts`:

| Function | Description | Example |
|----------|-------------|---------|
| `cn(...classes)` | Tailwind class merge | `cn("px-4", active && "bg-blue-500")` |
| `formatCurrency(amount)` | INR currency format | `formatCurrency(500000)` → `"₹5,00,000"` |
| `formatDate(date)` | Short date | `"16 Mar 2026"` |
| `formatDateTime(date)` | Date + time | `"16 Mar 2026, 10:30 AM"` |
| `statusColor(status)` | Tailwind classes for status badges | `statusColor("approved")` → `"bg-green-100 text-green-700"` |
| `formatStatus(status)` | Snake case → title case | `formatStatus("docs_pending")` → `"Docs Pending"` |

---

## Component Library

### UI Primitives (`components/ui/`)

Built on Radix UI + CVA (Class Variance Authority):

| Component | Based On | Variants |
|-----------|----------|----------|
| `Button` | Native button + Radix Slot | default, destructive, outline, secondary, ghost, link × default, sm, lg, icon |
| `Badge` | Native div | default, secondary, destructive, outline |
| `Card` | Native div | CardHeader, CardTitle, CardDescription, CardContent |
| `Dialog` | Radix Dialog | DialogHeader, DialogFooter, DialogTitle, DialogDescription |
| `Select` | Radix Select | SelectTrigger, SelectContent, SelectItem |
| `Table` | Native table | TableHeader, TableBody, TableRow, TableHead, TableCell |
| `Tabs` | Radix Tabs | TabsList, TabsTrigger, TabsContent |
| `Input` | Native input | — |
| `Textarea` | Native textarea | — |
| `Label` | Radix Label | — |
| `Switch` | Radix Switch | — |
| `DropdownMenu` | Radix DropdownMenu | DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem |
| `Separator` | Radix Separator | horizontal, vertical |
| `ScrollArea` | Radix ScrollArea | — |
| `Skeleton` | Native div | Animated pulse |

### Shared Components (`components/shared/`)

| Component | Props | Description |
|-----------|-------|-------------|
| `DataTable` | `columns`, `data`, `searchKey?`, `searchValue?` | TanStack Table wrapper with sorting + filtering |
| `StatCard` | `title`, `value`, `description?`, `icon` | Dashboard metric card |
| `StatusBadge` | `status`, `className?` | Colored status pill |
| `ConfirmDialog` | `open`, `onOpenChange`, `title`, `description`, `onConfirm`, `loading?`, `destructive?` | Confirmation modal |
| `PageHeader` | `title`, `description?`, `children?` | Page title + action buttons |

### Layout Components (`components/layout/`)

| Component | Description |
|-----------|-------------|
| `AppShell` | Sidebar + Header + scrollable main content area |
| `Sidebar` | Fixed left nav with 8 links + FMC logo |
| `Header` | Sticky top bar with user email + sign out dropdown |

---

## Backend API Endpoints Used

The admin panel consumes these existing FastAPI endpoints:

### Admin-Only Endpoints
| Method | Endpoint | Used In |
|--------|----------|---------|
| GET | `/api/v1/admin/stats` | Dashboard |
| PATCH | `/api/v1/users/{id}/role?role=X` | Users page |
| POST | `/api/v1/counselors` | Counselors page |
| PATCH | `/api/v1/counselors/{id}` | Counselors page |
| GET | `/api/v1/referrals` | Referrals page |
| POST | `/api/v1/referrals/process` | Referrals page |
| GET | `/api/v1/referrals/payouts?status=X` | Referrals page |
| POST | `/api/v1/referrals/payouts/process` | Referrals page |
| POST | `/api/v1/notifications/send` | Notifications page |

### Staff-Only Endpoints (admin + counselor)
| Method | Endpoint | Used In |
|--------|----------|---------|
| GET | `/api/v1/users?page=X&page_size=25&role=Y&search=Z` | Users page |
| GET | `/api/v1/users/{id}` | Users page, Auth check |
| GET | `/api/v1/loans?status=X&counselor_id=Y` | Loans page |
| PATCH | `/api/v1/loans/{id}/status` | Loan detail |
| GET | `/api/v1/documents/review?status=X` | Documents page |
| PATCH | `/api/v1/documents/{id}/review` | Documents page |
| POST | `/api/v1/counselors/assign` | Loan detail |
| POST | `/api/v1/banks/match-offers` | Loan detail |
| GET | `/api/v1/contacts?status=X` | Contacts page |
| PATCH | `/api/v1/contacts/{id}` | Contacts page |

### Public Endpoints
| Method | Endpoint | Used In |
|--------|----------|---------|
| GET | `/api/v1/counselors` | Loans page, Loan detail |
| GET | `/api/v1/loans/{id}` | Loan detail |
| GET | `/api/v1/banks/offers/{loan_id}` | Loan detail |

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
cd fundmycampus-admin
git init
git add .
git commit -m "Initial commit: FundMyCampus admin panel"
git remote add origin https://github.com/your-org/fundmycampus-admin.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and import the GitHub repo
2. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` → `https://api.fundmycampus.com`
3. Deploy

### 3. Custom Domain

1. In Vercel project settings → Domains → Add `admin.fundmycampus.com`
2. Update DNS: CNAME `admin` → `cname.vercel-dns.com`

### 4. Backend CORS

The backend `app/config.py` already includes `https://admin.fundmycampus.com` in CORS origins. If deploying to a different domain, update the `cors_origins` list.

---

## Known Limitations & Future Improvements

### Current Limitations
1. **No pagination** on loans, documents, contacts, counselors, referrals endpoints — returns all records. Fine for initial scale, needs pagination as data grows.
2. **No loan status history** — the loan detail page shows current status but no timeline of past changes. Would need a `GET /loans/{id}/history` endpoint.
3. **No monthly trend charts** — dashboard shows current stats but no time-series data. Would need a new stats endpoint or client-side derivation from `created_at` dates.
4. **Document preview** depends on file URLs being publicly accessible or signed URLs from Supabase Storage.
5. **No mobile responsive sidebar** — sidebar is hidden on mobile (`md:block`). Would need a hamburger menu / drawer.

### Potential Improvements
- Add real-time updates via Supabase Realtime subscriptions
- Add bulk actions (approve multiple documents, change multiple loan statuses)
- Add export to CSV/Excel for tables
- Add advanced search/filtering with date ranges
- Add user detail sheet/page with full profile + their loans + documents
- Add activity log / audit trail
- Add dark mode toggle
- Add role-based feature flags (different views for counselor vs admin)
