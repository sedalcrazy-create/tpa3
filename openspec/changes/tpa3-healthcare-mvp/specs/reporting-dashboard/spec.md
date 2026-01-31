## Status / وضعیت: Partially Implemented / تا حدی پیاده‌سازی شده

## Summary / خلاصه

Management dashboard and reporting including stats cards, Recharts charts, claims report, and financial report. Dynamic report builder and Excel export remain.

داشبورد مدیریتی و گزارش‌گیری شامل کارت‌های آماری، نمودارهای Recharts، گزارش پرونده‌ها و گزارش مالی. گزارش‌ساز پویا و خروجی اکسل باقی‌مانده.

## Tech Stack / پشته فناوری
- **Backend:** Laravel 12, PHP 8.3, Eloquent ORM, Sanctum
- **Frontend:** React 18, TypeScript, Tailwind CSS 4, Recharts (charting library), TanStack Query v5
- **Database:** PostgreSQL 16

## Backend / بک‌اند

### Implemented / پیاده‌سازی شده
- `app/Http/Controllers/ReportController.php` - Dashboard stats endpoint, claims report endpoint, financial report endpoint with date range filtering
  - کنترلر گزارش‌ها: اندپوینت آمار داشبورد، اندپوینت گزارش پرونده‌ها، اندپوینت گزارش مالی با فیلتر بازه تاریخ
- `app/Services/ReportService.php` - Business logic for report generation:
  - Dashboard KPIs: total active employees, total claims this month/year, claims by status, claims by type
  - Claims report: filterable by date range, type, status, center, employee
  - Financial report: total amounts, behdasht/takmili split, loss ratio calculation
  - منطق کسب‌وکار برای تولید گزارش: شاخص‌های کلیدی داشبورد (کل کارمندان فعال، کل پرونده‌های این ماه/سال، پرونده‌ها به تفکیک وضعیت/نوع)، گزارش پرونده‌ها (فیلتر بازه تاریخ، نوع، وضعیت، مرکز، کارمند)، گزارش مالی (مبالغ کل، تفکیک بهداشت/تکمیلی، محاسبه نسبت خسارت)
- `routes/api.php` - Report routes registered under `/api/v1/reports` and `/api/v1/dashboard`
  - مسیرهای API گزارش‌ها ثبت شده در مسیرهای `/api/v1/reports` و `/api/v1/dashboard`

### Remaining / باقی‌مانده
- Dynamic report builder endpoint (`POST /reports/custom` with dimensions and measures selection)
  - اندپوینت گزارش‌ساز پویا (با انتخاب ابعاد و سنجه‌ها)
- Excel export for all reports (`?format=xlsx` query parameter returning downloadable XLSX)
  - خروجی اکسل برای تمام گزارش‌ها (پارامتر `?format=xlsx` برای دانلود فایل XLSX)
- Center performance report endpoint (`GET /reports/centers?period=...` - per-center invoice totals, deduction rates, discrepancy counts)
  - اندپوینت گزارش عملکرد مراکز (جمع فاکتورهای هر مرکز، نرخ کسورات، تعداد مغایرت‌ها)
- Employee expense report endpoint (`GET /reports/employees/:id` - complete insurance usage summary)
  - اندپوینت گزارش هزینه کارمند (خلاصه کامل استفاده از بیمه)
- Report access control (role-based filtering: center_user sees only their center's data, report_viewer sees all)
  - کنترل دسترسی گزارش‌ها (فیلتر نقش‌محور: کاربر مرکز فقط داده‌های مرکز خود را می‌بیند، بیننده گزارش همه را می‌بیند)
- Top 10 expensive centers calculation
  - محاسبه ۱۰ مرکز پرهزینه
- Top 10 frequent drugs/services calculation
  - محاسبه ۱۰ دارو/خدمت پرتکرار
- Average processing time calculation (register to archive)
  - محاسبه میانگین زمان پردازش (از ثبت تا بایگانی)

## Frontend / فرانت‌اند

### Implemented / پیاده‌سازی شده
- `src/pages/dashboard/DashboardPage.tsx` - Main dashboard with:
  - Stats cards (total employees, active claims, monthly amount, pending claims)
  - Recharts bar chart (claims by type distribution)
  - Recharts line chart (monthly claim trends)
  - Recharts pie chart (claims by status breakdown)
  - داشبورد اصلی شامل: کارت‌های آماری (کل کارمندان، پرونده‌های فعال، مبلغ ماهانه، پرونده‌های در انتظار)، نمودار میله‌ای (توزیع پرونده‌ها به تفکیک نوع)، نمودار خطی (روند ماهانه پرونده‌ها)، نمودار دایره‌ای (تفکیک پرونده‌ها بر اساس وضعیت)
- `src/pages/reports/ClaimReportPage.tsx` - Claims report page with:
  - Date range filter, claim type filter, status filter
  - Tabular report with claim details
  - Summary totals
  - صفحه گزارش پرونده‌ها شامل: فیلتر بازه تاریخ، فیلتر نوع پرونده، فیلتر وضعیت، گزارش جدولی با جزئیات پرونده‌ها، جمع‌های خلاصه
- `src/pages/reports/FinancialReportPage.tsx` - Financial report page with:
  - Period selection
  - Behdasht/takmili amount breakdown
  - Loss ratio display
  - Monthly expense chart
  - صفحه گزارش مالی شامل: انتخاب دوره، تفکیک مبالغ بهداشت/تکمیلی، نمایش نسبت خسارت، نمودار هزینه‌های ماهانه
- `src/services/reportApi.ts` - API client with TanStack Query hooks (useDashboardStats, useClaimReport, useFinancialReport)
  - کلاینت API با هوک‌های TanStack Query

### Remaining / باقی‌مانده
- Dynamic report builder UI (dimension/measure picker, pivot table display)
  - رابط کاربری گزارش‌ساز پویا (انتخاب‌گر ابعاد/سنجه‌ها، نمایش جدول محوری)
- Excel export buttons on all report pages
  - دکمه‌های خروجی اکسل در تمام صفحات گزارش
- Center performance report page
  - صفحه گزارش عملکرد مراکز
- Employee expense report page
  - صفحه گزارش هزینه کارمند
- Dashboard date range picker for custom period filtering
  - انتخاب‌گر بازه تاریخ داشبورد برای فیلتر دوره دلخواه
- Report access control (hide reports user doesn't have permission to view)
  - کنترل دسترسی گزارش‌ها (پنهان کردن گزارش‌هایی که کاربر مجوز مشاهده ندارد)

## Database Tables / جداول پایگاه داده
- No dedicated report tables (reports query from existing tables: claims, invoices, invoice_items, employees, centers, settlements)
  - جدول اختصاصی گزارش‌ها وجود ندارد (گزارش‌ها از جداول موجود استعلام می‌گیرند: پرونده‌ها، فاکتورها، اقلام فاکتور، کارمندان، مراکز، تسویه‌ها)
- Potential future: `report_configs` - saved custom report configurations per user
  - آینده احتمالی: جدول پیکربندی‌های گزارش ذخیره‌شده به ازای هر کاربر

## API Endpoints / اندپوینت‌های API
| Method | Endpoint | Status / وضعیت |
|--------|----------|--------|
| GET | `/api/v1/dashboard/stats` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/reports/claims` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/reports/financial` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/reports/centers` | Not Started / شروع نشده |
| GET | `/api/v1/reports/employees/:id` | Not Started / شروع نشده |
| POST | `/api/v1/reports/custom` | Not Started / شروع نشده |
| GET | `/api/v1/reports/claims?format=xlsx` | Not Started / شروع نشده |
| GET | `/api/v1/reports/financial?format=xlsx` | Not Started / شروع نشده |

## Requirements (Original Spec) / الزامات (مشخصات اصلی)

### Requirement: Dashboard KPI statistics / الزام: آمار شاخص‌های کلیدی عملکرد داشبورد
The system provides a real-time dashboard with total active employees, total claims, claims by status/type, and more. PARTIALLY IMPLEMENTED (basic stats and charts, top-10 and average processing time pending).

سیستم داشبوردی بلادرنگ با کل کارمندان فعال، کل پرونده‌ها، پرونده‌ها به تفکیک وضعیت/نوع و موارد بیشتر فراهم می‌کند. تا حدی پیاده‌سازی شده (آمار و نمودارهای پایه، ۱۰ مورد برتر و میانگین زمان پردازش باقی‌مانده).

### Requirement: Claims report / الزام: گزارش پرونده‌ها
The system generates claims reports with filtering by date range, claim type, status, center, employee, examiner. IMPLEMENTED (basic report, Excel export pending).

سیستم گزارش پرونده‌ها را با فیلتر بر اساس بازه تاریخ، نوع پرونده، وضعیت، مرکز، کارمند و کارشناس تولید می‌کند. پیاده‌سازی شده (گزارش پایه، خروجی اکسل باقی‌مانده).

### Requirement: Financial reports / الزام: گزارش‌های مالی
The system generates financial reports including loss ratio, monthly expenses, per-center summary. PARTIALLY IMPLEMENTED (basic financial report, center-level and Excel export pending).

سیستم گزارش‌های مالی شامل نسبت خسارت، هزینه‌های ماهانه و خلاصه به تفکیک مرکز تولید می‌کند. تا حدی پیاده‌سازی شده (گزارش مالی پایه، سطح مرکز و خروجی اکسل باقی‌مانده).

### Requirement: Custom report builder / الزام: گزارش‌ساز سفارشی
The system provides a dynamic report builder allowing users to select dimensions and measures. NOT STARTED.

سیستم گزارش‌ساز پویایی فراهم می‌کند که به کاربران امکان انتخاب ابعاد و سنجه‌ها را می‌دهد. شروع نشده.

### Requirement: Report access control / الزام: کنترل دسترسی گزارش‌ها
Report access is controlled by role. center_user sees only their center's data. NOT STARTED.

دسترسی به گزارش‌ها بر اساس نقش کنترل می‌شود. کاربر مرکز فقط داده‌های مرکز خود را می‌بیند. شروع نشده.
