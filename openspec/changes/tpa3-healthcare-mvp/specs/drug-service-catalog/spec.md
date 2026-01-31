## Status / وضعیت: Partially Implemented / تا حدی پیاده‌سازی شده

## Summary / خلاصه

Management of the drug and medical service catalog with Item, ItemPrice, DrugInteraction, and Illness models. List and form pages are implemented; drug interaction checking and ICD-10 data remain.

مدیریت کاتالوگ داروها و خدمات درمانی با مدل‌های Item، ItemPrice، DrugInteraction و Illness. صفحات لیست و فرم پیاده‌سازی شده، بررسی تداخل دارویی و داده‌های ICD-10 باقی‌مانده.

## Tech Stack / پشته فناوری

- **Backend:** Laravel 12, PHP 8.3, Eloquent ORM, Sanctum
- **Frontend:** React 18, TypeScript, Tailwind CSS 4, TanStack Query v5
- **Database:** PostgreSQL 16

## Backend / بک‌اند

### Implemented / پیاده‌سازی شده

- `app/Models/Item.php` - Item model (drugs + services unified) with item_type field (1=drug, 2=service), Eloquent relationships (prices, interactions, category, subcategory, group)
- `app/Models/ItemPrice.php` - Item price model with effective_date for historical pricing
- `app/Models/DrugInteraction.php` - Drug interaction model with severity levels (1=mild, 2=moderate, 3=severe)
- `app/Models/Illness.php` - ICD diagnosis code model with Persian translations
- `app/Http/Controllers/ItemController.php` - CRUD: index (paginated, filterable by type/category/group), show (with current price), store, update, search, price history
- `app/Http/Controllers/DiagnosisController.php` - Index, show, search endpoints for ICD diagnosis codes
- `app/Services/ItemService.php` - Business logic for item operations, price lookup by effective date
- `database/migrations/` - items, item_prices, drug_interactions, illnesses tables, plus category/subcategory/group tables
- `routes/api.php` - Item and diagnosis routes registered

### Remaining / باقی‌مانده

- Drug interaction check during invoice item creation (query drug_interactions table when adding items to invoice, warn on severity >= 2)
- ICD-10 seed data (bulk seeder for illnesses table with standard ICD-10 codes and Persian translations)
- Item dosage limit enforcement (max daily/monthly dosage check during prescription processing)
- Tariff coefficient calculation for medical services (base_rvu * k_factor * current_tariff_coefficient)
- Item categorization hierarchy endpoints (categories with item counts)

بررسی تداخل دارویی هنگام افزودن آیتم به فاکتور (جستجو در جدول drug_interactions و هشدار در صورت شدت >= ۲)، داده‌های اولیه ICD-10 (سیدر انبوه برای جدول illnesses با کدهای استاندارد ICD-10 و ترجمه‌های فارسی)، اعمال محدودیت دوز دارو (بررسی حداکثر دوز روزانه/ماهانه هنگام پردازش نسخه)، محاسبه ضریب تعرفه برای خدمات درمانی (base_rvu * k_factor * current_tariff_coefficient)، و endpointهای سلسله‌مراتب دسته‌بندی آیتم‌ها (دسته‌ها با تعداد آیتم).

## Frontend / فرانت‌اند

### Implemented / پیاده‌سازی شده

- `src/pages/items/ItemListPage.tsx` - Items list with filters (type: drug/service, category, subcategory, group), search, pagination
- `src/pages/items/ItemFormPage.tsx` - Create/edit item form with all fields (IRC code, generic code, title FA/EN, category, unit, dosage, etc.)
- `src/pages/items/ItemPricePage.tsx` - Item price history management (add new prices with effective dates, view price timeline)
- `src/pages/diagnoses/DiagnosisListPage.tsx` - ICD diagnosis codes list with search by code or Persian title
- `src/services/itemApi.ts` - API client with TanStack Query hooks (useItems, useItem, useCreateItem, useUpdateItem, useItemPrices)
- `src/services/diagnosisApi.ts` - API client with TanStack Query hooks

### Remaining / باقی‌مانده

- Drug interaction management UI (CRUD for drug-drug interactions)
- Drug interaction warning display during invoice item entry
- Item autocomplete component for use in invoice/prescription forms
- Category hierarchy browser (tree view of category > subcategory > group)

رابط کاربری مدیریت تداخل دارویی (CRUD برای تداخل دارو-دارو)، نمایش هشدار تداخل دارویی هنگام ورود آیتم فاکتور، کامپوننت تکمیل خودکار آیتم برای استفاده در فرم‌های فاکتور/نسخه، و مرورگر سلسله‌مراتب دسته‌بندی (نمای درختی دسته > زیردسته > گروه).

## Database Tables / جداول پایگاه‌داده

- `items` - id, item_type (1=drug, 2=service), irc_code, generic_code, title_fa, title_en, category_id, subcategory_id, group_id, unit, default_dosage, max_daily_dosage, max_monthly_dosage, rvu_code (services), k_factor (services), is_active, timestamps
- `item_prices` - id, item_id, price, effective_date, created_by, timestamps
- `drug_interactions` - id, drug_a_id, drug_b_id, severity (1/2/3), description, timestamps
- `illnesses` - id, icd_code, title_fa, title_en, category, is_active, timestamps
- `item_categories` - id, code, title, is_active
- `item_subcategories` - id, category_id, code, title, is_active
- `item_groups` - id, subcategory_id, code, title, is_active

## API Endpoints / نقاط پایانی API

| Method | Endpoint | Status / وضعیت |
|--------|----------|--------|
| GET | `/api/v1/items` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/items` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/items/:id` | Implemented / پیاده‌سازی شده |
| PUT | `/api/v1/items/:id` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/items/search` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/items/:id/prices` | Implemented / پیاده‌سازی شده |
| POST | `/api/v1/items/:id/prices` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/diagnoses` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/diagnoses/:id` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/diagnoses/search` | Implemented / پیاده‌سازی شده |
| GET | `/api/v1/items/categories` | Not Started / شروع نشده |
| POST | `/api/v1/items/interactions/check` | Not Started / شروع نشده |

## Requirements (Original Spec) / الزامات (مشخصات اصلی)

### Requirement: Drug and service catalog management / الزام: مدیریت کاتالوگ دارو و خدمات

The system maintains a unified catalog of drugs (item_type=1) and medical services (item_type=2). IMPLEMENTED.

سیستم یک کاتالوگ یکپارچه از داروها (item_type=1) و خدمات درمانی (item_type=2) نگهداری می‌کند. پیاده‌سازی شده.

### Requirement: Item price history / الزام: تاریخچه قیمت آیتم

The system tracks price changes over time in `item_prices` table. Price lookups return the price effective on the invoice date. IMPLEMENTED.

سیستم تغییرات قیمت را در طول زمان در جدول `item_prices` ردیابی می‌کند. جستجوی قیمت، قیمت موثر در تاریخ فاکتور را برمی‌گرداند. پیاده‌سازی شده.

### Requirement: Drug interaction checking / الزام: بررسی تداخل دارویی

The system maintains drug-drug interaction records with severity levels. The system must check interactions when adding items to an invoice. PARTIALLY IMPLEMENTED (model exists, runtime check during invoicing pending).

سیستم رکوردهای تداخل دارو-دارو با سطوح شدت نگهداری می‌کند. سیستم باید تداخل‌ها را هنگام افزودن آیتم به فاکتور بررسی کند. تا حدی پیاده‌سازی شده (مدل موجود است، بررسی زمان اجرا هنگام صدور فاکتور در انتظار).

### Requirement: ICD diagnosis codes / الزام: کدهای تشخیصی ICD

The system maintains a catalog of ICD-10 diagnosis codes with Persian translations. PARTIALLY IMPLEMENTED (model and endpoints exist, seed data pending).

سیستم یک کاتالوگ از کدهای تشخیصی ICD-10 با ترجمه‌های فارسی نگهداری می‌کند. تا حدی پیاده‌سازی شده (مدل و endpointها موجود هستند، داده‌های اولیه در انتظار).
