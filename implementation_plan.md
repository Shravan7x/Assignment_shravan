# Expense Voucher Management System — Implementation Plan (v3 Final)

## Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Frontend | React (Vite) | Fast dev server, simple setup |
| Styling | TailwindCSS v4 | CSS-first config via `@import "tailwindcss"` |
| Backend | Node.js + Express | Simple MVC, no over-engineering |
| Database | Supabase (PostgreSQL) | Accessed via `@supabase/supabase-js` — **no Prisma, no ORM** |
| Storage | Supabase Storage | Bucket for signature images |
| Auth | Custom JWT | `bcryptjs` + `jsonwebtoken` — not Supabase Auth |
| Search | Fuse.js | Client-side fuzzy search across voucher fields |
| Print/PDF | react-to-print | Print and "Save as PDF" from browser |

> [!IMPORTANT]
> **No ORM.** All database calls go through the Supabase JS client (`supabase.from('vouchers').select(...)`) which is already clean and readable. Schema is created via raw SQL in Supabase's SQL Editor.

---

## 1. Project Structure

```
expense-voucher-system/
│
├── client/                              ← React frontend
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx               ← Sidebar + Navbar wrapper
│   │   │   ├── Sidebar.jsx              ← Role-based nav links
│   │   │   ├── Navbar.jsx               ← User info + logout
│   │   │   ├── ProtectedRoute.jsx       ← Auth + role guard
│   │   │   ├── StatsCard.jsx            ← Dashboard metric card
│   │   │   ├── VoucherTable.jsx         ← Reusable data table
│   │   │   ├── StatusBadge.jsx          ← Color-coded status pill
│   │   │   ├── SearchFilterBar.jsx      ← Fuse.js search + filter dropdowns
│   │   │   ├── SignatureUpload.jsx      ← Image upload + preview
│   │   │   ├── ConfirmModal.jsx         ← Approve/Reject/Delete confirmation
│   │   │   └── PrintableVoucher.jsx     ← Print-optimized voucher layout
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── employee/
│   │   │   │   ├── EmployeeDashboard.jsx
│   │   │   │   ├── CreateVoucher.jsx
│   │   │   │   ├── MyVouchers.jsx
│   │   │   │   ├── EditVoucher.jsx
│   │   │   │   └── VoucherDetails.jsx
│   │   │   ├── director/
│   │   │   │   ├── DirectorDashboard.jsx
│   │   │   │   ├── PendingApprovals.jsx
│   │   │   │   ├── AllVouchers.jsx
│   │   │   │   └── VoucherReview.jsx    ← Details + Approve/Reject actions
│   │   │   └── accounts/
│   │   │       ├── AccountsDashboard.jsx
│   │   │       ├── AllVouchers.jsx
│   │   │       └── VoucherDetails.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx          ← JWT token + user state + login/logout
│   │   │
│   │   ├── hooks/
│   │   │   └── useFuseSearch.js         ← Custom hook wrapping Fuse.js
│   │   │
│   │   ├── services/
│   │   │   └── api.js                   ← Axios instance + every API call
│   │   │
│   │   ├── utils/
│   │   │   ├── formatDate.js            ← "Sep 3, 2026" style formatter
│   │   │   └── formatCurrency.js        ← "₹1,200.00" style formatter
│   │   │
│   │   ├── App.jsx                      ← React Router routes
│   │   ├── index.css                    ← Tailwind imports + @theme
│   │   └── main.jsx                     ← Entry point
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                              ← Express backend
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js              ← Supabase client init
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js                  ← JWT verify → req.user
│   │   │   ├── authorize.js             ← Role-based access → authorize('director')
│   │   │   └── upload.js                ← Multer config (memory storage for Supabase)
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── voucher.routes.js
│   │   │   ├── upload.routes.js
│   │   │   └── dashboard.routes.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js       ← login, getMe
│   │   │   ├── voucher.controller.js    ← CRUD + submit/approve/reject
│   │   │   ├── upload.controller.js     ← Signature → Supabase Storage
│   │   │   └── dashboard.controller.js  ← Stats per role
│   │   │
│   │   ├── utils/
│   │   │   └── generateVoucherNumber.js ← VCH-YYYYMMDD-NNN logic
│   │   │
│   │   └── server.js                    ← Express app + CORS + routes
│   │
│   ├── package.json
│   └── .env.example
│
├── database/
│   └── schema.sql                       ← Raw SQL to run in Supabase SQL Editor
│
├── README.md
└── .gitignore
```

---

## 2. Database Schema (Raw SQL)

This SQL is run directly in **Supabase Dashboard → SQL Editor**.

```sql
-- ============================================
-- EXPENSE VOUCHER MANAGEMENT SYSTEM
-- Database Schema for Supabase (PostgreSQL)
-- ============================================

-- 1. Users Table
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(100)  NOT NULL UNIQUE,
    password        VARCHAR(255)  NOT NULL,            -- bcrypt hash
    role            VARCHAR(20)   NOT NULL
                    CHECK (role IN ('employee', 'director', 'accounts')),
    department      VARCHAR(100),
    employee_id     VARCHAR(50),                       -- optional
    created_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- 2. Vouchers Table
CREATE TABLE vouchers (
    id                   SERIAL PRIMARY KEY,
    voucher_number       VARCHAR(20)    NOT NULL UNIQUE,   -- auto: VCH-20260903-001
    created_by           INT            NOT NULL REFERENCES users(id),

    -- Basic Info
    voucher_date         DATE           NOT NULL,
    expense_date         DATE           NOT NULL,
    department           VARCHAR(100)   NOT NULL,
    expense_title        VARCHAR(200)   NOT NULL,
    expense_category     VARCHAR(100)   NOT NULL,
    expense_description  TEXT,
    amount               DECIMAL(10,2)  NOT NULL CHECK (amount > 0),

    -- Status & Approval
    status               VARCHAR(20)    NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft','submitted','pending_approval','approved','rejected')),
    employee_signature   TEXT,                              -- Supabase Storage URL
    director_signature   TEXT,                              -- Supabase Storage URL
    approved_by          INT            REFERENCES users(id),
    approval_date        TIMESTAMPTZ,
    rejection_reason     TEXT,

    -- Audit
    created_at           TIMESTAMPTZ    DEFAULT NOW(),
    updated_at           TIMESTAMPTZ    DEFAULT NOW()
);

-- 3. Index for faster lookups
CREATE INDEX idx_vouchers_created_by ON vouchers(created_by);
CREATE INDEX idx_vouchers_status     ON vouchers(status);

-- 4. Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vouchers_updated_at
    BEFORE UPDATE ON vouchers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA: 3 users (passwords = "password123")
-- bcrypt hash for "password123":
-- $2a$10$Xw8rQHq8z0dF6G2sK0v5wOQZzXjY5u6YvKp7rNmW3kL1hJ4eC9xAi
-- (we'll generate real hashes in the seed script)
-- ============================================
-- Seed users are inserted via the backend seed script
-- so passwords are properly bcrypt-hashed at runtime.
```

### Seed Users (inserted via a backend script)

| Name | Email | Role | Department | Password |
|------|-------|------|------------|----------|
| Shravan Kumar | shravan@company.com | employee | Engineering | password123 |
| Rajesh Sharma | rajesh@company.com | director | Management | password123 |
| Priya Verma | priya@company.com | accounts | Finance | password123 |

```
server/src/seed.js  ← one-time script: reads users, bcrypt-hashes passwords, inserts into Supabase
Run with: node src/seed.js
```

---

## 3. API Design

### Auth Routes

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| POST | `/api/auth/login` | Public | Validate credentials, return JWT + user |
| GET | `/api/auth/me` | Any authenticated | Return current user from token |

### Voucher Routes

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| POST | `/api/vouchers` | Employee | Create a new voucher (status=draft) |
| GET | `/api/vouchers` | All roles | List vouchers (scoped by role) |
| GET | `/api/vouchers/:id` | All roles (scoped) | Get single voucher with creator info |
| PUT | `/api/vouchers/:id` | Employee | Edit own draft voucher |
| DELETE | `/api/vouchers/:id` | Employee | Delete own draft voucher |
| PATCH | `/api/vouchers/:id/submit` | Employee | Submit draft → pending_approval |
| PATCH | `/api/vouchers/:id/approve` | Director | Approve + attach director signature |
| PATCH | `/api/vouchers/:id/reject` | Director | Reject + attach rejection reason |

**Scoping logic inside `GET /api/vouchers` controller:**
```
if role === 'employee'  → WHERE created_by = req.user.id
if role === 'director'  → all vouchers (no filter)
if role === 'accounts'  → all vouchers (no filter)
```

**Query params for server-side filtering:**
```
GET /api/vouchers?status=approved&category=Travel&sortBy=created_at&sortOrder=desc
```

### Upload Routes

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| POST | `/api/upload/signature` | Employee, Director | Upload image → Supabase Storage → return public URL |

### Dashboard Routes

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| GET | `/api/dashboard/stats` | All roles | Return role-specific dashboard numbers |

**What the stats endpoint returns per role:**

| Role | Stats Returned |
|------|----------------|
| Employee | total, draft, pending, approved, rejected, totalAmountClaimed (own vouchers only) |
| Director | pendingCount, approvedToday, rejectedToday, totalPendingAmount, recentActivity |
| Accounts | total, pending, approved, rejected, totalApprovedAmount, recentApproved |

---

## 4. Key Implementation Details

### Supabase Client (server-side)

```js
// server/src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY   // service role for server-side DB access
);

module.exports = supabase;
```

### Database Query Style (no ORM, just Supabase JS client)

```js
// Example: Fetch employee's own vouchers
const { data, error } = await supabase
    .from('vouchers')
    .select('*, users!created_by(name, email, employee_id)')
    .eq('created_by', req.user.id)
    .order('created_at', { ascending: false });

// Example: Create a voucher
const { data, error } = await supabase
    .from('vouchers')
    .insert({
        voucher_number: generatedNumber,
        created_by: req.user.id,
        voucher_date: req.body.voucher_date,
        expense_date: req.body.expense_date,
        department: req.body.department,
        expense_title: req.body.expense_title,
        expense_category: req.body.expense_category,
        expense_description: req.body.expense_description,
        amount: req.body.amount,
        status: 'draft'
    })
    .select()
    .single();
```

> [!TIP]
> This reads exactly like what a human developer would write — no magic, no abstraction layers, just straightforward queries.

### Voucher Number Generation

```js
// server/src/utils/generateVoucherNumber.js
// Format: VCH-YYYYMMDD-NNN
// Queries today's count from DB, increments by 1
```

### Signature Upload Flow

```
1. Frontend: User picks image → sends to POST /api/upload/signature (multipart/form-data)
2. Backend: Multer receives file in memory (memoryStorage)
3. Backend: supabase.storage.from('signatures').upload(filename, buffer)
4. Backend: Gets public URL → returns it to frontend
5. Frontend: Stores URL in form state
6. On voucher save/submit: URL is saved to employee_signature or director_signature column
```

### Fuse.js Search (client-side)

```js
// client/src/hooks/useFuseSearch.js
const fuseOptions = {
    keys: [
        'voucher_number',
        'employee_name',        // populated via join
        'department',
        'expense_title',
        'expense_category'
    ],
    threshold: 0.3,             // fuzzy tolerance
    includeScore: true
};

// The hook takes the full voucher array + search query
// Returns filtered results instantly as the user types
```

**Combined filtering flow:**
```
API returns all vouchers (scoped by role)
        │
   ┌────┴────┐
   │         │
Fuse.js    JS .filter()
fuzzy      for dropdowns:
text       Status, Category,
search     Date Range, Amount Range
   │         │
   └────┬────┘
        │
  Final filtered list → renders in VoucherTable
```

### Print / Download

```
- PrintableVoucher.jsx renders a clean, paper-friendly layout
- react-to-print hooks into the component ref
- "Print" button → opens browser print dialog
- "Download PDF" → same dialog, user picks "Save as PDF"
- Tailwind print: variant hides sidebar, navbar, buttons
```

---

## 5. Validation & Business Rules Enforcement Map

| Rule | Where Enforced | How |
|------|----------------|-----|
| Unique voucher number | DB `UNIQUE` constraint + auto-generation | `generateVoucherNumber()` |
| New voucher = draft | Controller | Hardcodes `status: 'draft'` on create |
| Edit/delete only drafts | Controller | Checks `status === 'draft' && created_by === userId` |
| Submitted = read-only | Controller | Rejects PUT/DELETE if status ≠ `draft` |
| Only Director approves/rejects | Middleware | `authorize('director')` on approve/reject routes |
| Approved = read-only | Controller | Rejects edits on approved vouchers |
| Rejection needs reason | Controller + Frontend | Validates `rejection_reason` is not empty |
| Employee sees own only | Controller | `WHERE created_by = userId` on queries |
| Director/Accounts see all | Controller | No `created_by` filter |
| Department required | Frontend + Controller | Required field check |
| Expense Title required | Frontend + Controller | Required field check |
| Expense Date required | Frontend + Controller | Required field check |
| Amount > 0 | Frontend + Controller + DB | `CHECK (amount > 0)` in schema |
| Employee sig before submit | Controller | Checks `employee_signature` exists |
| Director sig before approve | Controller | Checks signature is uploaded |

---

## 6. Step-by-Step Execution Guide

### Phase 1 — Scaffold & Database (~15 min)

| Step | Task |
|------|------|
| 1 | Create root folder `expense-voucher-system/` |
| 2 | `npm create vite@latest ./client -- --template react` inside it |
| 3 | Install client deps: `react-router-dom`, `axios`, `fuse.js`, `react-to-print`, `tailwindcss@4`, `@tailwindcss/vite` |
| 4 | Set up TailwindCSS v4 in `vite.config.js` + `index.css` with `@import "tailwindcss"` and `@theme` block |
| 5 | `npm init -y` inside `server/`, install: `express`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `multer`, `@supabase/supabase-js` |
| 6 | Create Supabase project → run `schema.sql` in SQL Editor |
| 7 | Create `signatures` storage bucket in Supabase (public access) |
| 8 | Write `.env.example`, `.gitignore` |
| 9 | Write `server/src/seed.js` → run it to insert 3 hashed users |

### Phase 2 — Backend Core (~1.5 hrs)

| Step | Task |
|------|------|
| 10 | `server/src/config/supabase.js` — init Supabase client |
| 11 | `server/src/server.js` — Express app, CORS, JSON parsing, route mounting |
| 12 | `server/src/middleware/auth.js` — JWT verification, attach `req.user` |
| 13 | `server/src/middleware/authorize.js` — `authorize('employee', 'director')` |
| 14 | `server/src/middleware/upload.js` — Multer with memory storage |
| 15 | `server/src/utils/generateVoucherNumber.js` — `VCH-YYYYMMDD-NNN` |
| 16 | `server/src/controllers/auth.controller.js` — login + getMe |
| 17 | `server/src/routes/auth.routes.js` — wire up auth endpoints |
| 18 | `server/src/controllers/voucher.controller.js` — create, getAll, getById, update, delete, submit, approve, reject |
| 19 | `server/src/routes/voucher.routes.js` — wire up with auth + authorize middleware |
| 20 | `server/src/controllers/upload.controller.js` — upload to Supabase Storage, return URL |
| 21 | `server/src/routes/upload.routes.js` — wire up upload route |
| 22 | `server/src/controllers/dashboard.controller.js` — stats queries per role |
| 23 | `server/src/routes/dashboard.routes.js` — wire up |
| 24 | Test all endpoints with Postman/Thunder Client |

### Phase 3 — Frontend Core (~2.5 hrs)

| Step | Task |
|------|------|
| 25 | `index.css` — Tailwind v4 theme (colors, fonts from Google Fonts `Inter`) |
| 26 | `context/AuthContext.jsx` — login/logout, token in localStorage, user state |
| 27 | `services/api.js` — Axios instance with base URL + JWT interceptor |
| 28 | `components/ProtectedRoute.jsx` — redirect if not authed or wrong role |
| 29 | `App.jsx` — all routes with ProtectedRoute wrappers |
| 30 | `pages/Login.jsx` — email + password form, error display |
| 31 | `components/Layout.jsx` + `Sidebar.jsx` + `Navbar.jsx` — shared shell |
| 32 | `components/StatsCard.jsx` + `StatusBadge.jsx` — reusable dashboard pieces |
| 33 | `pages/employee/EmployeeDashboard.jsx` — stats + recent vouchers |
| 34 | `pages/employee/CreateVoucher.jsx` — form + signature upload + save/submit |
| 35 | `components/SignatureUpload.jsx` — image picker + preview + upload to API |
| 36 | `pages/employee/MyVouchers.jsx` — table + search/filter |
| 37 | `hooks/useFuseSearch.js` — Fuse.js wrapper hook |
| 38 | `components/SearchFilterBar.jsx` — search input + filter dropdowns |
| 39 | `components/VoucherTable.jsx` — sortable columns, status badges, row click |
| 40 | `pages/employee/VoucherDetails.jsx` — full detail view + print/download |
| 41 | `components/PrintableVoucher.jsx` — print-optimized layout |
| 42 | `pages/employee/EditVoucher.jsx` — pre-filled form for drafts only |
| 43 | `pages/director/DirectorDashboard.jsx` — stats + recent activity |
| 44 | `pages/director/PendingApprovals.jsx` — filtered table |
| 45 | `pages/director/AllVouchers.jsx` — full table + search/filter |
| 46 | `pages/director/VoucherReview.jsx` — details + approve/reject modals |
| 47 | `components/ConfirmModal.jsx` — for approve (with sig upload) and reject (with reason textarea) |
| 48 | `pages/accounts/AccountsDashboard.jsx` — stats |
| 49 | `pages/accounts/AllVouchers.jsx` — full table + search/filter |
| 50 | `pages/accounts/VoucherDetails.jsx` — read-only details + print/download |

### Phase 4 — Polish (~30 min)

| Step | Task |
|------|------|
| 51 | Loading spinners on all async operations |
| 52 | Toast or inline error messages for API failures |
| 53 | Form validation error messages below each field |
| 54 | Empty states ("No vouchers yet") |
| 55 | Responsive tweaks (sidebar collapse on mobile) |
| 56 | Print CSS — hide nav/sidebar, proper margins |

### Phase 5 — Documentation & Ship (~20 min)

| Step | Task |
|------|------|
| 57 | Write `README.md` — project overview, setup steps, schema explanation, API docs, assumptions |
| 58 | Finalize `.env.example` with all required vars |
| 59 | End-to-end test: login → create → submit → approve → print |
| 60 | `git init` → commit → push to GitHub |

**Estimated total: ~5 hours**

---

## .env.example

```env
# Server
PORT=5000
JWT_SECRET=your-secret-key-here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

```env
# Client (.env in client/)
VITE_API_URL=http://localhost:5000/api
```

---

## Assumptions

1. No user registration — 3 pre-seeded users, login only
2. Single Director user (one approver)
3. Voucher numbers: `VCH-YYYYMMDD-NNN` (auto-generated)
4. Signatures are image file uploads, not drawn-on-screen
5. No email notifications — in-app status tracking only
6. Supabase Storage for signature images (public bucket)
7. "Download PDF" uses browser's native "Save as PDF" from print dialog
8. Expense categories are preset: Travel, Food, Office Supplies, Software, Equipment, Training, Other
9. All vouchers load at once per role (Fuse.js searches the loaded set client-side)
10. `submitted` and `pending_approval` are treated as one transition — on submit, status goes directly to `pending_approval`
