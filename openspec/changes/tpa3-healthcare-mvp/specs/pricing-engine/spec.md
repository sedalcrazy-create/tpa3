## Status / وضعیت: Partially Implemented / تا حدی پیاده‌سازی شده

## Summary / خلاصه

Multi-layer pricing calculation engine with 7 pricing services and condition tables. Service structures and database tables are created but full business logic implementation, ruler/ruler rules, and unit tests remain.

موتور محاسبه قیمت چند لایه‌ای با ۷ سرویس قیمت‌گذاری و جداول شرایط. ساختار سرویس‌ها و جداول پایگاه‌داده ایجاد شده اما پیاده‌سازی کامل منطق کسب‌وکار، قوانین ruler/ruler و تست‌های واحد باقی‌مانده.

## Tech Stack / پشته فناوری

- **Backend:** Laravel 12, PHP 8.3, Eloquent ORM, ruler/ruler (PHP rule engine, replaces Go Grule)
- **Frontend:** React 18, TypeScript (pricing results displayed in invoice views)
- **Database:** PostgreSQL 16

## Backend / بک‌اند

### Implemented / پیاده‌سازی شده

- `app/Services/Pricing/PricingService.php` - Main orchestrator: coordinates condition matching, discount calculation, group checking, and produces final paid_price per invoice item
- `app/Services/Pricing/ConditionMatcher.php` - Matches item + employee attributes (age, gender, work years, illness, CEC, SET, relation type, location) against `item_price_conditions` table
- `app/Services/Pricing/UsageCounter.php` - Counts existing invoice_items for the same employee+item within a period (day/week/month/year) for usage limit enforcement
- `app/Services/Pricing/DiscountCalculator.php` - Applies 4 discount types in priority order: employee_special_discounts > cec_item_discounts > set_item_discounts > item default
- `app/Services/Pricing/GroupChecker.php` - Enforces cross-item caps from `condition_groups` (e.g., max 10 physiotherapy sessions per month across all items)
- `app/Services/Pricing/ConflictChecker.php` - Detects conflicting conditions and resolves by priority/specificity
- `app/Services/Pricing/RuleEngineAdapter.php` - Adapter for ruler/ruler PHP rule engine integration (replaces Go Grule)
- `database/migrations/` - All pricing tables created:
  - `item_price_conditions` - base conditions per item + employee attributes
  - `item_price_condition_filters` - advanced filters by type (cec, employee, illness, item, category, etc.)
  - `item_price_condition_restrictions` - periodic usage limits (count per day/week/month/year, per body part)
  - `condition_groups` - cross-item usage caps
  - `employee_special_discounts` - per-employee per-item discounts
  - `cec_item_discounts` - employee type (CEC) based discounts
  - `set_item_discounts` - special type (SET) based discounts

### Remaining / باقی‌مانده

- Full business logic implementation in PricingService.php (currently scaffolded, needs complete calculation flow)
- Full business logic in ConditionMatcher.php (age range matching, gender matching, CEC/SET matching, location matching, illness matching)
- Full business logic in UsageCounter.php (Jalali period calculation for year/month/week/day, body part tracking)
- Full business logic in DiscountCalculator.php (priority-based discount selection logic)
- Full business logic in GroupChecker.php (cross-item group limit enforcement)
- Full business logic in ConflictChecker.php (conflict resolution algorithm)
- ruler/ruler rule definitions (PHP rule files replacing GRL files)
- RuleEngineAdapter.php integration with ruler/ruler library for dynamic rule evaluation
- Unit tests for all pricing service components
- Integration test: end-to-end pricing calculation for a sample invoice
- Price calculation result fields on invoice_items: paid_price, behdasht_price, takmili_price, discount_amount, alert_description

پیاده‌سازی کامل منطق کسب‌وکار در PricingService.php (در حال حاضر ساختار اولیه، نیاز به جریان محاسبه کامل)، منطق کامل در ConditionMatcher.php (تطبیق بازه سنی، جنسیت، CEC/SET، مکان، بیماری)، منطق کامل در UsageCounter.php (محاسبه دوره شمسی برای سال/ماه/هفته/روز، ردیابی عضو بدن)، منطق کامل در DiscountCalculator.php (منطق انتخاب تخفیف بر اساس اولویت)، منطق کامل در GroupChecker.php (اعمال محدودیت گروهی بین آیتم‌ها)، منطق کامل در ConflictChecker.php (الگوریتم حل تعارض)، تعاریف قوانین ruler/ruler، یکپارچه‌سازی RuleEngineAdapter.php، تست‌های واحد و تست یکپارچه‌سازی، و فیلدهای نتیجه محاسبه قیمت روی invoice_items.

## Frontend / فرانت‌اند

### Implemented / پیاده‌سازی شده

- Pricing results are displayed within invoice views (paid_price, employee_share, deductions per item)

نتایج قیمت‌گذاری در نماهای فاکتور نمایش داده می‌شوند (paid_price، سهم پرسنل، کسورات هر آیتم).

### Remaining / باقی‌مانده

- Pricing condition management UI (admin CRUD for item_price_conditions)
- Discount management UI (admin CRUD for employee_special_discounts, cec_item_discounts, set_item_discounts)
- Condition group management UI
- Pricing simulation/test tool (calculate price for hypothetical item + employee combination)

رابط کاربری مدیریت شرایط قیمت‌گذاری (CRUD ادمین برای item_price_conditions)، رابط کاربری مدیریت تخفیف‌ها (CRUD ادمین برای employee_special_discounts، cec_item_discounts، set_item_discounts)، رابط کاربری مدیریت گروه شرایط، و ابزار شبیه‌سازی/تست قیمت‌گذاری (محاسبه قیمت برای ترکیب فرضی آیتم + پرسنل).

## Database Tables / جداول پایگاه‌داده

- `item_price_conditions` - id, item_id, min_age, max_age, gender_id, min_work_years, max_work_years, illness_id, cec_id, set_id, relation_type_id, location_id, coverage_type (amount/percentage), coverage_value, priority, is_active, timestamps
- `item_price_condition_filters` - id, condition_id, filter_type (cec/employee/illness/item/category/subcategory/group/set), filter_value, timestamps
- `item_price_condition_restrictions` - id, condition_id, period_type (day/week/month/year), period_count, total_count_of_use, in_each_body_part (boolean), timestamps
- `condition_groups` - id, name, description, max_count, period_type, period_count, item_ids (JSON array), is_active, timestamps
- `employee_special_discounts` - id, employee_id, item_id, discount_percentage, start_date, end_date, timestamps
- `cec_item_discounts` - id, cec_id, item_id, discount_percentage, timestamps
- `set_item_discounts` - id, set_id, item_id, discount_percentage, timestamps

## API Endpoints / نقاط پایانی API

| Method | Endpoint | Status / وضعیت |
|--------|----------|--------|
| POST | `/api/v1/invoices/:id/calculate` | Scaffolded (logic pending) / ساختار اولیه (منطق در انتظار) |
| GET | `/api/v1/pricing/conditions` | Not Started / شروع نشده |
| POST | `/api/v1/pricing/conditions` | Not Started / شروع نشده |
| GET | `/api/v1/pricing/discounts` | Not Started / شروع نشده |
| POST | `/api/v1/pricing/simulate` | Not Started / شروع نشده |

## Requirements (Original Spec) / الزامات (مشخصات اصلی)

### Requirement: Multi-layer pricing calculation / الزام: محاسبه قیمت چند لایه‌ای

The system calculates insurance coverage for each invoice item through a multi-layer pricing engine:
- **Layer 1** - Base conditions (`item_price_conditions`): Match item + employee attributes
- **Layer 2** - Advanced filters (`item_price_condition_filters`): Further filter by type
- **Layer 3** - Usage restrictions (`item_price_condition_restrictions`): Enforce periodic usage limits
- **Layer 4** - Discounts: Apply 4 discount types in priority order
- **Layer 5** - Condition groups (`condition_groups`): Cross-item usage caps

سیستم پوشش بیمه‌ای هر آیتم فاکتور را از طریق موتور قیمت‌گذاری چند لایه‌ای محاسبه می‌کند:
- **لایه ۱** - شرایط پایه (`item_price_conditions`): تطبیق ویژگی‌های آیتم + پرسنل
- **لایه ۲** - فیلترهای پیشرفته (`item_price_condition_filters`): فیلتر بیشتر بر اساس نوع
- **لایه ۳** - محدودیت‌های استفاده (`item_price_condition_restrictions`): اعمال محدودیت‌های دوره‌ای استفاده
- **لایه ۴** - تخفیف‌ها: اعمال ۴ نوع تخفیف به ترتیب اولویت
- **لایه ۵** - گروه‌های شرایط (`condition_groups`): سقف استفاده بین آیتم‌ها

STATUS: Database tables and service file scaffolds created. Full business logic implementation REMAINING.

وضعیت: جداول پایگاه‌داده و ساختار اولیه فایل‌های سرویس ایجاد شده. پیاده‌سازی کامل منطق کسب‌وکار باقی‌مانده.

### Requirement: ruler/ruler rule engine integration / الزام: یکپارچه‌سازی موتور قوانین ruler/ruler

The system uses ruler/ruler (PHP) instead of Go Grule for rule evaluation. DB-loaded conditions are injected into the rule engine context. STATUS: RuleEngineAdapter.php created, full integration REMAINING.

سیستم از ruler/ruler (PHP) به جای Go Grule برای ارزیابی قوانین استفاده می‌کند. شرایط بارگذاری‌شده از پایگاه‌داده به متن موتور قوانین تزریق می‌شوند. وضعیت: RuleEngineAdapter.php ایجاد شده، یکپارچه‌سازی کامل باقی‌مانده.

### Requirement: Discount calculation (4 types) / الزام: محاسبه تخفیف (۴ نوع)

Priority order: employee_special_discounts > cec_item_discounts > set_item_discounts > item default. Only the most specific matching discount applies (no stacking). STATUS: DiscountCalculator.php created, logic REMAINING.

ترتیب اولویت: employee_special_discounts > cec_item_discounts > set_item_discounts > پیش‌فرض آیتم. فقط خاص‌ترین تخفیف منطبق اعمال می‌شود (بدون انباشت). وضعیت: DiscountCalculator.php ایجاد شده، منطق باقی‌مانده.
