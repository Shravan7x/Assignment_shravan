# Expense Voucher Management System

A full-stack web application designed to digitize and streamline the process of creating, approving, and tracking employee expense vouchers.

## 🚀 Features

### **Roles and Permissions**
- **Employee**: Can create vouchers, save as Draft, upload signature, submit for approval, edit/delete Drafts, and track the status of their own vouchers.
- **Director (Admin)**: Can view all submitted vouchers, approve or reject them with a digital signature, and provide rejection reasons.
- **Accounts Team**: Can view all approved/submitted vouchers across the organization, monitor approval statuses, and download/print vouchers for reimbursement.

### **Core Functionality**
- **Authentication**: JWT-based secure login system with Role-Based Access Control (RBAC).
- **Voucher Lifecycle**: Draft ➔ Submitted ➔ Pending Approval ➔ Approved / Rejected.
- **File Uploads**: Native image uploads for Employee and Director signatures utilizing Supabase Storage.
- **Search & Filter**: Real-time searching and filtering by voucher number, department, status, category, date range, and amount ranges (built with Fuse.js).
- **Print / PDF Download**: Clean, A4-formatted printable view for the Accounts Team and archiving.
- **Dashboards**: Role-specific dashboards with accurate statistical calculations and quick actions.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), TailwindCSS, React Router DOM, Axios, Fuse.js, React-To-Print.
- **Backend**: Node.js, Express.js, Multer (for file uploads).
- **Database**: PostgreSQL (hosted via Supabase).
- **Storage**: Supabase Storage Buckets.

---

## ⚙️ Project Setup Instructions

### Prerequisites
- Node.js (v18+)
- A Supabase Project (PostgreSQL)

### 1. Database Setup
1. Create a new Supabase project.
2. Run the SQL script found in `database/schema.sql` in the Supabase SQL Editor.
3. In Supabase Storage, create a **public** bucket named `signatures`.

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory based on `.env.example`:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The frontend runs on `http://localhost:3000` and proxies API requests to `http://localhost:5000`.

### 4. Test Accounts (Seed Data)
The database schema includes a seed script that creates three default users (password for all is `password123`):
- **Employee**: `shravan@company.com`
- **Director**: `rajesh@company.com`
- **Accounts**: `priya@company.com`

---

## 🗄️ Database Schema Explanation

The database consists of two core tables: `users` and `vouchers`.

- **`users` Table**: Stores employee details, authentication credentials (passwords are stored as plain text for this demo assignment, but in production would use bcrypt), and RBAC `role` ('employee', 'director', 'accounts').
- **`vouchers` Table**: The central entity representing an expense claim.
  - Linked to `users` via `created_by` (Employee) and `approved_by` (Director).
  - Uses a `status` ENUM (`draft`, `pending_approval`, `approved`, `rejected`) to enforce the business logic state machine.
  - Contains signature URLs (`employee_signature`, `director_signature`) pointing to Supabase Storage.

---

## 📖 API Documentation

### **Auth Routes**
- `POST /api/auth/login` - Authenticates user and returns JWT.
- `GET /api/auth/me` - Returns current user profile (requires JWT).

### **Voucher Routes** (Protected)
- `POST /api/vouchers` - Creates a new Draft voucher.
- `GET /api/vouchers` - Retrieves vouchers based on user role and query filters.
- `GET /api/vouchers/:id` - Retrieves detailed view of a specific voucher.
- `PUT /api/vouchers/:id` - Updates a Draft voucher.
- `DELETE /api/vouchers/:id` - Deletes a Draft voucher.
- `PATCH /api/vouchers/:id/submit` - Submits a Draft to `pending_approval`.
- `PATCH /api/vouchers/:id/approve` - Approves a voucher (requires `director_signature`).
- `PATCH /api/vouchers/:id/reject` - Rejects a voucher (requires `rejection_reason`).

### **Upload Routes** (Protected)
- `POST /api/upload/signature` - Accepts `multipart/form-data` image file and uploads it to Supabase Storage, returning the public URL.

### **Dashboard Routes** (Protected)
- `GET /api/dashboard/stats` - Returns calculated aggregates (total counts, pending amounts, etc.) tailored to the requesting user's role.

---

## 🤔 Assumptions Made During Development

1. **Authentication & User Provisioning**: There is no public "Signup" page for employees. In typical internal enterprise applications (like an expense management system), employee accounts are provisioned centrally by IT or HR, not via self-registration. Passwords in the seed file are provided for demo purposes, but in production, they are hashed using `bcrypt` and managed through secure internal flows.
2. **Session Management (JWT)**: JSON Web Tokens (JWT) are used for stateless authentication. The JWT session is explicitly configured with a **24-hour expiration time** (`expiresIn: '24h'`) to enforce session timeouts and improve security.
3. **Signature Storage**: Signatures are uploaded as image files rather than using a canvas drawing tool. They are securely uploaded via the backend using Multer memory storage and passed directly to Supabase Storage, returning a public URL.
4. **Draft Privacy**: Drafts are considered entirely private to the employee until submitted. Directors and Accounts users cannot see drafts in their tables or statistics.
5. **Dates and Timestamps**: All dates are managed using ISO 8601 strings to ensure frontend and backend compatibility, avoiding time-zone drift issues.
