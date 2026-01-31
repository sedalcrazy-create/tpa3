<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LookupSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // 31 Provinces of Iran
        $provinces = [
            ['name' => 'آذربایجان شرقی', 'code' => '01'],
            ['name' => 'آذربایجان غربی', 'code' => '02'],
            ['name' => 'اردبیل', 'code' => '03'],
            ['name' => 'اصفهان', 'code' => '04'],
            ['name' => 'البرز', 'code' => '05'],
            ['name' => 'ایلام', 'code' => '06'],
            ['name' => 'بوشهر', 'code' => '07'],
            ['name' => 'تهران', 'code' => '08'],
            ['name' => 'چهارمحال و بختیاری', 'code' => '09'],
            ['name' => 'خراسان جنوبی', 'code' => '10'],
            ['name' => 'خراسان رضوی', 'code' => '11'],
            ['name' => 'خراسان شمالی', 'code' => '12'],
            ['name' => 'خوزستان', 'code' => '13'],
            ['name' => 'زنجان', 'code' => '14'],
            ['name' => 'سمنان', 'code' => '15'],
            ['name' => 'سیستان و بلوچستان', 'code' => '16'],
            ['name' => 'فارس', 'code' => '17'],
            ['name' => 'قزوین', 'code' => '18'],
            ['name' => 'قم', 'code' => '19'],
            ['name' => 'کردستان', 'code' => '20'],
            ['name' => 'کرمان', 'code' => '21'],
            ['name' => 'کرمانشاه', 'code' => '22'],
            ['name' => 'کهگیلویه و بویراحمد', 'code' => '23'],
            ['name' => 'گلستان', 'code' => '24'],
            ['name' => 'گیلان', 'code' => '25'],
            ['name' => 'لرستان', 'code' => '26'],
            ['name' => 'مازندران', 'code' => '27'],
            ['name' => 'مرکزی', 'code' => '28'],
            ['name' => 'هرمزگان', 'code' => '29'],
            ['name' => 'همدان', 'code' => '30'],
            ['name' => 'یزد', 'code' => '31'],
        ];

        foreach ($provinces as &$province) {
            $province['is_active'] = true;
            $province['created_at'] = $now;
            $province['updated_at'] = $now;
        }
        DB::table('provinces')->insert($provinces);

        // Relation types
        $relationTypes = [
            ['title' => 'خود بیمه‌شده', 'code' => 'self'],
            ['title' => 'همسر', 'code' => 'spouse'],
            ['title' => 'فرزند', 'code' => 'child'],
            ['title' => 'پدر', 'code' => 'father'],
            ['title' => 'مادر', 'code' => 'mother'],
        ];

        foreach ($relationTypes as &$rt) {
            $rt['is_active'] = true;
            $rt['created_at'] = $now;
            $rt['updated_at'] = $now;
        }
        DB::table('relation_types')->insert($relationTypes);

        // Guardianship types
        $guardianshipTypes = [
            ['title' => 'قیم قانونی', 'code' => 'legal_guardian'],
            ['title' => 'سرپرست', 'code' => 'custodian'],
            ['title' => 'وکیل قانونی', 'code' => 'legal_representative'],
        ];

        foreach ($guardianshipTypes as &$gt) {
            $gt['is_active'] = true;
            $gt['created_at'] = $now;
            $gt['updated_at'] = $now;
        }
        DB::table('guardianship_types')->insert($guardianshipTypes);

        // Special employee types (ایثارگران)
        $specialTypes = [
            ['title' => 'جانباز', 'code' => 'veteran', 'description' => 'جانبازان جنگ تحمیلی'],
            ['title' => 'آزاده', 'code' => 'freed_pow', 'description' => 'آزادگان جنگ تحمیلی'],
            ['title' => 'خانواده شهید', 'code' => 'martyr_family', 'description' => 'خانواده محترم شهدا'],
            ['title' => 'رزمنده', 'code' => 'combatant', 'description' => 'رزمندگان جنگ تحمیلی'],
        ];

        foreach ($specialTypes as &$st) {
            $st['is_active'] = true;
            $st['created_at'] = $now;
            $st['updated_at'] = $now;
        }
        DB::table('special_employee_types')->insert($specialTypes);

        // Custom employee codes
        $employeeCodes = [
            ['code' => 'EMP-REG', 'title' => 'کارمند رسمی', 'description' => null],
            ['code' => 'EMP-CON', 'title' => 'کارمند قراردادی', 'description' => null],
            ['code' => 'EMP-RET', 'title' => 'بازنشسته', 'description' => null],
            ['code' => 'EMP-TMP', 'title' => 'کارمند موقت', 'description' => null],
        ];

        foreach ($employeeCodes as &$ec) {
            $ec['is_active'] = true;
            $ec['created_at'] = $now;
            $ec['updated_at'] = $now;
        }
        DB::table('custom_employee_codes')->insert($employeeCodes);

        // Prescription types
        $prescriptionTypes = [
            ['name' => 'عادی', 'code' => 'normal', 'description' => 'نسخه عادی'],
            ['name' => 'اورژانسی', 'code' => 'emergency', 'description' => 'نسخه اورژانسی'],
            ['name' => 'مزمن', 'code' => 'chronic', 'description' => 'نسخه بیماری مزمن'],
        ];

        foreach ($prescriptionTypes as &$pt) {
            $pt['is_active'] = true;
            $pt['created_at'] = $now;
            $pt['updated_at'] = $now;
        }
        DB::table('prescription_types')->insert($prescriptionTypes);

        // Document types
        $documentTypes = [
            ['name' => 'نسخه پزشک', 'code' => 'prescription', 'is_required' => true, 'allowed_extensions' => 'jpg,png,pdf', 'max_file_size_kb' => 5120],
            ['name' => 'صورتحساب', 'code' => 'invoice', 'is_required' => true, 'allowed_extensions' => 'jpg,png,pdf', 'max_file_size_kb' => 5120],
            ['name' => 'نتیجه آزمایش', 'code' => 'lab_result', 'is_required' => false, 'allowed_extensions' => 'jpg,png,pdf', 'max_file_size_kb' => 10240],
            ['name' => 'تصویر رادیولوژی', 'code' => 'radiology', 'is_required' => false, 'allowed_extensions' => 'jpg,png,pdf,dcm', 'max_file_size_kb' => 20480],
            ['name' => 'معرفی‌نامه', 'code' => 'referral', 'is_required' => false, 'allowed_extensions' => 'jpg,png,pdf', 'max_file_size_kb' => 5120],
            ['name' => 'کارت ملی', 'code' => 'national_id', 'is_required' => false, 'allowed_extensions' => 'jpg,png,pdf', 'max_file_size_kb' => 2048],
        ];

        foreach ($documentTypes as &$dt) {
            $dt['description'] = null;
            $dt['is_active'] = true;
            $dt['created_at'] = $now;
            $dt['updated_at'] = $now;
        }
        DB::table('document_types')->insert($documentTypes);

        // Body part types
        $bodyPartTypes = [
            ['name' => 'دندان', 'code' => 'tooth'],
            ['name' => 'چشم', 'code' => 'eye'],
            ['name' => 'مفصل', 'code' => 'joint'],
            ['name' => 'اندام', 'code' => 'limb'],
        ];

        foreach ($bodyPartTypes as &$bpt) {
            $bpt['is_active'] = true;
            $bpt['created_at'] = $now;
            $bpt['updated_at'] = $now;
        }
        DB::table('body_part_types')->insert($bodyPartTypes);

        // Commission case types
        $commissionCaseTypes = [
            ['name' => 'اعتراض به کسورات', 'code' => 'deduction_appeal', 'description' => null],
            ['name' => 'درخواست استثنا', 'code' => 'exception_request', 'description' => null],
            ['name' => 'بررسی تخلف', 'code' => 'infraction_review', 'description' => null],
        ];

        foreach ($commissionCaseTypes as &$cct) {
            $cct['is_active'] = true;
            $cct['created_at'] = $now;
            $cct['updated_at'] = $now;
        }
        DB::table('commission_case_types')->insert($commissionCaseTypes);

        // Institution contract types
        $contractTypes = [
            ['name' => 'قرارداد بیمارستانی', 'code' => 'hospital', 'description' => null],
            ['name' => 'قرارداد داروخانه', 'code' => 'pharmacy', 'description' => null],
            ['name' => 'قرارداد آزمایشگاه', 'code' => 'lab', 'description' => null],
            ['name' => 'قرارداد تصویربرداری', 'code' => 'imaging', 'description' => null],
            ['name' => 'قرارداد دندانپزشکی', 'code' => 'dentistry', 'description' => null],
        ];

        foreach ($contractTypes as &$ct) {
            $ct['is_active'] = true;
            $ct['created_at'] = $now;
            $ct['updated_at'] = $now;
        }
        DB::table('institution_contract_types')->insert($contractTypes);
    }
}
