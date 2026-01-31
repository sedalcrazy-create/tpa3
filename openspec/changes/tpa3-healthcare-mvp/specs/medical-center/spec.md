## Status / وضعیت: Implemented / پیاده‌سازی شده

## Summary / خلاصه

Management of medical centers, doctors, and center contracts. Nearly all required functionality has been implemented.

مدیریت مراکز درمانی، پزشکان و قراردادهای مراکز. تقریبا تمام عملکردهای مورد نیاز پیاده‌سازی شده است.

## Tech Stack / پشته فناوری
- **Backend:** Laravel 12, PHP 8.3, Eloquent ORM, Sanctum
- **Frontend:** React 18, TypeScript, Tailwind CSS 4, TanStack Query v5
- **Database:** PostgreSQL 16

## Backend / بک‌اند

### Implemented / پیاده‌سازی شده
- `app/Models/Center.php` - Center model with Eloquent relationships (doctors, contracts, invoices), center types (hospital, clinic, pharmacy, lab, imaging, physiotherapy, dental, optics)
  - مدل مرکز درمانی با روابط Eloquent (پزشکان، قراردادها، فاکتورها)، انواع مرکز (بیمارستان، درمانگاه، داروخانه، آزمایشگاه، تصویربرداری، فیزیوتراپی، دندانپزشکی، عینک‌سازی)
- `app/Models/Doctor.php` - Doctor model with Eloquent relationships (center, specialties)
  - مدل پزشک با روابط Eloquent (مرکز، تخصص‌ها)
- `app/Models/InstitutionContract.php` - Institution contract model (TPA-center contracts with tariff rates, discount percentages, settlement terms)
  - مدل قرارداد سازمان (قراردادهای TPA-مرکز با نرخ تعرفه، درصد تخفیف، شرایط تسویه)
- `app/Http/Controllers/CenterController.php` - Full CRUD: index (paginated, filterable by type/province/contracted status), show (with doctors and contracts), store, update, destroy, search
  - کنترلر با عملیات کامل CRUD: لیست (صفحه‌بندی، فیلتر بر اساس نوع/استان/وضعیت قرارداد)، نمایش (با پزشکان و قراردادها)، ایجاد، ویرایش، حذف، جستجو
- `app/Services/CenterService.php` - Business logic for center operations (validation, duplicate code check, contract management)
  - منطق کسب‌وکار برای عملیات مرکز درمانی (اعتبارسنجی، بررسی کد تکراری، مدیریت قرارداد)
- `database/migrations/` - centers, doctors, institution_contracts tables
  - مایگریشن‌ها برای جداول مراکز، پزشکان و قراردادهای سازمانی
- `routes/api.php` - All center routes registered
  - تمام مسیرهای API مرکز درمانی ثبت شده

### Remaining / باقی‌مانده
- Nothing major - module is mostly complete
  - موارد عمده‌ای باقی نمانده - ماژول تقریبا کامل است
- Minor: location hierarchy endpoints for province/city/branch lookup (may already exist in lookup routes)
  - جزئی: اندپوینت‌های سلسله‌مراتب مکانی برای جستجوی استان/شهر/شعبه (ممکن است در مسیرهای lookup موجود باشد)
- Minor: doctor search endpoint optimization for large datasets
  - جزئی: بهینه‌سازی اندپوینت جستجوی پزشک برای مجموعه داده‌های بزرگ

## Frontend / فرانت‌اند

### Implemented / پیاده‌سازی شده
- `src/pages/centers/CenterListPage.tsx` - Centers list with filters (type, province, contracted status), search, pagination
  - لیست مراکز درمانی با فیلترها (نوع، استان، وضعیت قرارداد)، جستجو، صفحه‌بندی
- `src/pages/centers/CenterFormPage.tsx` - Create/edit center form (code, name, type, address, province, city, phone, contracted status)
  - فرم ایجاد/ویرایش مرکز (کد، نام، نوع، آدرس، استان، شهر، تلفن، وضعیت قرارداد)
- `src/pages/centers/CenterViewPage.tsx` - Center detail view with tabbed interface:
  - **Info tab:** Center details and contact information
  - **Doctors tab:** List of doctors at this center with add/edit/remove
  - **Contracts tab:** Institution contracts for this center with add/edit
  - نمای جزئیات مرکز با رابط تب‌دار: تب اطلاعات (جزئیات و اطلاعات تماس)، تب پزشکان (لیست با افزودن/ویرایش/حذف)، تب قراردادها (قراردادهای سازمانی با افزودن/ویرایش)
- `src/services/centerApi.ts` - API client with TanStack Query hooks (useCenters, useCenter, useCreateCenter, useUpdateCenter, useCenterDoctors, useCenterContracts)
  - کلاینت API با هوک‌های TanStack Query
- `src/components/centers/DoctorForm.tsx` - Doctor create/edit form component
  - کامپوننت فرم ایجاد/ویرایش پزشک
- `src/components/centers/ContractForm.tsx` - Institution contract create/edit form component
  - کامپوننت فرم ایجاد/ویرایش قرارداد سازمانی

### Remaining / باقی‌مانده
- Nothing significant remaining for this module
  - موارد قابل‌توجهی برای این ماژول باقی نمانده

## Database Tables / جداول پایگاه داده
- `centers` - id, code (unique), name, center_type (hospital/clinic/pharmacy/lab/imaging/physiotherapy/dental/optics), address, phone, province_id, city_id, is_contracted, is_active, timestamps, soft_deletes
  - جدول مراکز: شناسه، کد (یکتا)، نام، نوع مرکز، آدرس، تلفن، استان، شهر، وضعیت قرارداد، وضعیت فعال، زمان‌ها
- `doctors` - id, center_id, medical_council_code (unique), national_code, first_name, last_name, specialty, degree, is_active, timestamps
  - جدول پزشکان: شناسه، مرکز، کد نظام پزشکی (یکتا)، کد ملی، نام، نام خانوادگی، تخصص، مدرک، وضعیت فعال، زمان‌ها
- `institution_contracts` - id, center_id, contract_number, start_date, end_date, discount_percentage, settlement_cycle_days, tariff_rate, terms, status, timestamps, soft_deletes
  - جدول قراردادهای سازمانی: شناسه، مرکز، شماره قرارداد، تاریخ شروع، تاریخ پایان، درصد تخفیف، دوره تسویه، نرخ تعرفه، شرایط، وضعیت، زمان‌ها

## API Endpoints / اندپوینت‌های API
| Method | Endpoint | Status / وضعیت |
|--------|----------|--------|
| GET | `/api/v1/centers` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/centers` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/centers/:id` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/centers/:id` | Implemented / پیاده‌سازی شده |
| DELETE | `/api/v1/centers/:id` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/centers/search` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/centers/:id/doctors` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/centers/:id/doctors` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/doctors/:id` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/centers/:id/contracts` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/centers/:id/contracts` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/institution-contracts/:id` | Implemented / پیاده‌سازی شده |

## Requirements (Original Spec) / الزامات (مشخصات اصلی)

### Requirement: Center CRUD / الزام: عملیات CRUD مرکز درمانی
The system manages medical centers (hospitals, clinics, pharmacies, labs, imaging centers, etc.) with code, name, type, address, phone, province, city, contracted status, active status. IMPLEMENTED.

سیستم مراکز درمانی (بیمارستان‌ها، درمانگاه‌ها، داروخانه‌ها، آزمایشگاه‌ها، مراکز تصویربرداری و غیره) را با کد، نام، نوع، آدرس، تلفن، استان، شهر، وضعیت قرارداد و وضعیت فعال مدیریت می‌کند. پیاده‌سازی شده.

### Requirement: Center types / الزام: انواع مرکز درمانی
The system supports center types: hospital, clinic, pharmacy, lab, imaging, physiotherapy, dental, optics. IMPLEMENTED.

سیستم از انواع مراکز پشتیبانی می‌کند: بیمارستان، درمانگاه، داروخانه، آزمایشگاه، تصویربرداری، فیزیوتراپی، دندانپزشکی، عینک‌سازی. پیاده‌سازی شده.

### Requirement: Center contract management / الزام: مدیریت قرارداد مرکز درمانی
The system manages contracts between the TPA and medical centers, defining tariff rates, discount percentages, settlement terms, contract period. IMPLEMENTED.

سیستم قراردادهای بین TPA و مراکز درمانی را مدیریت می‌کند، شامل تعریف نرخ تعرفه، درصد تخفیف، شرایط تسویه و دوره قرارداد. پیاده‌سازی شده.

### Requirement: Doctor management / الزام: مدیریت پزشکان
The system manages doctors linked to centers with medical council code, national code, name, specialty, degree, active status. IMPLEMENTED.

سیستم پزشکان مرتبط با مراکز را با کد نظام پزشکی، کد ملی، نام، تخصص، مدرک و وضعیت فعال مدیریت می‌کند. پیاده‌سازی شده.
