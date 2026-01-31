# TPA3 Frontend - Project Report

## Overview

**Project**: TPA3 - Health Insurance System for Bank Melli Iran (سیستم بیمه درمان بانک ملی ایران)
**Frontend Stack**: React 18, TypeScript, Vite 6.4, Tailwind CSS 4
**Backend**: Laravel 12 with Sanctum Auth (102 API endpoints)
**Language**: Persian (Farsi), RTL layout
**API Base URL**: `http://localhost:8088/api/v1`

---

## Project Statistics

| Category | Count |
|---|---|
| Page Components (.tsx) | 41 |
| UI/Layout Components (.tsx) | 19 |
| API Modules (.ts) | 19 |
| Hooks (.ts) | 3 |
| Type Definitions (.ts) | 8 |
| State Stores (.ts) | 2 |
| Utility Modules (.ts) | 3 |
| **Total Source Files** | **97** (+ main.tsx, App.tsx, index.css, vite-env.d.ts) |
| Routes | 55 |
| Build Output | 1177 modules, 82 chunks |

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| react | 18 | UI Framework |
| react-dom | 18 | DOM Renderer |
| react-router-dom | 6 | Client-side Routing |
| typescript | 5.x | Type Safety |
| vite | 6.4 | Build Tool |
| tailwindcss | 4 | Utility-first CSS |
| @tanstack/react-query | 5 | Server State Management |
| zustand | 5 | Client State Management |
| axios | latest | HTTP Client |
| react-hook-form | latest | Form Management |
| zod | latest | Schema Validation |
| recharts | latest | Dashboard Charts |
| react-hot-toast | latest | Toast Notifications |
| @heroicons/react | latest | Icons |
| jalaali-js | latest | Jalali/Persian Calendar |

---

## Project Structure

```
frontend/
├── index.html                          # Entry HTML (RTL, Vazirmatn font)
├── vite.config.ts                      # Vite + React + Tailwind config
├── tsconfig.json                       # TypeScript strict mode
├── package.json                        # Dependencies
├── .env                                # VITE_API_URL
├── public/
│   └── logo.svg                        # Medical cross logo (gradient)
├── src/
│   ├── main.tsx                        # Entry point with ErrorBoundary
│   ├── App.tsx                         # 55 routes with lazy loading
│   ├── index.css                       # Tailwind @theme, custom colors, fonts
│   ├── vite-env.d.ts                   # Vite + jalaali-js type declarations
│   ├── api/                            # 19 API modules
│   │   ├── client.ts                   # Axios instance + interceptors
│   │   ├── auth.ts                     # Login, logout, me, changePassword
│   │   ├── employees.ts               # Employee CRUD + search + family
│   │   ├── employeeImport.ts           # Excel import + history
│   │   ├── insurances.ts              # Insurance CRUD + inquiry
│   │   ├── contracts.ts               # Contract CRUD
│   │   ├── items.ts                   # Item/catalog CRUD + prices
│   │   ├── diagnoses.ts              # Diagnosis list/get
│   │   ├── prescriptions.ts          # Prescription CRUD
│   │   ├── invoices.ts               # Invoice CRUD + calculate + submit
│   │   ├── claims.ts                 # Claim CRUD + transitions + notes + attachments
│   │   ├── centers.ts                # Center CRUD + doctors
│   │   ├── settlements.ts            # Settlement list + approve + pay
│   │   ├── commission.ts             # Commission cases + social work
│   │   ├── lookups.ts                # 13 lookup endpoints + 6 static lookups
│   │   ├── reports.ts                # Dashboard + claims + financial reports
│   │   ├── users.ts                  # User CRUD + toggleActive
│   │   ├── roles.ts                  # Role CRUD + permissions
│   │   └── audit.ts                  # Audit log list/get
│   ├── store/                          # 2 Zustand stores
│   │   ├── authStore.ts               # Token, user, login/logout (localStorage)
│   │   └── uiStore.ts                # Sidebar collapse state
│   ├── hooks/                          # 3 custom hooks
│   │   ├── useAuth.ts                 # Auto-fetch user on mount
│   │   ├── useLookups.ts             # 20 lookup hooks (API + static)
│   │   └── useDebounce.ts            # Debounce for search inputs
│   ├── components/
│   │   ├── layout/                     # 4 layout components
│   │   │   ├── AppLayout.tsx          # Sidebar + Header + Outlet
│   │   │   ├── Sidebar.tsx            # RTL navigation, collapsible
│   │   │   ├── Header.tsx             # Logo, user name, logout
│   │   │   └── Breadcrumb.tsx         # Auto-generated from route
│   │   ├── ui/                         # 14 reusable UI components
│   │   │   ├── DataTable.tsx          # Generic table (sort, filter, checkbox, pagination)
│   │   │   ├── Pagination.tsx         # Persian page numbers
│   │   │   ├── Modal.tsx              # Overlay dialog
│   │   │   ├── FormField.tsx          # Label + input + error wrapper
│   │   │   ├── SelectField.tsx        # Dropdown with loading state
│   │   │   ├── SearchInput.tsx        # Debounced search
│   │   │   ├── StatusBadge.tsx        # Color-coded status pills
│   │   │   ├── DatePicker.tsx         # Jalali/Persian date picker
│   │   │   ├── FileUpload.tsx         # Image/file upload with preview
│   │   │   ├── ConfirmDialog.tsx      # Delete confirmation
│   │   │   ├── LoadingSpinner.tsx     # Animated spinner
│   │   │   ├── EmptyState.tsx         # No data placeholder
│   │   │   └── Button.tsx            # 4 variants (primary/danger/secondary/ghost)
│   │   └── shared/                     # 2 shared components
│   │       ├── ProtectedRoute.tsx     # Auth guard
│   │       └── ErrorBoundary.tsx      # Runtime error catcher
│   ├── pages/                          # 41 page components
│   │   ├── auth/LoginPage.tsx
│   │   ├── dashboard/DashboardPage.tsx
│   │   ├── employees/ (6 pages)
│   │   ├── insurances/ (3 pages)
│   │   ├── contracts/ (2 pages)
│   │   ├── items/ (3 pages)
│   │   ├── diagnoses/ (1 page)
│   │   ├── prescriptions/ (2 pages)
│   │   ├── invoices/ (3 pages)
│   │   ├── claims/ (3 pages)
│   │   ├── centers/ (3 pages)
│   │   ├── settlements/ (2 pages)
│   │   ├── commission/ (4 pages)
│   │   ├── reports/ (2 pages)
│   │   ├── users/ (2 pages)
│   │   ├── roles/ (2 pages)
│   │   └── audit/ (1 page)
│   ├── types/                          # 8 type definition files
│   │   ├── api.ts                     # ApiResponse, PaginatedResponse, SelectOption
│   │   ├── employee.ts               # Employee, EmployeeFamily, EmployeeFormData
│   │   ├── insurance.ts              # Insurance, InsuranceInquiry
│   │   ├── claim.ts                  # Claim, ClaimNote, ClaimAttachment
│   │   ├── invoice.ts                # Invoice, InvoiceItem
│   │   ├── item.ts                   # Item, ItemPrice
│   │   ├── center.ts                 # Center, Settlement, CommissionCase, etc.
│   │   └── common.ts                 # LookupItem
│   └── utils/                          # 3 utility modules
│       ├── constants.ts               # Menu items, status labels/colors
│       ├── format.ts                  # Persian number, currency, date formatting
│       └── jalali.ts                  # Jalali calendar conversion helpers
```

---

## Implemented Modules

### 1. Authentication & Layout
- **Login Page**: Email/password form with gradient logo
- **Protected Routes**: Redirects to `/login` if no token
- **App Layout**: RTL sidebar + header + content area
- **Sidebar**: Collapsible navigation with nested menus and icons
- **Header**: Logo, user name display, logout button
- **Breadcrumb**: Auto-generated from current route path
- **Error Boundary**: Catches runtime errors with Persian message

### 2. Dashboard
- 4 stat cards: total employees, insured, active claims, total invoices
- Pie chart: claims by status
- Bar chart: claims by type
- Line chart: monthly trend
- Horizontal bar chart: top centers by claim count

### 3. Employee Module (6 pages)
- **List Page**: 15-column DataTable with dropdown filters for lookup columns, checkbox selection for bulk operations, search, pagination, sort
- **Create Page**: ~23 form fields with react-hook-form + zod validation, photo upload, Jalali date pickers
- **Edit Page**: Same form pre-filled with existing data
- **View Page**: Read-only detail view with tabs
- **Family Page**: Family member CRUD in modal dialog
- **Import Page**: Drag-and-drop Excel upload, import history table

### 4. Insurance Module (3 pages)
- **List Page**: Grid with filters, search, pagination
- **Form Page**: Create/edit insurance (shared component)
- **Inquiry Page**: Search by national code, display insurance status and ceiling

### 5. Contract Module (2 pages)
- **List Page**: Grid with filters, search, pagination
- **Form Page**: Create/edit contract with lookup dropdowns

### 6. Items/Catalog Module (3 pages)
- **List Page**: Drug/service catalog grid with category/group filters
- **Form Page**: Create/edit item with category and group selection
- **Price Page**: Price history management, add/edit prices in modal

### 7. Diagnosis Module (1 page)
- **List Page**: ICD-10 code search (read-only), pagination

### 8. Prescription Module (2 pages)
- **List Page**: Grid with type filter, search, pagination
- **Form Page**: Dynamic item rows using useFieldArray, auto-calculate totals

### 9. Invoice Module (3 pages)
- **List Page**: Grid with status filter, search, pagination
- **Form Page**: Dynamic invoice item rows with auto-calculation
- **View Page**: Pricing breakdown (insurance share, patient share, deductions, discounts), calculate button calls pricing engine, submit button for finalization

### 10. Claims Module (3 pages)
- **List Page**: Grid with status color-coded badges, status filter
- **Form Page**: Create/edit claim
- **View Page**: Full claim detail with:
  - Status workflow visualization (current state highlighted)
  - Transition buttons (fetched from `/next-statuses`)
  - Notes timeline with add note form
  - Attachments list with file upload
  - Associated invoices

### 11. Centers Module (3 pages)
- **List Page**: Grid with type filter, search, pagination
- **Form Page**: Create/edit with province/city cascade dropdowns
- **View Page**: Tabs for info, doctors management, contracts

### 12. Settlements Module (2 pages)
- **List Page**: Grid with status filter, search, pagination
- **View Page**: Settlement details with approve and pay action buttons

### 13. Commission Module (4 pages)
- **Case List Page**: Grid with type filter, search, pagination
- **Case Form Page**: Create/edit case with verdict section
- **Social Work List Page**: Grid with search, pagination
- **Social Work Form Page**: Create/edit with resolve section

### 14. Reports Module (2 pages)
- **Claim Report Page**: Filtered claims report with date range, status, type filters, export to Excel
- **Financial Report Page**: Financial summary with stat cards, charts, export

### 15. User Management (2 pages)
- **List Page**: User grid with toggle active/inactive switch
- **Form Page**: Create/edit user with role selection, password validation

### 16. Role Management (2 pages)
- **List Page**: Roles grid with delete
- **Form Page**: Create/edit role with grouped permissions and select-all per group

### 17. Audit Log (1 page)
- **Log Page**: Filterable audit log with user, action, entity filters, diff view modal

---

## Design System

### Color Palette
| Name | Hex | Usage |
|---|---|---|
| Primary | `#7d3cff` | Buttons, links, active states |
| Danger | `#c80e13` | Delete buttons, errors |
| Warning | `#f2d53c` | Warnings, pending status |
| Surface | `#fceed1` | Page background |
| Sidebar | `#1e1b4b` | Sidebar background |

### RTL Support
- `dir="rtl"` on `<html>` element
- Tailwind CSS logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`)
- Font: Vazirmatn (Google Fonts) - Persian/Arabic optimized
- All text and layouts are right-to-left

### DataTable Component
Modeled after the old Yii CGridView:
- Striped rows with alternating background
- Bordered with hover highlight
- Sortable column headers with arrow indicators
- Dropdown filter row below headers
- Checkbox column for bulk operations
- Action column with icon buttons
- Pagination bar with Persian numerals

### Reusable Components
- **Button**: 4 variants (primary, danger, secondary, ghost), 3 sizes, loading state, icon support
- **FormField**: Horizontal label + input + error message layout
- **SelectField**: Dropdown with loading spinner
- **DatePicker**: Full Jalali/Persian calendar with month/year navigation
- **FileUpload**: Drag-and-drop with image preview
- **StatusBadge**: 10 color-coded status pills
- **Modal**: Overlay dialog with ESC close and click-outside
- **ConfirmDialog**: Danger confirmation with loading state
- **SearchInput**: Debounced text search with magnifying glass icon

---

## API Architecture

### Client Configuration (`api/client.ts`)
- Base URL from `VITE_API_URL` environment variable
- Auto-attaches `Authorization: Bearer` token from Zustand store
- 401 responses redirect to `/login` and clear auth state
- Error responses display toast with API `message` field
- All responses unwrap `ApiResponse.data` automatically

### Lookup System (`api/lookups.ts` + `hooks/useLookups.ts`)
**API-backed lookups** (13 endpoints, cached with `staleTime: Infinity`):
- Provinces, Locations (by province)
- Relation Types, Guardianship Types
- Special Employee Types, Custom Employee Codes
- Item Categories, Item Groups
- Prescription Types, Document Types
- Body Part Types, Commission Case Types
- Institution Contract Types

**Static lookups** (6 constants, no API call):
- Genders (male/female)
- Employee Statuses (active/inactive/retired/suspended)
- Insurance Types (basic/supplementary)
- Claim Statuses (8 statuses: draft through closed)
- Claim Types (inpatient/outpatient/dental/para)
- Center Types (hospital/clinic/pharmacy/lab/imaging/dentistry/physiotherapy)

### State Management
- **Auth Store** (Zustand): Token, user object, login/logout actions, persisted to localStorage
- **UI Store** (Zustand): Sidebar collapsed state, mobile sidebar open state

---

## Routes

| Path | Page | Description |
|---|---|---|
| `/login` | LoginPage | Authentication |
| `/` | DashboardPage | Statistics and charts |
| `/employees` | EmployeeListPage | Employee grid |
| `/employees/create` | EmployeeCreatePage | New employee form |
| `/employees/import` | EmployeeImportPage | Excel import |
| `/employees/:id` | EmployeeViewPage | Employee details |
| `/employees/:id/edit` | EmployeeEditPage | Edit employee |
| `/employees/:id/family` | EmployeeFamilyPage | Family members |
| `/insurances` | InsuranceListPage | Insurance grid |
| `/insurances/create` | InsuranceFormPage | New insurance |
| `/insurances/:id/edit` | InsuranceFormPage | Edit insurance |
| `/insurances/inquiry` | InsuranceInquiryPage | Insurance inquiry |
| `/contracts` | ContractListPage | Contract grid |
| `/contracts/create` | ContractFormPage | New contract |
| `/contracts/:id/edit` | ContractFormPage | Edit contract |
| `/items` | ItemListPage | Item catalog |
| `/items/create` | ItemFormPage | New item |
| `/items/:id/edit` | ItemFormPage | Edit item |
| `/items/:id/price` | ItemPricePage | Price management |
| `/diagnoses` | DiagnosisListPage | ICD-10 search |
| `/prescriptions` | PrescriptionListPage | Prescription grid |
| `/prescriptions/create` | PrescriptionFormPage | New prescription |
| `/prescriptions/:id/edit` | PrescriptionFormPage | Edit prescription |
| `/invoices` | InvoiceListPage | Invoice grid |
| `/invoices/create` | InvoiceFormPage | New invoice |
| `/invoices/:id` | InvoiceViewPage | Invoice details |
| `/invoices/:id/edit` | InvoiceFormPage | Edit invoice |
| `/claims` | ClaimListPage | Claim grid |
| `/claims/create` | ClaimFormPage | New claim |
| `/claims/:id` | ClaimViewPage | Claim details |
| `/claims/:id/edit` | ClaimFormPage | Edit claim |
| `/centers` | CenterListPage | Center grid |
| `/centers/create` | CenterFormPage | New center |
| `/centers/:id` | CenterViewPage | Center details |
| `/centers/:id/edit` | CenterFormPage | Edit center |
| `/settlements` | SettlementListPage | Settlement grid |
| `/settlements/:id` | SettlementViewPage | Settlement details |
| `/commission/cases` | CommissionCaseListPage | Commission cases |
| `/commission/cases/create` | CommissionCaseFormPage | New case |
| `/commission/cases/:id` | CommissionCaseFormPage | Edit case |
| `/commission/social-work` | SocialWorkListPage | Social work grid |
| `/commission/social-work/create` | SocialWorkFormPage | New social work |
| `/commission/social-work/:id` | SocialWorkFormPage | Edit social work |
| `/reports/claims` | ClaimReportPage | Claim reports |
| `/reports/financial` | FinancialReportPage | Financial reports |
| `/users` | UserListPage | User management |
| `/users/create` | UserFormPage | New user |
| `/users/:id/edit` | UserFormPage | Edit user |
| `/roles` | RoleListPage | Role management |
| `/roles/create` | RoleFormPage | New role |
| `/roles/:id/edit` | RoleFormPage | Edit role |
| `/audit` | AuditLogPage | Audit logs |

---

## Sidebar Menu

```
داشبورد                          /
مدیریت پرسنل                    /employees
  ├── لیست پرسنل                /employees
  └── ایمپورت پرسنل             /employees/import
بیمه‌نامه                        /insurances
  ├── لیست بیمه‌نامه             /insurances
  └── استعلام                    /insurances/inquiry
قراردادها                        /contracts
کاتالوگ دارو و خدمات             /items
تشخیص (ICD)                     /diagnoses
نسخه‌ها                          /prescriptions
صورتحساب                         /invoices
پرونده خسارت                     /claims
مراکز درمانی                     /centers
تسویه مالی                       /settlements
کمیسیون پزشکی
  ├── پرونده‌ها                   /commission/cases
  └── مددکاری                    /commission/social-work
گزارشات
  ├── گزارش خسارات               /reports/claims
  └── گزارش مالی                 /reports/financial
مدیریت کاربران
  ├── کاربران                    /users
  └── نقش‌ها                     /roles
لاگ تغییرات                      /audit
```

---

## Bug Fixes Applied

### 1. Pagination Crash on Null Values
**Problem**: Laravel returns `from: null` and `to: null` when paginated results are empty. The `toPersianNumber` function called `.toString()` on null, causing a `TypeError`.
**Fix**:
- `Pagination.tsx`: Added null/undefined guard in `toPersianNumber`
- `DataTable.tsx`: Added `pagination.total > 0` guard before rendering Pagination, with null fallbacks for all pagination props

### 2. Lookup API 404 Errors
**Problem**: Frontend called lookup endpoints that don't exist in the backend (e.g., `/lookups/genders`, `/lookups/employee-statuses`, `/lookups/claim-statuses`).
**Fix**:
- Rewrote `lookups.ts` to match actual backend routes exactly
- Created static constants for lookups not provided by API
- Updated `useLookups.ts` hooks to use correct API functions and static data

### 3. TanStack React Query v5 Compatibility
**Problem**: Code used v4 APIs (`keepPreviousData` option, `isLoading` on mutations) that were changed in v5.
**Fix**:
- Replaced `keepPreviousData: true` with `placeholderData: keepPreviousData` (imported function) across 18 list pages
- Changed `mutation.isLoading` to `mutation.isPending` across 25+ files
- All 1177 modules compile without TypeScript errors

### 4. Missing Type Declarations
**Problem**: No type declarations for `import.meta.env` (Vite) and `jalaali-js` module.
**Fix**: Created `src/vite-env.d.ts` with `/// <reference types="vite/client" />` and `declare module 'jalaali-js'`

---

## Build Output

```
vite v6.4.1 building for production...
✓ 1177 modules transformed
✓ built in 5.37s
  82 chunks generated
  Total JS: ~1.1 MB (gzip: ~310 KB)
  CSS: 34.04 KB (gzip: 6.93 KB)
```

---

## How to Run

### Prerequisites
- Node.js 18+
- Backend running at `http://localhost:8088`

### Development
```bash
cd E:\project\tpa3\frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

### Production Build
```bash
npm run build
# Output in dist/
```

### Login Credentials (Development)
- Email: `admin@tpa.ir`
- Password: `Admin@123`
