## Status / وضعیت: Partially Implemented / تا حدی پیاده‌سازی شده

## Summary / خلاصه

Medical commission and social work management including cases, case types, verdict templates, and social work cases. Core pages are implemented; verdict template UI and workflow actions remain.

مدیریت کمیسیون پزشکی و مددکاری اجتماعی شامل پرونده‌ها، انواع پرونده، قالب‌های رای و پرونده‌های مددکاری. صفحات اصلی پیاده‌سازی شده، رابط کاربری قالب‌های رای و اقدامات گردش کار باقی‌مانده.

## Tech Stack / پشته فناوری
- **Backend:** Laravel 12, PHP 8.3, Eloquent ORM, Sanctum
- **Frontend:** React 18, TypeScript, Tailwind CSS 4, TanStack Query v5
- **Database:** PostgreSQL 16

## Backend / بک‌اند

### Implemented / پیاده‌سازی شده
- `app/Models/CommissionCase.php` - Commission case model with Eloquent relationships (employee, caseType, verdicts, attachments)
  - مدل پرونده کمیسیون با روابط Eloquent (کارمند، نوع پرونده، آراء، پیوست‌ها)
- `app/Models/CommissionCaseType.php` - Case type model (disability assessment, chronic illness verification, sick leave extension, etc.)
  - مدل نوع پرونده (ارزیابی ازکارافتادگی، تایید بیماری مزمن، تمدید مرخصی استعلاجی و غیره)
- `app/Models/VerdictTemplate.php` - Verdict template model (pre-written text with placeholders per case type)
  - مدل قالب رای (متن از پیش نوشته‌شده با جایگاه‌های خالی به تفکیک نوع پرونده)
- `app/Models/SocialWorkCase.php` - Social work case model with Eloquent relationships (employee, assignedWorker, followUps)
  - مدل پرونده مددکاری با روابط Eloquent (کارمند، مددکار اختصاص‌یافته، پیگیری‌ها)
- `app/Http/Controllers/CommissionController.php` - CRUD for commission cases: index (paginated, filterable by status/type), show (with employee info, type, verdict history), store, update
  - کنترلر با عملیات CRUD برای پرونده‌های کمیسیون: لیست (صفحه‌بندی، فیلتر بر اساس وضعیت/نوع)، نمایش (با اطلاعات کارمند، نوع، تاریخچه آراء)، ایجاد، ویرایش
- `app/Services/CommissionService.php` - Business logic for commission case operations (case creation with auto-generated caseNumber, status management)
  - منطق کسب‌وکار برای عملیات پرونده کمیسیون (ایجاد پرونده با شماره خودکار، مدیریت وضعیت)
- `database/migrations/` - commission_cases, commission_case_types, verdict_templates, social_work_cases tables
  - مایگریشن‌ها برای جداول پرونده‌های کمیسیون، انواع پرونده، قالب‌های رای و پرونده‌های مددکاری
- `routes/api.php` - Commission and social work routes registered
  - مسیرهای API کمیسیون و مددکاری ثبت شده

### Remaining / باقی‌مانده
- Commission case workflow transitions (pending -> under_review -> verdict_issued -> closed) with validation
  - انتقال‌های گردش کار پرونده کمیسیون (در انتظار -> در حال بررسی -> رای صادرشده -> بسته‌شده) با اعتبارسنجی
- Verdict issuance endpoint (`PUT /commission/cases/:id/verdict`)
  - اندپوینت صدور رای
- Case type CRUD endpoints (`GET/POST/PUT /commission/case-types`)
  - اندپوینت‌های CRUD انواع پرونده
- Verdict template CRUD endpoints (`GET/POST/PUT /commission/verdict-templates`)
  - اندپوینت‌های CRUD قالب‌های رای
- Template placeholder filling logic (generate verdict text from template with filled values)
  - منطق پر کردن جایگاه‌های خالی قالب (تولید متن رای از قالب با مقادیر تکمیل‌شده)
- Social work case close endpoint with closure reason
  - اندپوینت بستن پرونده مددکاری با دلیل بستن
- Commission dashboard endpoint (`GET /commission/dashboard` - open cases count, avg resolution time, cases by type/status)
  - اندپوینت داشبورد کمیسیون (تعداد پرونده‌های باز، میانگین زمان حل، پرونده‌ها به تفکیک نوع/وضعیت)

## Frontend / فرانت‌اند

### Implemented / پیاده‌سازی شده
- `src/pages/commission/CommissionCaseListPage.tsx` - Commission cases list with filters (status, type, date range), search, pagination
  - لیست پرونده‌های کمیسیون با فیلترها (وضعیت، نوع، بازه تاریخ)، جستجو، صفحه‌بندی
- `src/pages/commission/CommissionCaseFormPage.tsx` - Create/edit commission case form (employee selection, case type, description, attachments)
  - فرم ایجاد/ویرایش پرونده کمیسیون (انتخاب کارمند، نوع پرونده، توضیحات، پیوست‌ها)
- `src/pages/socialWork/SocialWorkListPage.tsx` - Social work cases list with filters (status, assigned worker), pagination
  - لیست پرونده‌های مددکاری با فیلترها (وضعیت، مددکار اختصاص‌یافته)، صفحه‌بندی
- `src/pages/socialWork/SocialWorkFormPage.tsx` - Create/edit social work case form (employee selection, description, assigned worker, follow-up dates)
  - فرم ایجاد/ویرایش پرونده مددکاری (انتخاب کارمند، توضیحات، مددکار اختصاص‌یافته، تاریخ‌های پیگیری)
- `src/services/commissionApi.ts` - API client with TanStack Query hooks
  - کلاینت API با هوک‌های TanStack Query
- `src/services/socialWorkApi.ts` - API client with TanStack Query hooks
  - کلاینت API با هوک‌های TanStack Query

### Remaining / باقی‌مانده
- Verdict templates CRUD UI (list, create, edit templates with placeholder management)
  - رابط کاربری CRUD قالب‌های رای (لیست، ایجاد، ویرایش قالب‌ها با مدیریت جایگاه‌های خالی)
- Commission case detail view with verdict history timeline
  - نمای جزئیات پرونده کمیسیون با خط زمانی تاریخچه آراء
- Workflow action buttons on case detail page (start review, issue verdict, close case)
  - دکمه‌های اقدام گردش کار در صفحه جزئیات پرونده (شروع بررسی، صدور رای، بستن پرونده)
- Template selection and placeholder filling UI during verdict issuance
  - رابط کاربری انتخاب قالب و پر کردن جایگاه‌ها در هنگام صدور رای
- Social work case follow-up notes and history UI
  - رابط کاربری یادداشت‌های پیگیری و تاریخچه پرونده مددکاری
- Commission dashboard page with KPI widgets
  - صفحه داشبورد کمیسیون با ویجت‌های شاخص کلیدی عملکرد

## Database Tables / جداول پایگاه داده
- `commission_cases` - id, case_number (auto-generated), employee_id, case_type_id, description, status (pending/under_review/verdict_issued/closed), assigned_doctor_id, verdict_text, verdict_date, closed_at, timestamps, soft_deletes
  - جدول پرونده‌های کمیسیون: شناسه، شماره پرونده (خودکار)، کارمند، نوع پرونده، توضیحات، وضعیت (در انتظار/در حال بررسی/رای صادرشده/بسته‌شده)، پزشک اختصاص‌یافته، متن رای، تاریخ رای، زمان بسته شدن، زمان‌ها
- `commission_case_types` - id, name, description, required_documents (JSON array), is_active, timestamps
  - جدول انواع پرونده: شناسه، نام، توضیحات، مدارک مورد نیاز (آرایه JSON)، وضعیت فعال، زمان‌ها
- `verdict_templates` - id, case_type_id, title, template_text (with placeholders), is_active, timestamps
  - جدول قالب‌های رای: شناسه، نوع پرونده، عنوان، متن قالب (با جایگاه‌های خالی)، وضعیت فعال، زمان‌ها
- `social_work_cases` - id, employee_id, description, assigned_to (user_id), status (open/in_progress/closed), follow_up_notes (text), next_follow_up_date, closure_reason, closed_at, timestamps, soft_deletes
  - جدول پرونده‌های مددکاری: شناسه، کارمند، توضیحات، اختصاص به (کاربر)، وضعیت (باز/در حال انجام/بسته)، یادداشت‌های پیگیری، تاریخ پیگیری بعدی، دلیل بستن، زمان‌ها

## API Endpoints / اندپوینت‌های API
| Method | Endpoint | Status / وضعیت |
|--------|----------|--------|
| GET | `/api/v1/commission/cases` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/commission/cases` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/commission/cases/:id` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/commission/cases/:id` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/commission/cases/:id/review` | Not Started / شروع نشده |
| PUT | `/api/v1/commission/cases/:id/verdict` | Not Started / شروع نشده |
| PUT | `/api/v1/commission/cases/:id/close` | Not Started / شروع نشده |
| GET | `/api/v1/commission/case-types` | Not Started / شروع نشده |
| POST | `/api/v1/commission/case-types` | Not Started / شروع نشده |
| GET | `/api/v1/commission/verdict-templates` | Not Started / شروع نشده |
| POST | `/api/v1/commission/verdict-templates` | Not Started / شروع نشده |
| GET | `/api/v1/social-work` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/social-work` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/social-work/:id` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/social-work/:id` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/social-work/:id/close` | Not Started / شروع نشده |
| GET | `/api/v1/commission/dashboard` | Not Started / شروع نشده |

## Requirements (Original Spec) / الزامات (مشخصات اصلی)

### Requirement: Commission case management / الزام: مدیریت پرونده‌های کمیسیون
The system manages medical commission cases for employees requiring medical evaluation (disability assessment, chronic illness verification, treatment authorization). IMPLEMENTED (basic CRUD).

سیستم پرونده‌های کمیسیون پزشکی را برای کارمندانی که نیاز به ارزیابی پزشکی دارند (ارزیابی ازکارافتادگی، تایید بیماری مزمن، مجوز درمان) مدیریت می‌کند. پیاده‌سازی شده (CRUD پایه).

### Requirement: Commission case workflow / الزام: گردش کار پرونده کمیسیون
Cases follow workflow: pending -> under_review -> verdict_issued -> closed. NOT STARTED (transitions not enforced yet).

پرونده‌ها از گردش کار زیر پیروی می‌کنند: در انتظار -> در حال بررسی -> رای صادرشده -> بسته‌شده. شروع نشده (انتقال‌ها هنوز اعمال نشده‌اند).

### Requirement: Case types / الزام: انواع پرونده
The system supports configurable case types with name, description, and required documents list. PARTIALLY IMPLEMENTED (model exists, CRUD endpoints pending).

سیستم از انواع پرونده قابل پیکربندی با نام، توضیحات و لیست مدارک مورد نیاز پشتیبانی می‌کند. تا حدی پیاده‌سازی شده (مدل موجود است، اندپوینت‌های CRUD باقی‌مانده).

### Requirement: Verdict templates / الزام: قالب‌های رای
The system maintains verdict templates to speed up verdict entry with pre-written text and placeholders. PARTIALLY IMPLEMENTED (model exists, CRUD UI and filling logic pending).

سیستم قالب‌های رای را برای تسریع ورود رای با متن از پیش نوشته‌شده و جایگاه‌های خالی نگهداری می‌کند. تا حدی پیاده‌سازی شده (مدل موجود است، رابط کاربری CRUD و منطق پر کردن باقی‌مانده).

### Requirement: Social work cases / الزام: پرونده‌های مددکاری
The system manages social work cases for employees needing social support. IMPLEMENTED (basic CRUD, close with reason pending).

سیستم پرونده‌های مددکاری را برای کارمندان نیازمند حمایت اجتماعی مدیریت می‌کند. پیاده‌سازی شده (CRUD پایه، بستن با دلیل باقی‌مانده).
