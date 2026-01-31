## Status / وضعیت: Implemented / پیاده‌سازی شده

## Summary / خلاصه

Management of Bank Melli personnel information and their families using an Employee model with 61 fields, 6 frontend pages, staged Excel import with 33-column mapping from the HR system (جافام), family/illness/infraction CRUD, and lookup-driven dropdowns. HR server synchronization remains to be implemented.

مدیریت اطلاعات پرسنل بانک ملی و خانواده‌های آنها با استفاده از مدل Employee با ۶۱ فیلد، ۶ صفحه فرانت‌اند، ایمپورت مرحله‌ای اکسل با نگاشت ۳۳ ستون از سیستم منابع انسانی (جافام)، عملیات CRUD خانواده/بیماری/تخلف، و منوهای کشویی مبتنی بر lookup. همگام‌سازی با سرور منابع انسانی باقی‌مانده است.

## Tech Stack / پشته فناوری

- **Backend:** Laravel 12, PHP 8.3, Eloquent ORM, PhpSpreadsheet
- **Frontend:** React 18, TypeScript, Tailwind CSS 4, TanStack Query v5, react-hook-form + Zod
- **Database:** PostgreSQL 16

## Backend / بک‌اند

### Implemented / پیاده‌سازی شده

- `app/Models/Employee.php` - Employee model with 61 fillable fields, self-referencing parent_id, relationships (familyMembers, parent, insurances, illnesses, infractions, marriageStatus, locationWork, location, province, customEmployeeCode, specialEmployeeType, relationType, guardianshipType)
- `app/Models/MarriageStatus.php` - Marriage status lookup model (single, married, divorced, widowed)
- `app/Http/Controllers/Api/V1/EmployeeController.php` - 20+ methods: CRUD, bulkDestroy, search, family CRUD, illness CRUD, infraction CRUD, staged import (importStage, importPreview, importApply), import history, template download, photo upload
- `app/Services/EmployeeService.php` - Business logic: list (with LIST_RELATIONS/DETAIL_RELATIONS), search, bulkDelete, family CRUD, illness CRUD, infraction CRUD
- `app/Services/EmployeeImportService.php` - Complete rewrite: 35-column Excel mapping (33 data + 2 ignored), streaming XMLReader parser via `zip://` URI (handles 55MB+ files with minimal memory), staged import flow (stage → preview → apply), chunked DB inserts (1000 rows), FK sanitization (nullifies invalid references), NULL-string handling, two-pass parent_id resolution, COALESCE update logic, Jalali→Gregorian date conversion, diff computation
- `app/Http/Resources/EmployeeResource.php` - Nested relation format (gender/status as {value, label}, FK relations as {id, code, title}, parent as {id, full_name, personnel_code})
- `app/Http/Requests/Employee/` - 8 request validators: Store, Update, StoreFamily, BulkDelete, StoreIllness, StoreInfraction, ImportStage, ImportApply
- `database/migrations/` - employees table (61 columns, national_code nullable), marriage_statuses, employees_import_temp (with action/diff_data, status varchar(30)), employee_import_history (with import_mode/selected_fields/insert_count/update_count/skip_count, status varchar(30))
- `routes/api.php` - 25+ employee routes registered under `/api/v1/employees` (specific routes before `{id}` wildcard)

### Remaining / باقی‌مانده

- HR sync from Bank Melli server at `172.29.21.6` (database `personal`, views `V_sadad_personal` and `V_sadad_family`)
- Scheduled daily sync command

همگام‌سازی پرسنلی از سرور بانک ملی در آدرس `172.29.21.6` و دستور همگام‌سازی روزانه زمان‌بندی‌شده.

## Frontend / فرانت‌اند

### Implemented / پیاده‌سازی شده

- `src/pages/employees/EmployeeListPage.tsx` - Paginated list with search, dropdown filters (special type, relation, guardianship, gender, status), column sorting, bulk delete, nested data accessors via render functions
- `src/pages/employees/EmployeeCreatePage.tsx` - Form with 27 fields, Zod validation, lookup-driven dropdowns (useSpecialEmployeeTypes, useRelationTypes, useGuardianshipTypes, useGenders, useEmployeeStatuses, useCustomEmployeeCodes, useMarriageStatuses, useAllLocations), DatePicker, FileUpload, FormData submission
- `src/pages/employees/EmployeeEditPage.tsx` - Edit form matching Create, pre-fill from nested resource format (e.g., `employee.custom_employee_code?.id`, `employee.gender?.value`)
- `src/pages/employees/EmployeeViewPage.tsx` - Detail view with 3 tabs (basic info, family, insurance), nested field display, family table with data fetch, active insurance display
- `src/pages/employees/EmployeeFamilyPage.tsx` - Family CRUD with modal form, DataTable, nested type accessors (relation_type?.title, gender?.label)
- `src/pages/employees/EmployeeImportPage.tsx` - Staged import UI: idle → uploading → staged (preview with inserts/updates/errors tabs, diff highlighting, field selection checkboxes, import mode selector) → applying → done. Import history table with detail modal.
- `src/api/employees.ts` - API client: list, get, create, update, delete, bulkDelete, search, family CRUD
- `src/api/employeeImport.ts` - Staged import API: stage, preview, apply (with 600s timeout), history, template download
- `src/types/employee.ts` - Employee interface with nested relations (gender: {value, label}, status: {value, label}, custom_employee_code: {id, code, title}, etc.)
- `src/hooks/useLookups.ts` - useMarriageStatuses, useAllLocations hooks added
- `src/api/lookups.ts` - marriageStatuses endpoint added

### Remaining / باقی‌مانده

- HR sync trigger UI (button to initiate sync from 172.29.21.6)
- Sync progress/history page

رابط کاربری راه‌اندازی همگام‌سازی پرسنلی و صفحه پیشرفت/تاریخچه همگام‌سازی.

## Database Tables / جداول پایگاه‌داده

### `employees` / جدول کارمندان

61 columns including: id, parent_id (self-ref), personnel_code, national_code (nullable - many HR records have no national code), first_name, last_name, father_name, id_number, phone, mobile, email, address, bank_account_number, photo, gender (enum), birth_date, birth_date_jalali, employment_date, employment_date_jalali, retirement_date, status (enum), is_active, is_head_of_family, priority, description, branch_id, bazneshasegi_date, hoghogh_branch_id, province_id (FK), location_id (FK), location_work_id (FK), custom_employee_code_id (FK), special_employee_type_id (FK), relation_type_id (FK), guardianship_type_id (FK), marriage_status_id (FK), timestamps, soft_deletes

۶۱ ستون شامل: شناسه، شناسه والد (خودارجاعی)، کد پرسنلی، کد ملی، نام، نام خانوادگی، نام پدر، شماره شناسنامه، تلفن، موبایل، ایمیل، آدرس، شماره حساب بانکی، تصویر، جنسیت، تاریخ تولد، تاریخ استخدام، تاریخ بازنشستگی، وضعیت، فعال، سرپرست خانوار، اولویت، توضیحات، شعبه، تاریخ بازنشستگی، شعبه حقوق، استان، محل خدمت، محل کار، کد CEC، نوع خاص، نسبت، سرپرستی، وضعیت تاهل، timestamps، soft_deletes

### `marriage_statuses` / جدول وضعیت تاهل

id, code, title, is_active. Seeded: مجرد (1), متاهل (2), مطلقه (3), همسر فوت شده (4)

### `employees_import_temp` / جدول موقت ایمپورت

import_id, row_number, raw_data (JSONB), processed_data (JSONB), error_message, new_p_code, action (insert/update/skip/error), matched_employee_id, diff_data (JSONB)

### `employee_import_history` / جدول تاریخچه ایمپورت

file_name, file_path, total_rows, success_count, error_count, insert_count, update_count, skip_count, status, import_mode, selected_fields (JSONB), imported_by, started_at, completed_at, error_log

### `employee_illnesses` / جدول بیماری‌های کارمندان
employee_id, illness_id, diagnosis_date, description

### `employee_infractions` / جدول تخلفات کارمندان
employee_id, type, description, suspension_start_date, suspension_end_date

## Excel Import Mapping (33 Columns - جافام) / نگاشت ایمپورت اکسل (۳۳ ستون - جافام)

The system imports from Bank Melli HR Excel files (جافام 14040811.xlsx format) with the following column mapping:

سیستم از فایل‌های اکسل منابع انسانی بانک ملی (فرمت جافام 14040811.xlsx) با نگاشت ستون زیر ایمپورت می‌کند:

| Excel Column / ستون اکسل | TPA3 Column / ستون TPA3 | Transform / تبدیل |
|---|---|---|
| NewPCode | personnel_code | Direct / مستقیم |
| employee_active | is_active | 1=true, 0=false |
| employee_priority | priority | Direct / مستقیم |
| employee_status | status | Map: 1→active, 2→inactive, 3→retired, 4→deceased |
| id_cec | custom_employee_code_id | FK integer |
| id_set | special_employee_type_id | FK integer |
| id_employee_parent | parent_id | Resolve via personnel_code (2-pass) / حل از طریق کد پرسنلی (۲ مرحله) |
| employee_discription | description | Direct (Excel header has typo) / مستقیم (غلط املایی در اکسل) |
| employee_craete_date | _(ignored)_ | Not imported / ایمپورت نمی‌شود |
| employee_first_name | first_name | Direct / مستقیم |
| employee_last_name | last_name | Direct / مستقیم |
| employee_phone_number | phone | Direct / مستقیم |
| employee_mobile_number | mobile | Direct / مستقیم |
| employee_personnel_code | (reference festno) | Shared family code / کد مشترک خانواده |
| employee_account_number | bank_account_number | Direct / مستقیم |
| employee_email | email | Direct / مستقیم |
| employee_picture | photo | Path string / رشته مسیر |
| id_rt | relation_type_id | FK integer |
| employee_meli_code | national_code | Direct / مستقیم |
| id_gt | guardianship_type_id | FK integer |
| id_gender | gender | 1→male, 2→female |
| id_ms | marriage_status_id | FK integer |
| employee_birthday | birth_date | Jalali→Gregorian / شمسی→میلادی |
| id_location | location_id | FK integer |
| id_location_work | location_work_id | FK integer |
| employee_father_name | father_name | Direct / مستقیم |
| id_branch | branch_id | Direct / مستقیم |
| employee_start_date | employment_date | Jalali→Gregorian / شمسی→میلادی |
| employee_out_date | retirement_date | Jalali→Gregorian / شمسی→میلادی |
| BazDate | bazneshasegi_date | Direct (Jalali) / مستقیم (شمسی) |
| Shenasname | id_number | Direct / مستقیم |
| Hoghogh | hoghogh_branch_id | Direct / مستقیم |
| Address | address | Direct / مستقیم |

### Staged Import Flow / جریان ایمپورت مرحله‌ای

1. **Stage / مرحله‌بندی:** `POST /employees/import/stage` - Upload XLSX, stream-parse via XMLReader+`zip://` URI (memory-efficient for 55MB+ files), map 35 columns, handle literal "NULL" strings, validate, write to temp table in 1000-row chunks, compute diffs for existing employees
2. **Preview / پیش‌نمایش:** `GET /employees/import/{id}/preview` - Returns summary (insert/update/skip/error counts) with sample records and diff data showing old→new values per field
3. **Apply / اعمال:** `POST /employees/import/{id}/apply` - Apply with import_mode (insert_only/update_only/both), selected_fields filtering, FK sanitization (nullifies references to non-existent lookup records), COALESCE logic for updates, `chunkById(500)` processing, two-pass for parent_id resolution

**Verified / تست شده:** 1000-row sample from جافام 14040811.xlsx (55MB, 318K+ rows) - stage 4.6s, insert 10s, re-import as update 10s, 0 errors

## API Endpoints / نقاط پایانی API

| Method | Endpoint | Status / وضعیت |
|--------|----------|--------|
| GET | `/api/v1/employees` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/employees` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/employees/search` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/employees/bulk-delete` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/employees/import/history` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/employees/import/history/{id}` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/employees/import/template` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/employees/import/stage` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/employees/import/{id}/preview` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/employees/import/{id}/apply` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/employees/{id}` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/employees/{id}` | Implemented / پیاده‌سازی شده |
| DELETE | `/api/v1/employees/{id}` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/employees/{id}/family` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/employees/{id}/family` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/employees/{id}/family/{familyId}` | Implemented / پیاده‌سازی شده |
| DELETE | `/api/v1/employees/{id}/family/{familyId}` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/employees/{id}/illnesses` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/employees/{id}/illnesses` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/employees/{id}/illnesses/{illnessId}` | Implemented / پیاده‌سازی شده |
| DELETE | `/api/v1/employees/{id}/illnesses/{illnessId}` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/employees/{id}/infractions` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/employees/{id}/infractions` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/employees/{id}/infractions/{infractionId}` | Implemented / پیاده‌سازی شده |
| DELETE | `/api/v1/employees/{id}/infractions/{infractionId}` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/lookups/marriage-statuses` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/employees/sync` | Not Started / شروع نشده |

## Requirements / الزامات

### Requirement: Employee CRUD with family hierarchy / الزام: عملیات CRUD پرسنل با سلسله‌مراتب خانواده

The system manages employees (bank personnel) and their family dependents in a single `employees` table using self-referencing `parent_id`. Main employees have `parent_id=NULL`, family members have `parent_id` pointing to the main employee. **IMPLEMENTED.**

سیستم پرسنل و اعضای خانواده وابسته آنها را در یک جدول `employees` با استفاده از `parent_id` خودارجاعی مدیریت می‌کند. **پیاده‌سازی شده.**

### Requirement: Staged Excel import with 33-column mapping / الزام: ایمپورت مرحله‌ای اکسل با نگاشت ۳۳ ستون

The system imports from Bank Melli HR Excel files (جافام format, 55MB+, 318K+ rows) using a staged flow: upload → preview (with diffs) → apply. Uses streaming XMLReader parser via `zip://` URI for memory efficiency. Handles literal "NULL" strings from the HR system. FK sanitization nullifies references to non-existent lookup records. Supports import modes (insert_only, update_only, both), field-level selection, `chunkById` processing, and two-pass parent_id resolution. **IMPLEMENTED AND TESTED.**

سیستم از فایل‌های اکسل منابع انسانی بانک ملی (فرمت جافام، ۵۵+ مگابایت، ۳۱۸هزار+ ردیف) با جریان مرحله‌ای ایمپورت می‌کند. از پارسر استریمی XMLReader برای بهینگی حافظه استفاده می‌کند. رشته‌های "NULL" سیستم منابع انسانی را مدیریت می‌کند. ارجاعات FK نامعتبر را null می‌کند. از حالت‌های ایمپورت، انتخاب سطح فیلد، پردازش chunkById و حل parent_id دو مرحله‌ای پشتیبانی می‌کند. **پیاده‌سازی و تست شده.**

### Requirement: Family, illness, and infraction management / الزام: مدیریت خانواده، بیماری و تخلف

Full CRUD operations for family members, illness records, and infraction records per employee. **IMPLEMENTED.**

عملیات CRUD کامل برای اعضای خانواده، سوابق بیماری و سوابق تخلف هر پرسنل. **پیاده‌سازی شده.**

### Requirement: HR sync from Bank Melli server / الزام: همگام‌سازی پرسنلی از سرور بانک ملی

The system will sync employee data from Bank Melli HR server at `172.29.21.6` database `personal`, views `V_sadad_personal` and `V_sadad_family`. **NOT YET IMPLEMENTED.**

سیستم داده‌های پرسنل را از سرور منابع انسانی بانک ملی همگام‌سازی خواهد کرد. **هنوز پیاده‌سازی نشده.**

### Requirement: Employee autocomplete search / الزام: جستجوی تکمیل خودکار پرسنل

The system provides fast search for employee lookup (used in prescription and invoice forms). **IMPLEMENTED.**

سیستم جستجوی سریع برای یافتن پرسنل ارائه می‌دهد. **پیاده‌سازی شده.**
