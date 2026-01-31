## 1. Project Scaffolding & Infrastructure / زیرساخت و راه‌اندازی پروژه

- [x] 1.1 Initialize Laravel 12 project with PHP 8.3, add dependencies: sanctum, morilog/jalali, ruler/ruler / راه‌اندازی پروژه Laravel 12 با PHP 8.3 و افزودن وابستگی‌ها: sanctum، morilog/jalali، ruler/ruler
- [x] 1.2 Create directory structure: `backend/app/{Http/Controllers/Api/V1, Models, Services, Enums, Traits, Rules}` / ایجاد ساختار پوشه‌ها: `backend/app/{Http/Controllers/Api/V1, Models, Services, Enums, Traits, Rules}`
- [x] 1.3 Configure `.env` - APP_TIMEZONE=Asia/Tehran, APP_LOCALE=fa, DB_CONNECTION=pgsql / پیکربندی `.env` - منطقه زمانی تهران، زبان فارسی، اتصال PostgreSQL
- [x] 1.4 Configure Eloquent PostgreSQL connection with pool settings / پیکربندی اتصال Eloquent به PostgreSQL با تنظیمات pool
- [x] 1.5 Configure Redis connection / پیکربندی اتصال Redis
- [x] 1.6 Create `ApiResponse` trait for standardized JSON responses / ایجاد trait `ApiResponse` برای پاسخ‌های JSON استاندارد
- [x] 1.7 Create `backend/docker-compose.yml` with php:8.3-fpm-apache (port 8088), postgres:16-alpine (port 15432), redis:7-alpine (port 16379) / ایجاد `backend/docker-compose.yml` با php:8.3-fpm-apache (پورت 8088)، postgres:16-alpine (پورت 15432)، redis:7-alpine (پورت 16379)
- [x] 1.8 Create `docker-compose.dev.yml` with app (port 8000), postgres (port 5434), redis (port 6380) / ایجاد `docker-compose.dev.yml` با app (پورت 8000)، postgres (پورت 5434)، redis (پورت 6380)
- [x] 1.9 Initialize frontend: `npm create vite@latest frontend -- --template react-ts`, add react-router, axios, zustand, tanstack-query, react-hook-form, zod, recharts, tailwindcss 4 / راه‌اندازی فرانت‌اند با Vite و React-TS و افزودن کتابخانه‌ها: react-router، axios، zustand، tanstack-query، react-hook-form، zod، recharts، tailwindcss 4
- [x] 1.10 Configure frontend: `vite.config.ts` with path alias @, Tailwind CSS 4 RTL setup / پیکربندی فرانت‌اند: `vite.config.ts` با alias مسیر @ و تنظیم RTL در Tailwind CSS 4
- [x] 1.11 Create `frontend/src/components/layout/AppLayout.tsx` with RTL Persian sidebar + header + breadcrumb / ایجاد `AppLayout.tsx` با سایدبار فارسی RTL + هدر + مسیرنما
- [x] 1.12 Create `frontend/src/api/client.ts` with Axios instance, Bearer token interceptor, 401 redirect / ایجاد `client.ts` با نمونه Axios، interceptor توکن Bearer، ریدایرکت 401
- [x] 1.13 Create `frontend/src/store/authStore.ts` (Zustand) and `uiStore.ts` for sidebar state / ایجاد `authStore.ts` (Zustand) و `uiStore.ts` برای وضعیت سایدبار
- [x] 1.14 Create `frontend/src/index.css` with Tailwind, Vazirmatn font, RTL base styles / ایجاد `index.css` با Tailwind، فونت وزیرمتن، استایل‌های پایه RTL

## 2. Database Migrations (35 Laravel migrations) / مایگریشن‌های دیتابیس (۳۵ مایگریشن لاراول)

- [x] 2.1 Migration: `create_users_table` (Laravel default) / مایگریشن: `create_users_table` (پیش‌فرض لاراول)
- [x] 2.2 Migration: `create_cache_table` + `create_jobs_table` (Laravel defaults) / مایگریشن: `create_cache_table` + `create_jobs_table` (پیش‌فرض‌های لاراول)
- [x] 2.3 Migration: `create_custom_employee_codes_table` (id, code, title, is_active) / مایگریشن: جدول کدهای سفارشی کارمندان
- [x] 2.4 Migration: `create_special_employee_types_table` (id, code, title, is_active) / مایگریشن: جدول انواع خاص کارمندان
- [x] 2.5 Migration: `create_relation_types_table` (id, code, title) / مایگریشن: جدول انواع نسبت
- [x] 2.6 Migration: `create_guardianship_types_table` (id, code, title) / مایگریشن: جدول انواع قیمومت
- [x] 2.7 Migration: `create_locations_table` (id, code, title, parent_id, type) / مایگریشن: جدول مکان‌ها
- [x] 2.8 Migration: `create_provinces_table` (id, code, title) / مایگریشن: جدول استان‌ها
- [x] 2.9 Migration: `create_roles_and_permissions_tables` + seed admin user / مایگریشن: جدول نقش‌ها و مجوزها + ایجاد کاربر ادمین
- [x] 2.10 Migration: `update_users_table` with role_id, is_active / مایگریشن: به‌روزرسانی جدول کاربران با role_id و is_active
- [x] 2.11 Migration: `create_employees_table` with all columns, indexes on personnel_code, national_code, parent_id / مایگریشن: جدول کارمندان با تمام ستون‌ها و ایندکس‌ها
- [x] 2.12 Migration: `create_employee_import_tables` (import_temp + import_history) / مایگریشن: جداول ورود اطلاعات کارمندان (موقت + تاریخچه)
- [x] 2.13 Migration: `create_insurances_table` + `insurance_histories` / مایگریشن: جدول بیمه‌ها + تاریخچه بیمه
- [x] 2.14 Migration: `create_insurance_rules_table` / مایگریشن: جدول قوانین بیمه
- [x] 2.15 Migration: `create_item_categories_tables` (categories + sub_categories + groups) / مایگریشن: جداول دسته‌بندی آیتم‌ها (دسته + زیردسته + گروه)
- [x] 2.16 Migration: `create_items_and_prices_tables` (items + item_prices) / مایگریشن: جداول آیتم‌ها و قیمت‌ها
- [x] 2.17 Migration: `create_drug_interactions_table` / مایگریشن: جدول تداخلات دارویی
- [x] 2.18 Migration: `create_illnesses_table` (ICD-10) / مایگریشن: جدول بیماری‌ها (ICD-10)
- [x] 2.19 Migration: `create_employee_illnesses_tables` (illnesses + infractions) / مایگریشن: جداول بیماری‌ها و تخلفات کارمندان
- [x] 2.20 Migration: `create_item_price_conditions_table` with all pricing rule columns / مایگریشن: جدول شرایط قیمت‌گذاری با تمام ستون‌های قوانین
- [x] 2.21 Migration: `create_item_price_condition_filters_table` (unified adv2) / مایگریشن: جدول فیلترهای شرایط قیمت‌گذاری (adv2 یکپارچه)
- [x] 2.22 Migration: `create_item_price_condition_restrictions_table` / مایگریشن: جدول محدودیت‌های شرایط قیمت‌گذاری
- [x] 2.23 Migration: `create_condition_groups_tables` (groups + group_items) / مایگریشن: جداول گروه‌های شرایط (گروه‌ها + آیتم‌های گروه)
- [x] 2.24 Migration: `create_discount_tables` (employee_special, cec_item, set_item) / مایگریشن: جداول تخفیف (ویژه کارمند، CEC، SET)
- [x] 2.25 Migration: `create_body_parts_tables` (body_parts + body_part_types) / مایگریشن: جداول اعضای بدن (اعضا + انواع)
- [x] 2.26 Migration: `create_centers_and_doctors_tables` (centers + doctors + institution_contracts + types) / مایگریشن: جداول مراکز و پزشکان (مراکز + پزشکان + قراردادها + انواع)
- [x] 2.27 Migration: `create_prescription_and_document_types_tables` / مایگریشن: جداول انواع نسخه و مدارک
- [x] 2.28 Migration: `create_prescriptions_table` / مایگریشن: جدول نسخه‌ها
- [x] 2.29 Migration: `create_invoices_tables` (invoices + invoice_items) / مایگریشن: جداول صورتحساب‌ها (صورتحساب + اقلام)
- [x] 2.30 Migration: `create_claims_tables` (claims + claim_notes + claim_attachments) / مایگریشن: جداول پرونده‌ها (پرونده + یادداشت‌ها + پیوست‌ها)
- [x] 2.31 Migration: `create_invoice_aggregations_and_contracts_tables` / مایگریشن: جداول تجمیع صورتحساب‌ها و قراردادها
- [x] 2.32 Migration: `create_commission_tables` (commission_cases + case_types + verdict_templates + social_work_cases) / مایگریشن: جداول کمیسیون (پرونده‌ها + انواع + الگوهای رأی + مددکاری)
- [x] 2.33 Migration: `create_audit_logs_table` (JSONB old_data/new_data) / مایگریشن: جدول لاگ‌های ممیزی (JSONB داده قبلی/جدید)
- [x] 2.34 Migration: `create_personal_access_tokens_table` (Sanctum) / مایگریشن: جدول توکن‌های دسترسی شخصی (Sanctum)

## 3. Eloquent Models (53 models) / مدل‌های Eloquent (۵۳ مدل)

- [x] 3.1 Create User.php, Role.php, Permission.php with relations / ایجاد User.php، Role.php، Permission.php با روابط
- [x] 3.2 Create Employee.php with self-referencing parent_id, all fillable, casts, relations / ایجاد Employee.php با parent_id خودارجاعی، تمام fillable، cast و روابط
- [x] 3.3 Create EmployeeImportTemp.php, EmployeeImportHistory.php / ایجاد مدل‌های ورود موقت و تاریخچه ورود کارمندان
- [x] 3.4 Create EmployeeIllness.php, EmployeeInfraction.php / ایجاد مدل‌های بیماری و تخلف کارمندان
- [x] 3.5 Create Insurance.php, InsuranceHistory.php, InsuranceRule.php / ایجاد مدل‌های بیمه، تاریخچه بیمه، قوانین بیمه
- [x] 3.6 Create Item.php, ItemPrice.php, ItemCategory.php, ItemSubCategory.php, ItemGroup.php / ایجاد مدل‌های آیتم، قیمت، دسته‌بندی، زیردسته و گروه
- [x] 3.7 Create DrugInteraction.php, Illness.php / ایجاد مدل‌های تداخل دارویی و بیماری
- [x] 3.8 Create ItemPriceCondition.php, ItemPriceConditionFilter.php, ItemPriceConditionRestriction.php / ایجاد مدل‌های شرایط قیمت‌گذاری، فیلتر و محدودیت
- [x] 3.9 Create ConditionGroup.php, ConditionGroupItem.php / ایجاد مدل‌های گروه شرایط و آیتم‌های گروه
- [x] 3.10 Create EmployeeSpecialDiscount.php, CecItemDiscount.php, SetItemDiscount.php / ایجاد مدل‌های تخفیف ویژه کارمند، تخفیف CEC و تخفیف SET
- [x] 3.11 Create Prescription.php, PrescriptionType.php, DocumentType.php / ایجاد مدل‌های نسخه، نوع نسخه، نوع مدرک
- [x] 3.12 Create Invoice.php, InvoiceItem.php / ایجاد مدل‌های صورتحساب و اقلام صورتحساب
- [x] 3.13 Create Claim.php, ClaimNote.php, ClaimAttachment.php / ایجاد مدل‌های پرونده، یادداشت و پیوست
- [x] 3.14 Create Center.php, Doctor.php, InstitutionContract.php, InstitutionContractType.php / ایجاد مدل‌های مرکز، پزشک، قرارداد مؤسسه و نوع قرارداد
- [x] 3.15 Create InvoiceAggregation.php, Contract.php / ایجاد مدل‌های تجمیع صورتحساب و قرارداد
- [x] 3.16 Create CommissionCase.php, CommissionCaseType.php, VerdictTemplate.php, SocialWorkCase.php / ایجاد مدل‌های پرونده کمیسیون، نوع پرونده، الگوی رأی و مددکاری
- [x] 3.17 Create AuditLog.php / ایجاد مدل لاگ ممیزی
- [x] 3.18 Create BodyPart.php, BodyPartType.php / ایجاد مدل‌های عضو بدن و نوع عضو
- [x] 3.19 Create Location.php, Province.php, RelationType.php, GuardianshipType.php, CustomEmployeeCode.php, SpecialEmployeeType.php / ایجاد مدل‌های مکان، استان، نوع نسبت، نوع قیمومت، کد سفارشی کارمند، نوع خاص کارمند

## 4. PHP Enums / انوم‌های PHP

- [x] 4.1 Create Gender.php enum / ایجاد انوم جنسیت
- [x] 4.2 Create ClaimStatus.php enum (6 statuses) / ایجاد انوم وضعیت پرونده (۶ وضعیت)
- [x] 4.3 Create ClaimType.php enum / ایجاد انوم نوع پرونده
- [x] 4.4 Create RelationType.php enum / ایجاد انوم نوع نسبت
- [x] 4.5 Create EmployeeStatus.php enum / ایجاد انوم وضعیت کارمند
- [x] 4.6 Create InsuranceStatus.php enum / ایجاد انوم وضعیت بیمه
- [x] 4.7 Create PrescriptionType.php enum / ایجاد انوم نوع نسخه
- [x] 4.8 Create InvoiceStatus.php enum / ایجاد انوم وضعیت صورتحساب

## 5. Backend Services (25 services) / سرویس‌های بک‌اند (۲۵ سرویس)

- [x] 5.1 Create AuthService.php - login, logout, refresh, changePassword / ایجاد سرویس احراز هویت - ورود، خروج، تمدید، تغییر رمز
- [x] 5.2 Create EmployeeService.php - CRUD, search, family, bulk delete / ایجاد سرویس کارمندان - عملیات CRUD، جستجو، خانواده، حذف گروهی
- [x] 5.3 Create EmployeeImportService.php - CSV upload, parse, validate, import / ایجاد سرویس ورود اطلاعات کارمندان - آپلود CSV، تجزیه، اعتبارسنجی، ورود
- [x] 5.4 Create InsuranceService.php - CRUD, inquiry, ceiling check / ایجاد سرویس بیمه - عملیات CRUD، استعلام، بررسی سقف
- [x] 5.5 Create ContractService.php - CRUD / ایجاد سرویس قرارداد - عملیات CRUD
- [x] 5.6 Create ItemService.php - CRUD, search, prices, interactions / ایجاد سرویس آیتم - عملیات CRUD، جستجو، قیمت‌ها، تداخلات
- [x] 5.7 Create DiagnosisService.php - ICD search / ایجاد سرویس تشخیص - جستجوی ICD
- [x] 5.8 Create PrescriptionService.php - CRUD / ایجاد سرویس نسخه - عملیات CRUD
- [x] 5.9 Create InvoiceService.php - CRUD, calculate, submit / ایجاد سرویس صورتحساب - عملیات CRUD، محاسبه، ثبت
- [x] 5.10 Create ReportService.php - dashboard stats, claims report, financial report / ایجاد سرویس گزارش - آمار داشبورد، گزارش پرونده‌ها، گزارش مالی
- [x] 5.11 Create LookupService.php - all 13 lookup endpoints / ایجاد سرویس جستجوی مقادیر - تمام ۱۳ نقطه دسترسی lookup
- [x] 5.12 Create UserService.php - CRUD, toggle active / ایجاد سرویس کاربران - عملیات CRUD، تغییر وضعیت فعال
- [x] 5.13 Create CenterService.php - CRUD, doctors, contracts / ایجاد سرویس مراکز - عملیات CRUD، پزشکان، قراردادها
- [x] 5.14 Create SettlementService.php - aggregate, approve, pay / ایجاد سرویس تسویه - تجمیع، تأیید، پرداخت
- [x] 5.15 Create CommissionService.php - cases CRUD, verdict, social work / ایجاد سرویس کمیسیون - عملیات CRUD پرونده‌ها، رأی، مددکاری
- [x] 5.16 Create Pricing/PricingService.php - orchestrator / ایجاد سرویس قیمت‌گذاری - ارکستراتور اصلی
- [x] 5.17 Create Pricing/ConditionMatcher.php - match conditions by employee attributes / ایجاد تطبیق‌دهنده شرایط - تطبیق شرایط بر اساس ویژگی‌های کارمند
- [x] 5.18 Create Pricing/UsageCounter.php - count usage in period / ایجاد شمارنده استفاده - شمارش استفاده در دوره
- [x] 5.19 Create Pricing/DiscountCalculator.php - 4 discount types / ایجاد محاسبه‌گر تخفیف - ۴ نوع تخفیف
- [x] 5.20 Create Pricing/GroupChecker.php - cross-item group limits / ایجاد بررسی‌کننده گروه - محدودیت‌های بین‌آیتمی گروه
- [x] 5.21 Create Pricing/ConflictChecker.php - pricing conflicts / ایجاد بررسی‌کننده تعارض - تعارضات قیمت‌گذاری
- [x] 5.22 Create Pricing/RuleEngineAdapter.php - ruler/ruler wrapper / ایجاد آداپتور موتور قوانین - پوشش‌دهنده ruler/ruler
- [x] 5.23 Create Claim/ClaimService.php / ایجاد سرویس پرونده
- [x] 5.24 Create Claim/ClaimStateMachine.php - state transitions / ایجاد ماشین حالت پرونده - انتقال وضعیت‌ها
- [x] 5.25 Create Claim/DeductionService.php - deduction calculations / ایجاد سرویس کسورات - محاسبات کسورات

## 6. API Controllers & Routes (15 controllers, 90 endpoints) / کنترلرها و مسیرهای API (۱۵ کنترلر، ۹۰ نقطه دسترسی)

- [x] 6.1 Create AuthController.php - login, logout, refresh, me, changePassword / ایجاد کنترلر احراز هویت - ورود، خروج، تمدید، پروفایل، تغییر رمز
- [x] 6.2 Create EmployeeController.php - CRUD + import, sync, family, insurance / ایجاد کنترلر کارمندان - عملیات CRUD + ورود، همگام‌سازی، خانواده، بیمه
- [x] 6.3 Create InsuranceController.php - CRUD + inquiry, check-ceiling / ایجاد کنترلر بیمه - عملیات CRUD + استعلام، بررسی سقف
- [x] 6.4 Create ContractController.php - CRUD / ایجاد کنترلر قرارداد - عملیات CRUD
- [x] 6.5 Create ItemController.php - CRUD + prices, interactions / ایجاد کنترلر آیتم - عملیات CRUD + قیمت‌ها، تداخلات
- [x] 6.6 Create DiagnosisController.php - list, search, show / ایجاد کنترلر تشخیص - لیست، جستجو، نمایش
- [x] 6.7 Create PrescriptionController.php - CRUD / ایجاد کنترلر نسخه - عملیات CRUD
- [x] 6.8 Create InvoiceController.php - CRUD + calculate, submit / ایجاد کنترلر صورتحساب - عملیات CRUD + محاسبه، ثبت
- [x] 6.9 Create ClaimController.php - CRUD + transition, notes, attachments, next-statuses / ایجاد کنترلر پرونده - عملیات CRUD + انتقال، یادداشت‌ها، پیوست‌ها، وضعیت‌های بعدی
- [x] 6.10 Create CenterController.php - CRUD + doctors, contracts / ایجاد کنترلر مرکز - عملیات CRUD + پزشکان، قراردادها
- [x] 6.11 Create SettlementController.php - list, show, aggregate, approve, pay / ایجاد کنترلر تسویه - لیست، نمایش، تجمیع، تأیید، پرداخت
- [x] 6.12 Create CommissionController.php - cases CRUD + verdict, social work CRUD + resolve / ایجاد کنترلر کمیسیون - عملیات CRUD پرونده‌ها + رأی، مددکاری + حل‌وفصل
- [x] 6.13 Create ReportController.php - dashboard, claims, financial / ایجاد کنترلر گزارش - داشبورد، پرونده‌ها، مالی
- [x] 6.14 Create LookupController.php - 13 lookup endpoints / ایجاد کنترلر جستجوی مقادیر - ۱۳ نقطه دسترسی
- [x] 6.15 Create UserController.php - CRUD + toggle-active / ایجاد کنترلر کاربران - عملیات CRUD + تغییر وضعیت فعال
- [x] 6.16 Create routes/api.php with all route groups and Sanctum middleware / ایجاد routes/api.php با تمام گروه‌های مسیر و میان‌افزار Sanctum
- [x] 6.17 Create NationalCode.php validation rule / ایجاد قاعده اعتبارسنجی کد ملی

## 7. Frontend - UI Components (13 reusable) / فرانت‌اند - کامپوننت‌های رابط کاربری (۱۳ کامپوننت قابل استفاده مجدد)

- [x] 7.1 Create DataTable.tsx - sortable, filterable grid with striped rows / ایجاد جدول داده - شبکه مرتب‌شونده و قابل فیلتر با ردیف‌های راه‌راه
- [x] 7.2 Create Pagination.tsx - Persian page numbers / ایجاد صفحه‌بندی - شماره صفحات فارسی
- [x] 7.3 Create Modal.tsx - dialog overlay / ایجاد مودال - پوشش دیالوگ
- [x] 7.4 Create FormField.tsx - label + input wrapper / ایجاد فیلد فرم - پوشش‌دهنده برچسب + ورودی
- [x] 7.5 Create SelectField.tsx - dropdown / ایجاد فیلد انتخابی - منوی کشویی
- [x] 7.6 Create SearchInput.tsx - debounced search / ایجاد ورودی جستجو - جستجوی با تأخیر
- [x] 7.7 Create StatusBadge.tsx - color-coded status pills / ایجاد نشان وضعیت - برچسب‌های رنگی وضعیت
- [x] 7.8 Create DatePicker.tsx - Jalali date picker / ایجاد انتخابگر تاریخ - تقویم جلالی
- [x] 7.9 Create FileUpload.tsx - file upload / ایجاد آپلود فایل
- [x] 7.10 Create ConfirmDialog.tsx - delete confirmation / ایجاد دیالوگ تأیید - تأیید حذف
- [x] 7.11 Create LoadingSpinner.tsx / ایجاد اسپینر بارگذاری
- [x] 7.12 Create EmptyState.tsx / ایجاد حالت خالی
- [x] 7.13 Create Button.tsx - primary/secondary/danger variants / ایجاد دکمه - انواع اصلی/ثانویه/خطر

## 8. Frontend - Layout & Shared Components / فرانت‌اند - چیدمان و کامپوننت‌های مشترک

- [x] 8.1 Create AppLayout.tsx - RTL sidebar + header + content area / ایجاد چیدمان اصلی - سایدبار RTL + هدر + ناحیه محتوا
- [x] 8.2 Create Sidebar.tsx - navigation menu with icons and submenu / ایجاد سایدبار - منوی ناوبری با آیکون و زیرمنو
- [x] 8.3 Create Header.tsx - logo, user info, logout / ایجاد هدر - لوگو، اطلاعات کاربر، خروج
- [x] 8.4 Create Breadcrumb.tsx - route-based breadcrumbs / ایجاد مسیرنما - مسیرنمای مبتنی بر route
- [x] 8.5 Create ProtectedRoute.tsx - auth guard / ایجاد مسیر محافظت‌شده - نگهبان احراز هویت
- [x] 8.6 Create ErrorBoundary.tsx - runtime error handler / ایجاد مرزبان خطا - مدیریت خطاهای زمان اجرا

## 9. Frontend - API Modules (19 modules) / فرانت‌اند - ماژول‌های API (۱۹ ماژول)

- [x] 9.1 Create client.ts - Axios instance + token interceptor + 401 handler / ایجاد کلاینت - نمونه Axios + interceptor توکن + مدیریت 401
- [x] 9.2 Create auth.ts - login, logout, me, refresh, changePassword / ایجاد ماژول احراز هویت - ورود، خروج، پروفایل، تمدید، تغییر رمز
- [x] 9.3 Create employees.ts - CRUD + family / ایجاد ماژول کارمندان - عملیات CRUD + خانواده
- [x] 9.4 Create employeeImport.ts - import/export / ایجاد ماژول ورود اطلاعات کارمندان - ورود/خروج داده
- [x] 9.5 Create insurances.ts - CRUD + inquiry / ایجاد ماژول بیمه - عملیات CRUD + استعلام
- [x] 9.6 Create contracts.ts - CRUD / ایجاد ماژول قرارداد - عملیات CRUD
- [x] 9.7 Create items.ts - CRUD + prices / ایجاد ماژول آیتم - عملیات CRUD + قیمت‌ها
- [x] 9.8 Create diagnoses.ts - search / ایجاد ماژول تشخیص - جستجو
- [x] 9.9 Create prescriptions.ts - CRUD / ایجاد ماژول نسخه - عملیات CRUD
- [x] 9.10 Create invoices.ts - CRUD + calculate / ایجاد ماژول صورتحساب - عملیات CRUD + محاسبه
- [x] 9.11 Create claims.ts - CRUD + workflow / ایجاد ماژول پرونده - عملیات CRUD + گردش کار
- [x] 9.12 Create centers.ts - CRUD + doctors + contracts / ایجاد ماژول مراکز - عملیات CRUD + پزشکان + قراردادها
- [x] 9.13 Create settlements.ts - operations / ایجاد ماژول تسویه - عملیات‌ها
- [x] 9.14 Create commission.ts - cases + social work / ایجاد ماژول کمیسیون - پرونده‌ها + مددکاری
- [x] 9.15 Create reports.ts - dashboard, claims, financial / ایجاد ماژول گزارش - داشبورد، پرونده‌ها، مالی
- [x] 9.16 Create lookups.ts - 13 API + 6 static lookups / ایجاد ماژول جستجوی مقادیر - ۱۳ API + ۶ مقدار ثابت
- [x] 9.17 Create users.ts - CRUD / ایجاد ماژول کاربران - عملیات CRUD
- [x] 9.18 Create roles.ts - CRUD / ایجاد ماژول نقش‌ها - عملیات CRUD
- [x] 9.19 Create audit.ts - list / ایجاد ماژول ممیزی - لیست

## 10. Frontend - Hooks & Store / فرانت‌اند - هوک‌ها و استور

- [x] 10.1 Create useAuth.ts hook / ایجاد هوک احراز هویت
- [x] 10.2 Create useLookups.ts - 22 hooks (13 API + 6 static + 3 utility) / ایجاد هوک جستجوی مقادیر - ۲۲ هوک (۱۳ API + ۶ ثابت + ۳ ابزاری)
- [x] 10.3 Create useDebounce.ts hook / ایجاد هوک تأخیر
- [x] 10.4 Create authStore.ts (Zustand) - token, user, login/logout / ایجاد استور احراز هویت (Zustand) - توکن، کاربر، ورود/خروج
- [x] 10.5 Create uiStore.ts (Zustand) - sidebar collapse / ایجاد استور رابط کاربری (Zustand) - جمع‌شدن سایدبار

## 11. Frontend - Pages (41 pages) / فرانت‌اند - صفحات (۴۱ صفحه)

- [x] 11.1 Create LoginPage.tsx / ایجاد صفحه ورود
- [x] 11.2 Create DashboardPage.tsx - stats cards, charts (Recharts) / ایجاد صفحه داشبورد - کارت‌های آماری، نمودارها (Recharts)
- [x] 11.3 Create EmployeeListPage.tsx - DataTable with search, filters, bulk delete / ایجاد صفحه لیست کارمندان - جدول داده با جستجو، فیلتر، حذف گروهی
- [x] 11.4 Create EmployeeCreatePage.tsx / ایجاد صفحه ایجاد کارمند
- [x] 11.5 Create EmployeeEditPage.tsx / ایجاد صفحه ویرایش کارمند
- [x] 11.6 Create EmployeeViewPage.tsx / ایجاد صفحه مشاهده کارمند
- [x] 11.7 Create EmployeeFamilyPage.tsx / ایجاد صفحه خانواده کارمند
- [x] 11.8 Create EmployeeImportPage.tsx - Excel import / ایجاد صفحه ورود اطلاعات کارمندان - ورود از اکسل
- [x] 11.9 Create InsuranceListPage.tsx / ایجاد صفحه لیست بیمه‌ها
- [x] 11.10 Create InsuranceFormPage.tsx (create/edit) / ایجاد صفحه فرم بیمه (ایجاد/ویرایش)
- [x] 11.11 Create InsuranceInquiryPage.tsx / ایجاد صفحه استعلام بیمه
- [x] 11.12 Create ContractListPage.tsx / ایجاد صفحه لیست قراردادها
- [x] 11.13 Create ContractFormPage.tsx / ایجاد صفحه فرم قرارداد
- [x] 11.14 Create ItemListPage.tsx - drug/service catalog / ایجاد صفحه لیست آیتم‌ها - کاتالوگ دارو/خدمات
- [x] 11.15 Create ItemFormPage.tsx / ایجاد صفحه فرم آیتم
- [x] 11.16 Create ItemPricePage.tsx - price management / ایجاد صفحه قیمت آیتم - مدیریت قیمت
- [x] 11.17 Create DiagnosisListPage.tsx - ICD search (read-only) / ایجاد صفحه لیست تشخیص‌ها - جستجوی ICD (فقط خواندنی)
- [x] 11.18 Create PrescriptionListPage.tsx / ایجاد صفحه لیست نسخه‌ها
- [x] 11.19 Create PrescriptionFormPage.tsx / ایجاد صفحه فرم نسخه
- [x] 11.20 Create InvoiceListPage.tsx / ایجاد صفحه لیست صورتحساب‌ها
- [x] 11.21 Create InvoiceFormPage.tsx / ایجاد صفحه فرم صورتحساب
- [x] 11.22 Create InvoiceViewPage.tsx - price breakdown / ایجاد صفحه مشاهده صورتحساب - جزئیات قیمت
- [x] 11.23 Create ClaimListPage.tsx - status tabs, filters / ایجاد صفحه لیست پرونده‌ها - تب‌های وضعیت، فیلترها
- [x] 11.24 Create ClaimFormPage.tsx / ایجاد صفحه فرم پرونده
- [x] 11.25 Create ClaimViewPage.tsx - examiner actions, notes, attachments / ایجاد صفحه مشاهده پرونده - اقدامات کارشناس، یادداشت‌ها، پیوست‌ها
- [x] 11.26 Create CenterListPage.tsx / ایجاد صفحه لیست مراکز
- [x] 11.27 Create CenterFormPage.tsx / ایجاد صفحه فرم مرکز
- [x] 11.28 Create CenterViewPage.tsx - doctors + contracts tabs / ایجاد صفحه مشاهده مرکز - تب‌های پزشکان + قراردادها
- [x] 11.29 Create SettlementListPage.tsx / ایجاد صفحه لیست تسویه‌ها
- [x] 11.30 Create SettlementViewPage.tsx / ایجاد صفحه مشاهده تسویه
- [x] 11.31 Create CommissionCaseListPage.tsx / ایجاد صفحه لیست پرونده‌های کمیسیون
- [x] 11.32 Create CommissionCaseFormPage.tsx / ایجاد صفحه فرم پرونده کمیسیون
- [x] 11.33 Create SocialWorkListPage.tsx / ایجاد صفحه لیست مددکاری
- [x] 11.34 Create SocialWorkFormPage.tsx / ایجاد صفحه فرم مددکاری
- [x] 11.35 Create ClaimReportPage.tsx / ایجاد صفحه گزارش پرونده‌ها
- [x] 11.36 Create FinancialReportPage.tsx / ایجاد صفحه گزارش مالی
- [x] 11.37 Create UserListPage.tsx / ایجاد صفحه لیست کاربران
- [x] 11.38 Create UserFormPage.tsx / ایجاد صفحه فرم کاربر
- [x] 11.39 Create RoleListPage.tsx / ایجاد صفحه لیست نقش‌ها
- [x] 11.40 Create RoleFormPage.tsx / ایجاد صفحه فرم نقش
- [x] 11.41 Create AuditLogPage.tsx / ایجاد صفحه لاگ ممیزی

## 12. Frontend - Types & Utils / فرانت‌اند - تایپ‌ها و ابزارها

- [x] 12.1 Create types/api.ts - ApiResponse, PaginatedResponse / ایجاد تایپ‌های API - پاسخ API، پاسخ صفحه‌بندی‌شده
- [x] 12.2 Create types/employee.ts, insurance.ts, claim.ts, invoice.ts, item.ts, center.ts, common.ts / ایجاد تایپ‌های کارمند، بیمه، پرونده، صورتحساب، آیتم، مرکز، مشترک
- [x] 12.3 Create utils/jalali.ts - Jalali date conversion / ایجاد ابزار تاریخ جلالی - تبدیل تاریخ جلالی
- [x] 12.4 Create utils/format.ts - Persian numbers, currency, dates / ایجاد ابزار فرمت - اعداد فارسی، واحد پول، تاریخ
- [x] 12.5 Create utils/constants.ts - menu items, status maps, color palette / ایجاد ثوابت - آیتم‌های منو، نقشه وضعیت، پالت رنگ

## 13. Frontend - Routing / فرانت‌اند - مسیریابی

- [x] 13.1 Create App.tsx with React Router, lazy loading, 51 routes, QueryClientProvider, Toaster / ایجاد App.tsx با React Router، بارگذاری تنبل، ۵۱ مسیر، QueryClientProvider، Toaster

## 13.5 Employee Module Completion / تکمیل ماژول پرسنل

### Database / دیتابیس
- [x] 13.5.1 Migration: `create_marriage_statuses_table` with seed data (مجرد, متاهل, مطلقه, همسر فوت شده) / مایگریشن: جدول وضعیت تاهل با داده اولیه
- [x] 13.5.2 Migration: `add_missing_columns_to_employees_table` - priority, description, photo, marriage_status_id, location_work_id, branch_id, bazneshasegi_date, hoghogh_branch_id / مایگریشن: افزودن ۸ ستون جدید به جدول پرسنل
- [x] 13.5.3 Migration: `expand_employees_import_tables` - new_p_code, action, matched_employee_id, diff_data, import_mode, selected_fields, insert_count, update_count, skip_count / مایگریشن: گسترش جداول ایمپورت

### Backend / بک‌اند
- [x] 13.5.4 Install phpoffice/phpspreadsheet for XLSX parsing / نصب phpspreadsheet برای پردازش XLSX
- [x] 13.5.5 Create MarriageStatus model / ایجاد مدل وضعیت تاهل
- [x] 13.5.6 Update Employee model - add 8 new fillable fields + marriageStatus() and locationWork() relationships / به‌روزرسانی مدل پرسنل - افزودن ۸ فیلد جدید + روابط
- [x] 13.5.7 Update EmployeeResource - add new fields + 3 new conditional relations / به‌روزرسانی ریسورس پرسنل - فیلدهای جدید + ۳ رابطه شرطی
- [x] 13.5.8 Update Store/UpdateEmployeeRequest - add validation rules for 8 new fields / به‌روزرسانی ولیدیتورها - قوانین ۸ فیلد جدید
- [x] 13.5.9 Create 6 new request validators (StoreFamilyRequest, BulkDeleteRequest, StoreIllnessRequest, StoreInfractionRequest, ImportStageRequest, ImportApplyRequest) / ایجاد ۶ ولیدیتور جدید
- [x] 13.5.10 Add 18+ employee routes before {id} wildcard (bulk-delete, search, import/*, family/*, illnesses/*, infractions/*) / افزودن ۱۸+ مسیر پرسنل قبل از wildcard
- [x] 13.5.11 Rewrite EmployeeController with 20+ methods (CRUD, family CRUD, illness CRUD, infraction CRUD, staged import, photo upload) / بازنویسی کنترلر پرسنل با ۲۰+ متد
- [x] 13.5.12 Rewrite EmployeeService with LIST_RELATIONS/DETAIL_RELATIONS, search, bulkDelete, family/illness/infraction CRUD / بازنویسی سرویس پرسنل
- [x] 13.5.13 Rewrite EmployeeImportService - 35-column Excel mapping (33 data + 2 ignored), streaming XMLReader parser via zip:// URI, staged import (stage→preview→apply), FK sanitization, NULL-string handling, chunkById processing, two-pass parent_id, Jalali→Gregorian, diff computation / بازنویسی سرویس ایمپورت - نگاشت ۳۵ ستون اکسل، پارسر استریمی XMLReader، ایمپورت مرحله‌ای، مدیریت FK نامعتبر
- [x] 13.5.14 Add marriageStatuses to LookupController + route / افزودن وضعیت تاهل به کنترلر lookup + مسیر
- [x] 13.5.26 Migration: `fix_column_constraints` - status varchar(30), employees.national_code nullable / مایگریشن: اصلاح محدودیت‌ها - وضعیت varchar(30)، کد ملی nullable
- [x] 13.5.27 Test import with 1000-row sample from جافام 14040811.xlsx - stage 4.6s, insert 10s, update 10s, 0 errors / تست ایمپورت با نمونه ۱۰۰۰ ردیفی از فایل جافام

### Frontend / فرانت‌اند
- [x] 13.5.15 Rewrite types/employee.ts - nested relation format (gender: {value, label}, status: {value, label}, custom_employee_code: {id, code, title}, etc.) / بازنویسی تایپ‌ها - فرمت رابطه تودرتو
- [x] 13.5.16 Update api/employeeImport.ts - add stage(), preview(), apply() methods with 600s timeout / به‌روزرسانی API ایمپورت - افزودن متدهای ایمپورت مرحله‌ای
- [x] 13.5.17 Add marriageStatuses to api/lookups.ts + useMarriageStatuses and useAllLocations hooks / افزودن وضعیت تاهل به lookup API + هوک‌ها
- [x] 13.5.18 Rewrite EmployeeCreatePage.tsx - correct field names, 8 lookup-driven dropdowns, new fields / بازنویسی صفحه ایجاد پرسنل
- [x] 13.5.19 Rewrite EmployeeEditPage.tsx - pre-fill from nested resource format / بازنویسی صفحه ویرایش پرسنل
- [x] 13.5.20 Rewrite EmployeeViewPage.tsx - nested field display, family tab with data fetch, insurance tab / بازنویسی صفحه مشاهده پرسنل
- [x] 13.5.21 Rewrite EmployeeListPage.tsx - render functions for nested data (custom_employee_code?.code, gender?.label, location?.name, status?.value) / بازنویسی صفحه لیست پرسنل
- [x] 13.5.22 Rewrite EmployeeImportPage.tsx - staged import UI (idle→uploading→staged→applying→done), preview tabs, field selection, diff highlighting / بازنویسی صفحه ایمپورت - رابط مرحله‌ای
- [x] 13.5.23 Fix EmployeeFamilyPage.tsx - nested type accessors (relation_type?.id, gender?.value) / اصلاح صفحه خانواده - دسترسی‌های تایپ تودرتو
- [x] 13.5.24 Add staged/retired/suspended/deceased to STATUS_LABELS and STATUS_COLORS in constants.ts / افزودن وضعیت‌های جدید به ثوابت
- [x] 13.5.25 Update OpenSpec spec.md - bilingual, 33-column Excel mapping table, staged import flow, all API endpoints / به‌روزرسانی spec دوزبانه

---

## 14. REMAINING: Pricing Engine Business Logic / باقیمانده: منطق کسب‌وکار موتور قیمت‌گذاری

- [ ] 14.1 Implement ConditionMatcher.php - full matching algorithm (age, gender, work years, CEC, SET, illness, location, category) / پیاده‌سازی الگوریتم کامل تطبیق شرایط (سن، جنسیت، سابقه کار، CEC، SET، بیماری، مکان، دسته‌بندی)
- [ ] 14.2 Implement UsageCounter.php - count invoice_items in period (day/week/month/year), per body part option / پیاده‌سازی شمارنده استفاده - شمارش اقلام صورتحساب در دوره (روز/هفته/ماه/سال)، به تفکیک عضو بدن
- [ ] 14.3 Implement DiscountCalculator.php - apply 4 discount types in priority: employee > CEC > SET > default / پیاده‌سازی محاسبه‌گر تخفیف - اعمال ۴ نوع تخفیف به ترتیب اولویت: کارمند > CEC > SET > پیش‌فرض
- [ ] 14.4 Implement GroupChecker.php - check condition_group cross-item limits / پیاده‌سازی بررسی‌کننده گروه - بررسی محدودیت‌های بین‌آیتمی گروه شرایط
- [ ] 14.5 Implement RuleEngineAdapter.php - integrate ruler/ruler with DataContext builder / پیاده‌سازی آداپتور موتور قوانین - یکپارچه‌سازی ruler/ruler با سازنده DataContext
- [ ] 14.6 Implement PricingService.php - full orchestration: load conditions, match, calculate layers / پیاده‌سازی سرویس قیمت‌گذاری - ارکستراسیون کامل: بارگذاری شرایط، تطبیق، محاسبه لایه‌ها
- [ ] 14.7 Write ruler/ruler rules for base coverage (percentage, amount, no_payment) / نوشتن قوانین ruler/ruler برای پوشش پایه (درصد، مبلغ، بدون پرداخت)
- [ ] 14.8 Write ruler/ruler rules for age-based conditions / نوشتن قوانین ruler/ruler برای شرایط مبتنی بر سن
- [ ] 14.9 Write ruler/ruler rules for usage limits (period-based) / نوشتن قوانین ruler/ruler برای محدودیت‌های استفاده (مبتنی بر دوره)
- [ ] 14.10 Write ruler/ruler rules for body-part-specific limits / نوشتن قوانین ruler/ruler برای محدودیت‌های مختص عضو بدن
- [ ] 14.11 Write ruler/ruler rules for discount application / نوشتن قوانین ruler/ruler برای اعمال تخفیف
- [ ] 14.12 Write unit tests for pricing engine with real Refah test data (>=10 cases covering all layers) / نوشتن تست‌های واحد برای موتور قیمت‌گذاری با داده‌های واقعی رفاه (حداقل ۱۰ مورد پوشش‌دهنده تمام لایه‌ها)

## 15. REMAINING: Claim State Machine Completion / باقیمانده: تکمیل ماشین حالت پرونده

- [ ] 15.1 Implement ClaimStateMachine.php - validate all transitions per state diagram, reject invalid / پیاده‌سازی ماشین حالت پرونده - اعتبارسنجی تمام انتقال‌ها طبق نمودار حالت، رد انتقال‌های نامعتبر
- [ ] 15.2 Implement DeductionService.php - apply deductions to claim items, recalculate totals / پیاده‌سازی سرویس کسورات - اعمال کسورات به اقلام پرونده، محاسبه مجدد جمع‌ها
- [ ] 15.3 Add role-based transition permissions (operator, examiner, supervisor, financial) / افزودن مجوزهای انتقال مبتنی بر نقش (اپراتور، کارشناس، سرپرست، مالی)
- [ ] 15.4 Write unit tests for claim state machine (all valid + invalid transitions) / نوشتن تست‌های واحد برای ماشین حالت پرونده (تمام انتقال‌های معتبر + نامعتبر)

## 16. REMAINING: HR Sync / باقیمانده: همگام‌سازی منابع انسانی

- [ ] 16.1 Create EmployeeSyncService.php - connect to 172.29.21.6, query V_sadad_personal + V_sadad_family / ایجاد سرویس همگام‌سازی کارمندان - اتصال به 172.29.21.6، کوئری V_sadad_personal + V_sadad_family
- [ ] 16.2 Implement staging: upsert to employee_import_temp / پیاده‌سازی مرحله‌بندی: upsert به جدول موقت ورود کارمندان
- [ ] 16.3 Implement diff: compare temp with employees table / پیاده‌سازی مقایسه: مقایسه جدول موقت با جدول کارمندان
- [ ] 16.4 Implement apply: insert/update/deactivate with history tracking / پیاده‌سازی اعمال: درج/به‌روزرسانی/غیرفعال‌سازی با ردیابی تاریخچه
- [ ] 16.5 Create scheduled command for daily sync / ایجاد دستور زمان‌بندی‌شده برای همگام‌سازی روزانه
- [ ] 16.6 Add sync status UI in EmployeeImportPage.tsx / افزودن رابط کاربری وضعیت همگام‌سازی در صفحه ورود اطلاعات کارمندان

## 17. REMAINING: Insurance Rules Enforcement / باقیمانده: اجرای قوانین بیمه

- [ ] 17.1 Implement waiting period check in InsuranceService / پیاده‌سازی بررسی دوره انتظار در سرویس بیمه
- [ ] 17.2 Implement annual ceiling enforcement / پیاده‌سازی اعمال سقف سالانه
- [ ] 17.3 Implement per-claim limit check / پیاده‌سازی بررسی محدودیت هر پرونده
- [ ] 17.4 Implement eligible relations validation / پیاده‌سازی اعتبارسنجی نسبت‌های مجاز
- [ ] 17.5 Add insurance rule management UI (CRUD for insurance_rules) / افزودن رابط کاربری مدیریت قوانین بیمه (عملیات CRUD برای insurance_rules)

## 18. REMAINING: Drug Interaction Check / باقیمانده: بررسی تداخل دارویی

- [ ] 18.1 Implement drug interaction check when adding invoice item / پیاده‌سازی بررسی تداخل دارویی هنگام افزودن قلم صورتحساب
- [ ] 18.2 Show interaction warnings in InvoiceFormPage.tsx / نمایش هشدارهای تداخل در صفحه فرم صورتحساب
- [ ] 18.3 Seed drug_interactions table with common interaction data / بارگذاری داده‌های تداخلات رایج در جدول تداخلات دارویی

## 19. REMAINING: Audit Trail & Security / باقیمانده: ردیابی ممیزی و امنیت

- [ ] 19.1 Create audit middleware to auto-log write operations to audit_logs / ایجاد میان‌افزار ممیزی برای ثبت خودکار عملیات نوشتن در لاگ‌های ممیزی
- [ ] 19.2 Implement row-level data in AuditLog (old_data/new_data JSONB) / پیاده‌سازی داده سطح ردیف در لاگ ممیزی (JSONB داده قبلی/جدید)
- [ ] 19.3 Add audit log filtering in AuditLogPage.tsx (by entity, user, date) / افزودن فیلتر لاگ ممیزی در صفحه لاگ (بر اساس موجودیت، کاربر، تاریخ)

## 20. REMAINING: Reports & Export / باقیمانده: گزارشات و خروجی

- [ ] 20.1 Implement Excel export for claims report / پیاده‌سازی خروجی اکسل برای گزارش پرونده‌ها
- [ ] 20.2 Implement Excel export for financial report / پیاده‌سازی خروجی اکسل برای گزارش مالی
- [ ] 20.3 Create dynamic report builder (dimensions + measures -> SQL pivot) / ایجاد گزارش‌ساز پویا (ابعاد + معیارها -> SQL pivot)
- [ ] 20.4 Add report builder UI / افزودن رابط کاربری گزارش‌ساز

## 21. REMAINING: Database Seeders / باقیمانده: سیدرهای دیتابیس

- [ ] 21.1 Seed lookup tables: provinces (31), relation_types, guardianship_types, body_parts / بارگذاری جداول مقادیر: استان‌ها (۳۱)، انواع نسبت، انواع قیمومت، اعضای بدن
- [ ] 21.2 Seed custom_employee_codes from Refah fservice values / بارگذاری کدهای سفارشی کارمندان از مقادیر fservice رفاه
- [ ] 21.3 Seed special_employee_types (JANBAAZ, AZADEH, SHAHID_CHILD) / بارگذاری انواع خاص کارمندان (جانباز، آزاده، فرزند شهید)
- [ ] 21.4 Seed item_categories, item_sub_categories, item_groups / بارگذاری دسته‌بندی‌ها، زیردسته‌ها و گروه‌های آیتم
- [ ] 21.5 Seed prescription_types, document_types, commission_case_types / بارگذاری انواع نسخه، انواع مدارک، انواع پرونده کمیسیون
- [ ] 21.6 Seed roles (9 roles) and permissions (40+) / بارگذاری نقش‌ها (۹ نقش) و مجوزها (۴۰+)
- [ ] 21.7 Seed test data: 100 employees with families, 50 items with prices, 20 conditions, 5 centers / بارگذاری داده‌های تست: ۱۰۰ کارمند با خانواده، ۵۰ آیتم با قیمت، ۲۰ شرط، ۵ مرکز

## 22. REMAINING: Testing / باقیمانده: تست‌نویسی

- [ ] 22.1 Write integration tests for auth flow (login -> token -> protected route -> refresh) / نوشتن تست‌های یکپارچه برای جریان احراز هویت (ورود -> توکن -> مسیر محافظت‌شده -> تمدید)
- [ ] 22.2 Write unit tests for pricing engine (>=10 test cases) / نوشتن تست‌های واحد برای موتور قیمت‌گذاری (حداقل ۱۰ مورد)
- [ ] 22.3 Write unit tests for claim state machine (all transitions) / نوشتن تست‌های واحد برای ماشین حالت پرونده (تمام انتقال‌ها)
- [ ] 22.4 Write unit tests for national code validation / نوشتن تست‌های واحد برای اعتبارسنجی کد ملی
- [ ] 22.5 Write integration tests for employee CRUD + family / نوشتن تست‌های یکپارچه برای عملیات CRUD کارمندان + خانواده
- [ ] 22.6 Write integration tests for invoice -> pricing -> claim flow / نوشتن تست‌های یکپارچه برای جریان صورتحساب -> قیمت‌گذاری -> پرونده
