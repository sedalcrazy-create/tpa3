## Status / وضعیت: Partially Implemented / تا حدی پیاده‌سازی شده

## Summary / خلاصه

Management of insurance policies, insurance history, insurance rules, and contracts. Models and pages are built but enforcement of waiting periods, coverage ceilings, and eligible relation validation remain.

مدیریت بیمه‌نامه‌ها، تاریخچه بیمه، قوانین بیمه‌ای و قراردادها. مدل‌ها و صفحات ساخته شده اما اعمال دوره انتظار، سقف تعهدات و اعتبارسنجی اقوام مجاز باقی‌مانده است.

## Tech Stack / پشته فناوری

- **Backend:** Laravel 12, PHP 8.3, Eloquent ORM, Sanctum
- **Frontend:** React 18, TypeScript, Tailwind CSS 4, Zustand, TanStack Query v5
- **Database:** PostgreSQL 16

## Backend / بک‌اند

### Implemented / پیاده‌سازی شده

- `app/Models/Insurance.php` - Insurance model with Eloquent relationships (employee, histories, rules)
- `app/Models/InsuranceHistory.php` - Insurance history model tracking changes (extensions, renewals)
- `app/Models/InsuranceRule.php` - Insurance rule model (waiting periods, coverage limits, age limits)
- `app/Models/Contract.php` - Contract model for insurer-TPA contracts
- `app/Http/Controllers/InsuranceController.php` - CRUD: index (paginated, filterable by employee), show, store, update, inquiry endpoint
- `app/Http/Controllers/ContractController.php` - CRUD: index (filterable by status), show, store, update
- `app/Services/InsuranceService.php` - Business logic for insurance operations (create, extend, inquiry)
- `app/Services/ContractService.php` - Contract management logic
- `database/migrations/` - insurances, insurance_histories, insurance_rules, contracts tables
- `routes/api.php` - Insurance and contract routes registered

### Remaining / باقی‌مانده

- Waiting period enforcement logic (check insurance start_date against insurance_rule.waiting_period per service category before allowing prescription)
- Coverage ceiling enforcement (track total claims per year against annual_coverage_limit, mark excess as employee share)
- Eligible relation types validation (verify family member relation_type_id is allowed per insurance_rule)
- Age limit validation per service category
- Full insurance inquiry logic (remaining ceiling calculation, active waiting periods, suspension check)

منطق اعمال دوره انتظار (بررسی تاریخ شروع بیمه در برابر دوره انتظار قانون بیمه‌ای برای هر دسته خدمت قبل از صدور نسخه)، اعمال سقف تعهدات (ردیابی کل ادعاهای سالانه در برابر سقف تعهد سالانه و علامت‌گذاری مازاد به عنوان سهم پرسنل)، اعتبارسنجی نوع نسبت‌های مجاز (بررسی relation_type_id عضو خانواده بر اساس قانون بیمه‌ای)، اعتبارسنجی محدودیت سنی برای هر دسته خدمت، و منطق کامل استعلام بیمه (محاسبه سقف باقی‌مانده، دوره‌های انتظار فعال، بررسی تعلیق).

## Frontend / فرانت‌اند

### Implemented / پیاده‌سازی شده

- `src/pages/insurances/InsuranceListPage.tsx` - Insurance records list with search and filters (employee, status, date range)
- `src/pages/insurances/InsuranceFormPage.tsx` - Create/edit insurance form (employee selection, start/end dates, coverage details)
- `src/pages/insurances/InsuranceInquiryPage.tsx` - Insurance inquiry page (search by national code, display coverage status and details)
- `src/pages/contracts/ContractListPage.tsx` - Contracts list with filters (status, date range)
- `src/pages/contracts/ContractFormPage.tsx` - Create/edit contract form (contract number, dates, premium amounts, coverage limits)
- `src/services/insuranceApi.ts` - API client with TanStack Query hooks
- `src/services/contractApi.ts` - API client with TanStack Query hooks

### Remaining / باقی‌مانده

- Insurance history view (timeline of changes per insurance record)
- Insurance rules management UI (CRUD for waiting periods, coverage limits)
- Visual display of remaining ceiling and waiting periods in inquiry results
- Coverage ceiling warning indicators on prescription creation

نمای تاریخچه بیمه (خط زمانی تغییرات هر رکورد بیمه)، رابط کاربری مدیریت قوانین بیمه‌ای (CRUD برای دوره‌های انتظار و سقف تعهدات)، نمایش بصری سقف باقی‌مانده و دوره‌های انتظار در نتایج استعلام، و نشانگرهای هشدار سقف تعهدات هنگام ایجاد نسخه.

## Database Tables / جداول پایگاه‌داده

- `insurances` - id, employee_id, unique_number (auto-generated), start_date, end_date, status (active/expired/cancelled), contract_id, timestamps, soft_deletes
- `insurance_histories` - id, insurance_id, change_type (extension/renewal/modification), old_start_date, old_end_date, new_start_date, new_end_date, prescription_id, timestamps
- `insurance_rules` - id, service_category, waiting_period_months, annual_coverage_limit, max_age, min_age, eligible_relation_types (JSON), description, is_active, timestamps
- `contracts` - id, contract_number, start_date, end_date, premium_amount, coverage_limits (JSON), franchise_terms, renewal_policy, status, timestamps, soft_deletes

## API Endpoints / نقاط پایانی API

| Method | Endpoint | Status / وضعیت |
|--------|----------|--------|
| GET | `/api/v1/insurances` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/insurances` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/insurances/:id` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/insurances/:id` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/insurances/inquiry` | Implemented (basic) / پیاده‌سازی شده (پایه) |
| GET | `/api/v1/contracts` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/contracts` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/contracts/:id` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/contracts/:id` | Implemented / پیاده‌سازی شده |

## Requirements (Original Spec) / الزامات (مشخصات اصلی)

### Requirement: Insurance coverage management / الزام: مدیریت پوشش بیمه‌ای

The system manages insurance coverage records per employee with start/end dates, unique number, and active status. Each employee may have multiple insurance records (sequential coverage periods). Only one insurance is active at a time. IMPLEMENTED.

سیستم رکوردهای پوشش بیمه‌ای هر پرسنل را با تاریخ شروع/پایان، شماره یکتا و وضعیت فعال مدیریت می‌کند. هر پرسنل می‌تواند چندین رکورد بیمه‌ای داشته باشد (دوره‌های پوشش متوالی). فقط یک بیمه در هر زمان فعال است. پیاده‌سازی شده.

### Requirement: Insurance history tracking / الزام: ردیابی تاریخچه بیمه

The system tracks every change to insurance records (extension, renewal, modification) in `insurance_histories`. PARTIALLY IMPLEMENTED (model exists, full tracking logic pending).

سیستم هر تغییر در رکوردهای بیمه (تمدید، تجدید، اصلاح) را در `insurance_histories` ردیابی می‌کند. تا حدی پیاده‌سازی شده (مدل موجود است، منطق کامل ردیابی در انتظار).

### Requirement: Insurance rules / الزام: قوانین بیمه‌ای

The system defines insurance rules that control: waiting periods, maximum coverage amounts, eligible relation types, age limits per service category. PARTIALLY IMPLEMENTED (model exists, enforcement logic pending).

سیستم قوانین بیمه‌ای تعریف می‌کند که موارد زیر را کنترل می‌کنند: دوره‌های انتظار، حداکثر مبالغ پوشش، انواع نسبت‌های مجاز، و محدودیت‌های سنی برای هر دسته خدمت. تا حدی پیاده‌سازی شده (مدل موجود است، منطق اعمال در انتظار).

### Requirement: Insurance inquiry / الزام: استعلام بیمه

The system provides real-time insurance validity check for an employee. PARTIALLY IMPLEMENTED (basic endpoint exists, full ceiling/waiting period calculation pending).

سیستم بررسی اعتبار بیمه به صورت آنی برای پرسنل ارائه می‌دهد. تا حدی پیاده‌سازی شده (endpoint پایه موجود است، محاسبه کامل سقف/دوره انتظار در انتظار).

### Requirement: Contract management / الزام: مدیریت قراردادها

The system manages contracts between the insurer and the TPA company. IMPLEMENTED.

سیستم قراردادهای بین بیمه‌گر و شرکت TPA را مدیریت می‌کند. پیاده‌سازی شده.
