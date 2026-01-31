<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // 9 Roles
        $roles = [
            ['name' => 'admin', 'title' => 'مدیر سیستم', 'description' => 'دسترسی کامل به تمام بخش‌ها'],
            ['name' => 'insurance_manager', 'title' => 'مدیر بیمه', 'description' => 'مدیریت بیمه و قراردادها'],
            ['name' => 'claim_expert', 'title' => 'کارشناس خسارت', 'description' => 'بررسی و تایید پرونده‌ها'],
            ['name' => 'claim_supervisor', 'title' => 'سرپرست خسارت', 'description' => 'نظارت بر فرایند خسارت'],
            ['name' => 'financial_manager', 'title' => 'مدیر مالی', 'description' => 'تسویه و پرداخت‌ها'],
            ['name' => 'data_entry', 'title' => 'اپراتور ورود اطلاعات', 'description' => 'ورود اطلاعات بیمه‌شدگان و نسخ'],
            ['name' => 'medical_commission', 'title' => 'عضو کمیسیون پزشکی', 'description' => 'رسیدگی به پرونده‌های کمیسیون'],
            ['name' => 'social_worker', 'title' => 'مددکار اجتماعی', 'description' => 'پرونده‌های مددکاری'],
            ['name' => 'viewer', 'title' => 'بازبین', 'description' => 'فقط مشاهده گزارش‌ها'],
        ];

        foreach ($roles as &$role) {
            $role['is_active'] = true;
            $role['created_at'] = $now;
            $role['updated_at'] = $now;
        }

        DB::table('roles')->insert($roles);

        // Permissions grouped by module
        $permissionGroups = [
            'employees' => [
                'employees.view' => 'مشاهده بیمه‌شدگان',
                'employees.create' => 'ایجاد بیمه‌شده',
                'employees.update' => 'ویرایش بیمه‌شده',
                'employees.delete' => 'حذف بیمه‌شده',
                'employees.import' => 'ورود گروهی بیمه‌شدگان',
                'employees.export' => 'خروجی اکسل بیمه‌شدگان',
                'employees.family' => 'مدیریت خانواده بیمه‌شده',
            ],
            'insurance' => [
                'insurance.view' => 'مشاهده بیمه‌نامه',
                'insurance.create' => 'صدور بیمه‌نامه',
                'insurance.update' => 'ویرایش بیمه‌نامه',
                'insurance.inquiry' => 'استعلام بیمه',
            ],
            'items' => [
                'items.view' => 'مشاهده دارو و خدمات',
                'items.create' => 'ایجاد دارو/خدمت',
                'items.update' => 'ویرایش دارو/خدمت',
                'items.delete' => 'حذف دارو/خدمت',
                'items.prices' => 'مدیریت قیمت‌ها',
            ],
            'prescriptions' => [
                'prescriptions.view' => 'مشاهده نسخ',
                'prescriptions.create' => 'ثبت نسخه',
                'prescriptions.update' => 'ویرایش نسخه',
            ],
            'invoices' => [
                'invoices.view' => 'مشاهده صورتحساب',
                'invoices.create' => 'ایجاد صورتحساب',
                'invoices.update' => 'ویرایش صورتحساب',
                'invoices.calculate' => 'محاسبه صورتحساب',
            ],
            'claims' => [
                'claims.view' => 'مشاهده پرونده',
                'claims.create' => 'ایجاد پرونده',
                'claims.update' => 'ویرایش پرونده',
                'claims.check' => 'بررسی پرونده',
                'claims.confirm' => 'تایید پرونده',
                'claims.return' => 'برگشت پرونده',
                'claims.archive' => 'بایگانی پرونده',
            ],
            'centers' => [
                'centers.view' => 'مشاهده مراکز درمانی',
                'centers.create' => 'ایجاد مرکز درمانی',
                'centers.update' => 'ویرایش مرکز درمانی',
                'centers.contracts' => 'مدیریت قراردادها',
            ],
            'financial' => [
                'financial.view' => 'مشاهده مالی',
                'financial.aggregate' => 'تجمیع صورتحساب',
                'financial.approve' => 'تایید پرداخت',
                'financial.pay' => 'انجام پرداخت',
            ],
            'commission' => [
                'commission.view' => 'مشاهده کمیسیون',
                'commission.create' => 'ایجاد پرونده کمیسیون',
                'commission.verdict' => 'صدور رأی',
            ],
            'reports' => [
                'reports.dashboard' => 'داشبورد',
                'reports.claims' => 'گزارش پرونده‌ها',
                'reports.financial' => 'گزارش مالی',
                'reports.export' => 'خروجی گزارش',
            ],
            'users' => [
                'users.view' => 'مشاهده کاربران',
                'users.create' => 'ایجاد کاربر',
                'users.update' => 'ویرایش کاربر',
                'users.delete' => 'حذف کاربر',
            ],
            'settings' => [
                'settings.view' => 'مشاهده تنظیمات',
                'settings.update' => 'ویرایش تنظیمات',
                'settings.pricing_rules' => 'مدیریت قوانین قیمت‌گذاری',
            ],
        ];

        $permissions = [];
        foreach ($permissionGroups as $group => $perms) {
            foreach ($perms as $name => $title) {
                $permissions[] = [
                    'name' => $name,
                    'title' => $title,
                    'group_name' => $group,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        DB::table('permissions')->insert($permissions);

        // Assign all permissions to admin role
        $adminRole = DB::table('roles')->where('name', 'admin')->first();
        $allPermissions = DB::table('permissions')->pluck('id');

        $rolePermissions = [];
        foreach ($allPermissions as $permId) {
            $rolePermissions[] = [
                'role_id' => $adminRole->id,
                'permission_id' => $permId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('role_permissions')->insert($rolePermissions);

        // Claim expert permissions
        $claimExpert = DB::table('roles')->where('name', 'claim_expert')->first();
        $claimPerms = DB::table('permissions')
            ->whereIn('group_name', ['claims', 'prescriptions', 'invoices', 'employees', 'items', 'reports'])
            ->whereNotIn('name', ['employees.delete', 'employees.import', 'items.delete', 'claims.archive'])
            ->pluck('id');

        $expertRolePerms = [];
        foreach ($claimPerms as $permId) {
            $expertRolePerms[] = [
                'role_id' => $claimExpert->id,
                'permission_id' => $permId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('role_permissions')->insert($expertRolePerms);

        // Claim supervisor - same as expert + confirm + archive
        $claimSupervisor = DB::table('roles')->where('name', 'claim_supervisor')->first();
        $supervisorPerms = DB::table('permissions')
            ->whereIn('group_name', ['claims', 'prescriptions', 'invoices', 'employees', 'items', 'reports'])
            ->whereNotIn('name', ['employees.delete', 'items.delete'])
            ->pluck('id');

        $supervisorRolePerms = [];
        foreach ($supervisorPerms as $permId) {
            $supervisorRolePerms[] = [
                'role_id' => $claimSupervisor->id,
                'permission_id' => $permId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('role_permissions')->insert($supervisorRolePerms);

        // Data entry permissions
        $dataEntry = DB::table('roles')->where('name', 'data_entry')->first();
        $dataEntryPerms = DB::table('permissions')
            ->whereIn('name', [
                'employees.view', 'employees.create', 'employees.update', 'employees.import', 'employees.family',
                'prescriptions.view', 'prescriptions.create', 'prescriptions.update',
                'invoices.view', 'invoices.create', 'invoices.update',
                'insurance.view', 'insurance.inquiry',
                'items.view',
            ])
            ->pluck('id');

        $dataEntryRolePerms = [];
        foreach ($dataEntryPerms as $permId) {
            $dataEntryRolePerms[] = [
                'role_id' => $dataEntry->id,
                'permission_id' => $permId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('role_permissions')->insert($dataEntryRolePerms);

        // Viewer - only view + reports
        $viewer = DB::table('roles')->where('name', 'viewer')->first();
        $viewerPerms = DB::table('permissions')
            ->where('name', 'like', '%.view')
            ->orWhereIn('group_name', ['reports'])
            ->pluck('id');

        $viewerRolePerms = [];
        foreach ($viewerPerms as $permId) {
            $viewerRolePerms[] = [
                'role_id' => $viewer->id,
                'permission_id' => $permId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('role_permissions')->insert($viewerRolePerms);

        // Financial manager
        $financialManager = DB::table('roles')->where('name', 'financial_manager')->first();
        $financialPerms = DB::table('permissions')
            ->whereIn('group_name', ['financial', 'reports', 'invoices', 'claims', 'centers'])
            ->whereIn('name', [
                'financial.view', 'financial.aggregate', 'financial.approve', 'financial.pay',
                'reports.dashboard', 'reports.financial', 'reports.export',
                'invoices.view', 'claims.view', 'centers.view', 'centers.contracts',
            ])
            ->pluck('id');

        $financialRolePerms = [];
        foreach ($financialPerms as $permId) {
            $financialRolePerms[] = [
                'role_id' => $financialManager->id,
                'permission_id' => $permId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('role_permissions')->insert($financialRolePerms);

        // Insurance manager
        $insuranceManager = DB::table('roles')->where('name', 'insurance_manager')->first();
        $insurancePerms = DB::table('permissions')
            ->whereIn('group_name', ['insurance', 'employees', 'items', 'centers', 'reports', 'settings'])
            ->pluck('id');

        $insuranceRolePerms = [];
        foreach ($insurancePerms as $permId) {
            $insuranceRolePerms[] = [
                'role_id' => $insuranceManager->id,
                'permission_id' => $permId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('role_permissions')->insert($insuranceRolePerms);

        // Medical commission
        $commission = DB::table('roles')->where('name', 'medical_commission')->first();
        $commissionPerms = DB::table('permissions')
            ->whereIn('name', [
                'commission.view', 'commission.create', 'commission.verdict',
                'employees.view', 'claims.view', 'reports.dashboard',
            ])
            ->pluck('id');

        $commissionRolePerms = [];
        foreach ($commissionPerms as $permId) {
            $commissionRolePerms[] = [
                'role_id' => $commission->id,
                'permission_id' => $permId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('role_permissions')->insert($commissionRolePerms);

        // Social worker
        $socialWorker = DB::table('roles')->where('name', 'social_worker')->first();
        $socialPerms = DB::table('permissions')
            ->whereIn('name', [
                'employees.view', 'claims.view', 'reports.dashboard',
            ])
            ->pluck('id');

        $socialRolePerms = [];
        foreach ($socialPerms as $permId) {
            $socialRolePerms[] = [
                'role_id' => $socialWorker->id,
                'permission_id' => $permId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('role_permissions')->insert($socialRolePerms);
    }
}
