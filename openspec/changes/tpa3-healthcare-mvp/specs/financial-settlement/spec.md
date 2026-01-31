## Status / وضعیت: Partially Implemented / تا حدی پیاده‌سازی شده

## Summary / خلاصه

Financial settlement including invoice aggregation and settlement document management. Models, controller, and list/detail pages are built. Center-based aggregation and Excel export remain.

تسویه مالی شامل تجمیع فاکتورها و مدیریت اسناد تسویه. مدل‌ها، کنترلر و صفحات لیست/جزئیات ساخته شده. تجمیع بر اساس مرکز درمانی و خروجی اکسل باقی‌مانده.

## Tech Stack / پشته فناوری
- **Backend:** Laravel 12, PHP 8.3, Eloquent ORM, Sanctum
- **Frontend:** React 18, TypeScript, Tailwind CSS 4, TanStack Query v5
- **Database:** PostgreSQL 16

## Backend / بک‌اند

### Implemented / پیاده‌سازی شده
- `app/Models/InvoiceAggregation.php` - Invoice aggregation model with Eloquent relationships (employee, invoices, settlement), splits amounts into behdasht and takmili portions
  - مدل تجمیع فاکتور با روابط Eloquent (کارمند، فاکتورها، تسویه)، تفکیک مبالغ به بخش بهداشت و تکمیلی
- `app/Models/Contract.php` - Contract model (shared with contract-insurance module)
  - مدل قرارداد (مشترک با ماژول قرارداد-بیمه)
- `app/Http/Controllers/SettlementController.php` - CRUD: index (paginated, filterable by period/status), show (with aggregation details and linked invoices), store, update
  - کنترلر با عملیات CRUD: لیست (صفحه‌بندی، فیلتر بر اساس دوره/وضعیت)، نمایش (با جزئیات تجمیع و فاکتورهای مرتبط)، ایجاد، ویرایش
- `app/Services/SettlementService.php` - Business logic for settlement operations (aggregation creation, status management, approval workflow)
  - منطق کسب‌وکار برای عملیات تسویه (ایجاد تجمیع، مدیریت وضعیت، گردش کار تایید)
- `database/migrations/` - invoice_aggregations, settlements tables
  - مایگریشن‌ها برای جداول تجمیع فاکتورها و تسویه‌ها
- `routes/api.php` - Settlement routes registered
  - مسیرهای API تسویه ثبت شده

### Remaining / باقی‌مانده
- Center-based aggregation logic (`POST /settlements/aggregate` - group ARCHIVED invoices by employee and period, calculate total_amount/behdasht_amount/takmili_amount)
  - منطق تجمیع بر اساس مرکز (گروه‌بندی فاکتورهای بایگانی‌شده به تفکیک کارمند و دوره، محاسبه مبلغ کل/مبلغ بهداشت/مبلغ تکمیلی)
- Center settlement report (`GET /settlements/center/:centerId?period=...` - all invoices from a center in a period with discrepancy check)
  - گزارش تسویه مرکز (تمام فاکتورهای یک مرکز در یک دوره با بررسی مغایرت)
- Discrepancy detection (compare center-submitted amounts vs system-calculated amounts)
  - تشخیص مغایرت (مقایسه مبالغ ارسالی مرکز با مبالغ محاسبه‌شده سیستم)
- Settlement approval workflow (draft -> approved -> paid transitions)
  - گردش کار تایید تسویه (انتقال پیش‌نویس -> تایید‌شده -> پرداخت‌شده)
- Payment tracking (record payment method, reference number, payment date)
  - پیگیری پرداخت (ثبت روش پرداخت، شماره مرجع، تاریخ پرداخت)
- Excel export for settlement documents (downloadable XLSX with aggregation data)
  - خروجی اکسل برای اسناد تسویه (فایل XLSX قابل دانلود با داده‌های تجمیع)
- Financial reports integration (loss ratio, monthly expenses, per-center summary)
  - یکپارچه‌سازی با گزارش‌های مالی (نسبت خسارت، هزینه‌های ماهانه، خلاصه به تفکیک مرکز)

## Frontend / فرانت‌اند

### Implemented / پیاده‌سازی شده
- `src/pages/settlements/SettlementListPage.tsx` - Settlements list with filters (period, status), search, pagination
  - لیست تسویه‌ها با فیلترها (دوره، وضعیت)، جستجو، صفحه‌بندی
- `src/pages/settlements/SettlementViewPage.tsx` - Settlement detail view with aggregation breakdown (employee-level amounts, behdasht/takmili split, linked invoices)
  - نمای جزئیات تسویه با تفکیک تجمیع (مبالغ سطح کارمند، تفکیک بهداشت/تکمیلی، فاکتورهای مرتبط)
- `src/services/settlementApi.ts` - API client with TanStack Query hooks (useSettlements, useSettlement)
  - کلاینت API با هوک‌های TanStack Query

### Remaining / باقی‌مانده
- Aggregation trigger UI (button to generate aggregations for a period)
  - رابط کاربری فعال‌سازی تجمیع (دکمه برای تولید تجمیع‌ها برای یک دوره)
- Center settlement page (per-center invoice summary with discrepancy flags)
  - صفحه تسویه مرکز (خلاصه فاکتورهای هر مرکز با نشانگرهای مغایرت)
- Settlement approval buttons (approve, record payment)
  - دکمه‌های تایید تسویه (تایید، ثبت پرداخت)
- Payment recording form (payment method, reference number)
  - فرم ثبت پرداخت (روش پرداخت، شماره مرجع)
- Excel export button and download
  - دکمه خروجی اکسل و دانلود
- Settlement creation form (select aggregations to include)
  - فرم ایجاد تسویه (انتخاب تجمیع‌ها برای گنجاندن)

## Database Tables / جداول پایگاه داده
- `invoice_aggregations` - id, employee_id, period (e.g., '1404-01'), total_amount, behdasht_amount, takmili_amount, invoice_count, document_generated (boolean), settlement_id, timestamps
  - جدول تجمیع فاکتورها: شناسه، کارمند، دوره (مثلا '۱۴۰۴-۰۱')، مبلغ کل، مبلغ بهداشت، مبلغ تکمیلی، تعداد فاکتورها، سند تولیدشده (بولین)، تسویه، زمان‌ها
- `settlements` - id, settlement_number, period, status (draft/approved/paid), total_amount, behdasht_total, takmili_total, aggregation_count, approved_by, approved_at, payment_method, payment_reference, paid_at, timestamps, soft_deletes
  - جدول تسویه‌ها: شناسه، شماره تسویه، دوره، وضعیت (پیش‌نویس/تاییدشده/پرداخت‌شده)، مبلغ کل، جمع بهداشت، جمع تکمیلی، تعداد تجمیع، تایید توسط، زمان تایید، روش پرداخت، مرجع پرداخت، زمان پرداخت، زمان‌ها

## API Endpoints / اندپوینت‌های API
| Method | Endpoint | Status / وضعیت |
|--------|----------|--------|
| GET | `/api/v1/settlements` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/settlements/:id` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/settlements` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/settlements/:id` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/settlements/aggregate` | Not Started / شروع نشده |
| POST | `/api/v1/settlements/:id/approve` | Not Started / شروع نشده |
| POST | `/api/v1/settlements/:id/pay` | Not Started / شروع نشده |
| GET | `/api/v1/settlements/center/:centerId` | Not Started / شروع نشده |
| GET | `/api/v1/settlements/:id/export` | Not Started / شروع نشده |

## Requirements (Original Spec) / الزامات (مشخصات اصلی)

### Requirement: Invoice aggregation / الزام: تجمیع فاکتورها
The system aggregates approved invoices by employee and period into `invoice_aggregations`. Each aggregation splits amounts into behdasht and takmili portions. PARTIALLY IMPLEMENTED (model exists, aggregation logic pending).

سیستم فاکتورهای تاییدشده را به تفکیک کارمند و دوره در جدول تجمیع فاکتورها جمع‌آوری می‌کند. هر تجمیع مبالغ را به بخش بهداشت و تکمیلی تفکیک می‌کند. تا حدی پیاده‌سازی شده (مدل موجود است، منطق تجمیع باقی‌مانده).

### Requirement: Settlement creation and approval / الزام: ایجاد و تایید تسویه
The system supports creating settlement documents from aggregations and routing them through approval workflow. PARTIALLY IMPLEMENTED (basic CRUD exists, approval workflow pending).

سیستم از ایجاد اسناد تسویه از تجمیع‌ها و هدایت آن‌ها از طریق گردش کار تایید پشتیبانی می‌کند. تا حدی پیاده‌سازی شده (CRUD پایه موجود است، گردش کار تایید باقی‌مانده).

### Requirement: Center settlement / الزام: تسویه مرکز درمانی
The system supports settlement with medical centers by aggregating all invoices from a center in a period. NOT STARTED.

سیستم از تسویه با مراکز درمانی از طریق تجمیع تمام فاکتورهای یک مرکز در یک دوره پشتیبانی می‌کند. شروع نشده.

### Requirement: Payment tracking / الزام: پیگیری پرداخت
The system tracks payment status for settlements (draft, approved, paid) with payment method and reference number. NOT STARTED.

سیستم وضعیت پرداخت تسویه‌ها (پیش‌نویس، تاییدشده، پرداخت‌شده) را با روش پرداخت و شماره مرجع پیگیری می‌کند. شروع نشده.

### Requirement: Excel export / الزام: خروجی اکسل
The system generates downloadable Excel files for settlement documents. NOT STARTED.

سیستم فایل‌های اکسل قابل دانلود برای اسناد تسویه تولید می‌کند. شروع نشده.
