## Context / زمینه

The current Bank Melli (Refah) system runs on PHP/Yii 1.x with 89 models and 89 controllers. The previous rewrite attempt (TPA2) using Go+Fiber+NestJS was halted due to backend duality and Docker complexity. TPA3 has been rewritten with a more pragmatic approach (Laravel 12 + React 18), and the current MVP covers CRUD for all modules.

سامانه فعلی بانک ملی (رفاه) روی PHP/Yii 1.x با 89 مدل و 89 کنترلر در حال کار است. تلاش قبلی بازنویسی (TPA2) با Go+Fiber+NestJS به دلیل دوگانگی بکند و پیچیدگی Docker متوقف شد. TPA3 با رویکرد عملی‌تر (Laravel 12 + React 18) بازنویسی شده و MVP فعلی CRUD تمام ماژول‌ها را پوشش میدهد.

**Reference Sources / منابع مرجع:**
- Refah: 8-table pricing engine, 50+ entities, complete PriceConditionCalculator
- Synapse: CQRS architecture, 7-step claim workflow
- TPA2: Entity structs and migrations from which the data model was ported

- رفاه: موتور قیمت‌گذاری 8 جدولی، 50+ entity، PriceConditionCalculator کامل
- سیناپس: معماری CQRS، claim workflow 7 مرحله‌ای
- TPA2: Entity structs و migration هایی که مدل داده ازشون پورت شد

**Constraints / محدودیت‌ها:**
- Single client: Bank Melli only (single-tenant) / مشتری فقط بانک ملی (single-tenant)
- Shamsi (Solar Hijri) calendar required / تقویم شمسی الزامی
- Bank Melli HR server at `172.29.21.6` with views `V_sadad_personal` and `V_sadad_family` / سرور HR بانک ملی در `172.29.21.6` با view های `V_sadad_personal` و `V_sadad_family`
- 200K personnel, 5M documents/year / 200K پرسنل، 5M سند/سال

## Goals / Non-Goals / اهداف و غیر اهداف

**Goals / اهداف:**
- Unified Laravel 12 backend with Sanctum auth and Service layer / بکند واحد Laravel 12 با Sanctum auth و Service layer
- React 18 + TypeScript + Tailwind CSS 4 frontend with Farsi RTL / فرانتاند React 18 + TypeScript + Tailwind CSS 4 با RTL فارسی
- Full port of 50+ table Refah data model to PostgreSQL / پورت کامل مدل داده 50+ جدول رفاه به PostgreSQL
- Simple Docker: postgres + redis + php-fpm-apache / Docker ساده: postgres + redis + php-fpm-apache
- Pricing engine with ruler/ruler (PHP rule engine) / موتور قیمت‌گذاری با ruler/ruler (PHP rule engine)
- Complete claim workflow (6 statuses) aligned with Synapse / Claim workflow کامل (6 وضعیت) مطابق سیناپس
- Personnel sync from Bank Melli HR / سینک پرسنل از HR بانک ملی

**Non-Goals / غیر اهداف:**
- Multi-tenancy (currently single-tenant for Bank Melli) / Multi-tenancy (فعلاً single-tenant برای بانک ملی)
- Mobile application / اپلیکیشن موبایل
- AI-based fraud detection / هوش مصنوعی تشخیص تقلب
- Integration with Sepas/Senhab (next phase) / یکپارچه‌سازی با سپاس/سنهاب (فاز بعدی)
- Kubernetes/Microservices

## Decisions / تصمیمات

### D1: Laravel 12 + PHP 8.3 Backend / بکند Laravel 12 + PHP 8.3

**Choice:** Laravel 12 with PHP 8.3 instead of Go+Fiber

**Reasoning:** Laravel offers a more complete ecosystem (Eloquent ORM, Sanctum auth, migrations, seeders, queues). Development speed is higher and the team is more familiar. ruler/ruler serves as the rule engine replacement for Grule.

**انتخاب:** Laravel 12 با PHP 8.3 بجای Go+Fiber

**دلیل:** Laravel اکوسیستم کامل‌تری دارد (Eloquent ORM, Sanctum auth, migrations, seeders, queues). سرعت توسعه بالاتر و تیم آشناتر. ruler/ruler بعنوان rule engine جایگزین Grule.

**Structure / ساختار:**
```
backend/
├── app/
│   ├── Http/Controllers/Api/V1/   # 15 API controllers / 15 کنترلر API
│   ├── Models/                     # 53 Eloquent models / 53 مدل Eloquent
│   ├── Services/                   # 25 services (business logic) / 25 سرویس (منطق کسب‌وکار)
│   │   ├── Pricing/                # 7 pricing services / 7 سرویس قیمت‌گذاری
│   │   └── Claim/                  # 3 claim services / 3 سرویس خسارت
│   ├── Enums/                      # 8 PHP enums / 8 شمارنده PHP
│   ├── Traits/                     # ApiResponse trait
│   └── Rules/                      # NationalCode validation / اعتبارسنجی کد ملی
├── database/
│   ├── migrations/                 # 35 migrations / 35 مایگریشن
│   └── seeders/
├── routes/api.php                  # 90 API endpoints / 90 نقطه اتصال API
├── config/
└── docker-compose.yml
```

### D2: React 18 + TypeScript + Tailwind CSS 4 Frontend / فرانتاند React 18 + TypeScript + Tailwind CSS 4

**Choice:** React 18 + TypeScript + Vite 6 + Tailwind CSS 4

**انتخاب:** React 18 + TypeScript + Vite 6 + Tailwind CSS 4

**Structure / ساختار:**
```
frontend/src/
├── api/                # 19 API modules (Axios) / 19 ماژول API
├── pages/              # 41 page components / 41 کامپوننت صفحه
├── components/
│   ├── layout/         # AppLayout, Sidebar, Header, Breadcrumb
│   ├── shared/         # ProtectedRoute, ErrorBoundary
│   └── ui/             # 13 reusable components (DataTable, Modal, DatePicker, ...) / 13 کامپوننت قابل استفاده مجدد
├── hooks/              # useAuth, useLookups, useDebounce
├── store/              # Zustand (authStore, uiStore)
├── types/              # 8 TypeScript type files / 8 فایل نوع TypeScript
└── utils/              # jalali, format, constants
```

**Patterns / الگوها:**
- `dir="rtl"` + Vazirmatn font (Google Fonts) / `dir="rtl"` + فونت Vazirmatn (Google Fonts)
- Shamsi calendar with `jalaali-js` / تقویم شمسی با `jalaali-js`
- Server state: TanStack React Query v5 (`staleTime: Infinity` for lookups) / مدیریت وضعیت سرور: TanStack React Query v5 (`staleTime: Infinity` برای lookups)
- Client state: Zustand (auth token, sidebar collapse) / مدیریت وضعیت کلاینت: Zustand (auth token, sidebar collapse)
- URL state: `useSearchParams` (pagination, sort, filters) / مدیریت وضعیت URL: `useSearchParams` (صفحه‌بندی، مرتب‌سازی، فیلتر)
- Form: React Hook Form + Zod validation / فرم: React Hook Form + اعتبارسنجی Zod

**Color Palette / پالت رنگ:**
```
primary:  #7d3cff (purple / بنفش)
danger:   #c80e13 (red / قرمز)
warning:  #f2d53c (yellow / زرد)
surface:  #fceed1 (cream / کرم)
sidebar:  #1e1b4b (navy / سرمه‌ای)
```

### D3: PostgreSQL 16 Database - Data Model / دیتابیس PostgreSQL 16 - مدل داده

**Choice:** PostgreSQL 16 with Eloquent ORM, data model based on Refah

**انتخاب:** PostgreSQL 16 با Eloquent ORM، مدل داده مبتنی بر رفاه

**35 migrations, 56 tables / 35 مایگریشن، 56 جدول:**

```sql
-- ============ Base & Lookups / پایه و Lookup ============
custom_employee_codes (id, code, title, is_active)
special_employee_types (id, code, title, is_active)
relation_types (id, code, title)
guardianship_types (id, code, title)
locations (id, code, title, parent_id, type)
provinces (id, code, title)
body_parts (id, code, title, type_id)
body_part_types (id, code, title)
item_categories (id, code, title)
item_sub_categories (id, category_id, code, title)
item_groups (id, code, title)
prescription_types (id, code, title)
document_types (id, code, title)
institution_contract_types (id, code, title)
commission_case_types (id, code, title)

-- ============ RBAC ============
roles (id, name, title_fa, level, is_system, is_active)
permissions (id, name, title_fa, module, is_active)
role_permissions (role_id, permission_id)
users (id, name, email, password, role_id, is_active, ...)

-- ============ Personnel & Insurance / پرسنل و بیمه ============
employees (
  id, parent_id, personnel_code, national_code,
  first_name, last_name, father_name, birth_date,
  gender, marital_status, relation_type_id, guardianship_type_id,
  custom_employee_code_id, special_employee_type_id,
  branch_id, location_id, location_work_id,
  phone, mobile, email, account_number, picture,
  recruitment_date, retirement_date, status, is_active,
  created_at, updated_at, deleted_at
)
employee_import_temp (staging table for HR sync)
employee_import_history (import tracking)
employee_illnesses (employee_id, illness_id)
employee_infractions (employee_id, type, description, ...)

insurances (id, employee_id, unique_number, start_date, end_date, status, is_active, location_id)
insurance_histories (id, insurance_id, unique_number, start_date, end_date, change_type, status)
insurance_rules (service_category, waiting_period_months, annual_limit, per_claim_limit, ...)

-- ============ Drugs & Services / دارو و خدمات ============
items (id, code, title, title_en, generic_code, item_type, category_id, sub_category_id, group_id, unit, default_dosage, is_active)
item_prices (id, item_id, price, effective_date, expiry_date, source)
drug_interactions (id, drug1_id, drug2_id, severity, description)
illnesses (id, icd_code, title, is_active)

-- ============ Pricing Engine / موتور قیمت‌گذاری ============
item_price_conditions (
  id, item_id,
  min_age, max_age, gender_id,
  min_work_years, max_work_years,
  custom_employee_code_id, special_employee_type_id, relation_type_id,
  illness_id, item_category_id, item_sub_category_id, item_group_id, location_id,
  amount, percentage, max_price_percentage, no_limitation,
  total_count_of_use, period_type, period_count, period_calculate_style,
  body_part_count_of_usage, in_each_body_part,
  priority, is_active, start_date, end_date
)
item_price_condition_filters (id, condition_id, filter_type, filter_value, status, priority)
item_price_condition_restrictions (id, condition_id, item_id, duration_type, duration_count, use_count, ...)
condition_groups (id, name, period_type, period_count, max_count, max_amount, is_active)
condition_group_items (id, group_id, item_id)

-- Discounts (4 types) / تخفیفات (4 نوع)
employee_special_discounts (employee_id, item_id, item_category_id, discount_percentage, discount_amount, ...)
cec_item_discounts (custom_employee_code_id, item_id, item_category_id, discount_percentage, discount_amount)
set_item_discounts (special_employee_type_id, item_id, item_category_id, discount_percentage, discount_amount)

-- ============ Prescription & Invoicing / نسخه و صورتحساب ============
prescriptions (id, unique_code, insurance_id, insurance_history_id, institution_contract_id, prescription_date, expiry_date, status)
invoices (
  id, unique_code, employee_id, prescription_id,
  doctor_id, pharmacy_id, institution_contract_id,
  document_type_id, prescription_type_id,
  total_price, total_paid_price, total_employee_share, total_bank_share,
  total_deductions, total_final_paid,
  status, delivery_type, is_frozen, location_id, invoice_date
)
invoice_items (
  id, invoice_id, item_id, item_real_id,
  price, count, count_requested, total_price, paid_price,
  behdasht_price, takmili_price,
  discount_type, discount_code, discount_percentage, discount_amount, discount_amount_real,
  body_part_id, body_part_type_id,
  status, is_checked, alert_description
)

-- ============ Medical Centers / مراکز درمانی ============
centers (id, code, name, center_type, phone, address, province_id, city_id, is_contracted, is_active)
doctors (id, medical_council_code, national_code, first_name, last_name, specialty, degree_id, center_id)
institution_contracts (id, center_id, type_id, name, start_date, end_date)

-- ============ Claims / خسارت ============
claims (
  id, employee_id, invoice_id, claim_type, status,
  request_price, approved_price, paid_price, deduction_amount,
  admission_date, discharge_date,
  examiner_id, supervisor_id, payment_date,
  examiner_note, rejection_reason
)
claim_notes (id, claim_id, user_id, note, created_at)
claim_attachments (id, claim_id, file_path, file_name, file_type, uploaded_by)

-- ============ Financial / مالی ============
invoice_aggregations (id, employee_id, personnel_code, aggregation_date, total_amount, behdasht_amount, takmili_amount, status)
contracts (id, ...)

-- ============ Medical Commission / کمیسیون پزشکی ============
commission_cases (id, employee_id, case_type_id, case_number, description, verdict, verdict_date, status, assigned_to)
verdict_templates (id, ...)
social_work_cases (id, ...)

-- ============ System / سیستمی ============
audit_logs (id, user_id, action, entity_type, entity_id, old_data JSONB, new_data JSONB, ip, created_at)
```

### D4: Pricing Engine - ruler/ruler + DB Conditions / موتور قیمت‌گذاری - ruler/ruler + شرایط دیتابیسی

**Choice:** Combination of ruler/ruler (PHP rule engine) + database-driven conditions

**انتخاب:** ترکیب ruler/ruler (PHP rule engine) + شرایط دیتابیسی

**Implemented Services / سرویس‌های پیاده‌سازی شده:**
```
app/Services/Pricing/
├── PricingService.php              # Main orchestrator / ارکستراتور اصلی
├── ConditionMatcher.php            # Match item_price_conditions by employee attributes / تطبیق شرایط قیمت بر اساس ویژگی‌های کارمند
├── UsageCounter.php                # Count invoice_items usage in period / شمارش استفاده آیتم‌های فاکتور در دوره
├── DiscountCalculator.php          # Apply 4 discount types (employee > CEC > SET > default) / اعمال 4 نوع تخفیف
├── GroupChecker.php                # Check condition_group cross-item limits / بررسی محدودیت‌های بین‌آیتمی گروه شرایط
├── ConflictChecker.php             # Check pricing conflicts / بررسی تعارضات قیمت‌گذاری
└── RuleEngineAdapter.php           # ruler/ruler integration wrapper / پوشش یکپارچه‌سازی ruler/ruler
```

**Flow / فلو:**
```
InvoiceItem + Employee + Insurance
         |
         v
+---------------------+
|  PricingService      |
|  (PHP orchestrator)  |
+----------+----------+
           |
    +------+------+--------+
    v      v      v        v
 Condition  Usage   Group   Discount
 Matcher   Counter  Checker Calculator
    |       |       |        |
    +-------+-------+--------+
                |
                v
       Final Price Result
       - paid_price
       - employee_share
       - deductions
```

**Current Status:** The service structure has been created but the internal business logic is still incomplete. Full implementation of the matching algorithm and ruler/ruler rules is needed.

**وضعیت فعلی:** ساختار سرویس‌ها ایجاد شده ولی business logic داخلی هنوز ناقصه. نیاز به پیاده‌سازی کامل matching algorithm و ruler/ruler rules.

### D5: Claim Workflow - State Machine / جریان کار خسارت - ماشین حالت

**Choice:** State machine in `app/Services/Claim/ClaimStateMachine.php`

**انتخاب:** State machine در `app/Services/Claim/ClaimStateMachine.php`

```
             +----------+
             | REGISTER | (2)
             +----+-----+
                  v
           +-------------+
      +----| WAIT_CHECK  | (3)
      |    +------+------+
      |           v
      |    +-------------+
      |    |WAIT_CONFIRM | (4)------+
      |    +------+------+          |
      |           v                 v
      |    +-------------+   +-----------+
      |    |WAIT_FINANCIAL|(5)|WAIT_RECHECK| (8)
      |    +------+------+   +-----------+
      |           v
      |    +-------------+
      |    |  ARCHIVED   | (6) = Paid / پرداخت شده
      |    +-------------+
      |
      v
+-----------+
| RETURNED  | (1) = Rejected / رد شده
+-----------+
```

**Current Status:** ClaimStateMachine.php and DeductionService.php have been created. API endpoints `POST /claims/{id}/transition` and `GET /claims/{id}/next-statuses` exist. Validation rules need to be completed.

**وضعیت فعلی:** ClaimStateMachine.php و DeductionService.php ایجاد شده. API endpoint `POST /claims/{id}/transition` و `GET /claims/{id}/next-statuses` موجوده. نیاز به تکمیل validation rules.

### D6: Authentication - Laravel Sanctum / احراز هویت - Laravel Sanctum

**Choice:** Laravel Sanctum (token-based API auth)

**انتخاب:** Laravel Sanctum (احراز هویت API مبتنی بر توکن)

**Endpoints:**
- `POST /auth/login` - Obtain token / دریافت token
- `POST /auth/logout` - Revoke token / ابطال token
- `POST /auth/refresh` - Refresh token / بازنشانی token
- `GET /auth/me` - Current user info / اطلاعات کاربر جاری
- `PUT /auth/change-password` - Change password / تغییر رمز

**Service / سرویس:** `AuthService.php` handles login/logout/refresh/password-change

**Frontend / فرانتاند:**
- Token is stored in Zustand `authStore` / Token در Zustand `authStore` ذخیره میشه
- Axios interceptor automatically adds `Authorization: Bearer` / Axios interceptor خودکار `Authorization: Bearer` اضافه میکنه
- 401 response -> redirect to `/login` and clear token / 401 response -> redirect به `/login` و پاک کردن token

### D7: Docker / داکر

**Choice / انتخاب:**
```yaml
# backend/docker-compose.yml (development)
services:
  app:
    image: serversideup/php:8.3-fpm-apache
    ports: ["8088:8080"]
    volumes: [./:/var/www/html]
    depends_on: [postgres, redis]
  postgres:
    image: postgres:16-alpine
    ports: ["15432:5432"]
  redis:
    image: redis:7-alpine
    ports: ["16379:6379"]
```

**Login Credentials / اطلاعات ورود:**
```
Email: admin@tpa.ir
Password: Admin@123
```

### D8: API Design / طراحی API

**Base URL:** `http://localhost:8088/api/v1`

**Auth:** Sanctum token (all endpoints except login require authentication) / توکن Sanctum (همه endpoint ها بجز login نیاز به auth دارن)

**Response format:** `{ success, message, data, errors }`

**90 Endpoints in 15 groups / 90 نقطه اتصال در 15 گروه:**
| Module | Endpoints | Controller |
|--------|-----------|------------|
| Auth | 5 | AuthController |
| Employees | 9 | EmployeeController |
| Insurances | 7 | InsuranceController |
| Contracts | 5 | ContractController |
| Items | 8 | ItemController |
| Diagnoses | 3 | DiagnosisController |
| Prescriptions | 5 | PrescriptionController |
| Invoices | 7 | InvoiceController |
| Claims | 9 | ClaimController |
| Centers | 8 | CenterController |
| Settlements | 5 | SettlementController |
| Commission | 9 | CommissionController |
| Reports | 3 | ReportController |
| Lookups | 13 | LookupController |
| Users | 6 | UserController |

## Risks / Trade-offs / ریسک‌ها و مصالحه‌ها

**[R1] Pricing engine complexity / پیچیدگی موتور قیمت‌گذاری**
- Mitigation: Service structure is ready. First, unit tests with real Refah data, then gradual rule implementation.
- مقابله: ساختار سرویس‌ها آماده‌ست. ابتدا unit test با داده واقعی رفاه، سپس پیاده‌سازی تدریجی rules.

**[R2] Personnel sync not yet implemented / سینک پرسنل هنوز پیاده‌سازی نشده**
- Mitigation: Staging tables and import history are ready. Only the connection to the HR server and sync logic remain.
- مقابله: جداول staging و import history آماده‌ست. فقط connection به HR server و sync logic مونده.

**[R3] Shamsi <-> Gregorian date conversion / تاریخ شمسی <-> میلادی**
- Done: Always stored as Gregorian, displayed as Shamsi. `jalaali-js` on frontend, `morilog/jalali` on backend.
- انجام شده: همیشه میلادی ذخیره، شمسی نمایش. `jalaali-js` در فرانت، `morilog/jalali` در بکند.

**[R4] Incomplete claim state machine / ماشین حالت خسارت ناقص**
- Mitigation: Structure is ready, transition validation and business rules need to be completed.
- مقابله: ساختار آماده، نیاز به تکمیل transition validation و business rules.

**[R5] Rule engine not yet active / Rule engine هنوز فعال نشده**
- Mitigation: `RuleEngineAdapter.php` has been created with ruler/ruler. Rules need to be written and tested with real data.
- مقابله: `RuleEngineAdapter.php` با ruler/ruler ایجاد شده. نیاز به نوشتن rules و تست با داده واقعی.
