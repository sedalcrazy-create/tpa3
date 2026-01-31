## Why / چرا

The current TPA system for Bank Melli (Refah) is built on obsolete PHP/Yii 1.x technology and lacks scalability, real-time capabilities, and modern maintainability. The previous rewrite attempt (TPA2) was abandoned due to Docker complexity and backend duality (Go+NestJS). TPA3 is rewritten with a more practical approach (Laravel + React) and the current MVP includes all core CRUDs, authentication, and a Farsi RTL user interface.

سامانه فعلی TPA بانک ملی (رفاه) روی تکنولوژی منسوخ PHP/Yii 1.x ساخته شده و قابلیت مقیاس‌پذیری، real-time و نگهداری مدرن ندارد. تلاش قبلی بازنویسی (TPA2) به دلیل پیچیدگی Docker و دوگانگی بکند (Go+NestJS) متوقف شد. TPA3 با رویکرد عملی‌تر (Laravel + React) بازنویسی شده و MVP فعلی شامل تمام CRUD های اصلی، احراز هویت، و رابط کاربری فارسی RTL است.

## What Changes / چه تغییراتی

- **Brand new system** in `E:/project/tpa3` with Laravel 12 + React 18 + TypeScript
- Laravel backend with 53 Eloquent models, 15 API controllers, 25 services
- React + TypeScript frontend with 41 pages, 13 UI components, Tailwind CSS 4
- PostgreSQL 16 database with 35 migrations and 56 tables
- Token-based authentication with Laravel Sanctum
- Fully Persian (RTL) user interface with Vazirmatn font and Jalali calendar
- Simple Docker setup (postgres + redis + php-fpm-apache)
- Pricing engine with ruler/ruler (PHP rule engine)

- **سیستم کاملا جدید** در `E:/project/tpa3` با Laravel 12 + React 18 + TypeScript
- بکند Laravel با ۵۳ مدل Eloquent، ۱۵ کنترلر API، ۲۵ سرویس
- فرانتاند React + TypeScript با ۴۱ صفحه، ۱۳ کامپوننت UI، Tailwind CSS 4
- دیتابیس PostgreSQL 16 با ۳۵ مایگریشن و ۵۶ جدول
- احراز هویت توکنی با Laravel Sanctum
- رابط کاربری کاملا فارسی (RTL) با فونت Vazirmatn و تقویم شمسی
- Docker ساده (postgres + redis + php-fpm-apache)
- موتور قیمت‌گذاری با ruler/ruler (PHP rule engine)

## Capabilities / قابلیت‌ها

### Implemented Capabilities (MVP - Done) / قابلیت‌های پیاده‌سازی شده (MVP - انجام شده)

- `auth-rbac`: Sanctum authentication, roles and permissions (CRUD), route protection middleware
- `employee-management`: Personnel + family CRUD, Excel import, search, filter, batch delete
- `contract-insurance`: Insurance policy + contract CRUD, insurance inquiry, insurance ceiling
- `drug-service-catalog`: Drug/service items CRUD, pricing, ICD-10, categorization
- `prescription-processing`: Prescriptions CRUD
- `claim-workflow`: Claims CRUD, status transitions, notes, attachments
- `financial-settlement`: Settlement list, aggregation, approval, payment
- `medical-center`: Medical centers + doctors + contracts CRUD
- `medical-commission`: Commission case + verdict + social work CRUD
- `reporting-dashboard`: KPI dashboard, claims report, financial report
- `pricing-engine`: Pricing service structure (ConditionMatcher, UsageCounter, DiscountCalculator, GroupChecker)

- `auth-rbac`: احراز هویت Sanctum، نقش‌ها و مجوزها (CRUD)، middleware محافظت route ها
- `employee-management`: CRUD پرسنل + خانواده، import اکسل، جستجو، فیلتر، حذف دسته‌ای
- `contract-insurance`: CRUD بیمه‌نامه + قرارداد، استعلام بیمه، سقف بیمه
- `drug-service-catalog`: CRUD اقلام دارویی/خدمات، قیمت‌گذاری، ICD-10، دسته‌بندی
- `prescription-processing`: CRUD نسخه‌ها
- `claim-workflow`: CRUD خسارات، transitions وضعیت، یادداشت، پیوست
- `financial-settlement`: لیست تسویه، تجمیع، تایید، پرداخت
- `medical-center`: CRUD مراکز درمانی + پزشکان + قراردادها
- `medical-commission`: CRUD پرونده کمیسیون + رای + مددکاری اجتماعی
- `reporting-dashboard`: داشبورد KPI، گزارش خسارات، گزارش مالی
- `pricing-engine`: ساختار سرویس‌های قیمت‌گذاری (ConditionMatcher, UsageCounter, DiscountCalculator, GroupChecker)

### Remaining Capabilities (Not Yet Implemented) / قابلیت‌های باقی‌مانده (هنوز پیاده‌سازی نشده)

- Complete pricing engine with ruler/ruler rules (service structure exists but logic is incomplete)
- Personnel sync from Bank Melli HR server (`172.29.21.6`)
- Drug interaction checking during invoice issuance
- Insurance Rules validation (waiting period, ceiling enforcement)
- Claim state machine validation (real transition rules)
- Dynamic report builder (custom report builder)
- Row-level security and automatic audit trail
- Excel export for reports
- Electronic prescription (eRx) integration

- موتور قیمت‌گذاری کامل با ruler/ruler rules (فعلا ساختار سرویس‌ها هست ولی logic ناقصه)
- سینک پرسنل از سرور HR بانک ملی (`172.29.21.6`)
- بررسی تداخلات دارویی موقع صدور فاکتور
- Insurance Rules validation (waiting period, ceiling enforcement)
- Claim state machine validation واقعی (transition rules)
- گزارش‌ساز پویا (custom report builder)
- Row-level security و audit trail خودکار
- Excel export برای گزارشات
- نسخه الکترونیک (eRx) integration

### Modified Capabilities / قابلیت‌های تغییریافته
<!-- N/A - greenfield project -->
<!-- غیرقابل اعمال - پروژه از صفر -->

## Impact / تاثیرات

- **Infrastructure / زیرساخت:** PHP 8.3, Composer, PostgreSQL 16, Redis 7, Node 20+ (frontend build)
- **External Integrations (next phase) / یکپارچه‌سازی خارجی (فاز بعدی):** Civil registration (national ID), Medical council, IRC/TTAC (drugs), electronic prescriptions, Social Security
- **Existing Data / داده موجود:** Migration from Refah (50+ MySQL tables -> PostgreSQL), personnel sync from `V_sadad_personal`
- **Security / امنیت:** Sensitive medical data - requires encryption at rest, audit trail, RBAC
- **Scale / مقیاس:** 200K insured persons, 5M documents/year, 450 concurrent users

- **زیرساخت:** PHP 8.3, Composer, PostgreSQL 16, Redis 7, Node 20+ (frontend build)
- **یکپارچه‌سازی خارجی (فاز بعدی):** ثبت احوال (کد ملی)، نظام پزشکی، IRC/TTAC (دارو)، نسخ الکترونیک، تامین اجتماعی
- **داده موجود:** مهاجرت از رفاه (50+ جدول MySQL -> PostgreSQL)، سینک پرسنل از `V_sadad_personal`
- **امنیت:** داده‌های حساس پزشکی - نیاز به encryption at rest، audit trail، RBAC
- **مقیاس:** ۲۰۰ هزار بیمه‌شده، ۵ میلیون سند/سال، ۴۵۰ کاربر همزمان
