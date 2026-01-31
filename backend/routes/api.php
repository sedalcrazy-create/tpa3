<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\InsuranceController;
use App\Http\Controllers\Api\V1\ContractController;
use App\Http\Controllers\Api\V1\ItemController;
use App\Http\Controllers\Api\V1\DiagnosisController;
use App\Http\Controllers\Api\V1\PrescriptionController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\ClaimController;
use App\Http\Controllers\Api\V1\CenterController;
use App\Http\Controllers\Api\V1\SettlementController;
use App\Http\Controllers\Api\V1\CommissionController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\LookupController;
use App\Http\Controllers\Api\V1\UserController;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // ── Auth ─────────────────────────────────────────
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // ── Employees (Phase 5) ──────────────────────────
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    // Specific routes BEFORE {id} wildcard
    Route::post('/employees/bulk-delete', [EmployeeController::class, 'bulkDestroy']);
    Route::get('/employees/search', [EmployeeController::class, 'search']);
    Route::get('/employees/import/history', [EmployeeController::class, 'importHistory']);
    Route::get('/employees/import/history/{historyId}', [EmployeeController::class, 'importHistoryDetail']);
    Route::get('/employees/import/template', [EmployeeController::class, 'importTemplate']);
    Route::post('/employees/import/stage', [EmployeeController::class, 'importStage']);
    Route::get('/employees/import/{importId}/preview', [EmployeeController::class, 'importPreview']);
    Route::post('/employees/import/{importId}/apply', [EmployeeController::class, 'importApply']);
    Route::post('/employees/import', [EmployeeController::class, 'import']);
    Route::post('/employees/sync', [EmployeeController::class, 'sync']);
    // Wildcard routes
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::put('/employees/{id}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);
    Route::get('/employees/{id}/family', [EmployeeController::class, 'family']);
    Route::post('/employees/{id}/family', [EmployeeController::class, 'storeFamily']);
    Route::put('/employees/{id}/family/{familyId}', [EmployeeController::class, 'updateFamily']);
    Route::delete('/employees/{id}/family/{familyId}', [EmployeeController::class, 'destroyFamily']);
    Route::get('/employees/{id}/insurance', [EmployeeController::class, 'insurance']);
    Route::get('/employees/{id}/illnesses', [EmployeeController::class, 'illnesses']);
    Route::post('/employees/{id}/illnesses', [EmployeeController::class, 'storeIllness']);
    Route::put('/employees/{id}/illnesses/{illnessId}', [EmployeeController::class, 'updateIllness']);
    Route::delete('/employees/{id}/illnesses/{illnessId}', [EmployeeController::class, 'destroyIllness']);
    Route::get('/employees/{id}/infractions', [EmployeeController::class, 'infractions']);
    Route::post('/employees/{id}/infractions', [EmployeeController::class, 'storeInfraction']);
    Route::put('/employees/{id}/infractions/{infractionId}', [EmployeeController::class, 'updateInfraction']);
    Route::delete('/employees/{id}/infractions/{infractionId}', [EmployeeController::class, 'destroyInfraction']);

    // ── Insurance (Phase 6) ──────────────────────────
    Route::get('/insurances', [InsuranceController::class, 'index']);
    Route::post('/insurances', [InsuranceController::class, 'store']);
    Route::post('/insurances/inquiry', [InsuranceController::class, 'inquiry']);
    Route::get('/insurances/{id}', [InsuranceController::class, 'show']);
    Route::put('/insurances/{id}', [InsuranceController::class, 'update']);
    Route::delete('/insurances/{id}', [InsuranceController::class, 'destroy']);
    Route::post('/insurances/{id}/check-ceiling', [InsuranceController::class, 'checkCeiling']);

    // ── Contracts (Phase 6) ──────────────────────────
    Route::get('/contracts', [ContractController::class, 'index']);
    Route::post('/contracts', [ContractController::class, 'store']);
    Route::get('/contracts/{id}', [ContractController::class, 'show']);
    Route::put('/contracts/{id}', [ContractController::class, 'update']);
    Route::delete('/contracts/{id}', [ContractController::class, 'destroy']);

    // ── Items / Drug & Service Catalog (Phase 7) ─────
    Route::get('/items', [ItemController::class, 'index']);
    Route::post('/items', [ItemController::class, 'store']);
    Route::post('/items/prices', [ItemController::class, 'addPrice']);
    Route::post('/items/interactions', [ItemController::class, 'interactions']);
    Route::get('/items/{id}', [ItemController::class, 'show']);
    Route::put('/items/{id}', [ItemController::class, 'update']);
    Route::delete('/items/{id}', [ItemController::class, 'destroy']);
    Route::get('/items/{id}/price', [ItemController::class, 'price']);

    // ── Diagnosis / ICD (Phase 7) ────────────────────
    Route::get('/diagnoses', [DiagnosisController::class, 'index']);
    Route::get('/diagnoses/code/{code}', [DiagnosisController::class, 'findByCode']);
    Route::get('/diagnoses/{id}', [DiagnosisController::class, 'show']);

    // ── Prescriptions (Phase 9) ──────────────────────
    Route::get('/prescriptions', [PrescriptionController::class, 'index']);
    Route::post('/prescriptions', [PrescriptionController::class, 'store']);
    Route::get('/prescriptions/{id}', [PrescriptionController::class, 'show']);
    Route::put('/prescriptions/{id}', [PrescriptionController::class, 'update']);
    Route::delete('/prescriptions/{id}', [PrescriptionController::class, 'destroy']);

    // ── Invoices (Phase 9) ───────────────────────────
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::post('/invoices', [InvoiceController::class, 'store']);
    Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
    Route::put('/invoices/{id}', [InvoiceController::class, 'update']);
    Route::delete('/invoices/{id}', [InvoiceController::class, 'destroy']);
    Route::post('/invoices/{id}/calculate', [InvoiceController::class, 'calculate']);
    Route::post('/invoices/{id}/submit', [InvoiceController::class, 'submit']);

    // ── Claims (Phase 10) ────────────────────────────
    Route::get('/claims/statuses', [ClaimController::class, 'statuses']);
    Route::get('/claims', [ClaimController::class, 'index']);
    Route::post('/claims', [ClaimController::class, 'store']);
    Route::get('/claims/{id}', [ClaimController::class, 'show']);
    Route::put('/claims/{id}', [ClaimController::class, 'update']);
    Route::post('/claims/{id}/transition', [ClaimController::class, 'transition']);
    Route::post('/claims/{id}/notes', [ClaimController::class, 'addNote']);
    Route::post('/claims/{id}/attachments', [ClaimController::class, 'addAttachment']);
    Route::get('/claims/{id}/next-statuses', [ClaimController::class, 'nextStatuses']);

    // ── Centers (Phase 11) ───────────────────────────
    Route::get('/centers', [CenterController::class, 'index']);
    Route::post('/centers', [CenterController::class, 'store']);
    Route::get('/centers/{id}', [CenterController::class, 'show']);
    Route::put('/centers/{id}', [CenterController::class, 'update']);
    Route::delete('/centers/{id}', [CenterController::class, 'destroy']);
    Route::get('/centers/{id}/doctors', [CenterController::class, 'doctors']);
    Route::post('/centers/doctors', [CenterController::class, 'addDoctor']);
    Route::get('/centers/{id}/contracts', [CenterController::class, 'contracts']);

    // ── Financial Settlement (Phase 12) ──────────────
    Route::get('/settlements', [SettlementController::class, 'index']);
    Route::get('/settlements/{id}', [SettlementController::class, 'show']);
    Route::post('/settlements/aggregate', [SettlementController::class, 'aggregate']);
    Route::post('/settlements/{id}/approve', [SettlementController::class, 'approve']);
    Route::post('/settlements/{id}/pay', [SettlementController::class, 'markPaid']);

    // ── Commission (Phase 13) ────────────────────────
    Route::get('/commission/cases', [CommissionController::class, 'cases']);
    Route::post('/commission/cases', [CommissionController::class, 'createCase']);
    Route::get('/commission/cases/{id}', [CommissionController::class, 'showCase']);
    Route::put('/commission/cases/{id}', [CommissionController::class, 'updateCase']);
    Route::post('/commission/cases/{id}/verdict', [CommissionController::class, 'issueVerdict']);
    Route::get('/commission/social-work', [CommissionController::class, 'socialWork']);
    Route::post('/commission/social-work', [CommissionController::class, 'createSocialWork']);
    Route::get('/commission/social-work/{id}', [CommissionController::class, 'showSocialWork']);
    Route::post('/commission/social-work/{id}/resolve', [CommissionController::class, 'resolveSocialWork']);

    // ── Reports (Phase 14) ───────────────────────────
    Route::get('/reports/dashboard', [ReportController::class, 'dashboard']);
    Route::get('/reports/claims', [ReportController::class, 'claims']);
    Route::get('/reports/financial', [ReportController::class, 'financial']);

    // ── Lookups (Phase 15) ───────────────────────────
    Route::get('/lookups/provinces', [LookupController::class, 'provinces']);
    Route::get('/lookups/relation-types', [LookupController::class, 'relationTypes']);
    Route::get('/lookups/guardianship-types', [LookupController::class, 'guardianshipTypes']);
    Route::get('/lookups/employee-codes', [LookupController::class, 'customEmployeeCodes']);
    Route::get('/lookups/special-employee-types', [LookupController::class, 'specialEmployeeTypes']);
    Route::get('/lookups/locations', [LookupController::class, 'locations']);
    Route::get('/lookups/prescription-types', [LookupController::class, 'prescriptionTypes']);
    Route::get('/lookups/document-types', [LookupController::class, 'documentTypes']);
    Route::get('/lookups/body-part-types', [LookupController::class, 'bodyPartTypes']);
    Route::get('/lookups/commission-case-types', [LookupController::class, 'commissionCaseTypes']);
    Route::get('/lookups/institution-contract-types', [LookupController::class, 'institutionContractTypes']);
    Route::get('/lookups/item-categories', [LookupController::class, 'itemCategories']);
    Route::get('/lookups/item-groups', [LookupController::class, 'itemGroups']);
    Route::get('/lookups/marriage-statuses', [LookupController::class, 'marriageStatuses']);

    // ── Users (Phase 15) ─────────────────────────────
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/users/{id}/toggle-active', [UserController::class, 'toggleActive']);
});
