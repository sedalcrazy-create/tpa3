# TPA3 - Project Report
## سیستم بیمه درمان بانک ملی ایران

---

## 1. Overview / خلاصه پروژه

TPA3 is a full-stack insurance management system (Third-Party Administrator) for Bank Melli Iran's healthcare insurance program. The system manages employees, insurance policies, medical claims, invoices, settlements, and reporting.

| Layer | Tech Stack | Lines of Code | Files |
|-------|-----------|---------------|-------|
| **Backend** | Laravel 12, PHP 8.x, MySQL | 13,691 | 163 PHP files |
| **Frontend** | React 18, TypeScript, Tailwind CSS 4, Vite | 14,263 | 98 TS/TSX files |
| **Total** | | ~27,954 | 261 files |

---

## 2. Backend Architecture / معماری بکند

### 2.1 Technology Stack

- **Framework**: Laravel 12
- **Language**: PHP 8.x
- **Database**: MySQL
- **Authentication**: Laravel Sanctum (token-based)
- **API Style**: RESTful JSON API
- **Base URL**: `http://localhost:8088/api/v1`

### 2.2 Database Schema (35 Migrations, 56 Tables)

#### Lookup Tables (جداول پایه)
| Table | Description |
|-------|------------|
| `provinces` | استان‌ها |
| `locations` | شهرها / مناطق |
| `relation_types` | انواع نسبت |
| `guardianship_types` | انواع سرپرستی |
| `special_employee_types` | انواع خاص پرسنل |
| `custom_employee_codes` | کدهای سفارشی پرسنل |
| `item_categories` | دسته‌بندی اقلام |
| `item_groups` | گروه‌بندی اقلام |
| `prescription_types` | انواع نسخه |
| `document_types` | انواع مدرک |
| `body_parts` | انواع اعضای بدن |
| `commission_case_types` | انواع پرونده کمیسیون |
| `institution_contract_types` | انواع قرارداد مؤسسه |

#### Core Domain Tables
| Table | Description |
|-------|------------|
| `employees` | پرسنل بیمه‌شده |
| `employee_families` | اعضای خانواده پرسنل |
| `insurances` | بیمه‌نامه‌ها |
| `insurance_ceilings` | سقف بیمه |
| `centers` | مراکز درمانی |
| `center_doctors` | پزشکان مراکز |
| `center_contracts` | قراردادهای مراکز |
| `contracts` | قراردادها |
| `contract_items` | اقلام قرارداد |
| `items` | اقلام دارویی و خدمات |
| `item_prices` | قیمت‌گذاری اقلام |
| `diagnoses` | تشخیص‌ها (ICD-10) |
| `prescriptions` | نسخه‌ها |
| `prescription_items` | اقلام نسخه |
| `invoices` | صورتحساب‌ها |
| `invoice_items` | اقلام صورتحساب |
| `claims` | پرونده‌های خسارت |
| `claim_notes` | یادداشت‌های خسارت |
| `claim_attachments` | پیوست‌های خسارت |
| `claim_status_history` | تاریخچه وضعیت خسارت |
| `settlements` | تسویه‌های مالی |
| `settlement_items` | اقلام تسویه |
| `commission_cases` | پرونده‌های کمیسیون |
| `social_works` | مددکاری اجتماعی |
| `roles` | نقش‌ها |
| `role_permissions` | مجوزهای نقش |
| `audit_logs` | لاگ‌های ممیزی |

### 2.3 Models (53 Eloquent Models)

All models include proper relationships (belongsTo, hasMany, morphMany), fillable attributes, casts, and scopes.

### 2.4 API Routes (103 Endpoints)

| Module | Endpoints | Key Operations |
|--------|-----------|---------------|
| Auth | 5 | login, logout, me, refresh, change-password |
| Lookups | 13 | provinces, locations, relation-types, etc. |
| Employees | 9 | CRUD + bulk-delete, family, import/export |
| Insurances | 7 | CRUD + inquiry, ceiling |
| Contracts | 5 | CRUD |
| Items | 7 | CRUD + prices |
| Diagnoses | 3 | list, search |
| Prescriptions | 5 | CRUD |
| Invoices | 7 | CRUD + calculate, submit |
| Claims | 10 | CRUD + status transitions, notes, attachments |
| Centers | 7 | CRUD + doctors, contracts |
| Settlements | 6 | list, view, aggregate, approve, pay |
| Commission | 6 | cases CRUD + verdict, social-work CRUD + resolve |
| Reports | 5 | dashboard, claims, financial, exports |
| Users | 5 | CRUD + toggle-active |
| Roles | 4 | CRUD |
| Audit | 2 | list, view |

### 2.5 Controllers (16 Controllers)

| Controller | Responsibility |
|-----------|---------------|
| `AuthController` | Authentication & session |
| `LookupController` | All 13 lookup endpoints |
| `EmployeeController` | Employee CRUD & family |
| `InsuranceController` | Insurance policies |
| `ContractController` | Contracts |
| `ItemController` | Drug/service catalog |
| `DiagnosisController` | ICD-10 diagnoses |
| `PrescriptionController` | Medical prescriptions |
| `InvoiceController` | Invoices & pricing engine |
| `ClaimController` | Claim workflow & state machine |
| `CenterController` | Medical centers |
| `SettlementController` | Financial settlements |
| `CommissionCaseController` | Medical commission |
| `SocialWorkController` | Social work cases |
| `ReportController` | Reports & dashboard |
| `UserController` | User management |
| `RoleController` | Role & permissions |
| `AuditLogController` | Audit trail |

---

## 3. Frontend Architecture / معماری فرانت‌اند

### 3.1 Technology Stack

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18 | UI Framework |
| TypeScript | 5.x | Type safety |
| Vite | 6.4 | Build tool & dev server |
| Tailwind CSS | 4 | Utility CSS |
| @tanstack/react-query | 5 | Server state management |
| Zustand | 5 | Client state (auth, UI) |
| Axios | - | HTTP client |
| React Hook Form | - | Form management |
| Zod | - | Schema validation |
| Recharts | - | Dashboard charts |
| react-hot-toast | - | Toast notifications |
| @heroicons/react | - | Icons |
| jalaali-js | - | Jalali (Persian) calendar |

### 3.2 Project Structure

```
frontend/src/
├── main.tsx                        # Entry point
├── App.tsx                         # Router (55 routes)
├── index.css                       # Tailwind + Vazirmatn font + RTL
├── vite-env.d.ts                   # Type declarations
│
├── api/                            # 19 API modules
│   ├── client.ts                   # Axios instance + interceptors
│   ├── auth.ts                     # Login/logout/me
│   ├── employees.ts                # Employee CRUD
│   ├── insurances.ts               # Insurance CRUD
│   ├── contracts.ts                # Contract CRUD
│   ├── items.ts                    # Item catalog CRUD
│   ├── diagnoses.ts                # Diagnosis search
│   ├── prescriptions.ts            # Prescription CRUD
│   ├── invoices.ts                 # Invoice CRUD + calculate
│   ├── claims.ts                   # Claim CRUD + workflow
│   ├── centers.ts                  # Center CRUD
│   ├── settlements.ts              # Settlement operations
│   ├── commission.ts               # Commission cases
│   ├── reports.ts                  # Reports & dashboard
│   ├── lookups.ts                  # 13 lookup endpoints + static data
│   ├── users.ts                    # User management
│   ├── roles.ts                    # Role management
│   ├── audit.ts                    # Audit logs
│   └── employeeImport.ts           # Employee import/export
│
├── store/                          # Zustand stores
│   ├── authStore.ts                # Token, user, login/logout
│   └── uiStore.ts                  # Sidebar collapse
│
├── hooks/                          # Custom hooks
│   ├── useAuth.ts                  # Auth utilities
│   ├── useLookups.ts               # 22 lookup hooks (API + static)
│   └── useDebounce.ts              # Debounced search
│
├── components/
│   ├── layout/                     # Layout components
│   │   ├── AppLayout.tsx           # RTL sidebar + header + content
│   │   ├── Sidebar.tsx             # Navigation menu
│   │   ├── Header.tsx              # Top bar (logo, user, logout)
│   │   └── Breadcrumb.tsx          # Route-based breadcrumbs
│   ├── shared/
│   │   ├── ProtectedRoute.tsx      # Auth guard
│   │   └── ErrorBoundary.tsx       # Runtime error handler
│   └── ui/                         # 13 reusable UI components
│       ├── DataTable.tsx           # Sortable/filterable data grid
│       ├── Pagination.tsx          # Persian page numbers
│       ├── Modal.tsx               # Dialog overlay
│       ├── FormField.tsx           # Label + input wrapper
│       ├── SelectField.tsx         # Dropdown
│       ├── SearchInput.tsx         # Debounced search
│       ├── StatusBadge.tsx         # Color-coded status pills
│       ├── DatePicker.tsx          # Jalali date picker
│       ├── FileUpload.tsx          # Image/file upload
│       ├── ConfirmDialog.tsx       # Delete confirmation
│       ├── LoadingSpinner.tsx      # Loading states
│       ├── EmptyState.tsx          # No data state
│       └── Button.tsx              # Primary/secondary/danger
│
├── pages/                          # 41 page components
│   ├── auth/LoginPage.tsx
│   ├── dashboard/DashboardPage.tsx
│   ├── employees/                  # 6 pages
│   ├── insurances/                 # 3 pages
│   ├── contracts/                  # 2 pages
│   ├── items/                      # 3 pages
│   ├── diagnoses/                  # 1 page
│   ├── prescriptions/              # 2 pages
│   ├── invoices/                   # 3 pages
│   ├── claims/                     # 3 pages
│   ├── centers/                    # 3 pages
│   ├── settlements/                # 2 pages
│   ├── commission/                 # 4 pages
│   ├── reports/                    # 2 pages
│   ├── users/                      # 2 pages
│   ├── roles/                      # 2 pages
│   └── audit/                      # 1 page
│
├── types/                          # TypeScript interfaces
│   ├── api.ts                      # ApiResponse, PaginatedResponse
│   ├── employee.ts
│   ├── insurance.ts
│   ├── claim.ts
│   ├── invoice.ts
│   ├── item.ts
│   ├── center.ts
│   └── common.ts                   # LookupItem, etc.
│
└── utils/                          # Utility functions
    ├── format.ts                   # Persian numbers, currency, dates
    ├── jalali.ts                   # Jalali date conversion
    └── constants.ts                # Menu items, status maps
```

### 3.3 Pages Summary (41 Pages)

| Module | Pages | Features |
|--------|-------|----------|
| **Auth** | LoginPage | Email/password, logo, redirect |
| **Dashboard** | DashboardPage | Stats cards, charts (Recharts), top centers |
| **Employees** | List, Create, Edit, View, Family, Import | Grid with 14 columns, dropdown filters, bulk delete, family management, Excel import |
| **Insurances** | List, Form, Inquiry | CRUD, inquiry by national code |
| **Contracts** | List, Form | CRUD with date range |
| **Items** | List, Form, Price | Drug/service catalog, price management |
| **Diagnoses** | List | ICD-10 search (read-only) |
| **Prescriptions** | List, Form | CRUD with dynamic item rows |
| **Invoices** | List, Form, View | CRUD, pricing engine (calculate button), price breakdown |
| **Claims** | List, Form, View | Status workflow, transitions, notes, attachments |
| **Centers** | List, Form, View | CRUD, doctors, contracts tabs |
| **Settlements** | List, View | Aggregate, approve, pay |
| **Commission** | CaseList, CaseForm, SocialWorkList, SocialWorkForm | Cases + verdicts, social work + resolve |
| **Reports** | ClaimReport, FinancialReport | Date range filters, charts, Excel export |
| **Users** | List, Form | CRUD, toggle active |
| **Roles** | List, Form | CRUD, permission checkboxes |
| **Audit** | AuditLog | Filterable audit trail |

### 3.4 Key Design Patterns

#### RTL & Persian
- `dir="rtl"` on `<html>`
- Font: **Vazirmatn** (Google Fonts)
- Persian (Jalali) date picker using `jalaali-js`
- Persian number formatting in Pagination and reports
- All labels, messages, and placeholders in Farsi

#### Color Palette
```
primary:    #7d3cff  (بنفش - دکمه‌ها و لینک‌ها)
danger:     #c80e13  (قرمز - حذف و خطاها)
warning:    #f2d53c  (زرد - هشدارها)
surface:    #fceed1  (کرم - پس‌زمینه صفحه)
sidebar:    #1e1b4b  (سرمه‌ای - سایدبار)
```

#### DataTable (شبیه Yii CGridView)
- Striped rows, hover highlight
- Sort arrows on column headers
- Dropdown filter row below headers
- Checkbox column for bulk operations
- Action buttons (view, edit, delete)
- Pagination with Persian numbers

#### API Client Pattern
- Base URL from `VITE_API_URL` env variable
- Auto-attach `Authorization: Bearer` token
- 401 response → redirect to `/login`, clear token
- Error messages shown via toast

#### State Management
- **Server state**: TanStack React Query v5 with `staleTime: Infinity` for lookups
- **Client state**: Zustand for auth token/user and sidebar collapse
- **URL state**: `useSearchParams` for pagination, sort, and filters (bookmarkable)
- **Form state**: React Hook Form + Zod validation

---

## 4. Routing / مسیرها (55 Routes)

```
/login                          → صفحه ورود
/                               → داشبورد
/employees                      → لیست پرسنل
/employees/create               → افزودن پرسنل
/employees/import               → ورود اکسل پرسنل
/employees/:id                  → مشاهده پرسنل
/employees/:id/edit             → ویرایش پرسنل
/employees/:id/family           → خانواده پرسنل
/insurances                     → لیست بیمه‌نامه
/insurances/create              → ایجاد بیمه‌نامه
/insurances/:id/edit            → ویرایش بیمه‌نامه
/insurances/inquiry             → استعلام بیمه
/contracts                      → لیست قراردادها
/contracts/create               → ایجاد قرارداد
/contracts/:id/edit             → ویرایش قرارداد
/items                          → لیست اقلام
/items/create                   → افزودن قلم
/items/:id/edit                 → ویرایش قلم
/items/:id/price                → مدیریت قیمت
/diagnoses                      → لیست تشخیص‌ها
/prescriptions                  → لیست نسخه‌ها
/prescriptions/create           → ایجاد نسخه
/prescriptions/:id/edit         → ویرایش نسخه
/invoices                       → لیست صورتحساب
/invoices/create                → ایجاد صورتحساب
/invoices/:id                   → مشاهده صورتحساب
/invoices/:id/edit              → ویرایش صورتحساب
/claims                         → لیست خسارات
/claims/create                  → ایجاد خسارت
/claims/:id                     → مشاهده خسارت
/claims/:id/edit                → ویرایش خسارت
/centers                        → لیست مراکز
/centers/create                 → ایجاد مرکز
/centers/:id                    → مشاهده مرکز
/centers/:id/edit               → ویرایش مرکز
/settlements                    → لیست تسویه‌ها
/settlements/:id                → مشاهده تسویه
/commission/cases               → لیست کمیسیون
/commission/cases/create        → ایجاد پرونده
/commission/cases/:id           → مشاهده پرونده
/commission/social-work         → لیست مددکاری
/commission/social-work/create  → ایجاد مددکاری
/commission/social-work/:id     → مشاهده مددکاری
/reports/claims                 → گزارش خسارات
/reports/financial              → گزارش مالی
/users                          → لیست کاربران
/users/create                   → ایجاد کاربر
/users/:id/edit                 → ویرایش کاربر
/roles                          → لیست نقش‌ها
/roles/create                   → ایجاد نقش
/roles/:id/edit                 → ویرایش نقش
/audit                          → لاگ ممیزی
```

---

## 5. Sidebar Menu / منوی سایدبار

```
داشبورد                         /
مدیریت پرسنل
  ├── لیست پرسنل               /employees
  └── ورود اکسل                /employees/import
بیمه‌نامه
  ├── لیست بیمه‌نامه            /insurances
  └── استعلام                   /insurances/inquiry
قراردادها                       /contracts
کاتالوگ دارو و خدمات            /items
تشخیص (ICD)                    /diagnoses
نسخه‌ها                         /prescriptions
صورتحساب                        /invoices
پرونده خسارت                    /claims
مراکز درمانی                    /centers
تسویه مالی                      /settlements
کمیسیون پزشکی
  ├── پرونده‌ها                  /commission/cases
  └── مددکاری                   /commission/social-work
گزارشات
  ├── گزارش خسارات              /reports/claims
  └── گزارش مالی                /reports/financial
مدیریت کاربران                  /users
نقش‌ها و دسترسی‌ها               /roles
لاگ ممیزی                       /audit
```

---

## 6. Lookup Data Strategy / استراتژی داده‌های پایه

### API-backed Lookups (13 endpoints)
These are fetched from `/api/v1/lookups/*` and cached with `staleTime: Infinity`:

| Hook | API Endpoint |
|------|-------------|
| `useProvinces` | `/lookups/provinces` |
| `useLocations` | `/lookups/locations` |
| `useRelationTypes` | `/lookups/relation-types` |
| `useGuardianshipTypes` | `/lookups/guardianship-types` |
| `useSpecialEmployeeTypes` | `/lookups/special-employee-types` |
| `useCustomEmployeeCodes` | `/lookups/employee-codes` |
| `useItemCategories` | `/lookups/item-categories` |
| `useItemGroups` | `/lookups/item-groups` |
| `usePrescriptionTypes` | `/lookups/prescription-types` |
| `useDocumentTypes` | `/lookups/document-types` |
| `useBodyPartTypes` | `/lookups/body-part-types` |
| `useCommissionCaseTypes` | `/lookups/commission-case-types` |
| `useInstitutionContractTypes` | `/lookups/institution-contract-types` |

### Static Lookups (6 constants)
These have no backend endpoint and are defined as constants in the frontend:

| Hook | Values |
|------|--------|
| `useGenders` | مرد، زن |
| `useEmployeeStatuses` | فعال، غیرفعال، بازنشسته، معلق |
| `useInsuranceTypes` | پایه، تکمیلی |
| `useClaimStatuses` | پیش‌نویس، ثبت شده، در حال بررسی، تایید شده، رد شده، تسویه شده، لغو شده، بسته شده |
| `useClaimTypes` | بستری، سرپایی، دندانپزشکی، پاراکلینیک |
| `useCenterTypes` | بیمارستان، کلینیک، داروخانه، آزمایشگاه، تصویربرداری، دندانپزشکی، فیزیوتراپی |

---

## 7. Build Output / خروجی بیلد

```
vite v6.4.1 - production build
✓ 1177 modules transformed
✓ 82 chunks generated
✓ Built in 4.81s

Key bundle sizes:
  index.js           288.95 kB (gzip: 94.56 kB)   # React + Router + Query + Zustand
  PieChart.js        410.59 kB (gzip: 111.27 kB)   # Recharts
  types.js            86.96 kB (gzip: 24.14 kB)    # Shared types
  index.css           34.04 kB (gzip: 6.93 kB)     # Tailwind CSS
  + 78 lazy-loaded page chunks
```

---

## 8. Bug Fixes Applied / باگ‌های رفع شده

### 8.1 Pagination Null Crash
- **Problem**: `Pagination.tsx` crashed when API returned `null` for `from`/`to`/`total` on empty results
- **Fix**: `toPersianNumber` updated to handle `null | undefined`, `DataTable` added `pagination.total > 0` guard

### 8.2 Lookup API Route Mismatch
- **Problem**: Frontend called non-existent API endpoints (`/lookups/special-types`, `/lookups/genders`, `/lookups/employee-statuses`, etc.)
- **Fix**: `lookups.ts` rewritten to match actual backend routes from `api.php`. Non-existent endpoints replaced with static constants.

### 8.3 useLookups Hook Mismatch
- **Problem**: `useLookups.ts` still referenced old function names after `lookups.ts` was rewritten
- **Fix**: Complete rewrite of `useLookups.ts` with correct API function names and static data hooks

### 8.4 Page Import Updates
- **Problem**: Pages imported renamed/removed hooks (`useSpecialTypes`, `useCities`, `useCenterSpecialties`)
- **Fix**: Updated imports in `EmployeeListPage`, `EmployeeCreatePage`, `EmployeeEditPage`, `EmployeeFamilyPage`, `CenterFormPage`

### 8.5 TanStack Query v5 Compatibility
- **Problem**: Code used v4 APIs (`keepPreviousData` option, `isLoading` on mutations)
- **Fix**: Updated to v5 APIs (`placeholderData: keepPreviousData`, `isPending` on mutations) in EmployeeListPage, EmployeeCreatePage, EmployeeEditPage, CenterFormPage

---

## 9. Configuration / تنظیمات

### Environment Variables
```env
# frontend/.env
VITE_API_URL=http://localhost:8088/api/v1
```

### Running the Project
```bash
# Backend
cd backend
php artisan serve --port=8088

# Frontend
cd frontend
npm run dev    # → http://localhost:3000

# Login credentials
Email: admin@tpa.ir
Password: Admin@123
```

---

## 10. Summary Statistics / آمار کلی

| Metric | Count |
|--------|-------|
| Total source files | 261 |
| Total lines of code | ~27,954 |
| Database tables | 56 |
| Database migrations | 35 |
| Eloquent models | 53 |
| API routes | 103 |
| API controllers | 16 |
| Frontend pages | 41 |
| Frontend components | 19 |
| Frontend API modules | 19 |
| Frontend routes | 55 |
| Lookup hooks | 22 (13 API + 6 static + 3 utility) |
| NPM dependencies | 13 runtime + 7 dev |
