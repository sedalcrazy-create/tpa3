## Status / وضعیت: Partially Implemented / تا حدی پیاده‌سازی شده

## Summary / خلاصه

Authentication and role-based access control system using Laravel Sanctum, including Role/Permission models and a React frontend with Zustand.

سیستم احراز هویت و کنترل دسترسی مبتنی بر نقش با استفاده از Laravel Sanctum، شامل مدل‌های Role/Permission و فرانت‌اند React با Zustand.

## Tech Stack / پشته فناوری

- **Backend:** Laravel 12, PHP 8.3, Sanctum (token-based auth)
- **Frontend:** React 18, TypeScript, Zustand (auth state), TanStack Query v5
- **Database:** PostgreSQL 16

## Backend / بک‌اند

### Implemented / پیاده‌سازی شده

- `app/Models/User.php` - User model with Sanctum HasApiTokens trait
- `app/Models/Role.php` - Role model with Eloquent relationships
- `app/Models/Permission.php` - Permission model with Eloquent relationships
- `app/Http/Controllers/AuthController.php` - Login, logout, me, refresh endpoints via Sanctum tokens
- `app/Services/AuthService.php` - Authentication business logic (credential validation, token creation)
- `routes/api.php` - Auth routes (`/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/me`)
- `database/migrations/` - Users, roles, permissions, role_has_permissions, user_has_roles tables
- Sanctum middleware on protected API route groups

### Remaining / باقی‌مانده

- Role-based middleware per route (e.g., `->middleware('role:system_admin')`)
- Permission checks in controllers before executing business logic (e.g., `claim.approve`, `employee.create`)
- Implementation of 9 predefined roles with hierarchical levels (system_admin, insurer_admin, supervisor, claim_examiner, insurance_officer, financial_officer, center_user, operator, report_viewer)
- User management CRUD endpoints (create, update, deactivate users)
- Admin password reset endpoint
- Audit logging middleware for write operations (audit_logs table with user_id, action, entity_type, old_data, new_data JSONB)

میان‌افزار کنترل دسترسی مبتنی بر نقش برای هر مسیر (مثلاً `->middleware('role:system_admin')`)، بررسی مجوزها در کنترلرها قبل از اجرای منطق کسب‌وکار، پیاده‌سازی ۹ نقش از پیش تعریف‌شده با سطوح سلسله‌مراتبی، endpointهای CRUD مدیریت کاربران، endpoint بازنشانی رمز عبور ادمین، و میان‌افزار ثبت رویداد (audit log) برای عملیات نوشتن.

## Frontend / فرانت‌اند

### Implemented / پیاده‌سازی شده

- `src/stores/authStore.ts` - Zustand store managing auth state (user, token, isAuthenticated, login/logout actions)
- `src/components/ProtectedRoute.tsx` - Route guard component checking authentication before rendering children
- `src/pages/LoginPage.tsx` - Login page with username/password form
- `src/services/authApi.ts` - API client for auth endpoints using TanStack Query

### Remaining / باقی‌مانده

- Role-based route guards (show/hide menu items based on user role)
- Permission-based UI element visibility (disable buttons if user lacks permission)
- User management pages (list, create, edit users) for admin roles

محافظ مسیر مبتنی بر نقش (نمایش/مخفی کردن آیتم‌های منو بر اساس نقش کاربر)، نمایش عناصر UI مبتنی بر مجوز (غیرفعال کردن دکمه‌ها اگر کاربر مجوز نداشته باشد)، و صفحات مدیریت کاربران (لیست، ایجاد، ویرایش) برای نقش‌های ادمین.

## Database Tables / جداول پایگاه‌داده

- `users` - id, username, email, password (bcrypt), first_name, last_name, is_active, timestamps
- `roles` - id, name, display_name, level, description, timestamps
- `permissions` - id, name, display_name, description, timestamps
- `role_has_permissions` - role_id, permission_id (pivot)
- `user_has_roles` - user_id, role_id (pivot)
- `personal_access_tokens` - Sanctum token table
- `audit_logs` (planned) - user_id, action, entity_type, entity_id, old_data (JSONB), new_data (JSONB), ip_address, timestamps

## API Endpoints / نقاط پایانی API

| Method | Endpoint | Status / وضعیت |
|--------|----------|--------|
| POST | `/api/v1/auth/login` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/auth/logout` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/auth/me` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/auth/refresh` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/users` | Not Started / شروع نشده |
| POST | `/api/v1/users` | Not Started / شروع نشده |
| PUT | `/api/v1/users/:id` | Not Started / شروع نشده |
| POST | `/api/v1/users/:id/reset-password` | Not Started / شروع نشده |

## Requirements (Original Spec) / الزامات (مشخصات اصلی)

### Requirement: Sanctum token authentication with login / الزام: احراز هویت توکنی Sanctum با ورود

The system authenticates users via email/username and password using Laravel Sanctum, returning an API token. Passwords are stored as bcrypt hashes.

سیستم کاربران را از طریق ایمیل/نام کاربری و رمز عبور با استفاده از Laravel Sanctum احراز هویت می‌کند و یک توکن API برمی‌گرداند. رمزهای عبور به صورت هش bcrypt ذخیره می‌شوند.

#### Scenario: Successful login / سناریو: ورود موفق

- **WHEN** user sends POST `/api/v1/auth/login` with valid email and password
- **THEN** system returns HTTP 200 with `{ token, user: { id, username, email, roleName, firstName, lastName } }`

- **هنگامی که** کاربر درخواست POST به `/api/v1/auth/login` با ایمیل و رمز عبور معتبر ارسال می‌کند
- **آنگاه** سیستم HTTP 200 با `{ token, user: { id, username, email, roleName, firstName, lastName } }` برمی‌گرداند

#### Scenario: Invalid credentials / سناریو: اطلاعات ورود نامعتبر

- **WHEN** user sends POST `/api/v1/auth/login` with wrong password
- **THEN** system returns HTTP 401 with error message

- **هنگامی که** کاربر درخواست POST به `/api/v1/auth/login` با رمز عبور اشتباه ارسال می‌کند
- **آنگاه** سیستم HTTP 401 با پیام خطا برمی‌گرداند

#### Scenario: Inactive user login / سناریو: ورود کاربر غیرفعال

- **WHEN** user with `is_active=false` attempts login
- **THEN** system returns HTTP 403

- **هنگامی که** کاربر با `is_active=false` اقدام به ورود می‌کند
- **آنگاه** سیستم HTTP 403 برمی‌گرداند

### Requirement: Auth middleware on protected routes / الزام: میان‌افزار احراز هویت در مسیرهای محافظت‌شده

All routes under `/api/v1/*` (except `/auth/login`, `/health`, `/lookup/*`) require a valid Sanctum Bearer token via `auth:sanctum` middleware.

تمام مسیرهای زیرمجموعه `/api/v1/*` (به جز `/auth/login`، `/health`، `/lookup/*`) نیاز به توکن Bearer معتبر Sanctum از طریق میان‌افزار `auth:sanctum` دارند.

### Requirement: Role-based access control (RBAC) / الزام: کنترل دسترسی مبتنی بر نقش (RBAC)

The system supports 9 predefined roles with hierarchical permission levels. Permission checks occur at the controller level before executing business logic.

سیستم از ۹ نقش از پیش تعریف‌شده با سطوح مجوز سلسله‌مراتبی پشتیبانی می‌کند. بررسی مجوزها در سطح کنترلر قبل از اجرای منطق کسب‌وکار انجام می‌شود.

Roles / نقش‌ها:
- system_admin (level 100): full access / دسترسی کامل
- insurer_admin (level 90): manage insurer settings, users / مدیریت تنظیمات بیمه‌گر، کاربران
- supervisor (level 80): approve claims, manage examiners / تایید ادعاها، مدیریت کارشناسان
- claim_examiner (level 60): examine and process claims / بررسی و پردازش ادعاها
- insurance_officer (level 60): manage employees, insurance / مدیریت پرسنل، بیمه
- financial_officer (level 50): settlements, payments / تسویه‌حساب‌ها، پرداخت‌ها
- center_user (level 40): submit claims for their center / ثبت ادعا برای مرکز خود
- operator (level 30): data entry, prescriptions / ورود داده، نسخه‌ها
- report_viewer (level 20): read-only reports and dashboard / گزارش‌ها و داشبورد فقط خواندنی
