## Status / وضعیت: Partially Implemented / تا حدی پیاده‌سازی شده

## Summary / خلاصه

Insurance prescription processing including prescription registration, invoice management, and line items. Model, controller, service, and frontend pages are built. Insurance eligibility check and prescription expiry remain.

پردازش نسخه‌های بیمه‌ای شامل ثبت نسخه، مدیریت فاکتورها و اقلام. مدل، کنترلر، سرویس و صفحات فرانت‌اند ساخته شده. بررسی اعتبار بیمه‌نامه و انقضای نسخه باقی‌مانده.

## Tech Stack / پشته فناوری

- **Backend:** Laravel 12, PHP 8.3, Eloquent ORM, Sanctum
- **Frontend:** React 18, TypeScript, Tailwind CSS 4, TanStack Query v5
- **Database:** PostgreSQL 16

## Backend / بک‌اند

### Implemented / پیاده‌سازی شده

- `app/Models/Prescription.php` - Prescription model with Eloquent relationships (employee, insurance, insuranceHistory, invoices, center)
- `app/Http/Controllers/PrescriptionController.php` - CRUD: index (paginated, filterable by employee/date/status), show (with invoices and items), store, update
- `app/Services/PrescriptionService.php` - Business logic for prescription creation, unique_code generation, basic validation
- `database/migrations/` - prescriptions table, invoices table, invoice_items table
- `routes/api.php` - Prescription routes registered under `/api/v1/prescriptions`

### Remaining / باقی‌مانده

- Insurance eligibility check during prescription creation (verify insurance is active on prescription_date, check remaining ceiling, check waiting periods)
- Insurance inquiry integration (`POST /prescriptions/:id/inquire` - check coverage, ceiling, waiting periods, suspensions)
- Prescription expiry validation (reject new invoices on expired prescriptions, configurable expiry period default 3 months)
- Invoice creation with auto price lookup (look up item_prices by effective_date, trigger pricing engine)
- Manual price override handling
- Letter of introduction generation (PDF with employee details, coverage info, QR code)
- QR code verification endpoint (`GET /prescriptions/verify/:code`)
- Prescription type handling (outpatient/inpatient/emergency) with different workflow rules

بررسی اعتبار بیمه هنگام ایجاد نسخه (تایید فعال بودن بیمه در تاریخ نسخه، بررسی سقف باقی‌مانده، بررسی دوره‌های انتظار)، یکپارچه‌سازی استعلام بیمه (`POST /prescriptions/:id/inquire` - بررسی پوشش، سقف، دوره‌های انتظار، تعلیق‌ها)، اعتبارسنجی انقضای نسخه (رد فاکتورهای جدید روی نسخه‌های منقضی، دوره انقضای قابل تنظیم پیش‌فرض ۳ ماه)، ایجاد فاکتور با جستجوی خودکار قیمت (جستجوی item_prices بر اساس effective_date و فعال‌سازی موتور قیمت‌گذاری)، مدیریت بازنویسی دستی قیمت، تولید معرفی‌نامه (PDF با مشخصات پرسنل، اطلاعات پوشش، کد QR)، endpoint تایید کد QR (`GET /prescriptions/verify/:code`)، و مدیریت نوع نسخه (سرپایی/بستری/اورژانسی) با قوانین گردش کار متفاوت.

## Frontend / فرانت‌اند

### Implemented / پیاده‌سازی شده

- `src/pages/prescriptions/PrescriptionListPage.tsx` - Prescription list with search, filters (date range, employee, status), pagination
- `src/pages/prescriptions/PrescriptionFormPage.tsx` - Create/edit prescription form (employee selection via autocomplete, insurance selection, center selection, date, type)
- `src/services/prescriptionApi.ts` - API client with TanStack Query hooks (usePrescriptions, usePrescription, useCreatePrescription, useUpdatePrescription)

### Remaining / باقی‌مانده

- Invoice management within prescription (add/edit/remove invoices with line items)
- Invoice item entry with auto-calculation display (price lookup, pricing engine results)
- Drug interaction warnings during item entry
- Insurance inquiry results display before prescription creation
- Prescription expiry indicator
- Letter of introduction generation and print UI
- QR code display and verification page

مدیریت فاکتور درون نسخه (افزودن/ویرایش/حذف فاکتورها با اقلام)، ورود آیتم فاکتور با نمایش محاسبه خودکار (جستجوی قیمت، نتایج موتور قیمت‌گذاری)، هشدارهای تداخل دارویی هنگام ورود آیتم، نمایش نتایج استعلام بیمه قبل از ایجاد نسخه، نشانگر انقضای نسخه، رابط کاربری تولید و چاپ معرفی‌نامه، و صفحه نمایش و تایید کد QR.

## Database Tables / جداول پایگاه‌داده

- `prescriptions` - id, unique_code (auto-generated), employee_id, insurance_id, insurance_history_id, institution_contract_id, prescription_date, expiry_date, prescription_type (outpatient/inpatient/emergency), status (active/expired/cancelled), inquiry_result (JSON), created_by, timestamps, soft_deletes
- `invoices` - id, prescription_id, employee_id, doctor_id, center_id, invoice_date, total_amount, paid_price, employee_share, total_deductions, status, timestamps
- `invoice_items` - id, invoice_id, item_id, count, unit_price, total_price, paid_price, behdasht_price, takmili_price, discount_amount, employee_share, deduction_amount, alert_description, body_part, timestamps

## API Endpoints / نقاط پایانی API

| Method | Endpoint | Status / وضعیت |
|--------|----------|--------|
| GET | `/api/v1/prescriptions` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/prescriptions` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/prescriptions/:id` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/prescriptions/:id` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/prescriptions/:id/inquire` | Not Started / شروع نشده |
| POST | `/api/v1/invoices` | Not Started / شروع نشده |
| GET | `/api/v1/invoices/:id` | Not Started / شروع نشده |
| PUT | `/api/v1/invoices/:id` | Not Started / شروع نشده |
| POST | `/api/v1/invoices/:id/items` | Not Started / شروع نشده |
| POST | `/api/v1/invoices/:id/calculate` | Not Started / شروع نشده |
| POST | `/api/v1/prescriptions/:id/introduction` | Not Started / شروع نشده |
| GET | `/api/v1/prescriptions/verify/:code` | Not Started / شروع نشده |

## Requirements (Original Spec) / الزامات (مشخصات اصلی)

### Requirement: Prescription creation / الزام: ایجاد نسخه

The system allows creating prescriptions linked to an active insurance and insurance_history. Each prescription gets an auto-generated unique_code. IMPLEMENTED (basic creation, eligibility check pending).

سیستم امکان ایجاد نسخه‌های متصل به بیمه فعال و insurance_history را فراهم می‌کند. هر نسخه یک unique_code تولید شده خودکار دریافت می‌کند. پیاده‌سازی شده (ایجاد پایه، بررسی اعتبار در انتظار).

### Requirement: Insurance inquiry before prescription / الزام: استعلام بیمه قبل از نسخه

The system requires insurance inquiry before prescription creation. Inquiry checks: insurance validity, remaining coverage ceiling, waiting periods, active suspensions, infraction status. NOT STARTED.

سیستم نیاز به استعلام بیمه قبل از ایجاد نسخه دارد. استعلام موارد زیر را بررسی می‌کند: اعتبار بیمه، سقف پوشش باقی‌مانده، دوره‌های انتظار، تعلیق‌های فعال، وضعیت تخلفات. شروع نشده.

### Requirement: Prescription with invoices / الزام: نسخه با فاکتورها

Each prescription has one or more invoices. Each invoice represents a separate service encounter. Invoices contain line items (`invoice_items`). PARTIALLY IMPLEMENTED (models exist, full invoice management pending).

هر نسخه یک یا چند فاکتور دارد. هر فاکتور نمایانگر یک مراجعه خدمتی جداگانه است. فاکتورها شامل اقلام (`invoice_items`) هستند. تا حدی پیاده‌سازی شده (مدل‌ها موجود هستند، مدیریت کامل فاکتور در انتظار).

### Requirement: Prescription expiry / الزام: انقضای نسخه

Each prescription has an expiry date (configurable, default 3 months from creation). Expired prescriptions shall not accept new invoices. NOT STARTED.

هر نسخه یک تاریخ انقضا دارد (قابل تنظیم، پیش‌فرض ۳ ماه از تاریخ ایجاد). نسخه‌های منقضی نباید فاکتور جدید بپذیرند. شروع نشده.
