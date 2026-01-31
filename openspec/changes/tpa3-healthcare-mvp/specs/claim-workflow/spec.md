## Status / وضعیت: Partially Implemented / تا حدی پیاده‌سازی شده

## Summary / خلاصه

Insurance claim workflow with state machine, notes, and attachments. Models, controller with CRUD operations and status transitions, and frontend pages are implemented. Full transition validation, role-based access, and deduction logic remain.

گردش کار پرونده‌های بیمه‌ای با ماشین وضعیت، یادداشت‌ها و پیوست‌ها. مدل‌ها، کنترلر با عملیات CRUD و انتقال وضعیت، و صفحات فرانت‌اند پیاده‌سازی شده. اعتبارسنجی کامل انتقال، دسترسی نقش‌محور و منطق کسورات باقی‌مانده.

## Tech Stack / پشته فناوری
- **Backend:** Laravel 12, PHP 8.3, Eloquent ORM, Sanctum
- **Frontend:** React 18, TypeScript, Tailwind CSS 4, Zustand, TanStack Query v5
- **Database:** PostgreSQL 16

## Backend / بک‌اند

### Implemented / پیاده‌سازی شده
- `app/Models/Claim.php` - Claim model with Eloquent relationships (employee, invoice, examiner, notes, attachments, statuses)
  - مدل پرونده با روابط Eloquent (کارمند، فاکتور، کارشناس، یادداشت‌ها، پیوست‌ها، وضعیت‌ها)
- `app/Models/ClaimNote.php` - Claim note model (examiner comments with user_id and timestamp)
  - مدل یادداشت پرونده (نظرات کارشناس با شناسه کاربر و زمان)
- `app/Models/ClaimAttachment.php` - Claim attachment model (scanned documents, file storage)
  - مدل پیوست پرونده (اسناد اسکن‌شده، ذخیره‌سازی فایل)
- `app/Http/Controllers/ClaimController.php` - Full feature set:
  - CRUD: index (paginated, filterable by status/type/date/examiner), show, store, update, destroy
  - `transition()` - Status transition endpoint with ClaimStateMachine validation
  - `addNote()` - Add examiner notes to claim
  - `addAttachment()` - Upload attachments (jpg/png/pdf, max 10MB)
  - `nextStatuses()` - Return available next statuses for current claim state
  - کنترلر با مجموعه کامل قابلیت‌ها: عملیات CRUD، انتقال وضعیت، افزودن یادداشت، آپلود پیوست، دریافت وضعیت‌های بعدی
- `app/Services/ClaimStateMachine.php` - State machine enforcing valid transitions:
  - ماشین وضعیت برای اعمال انتقال‌های معتبر:
  - WAIT_REGISTER(2) -> WAIT_CHECK(3)
  - WAIT_CHECK(3) -> WAIT_CONFIRM(4) / RETURNED(1) / WAIT_RECHECK(8)
  - WAIT_CONFIRM(4) -> WAIT_FINANCIAL(5) / WAIT_RECHECK(8)
  - WAIT_FINANCIAL(5) -> ARCHIVED(6)
  - WAIT_RECHECK(8) -> WAIT_CHECK(3)
- `app/Services/DeductionService.php` - Deduction service scaffold for claim item deductions
  - سرویس کسورات (ساختار اولیه) برای کسورات اقلام پرونده
- `app/Enums/ClaimStatus.php` - PHP enum: RETURNED(1), WAIT_REGISTER(2), WAIT_CHECK(3), WAIT_CONFIRM(4), WAIT_FINANCIAL(5), ARCHIVED(6), WAIT_RECHECK(8)
  - شمارشی PHP: برگشت‌داده‌شده(1)، منتظر ثبت(2)، منتظر بررسی(3)، منتظر تایید(4)، منتظر مالی(5)، بایگانی‌شده(6)، منتظر بازبررسی(8)
- `database/migrations/` - claims, claim_notes, claim_attachments tables
  - مایگریشن‌ها برای جداول پرونده‌ها، یادداشت‌ها و پیوست‌ها
- `routes/api.php` - All claim routes registered
  - تمام مسیرهای API پرونده ثبت شده

### Remaining / باقی‌مانده
- Full transition validation (verify user role is authorized for the specific transition, e.g., only examiner can approve WAIT_CHECK -> WAIT_CONFIRM)
  - اعتبارسنجی کامل انتقال (بررسی مجاز بودن نقش کاربر برای انتقال خاص، مثلا فقط کارشناس بتواند از منتظر بررسی به منتظر تایید منتقل کند)
- Role-based permissions per transition (supervisor for WAIT_CONFIRM -> WAIT_FINANCIAL, financial_officer for WAIT_FINANCIAL -> ARCHIVED)
  - دسترسی نقش‌محور به ازای هر انتقال (سرپرست برای منتظر تایید -> منتظر مالی، مسئول مالی برای منتظر مالی -> بایگانی)
- DeductionService full logic (apply deductions to invoice items, recalculate item paid_price and invoice totals)
  - منطق کامل سرویس کسورات (اعمال کسورات به اقلام فاکتور، محاسبه مجدد مبلغ پرداختی و جمع‌کل فاکتور)
- Duplicate claim detection (same employee, same date, same price, same claim_type -> HTTP 409)
  - تشخیص پرونده تکراری (همان کارمند، همان تاریخ، همان مبلغ، همان نوع پرونده -> خطای HTTP 409)
- Examiner queue endpoint (`GET /claims/queue?status=3` filtered by assigned examiner)
  - اندپوینت صف کارشناسی (فیلتر بر اساس کارشناس اختصاص‌یافته)
- Examiner assignment endpoint (`PUT /claims/:id/assign`)
  - اندپوینت تخصیص کارشناس
- Claim statistics endpoint (`GET /claims/stats` - counts per status, per type, total amounts)
  - اندپوینت آمار پرونده‌ها (تعداد به تفکیک وضعیت، نوع، مبالغ کل)
- Rejection reason storage on transition to RETURNED(1)
  - ذخیره دلیل برگشت در انتقال به وضعیت برگشت‌داده‌شده
- 12 claim types validation (Drug, Hospitalization, Dental, DoctorVisit, Lab, Imaging, Physiotherapy, OutpatientSurgery, Emergency, MedicalEquipment, Injection, Clinic)
  - اعتبارسنجی ۱۲ نوع پرونده (دارو، بستری، دندانپزشکی، ویزیت، آزمایشگاه، تصویربرداری، فیزیوتراپی، جراحی سرپایی، اورژانس، تجهیزات پزشکی، تزریقات، درمانگاه)

## Frontend / فرانت‌اند

### Implemented / پیاده‌سازی شده
- `src/pages/claims/ClaimListPage.tsx` - Claims list with filters (status, type, date range, examiner), pagination, status badges with colors
  - لیست پرونده‌ها با فیلترها (وضعیت، نوع، بازه تاریخ، کارشناس)، صفحه‌بندی، نشان‌های رنگی وضعیت
- `src/pages/claims/ClaimFormPage.tsx` - Create/edit claim form (invoice selection, claim type, admission date)
  - فرم ایجاد/ویرایش پرونده (انتخاب فاکتور، نوع پرونده، تاریخ پذیرش)
- `src/pages/claims/ClaimViewPage.tsx` - Claim detail view with:
  - Claim info cards (status, type, amounts)
  - Invoice items display with pricing details
  - Notes section (view and add notes)
  - Attachments section (view and upload)
  - Status transition buttons (dynamically shown based on current status via nextStatuses API)
  - نمای جزئیات پرونده شامل: کارت‌های اطلاعات، اقلام فاکتور، بخش یادداشت‌ها، بخش پیوست‌ها، دکمه‌های انتقال وضعیت
- `src/services/claimApi.ts` - API client with TanStack Query hooks (useClaims, useClaim, useCreateClaim, useTransitionClaim, useAddNote, useAddAttachment, useNextStatuses)
  - کلاینت API با هوک‌های TanStack Query
- `src/components/claims/ClaimStatusBadge.tsx` - Colored status badge component
  - کامپوننت نشان رنگی وضعیت

### Remaining / باقی‌مانده
- Examiner queue page (dedicated kartabl view for claim examiners)
  - صفحه صف کارشناسی (نمای کارتابل اختصاصی برای کارشناسان پرونده)
- Deduction entry UI during examination (per-item deduction amounts with reasons)
  - رابط کاربری ورود کسورات در حین بررسی (مبالغ کسورات به تفکیک قلم با دلایل)
- Partial approval UI (approve/reject individual items within a claim)
  - رابط کاربری تایید جزئی (تایید/رد اقلام منفرد در یک پرونده)
- Claim statistics dashboard widgets
  - ویجت‌های داشبورد آمار پرونده‌ها
- Rejection reason form on reject transition
  - فرم دلیل برگشت در هنگام رد پرونده

## Database Tables / جداول پایگاه داده
- `claims` - id, invoice_id, employee_id, claim_type (1-15), status (ClaimStatus enum), examiner_id, admission_date, total_amount, paid_price, employee_share, total_deductions, rejection_reason, examined_at, confirmed_at, archived_at, timestamps, soft_deletes
  - جدول پرونده‌ها: شناسه، فاکتور، کارمند، نوع پرونده، وضعیت، کارشناس، تاریخ پذیرش، مبلغ کل، مبلغ پرداختی، سهم بیمار، کل کسورات، دلیل برگشت، زمان‌ها
- `claim_notes` - id, claim_id, user_id, text, timestamps
  - جدول یادداشت‌ها: شناسه، پرونده، کاربر، متن، زمان‌ها
- `claim_attachments` - id, claim_id, file_name, file_path, file_type, file_size, uploaded_by, timestamps
  - جدول پیوست‌ها: شناسه، پرونده، نام فایل، مسیر فایل، نوع فایل، حجم فایل، آپلودکننده، زمان‌ها

## API Endpoints / اندپوینت‌های API
| Method | Endpoint | Status / وضعیت |
|--------|----------|--------|
| GET | `/api/v1/claims` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/claims` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/claims/:id` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/claims/:id` | Implemented / پیاده‌سازی شده |
| DELETE | `/api/v1/claims/:id` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/claims/:id/transition` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/claims/:id/next-statuses` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/claims/:id/notes` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/claims/:id/attachments` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/claims/queue` | Not Started / شروع نشده |
| PUT | `/api/v1/claims/:id/assign` | Not Started / شروع نشده |
| GET | `/api/v1/claims/stats` | Not Started / شروع نشده |

## Requirements (Original Spec) / الزامات (مشخصات اصلی)

### Requirement: Claim creation from invoice / الزام: ایجاد پرونده از فاکتور
The system creates claims from submitted invoices. Each claim links to one invoice and one employee. IMPLEMENTED.

سیستم پرونده‌ها را از فاکتورهای ارسال‌شده ایجاد می‌کند. هر پرونده به یک فاکتور و یک کارمند متصل است. پیاده‌سازی شده.

### Requirement: Claim status state machine / الزام: ماشین وضعیت پرونده
The system enforces valid state transitions via ClaimStateMachine. Invalid transitions are rejected. IMPLEMENTED (basic transitions work, role-based validation pending).

سیستم انتقال‌های معتبر وضعیت را از طریق ماشین وضعیت اعمال می‌کند. انتقال‌های نامعتبر رد می‌شوند. پیاده‌سازی شده (انتقال‌های پایه کار می‌کنند، اعتبارسنجی نقش‌محور باقی‌مانده).

### Requirement: Claim notes and attachments / الزام: یادداشت‌ها و پیوست‌های پرونده
The system supports adding notes (examiner comments) and attachments (scanned documents) to claims. IMPLEMENTED.

سیستم از افزودن یادداشت (نظرات کارشناس) و پیوست (اسناد اسکن‌شده) به پرونده‌ها پشتیبانی می‌کند. پیاده‌سازی شده.

### Requirement: Examiner queue / الزام: صف کارشناسی
The system provides a queue of claims awaiting examination, filtered by claim_type and assigned examiner. NOT STARTED.

سیستم صفی از پرونده‌های در انتظار بررسی، فیلترشده بر اساس نوع پرونده و کارشناس اختصاص‌یافته، فراهم می‌کند. شروع نشده.

### Requirement: Claim examination with deductions / الزام: بررسی پرونده با کسورات
The examiner can apply deductions to claim items during examination. PARTIALLY IMPLEMENTED (DeductionService scaffolded, full logic pending).

کارشناس می‌تواند در حین بررسی کسوراتی را به اقلام پرونده اعمال کند. تا حدی پیاده‌سازی شده (ساختار اولیه سرویس کسورات ایجاد شده، منطق کامل باقی‌مانده).
