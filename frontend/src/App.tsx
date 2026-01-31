import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/ui/LoadingSpinner';

const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const EmployeeListPage = lazy(() => import('./pages/employees/EmployeeListPage'));
const EmployeeCreatePage = lazy(() => import('./pages/employees/EmployeeCreatePage'));
const EmployeeEditPage = lazy(() => import('./pages/employees/EmployeeEditPage'));
const EmployeeViewPage = lazy(() => import('./pages/employees/EmployeeViewPage'));
const EmployeeFamilyPage = lazy(() => import('./pages/employees/EmployeeFamilyPage'));
const InsuranceListPage = lazy(() => import('./pages/insurances/InsuranceListPage'));
const InsuranceFormPage = lazy(() => import('./pages/insurances/InsuranceFormPage'));
const InsuranceInquiryPage = lazy(() => import('./pages/insurances/InsuranceInquiryPage'));
const ContractListPage = lazy(() => import('./pages/contracts/ContractListPage'));
const ContractFormPage = lazy(() => import('./pages/contracts/ContractFormPage'));
const ItemListPage = lazy(() => import('./pages/items/ItemListPage'));
const ItemFormPage = lazy(() => import('./pages/items/ItemFormPage'));
const ItemPricePage = lazy(() => import('./pages/items/ItemPricePage'));
const DiagnosisListPage = lazy(() => import('./pages/diagnoses/DiagnosisListPage'));
const PrescriptionListPage = lazy(() => import('./pages/prescriptions/PrescriptionListPage'));
const PrescriptionFormPage = lazy(() => import('./pages/prescriptions/PrescriptionFormPage'));
const InvoiceListPage = lazy(() => import('./pages/invoices/InvoiceListPage'));
const InvoiceFormPage = lazy(() => import('./pages/invoices/InvoiceFormPage'));
const InvoiceViewPage = lazy(() => import('./pages/invoices/InvoiceViewPage'));
const ClaimListPage = lazy(() => import('./pages/claims/ClaimListPage'));
const ClaimFormPage = lazy(() => import('./pages/claims/ClaimFormPage'));
const ClaimViewPage = lazy(() => import('./pages/claims/ClaimViewPage'));
const CenterListPage = lazy(() => import('./pages/centers/CenterListPage'));
const CenterFormPage = lazy(() => import('./pages/centers/CenterFormPage'));
const CenterViewPage = lazy(() => import('./pages/centers/CenterViewPage'));
const SettlementListPage = lazy(() => import('./pages/settlements/SettlementListPage'));
const SettlementViewPage = lazy(() => import('./pages/settlements/SettlementViewPage'));
const CommissionCaseListPage = lazy(() => import('./pages/commission/CommissionCaseListPage'));
const CommissionCaseFormPage = lazy(() => import('./pages/commission/CommissionCaseFormPage'));
const SocialWorkListPage = lazy(() => import('./pages/commission/SocialWorkListPage'));
const SocialWorkFormPage = lazy(() => import('./pages/commission/SocialWorkFormPage'));
const ClaimReportPage = lazy(() => import('./pages/reports/ClaimReportPage'));
const FinancialReportPage = lazy(() => import('./pages/reports/FinancialReportPage'));
const UserListPage = lazy(() => import('./pages/users/UserListPage'));
const UserFormPage = lazy(() => import('./pages/users/UserFormPage'));
const AuditLogPage = lazy(() => import('./pages/audit/AuditLogPage'));
const RoleListPage = lazy(() => import('./pages/roles/RoleListPage'));
const RoleFormPage = lazy(() => import('./pages/roles/RoleFormPage'));
const EmployeeImportPage = lazy(() => import('./pages/employees/EmployeeImportPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            {/* Employees */}
            <Route path="employees" element={<Suspense fallback={<PageLoader />}><EmployeeListPage /></Suspense>} />
            <Route path="employees/create" element={<Suspense fallback={<PageLoader />}><EmployeeCreatePage /></Suspense>} />
            <Route path="employees/import" element={<Suspense fallback={<PageLoader />}><EmployeeImportPage /></Suspense>} />
            <Route path="employees/:id" element={<Suspense fallback={<PageLoader />}><EmployeeViewPage /></Suspense>} />
            <Route path="employees/:id/edit" element={<Suspense fallback={<PageLoader />}><EmployeeEditPage /></Suspense>} />
            <Route path="employees/:id/family" element={<Suspense fallback={<PageLoader />}><EmployeeFamilyPage /></Suspense>} />
            {/* Insurances */}
            <Route path="insurances" element={<Suspense fallback={<PageLoader />}><InsuranceListPage /></Suspense>} />
            <Route path="insurances/create" element={<Suspense fallback={<PageLoader />}><InsuranceFormPage /></Suspense>} />
            <Route path="insurances/:id/edit" element={<Suspense fallback={<PageLoader />}><InsuranceFormPage /></Suspense>} />
            <Route path="insurances/inquiry" element={<Suspense fallback={<PageLoader />}><InsuranceInquiryPage /></Suspense>} />
            {/* Contracts */}
            <Route path="contracts" element={<Suspense fallback={<PageLoader />}><ContractListPage /></Suspense>} />
            <Route path="contracts/create" element={<Suspense fallback={<PageLoader />}><ContractFormPage /></Suspense>} />
            <Route path="contracts/:id/edit" element={<Suspense fallback={<PageLoader />}><ContractFormPage /></Suspense>} />
            {/* Items */}
            <Route path="items" element={<Suspense fallback={<PageLoader />}><ItemListPage /></Suspense>} />
            <Route path="items/create" element={<Suspense fallback={<PageLoader />}><ItemFormPage /></Suspense>} />
            <Route path="items/:id/edit" element={<Suspense fallback={<PageLoader />}><ItemFormPage /></Suspense>} />
            <Route path="items/:id/price" element={<Suspense fallback={<PageLoader />}><ItemPricePage /></Suspense>} />
            {/* Diagnoses */}
            <Route path="diagnoses" element={<Suspense fallback={<PageLoader />}><DiagnosisListPage /></Suspense>} />
            {/* Prescriptions */}
            <Route path="prescriptions" element={<Suspense fallback={<PageLoader />}><PrescriptionListPage /></Suspense>} />
            <Route path="prescriptions/create" element={<Suspense fallback={<PageLoader />}><PrescriptionFormPage /></Suspense>} />
            <Route path="prescriptions/:id/edit" element={<Suspense fallback={<PageLoader />}><PrescriptionFormPage /></Suspense>} />
            {/* Invoices */}
            <Route path="invoices" element={<Suspense fallback={<PageLoader />}><InvoiceListPage /></Suspense>} />
            <Route path="invoices/create" element={<Suspense fallback={<PageLoader />}><InvoiceFormPage /></Suspense>} />
            <Route path="invoices/:id" element={<Suspense fallback={<PageLoader />}><InvoiceViewPage /></Suspense>} />
            <Route path="invoices/:id/edit" element={<Suspense fallback={<PageLoader />}><InvoiceFormPage /></Suspense>} />
            {/* Claims */}
            <Route path="claims" element={<Suspense fallback={<PageLoader />}><ClaimListPage /></Suspense>} />
            <Route path="claims/create" element={<Suspense fallback={<PageLoader />}><ClaimFormPage /></Suspense>} />
            <Route path="claims/:id" element={<Suspense fallback={<PageLoader />}><ClaimViewPage /></Suspense>} />
            <Route path="claims/:id/edit" element={<Suspense fallback={<PageLoader />}><ClaimFormPage /></Suspense>} />
            {/* Centers */}
            <Route path="centers" element={<Suspense fallback={<PageLoader />}><CenterListPage /></Suspense>} />
            <Route path="centers/create" element={<Suspense fallback={<PageLoader />}><CenterFormPage /></Suspense>} />
            <Route path="centers/:id" element={<Suspense fallback={<PageLoader />}><CenterViewPage /></Suspense>} />
            <Route path="centers/:id/edit" element={<Suspense fallback={<PageLoader />}><CenterFormPage /></Suspense>} />
            {/* Settlements */}
            <Route path="settlements" element={<Suspense fallback={<PageLoader />}><SettlementListPage /></Suspense>} />
            <Route path="settlements/:id" element={<Suspense fallback={<PageLoader />}><SettlementViewPage /></Suspense>} />
            {/* Commission */}
            <Route path="commission/cases" element={<Suspense fallback={<PageLoader />}><CommissionCaseListPage /></Suspense>} />
            <Route path="commission/cases/create" element={<Suspense fallback={<PageLoader />}><CommissionCaseFormPage /></Suspense>} />
            <Route path="commission/cases/:id" element={<Suspense fallback={<PageLoader />}><CommissionCaseFormPage /></Suspense>} />
            <Route path="commission/social-work" element={<Suspense fallback={<PageLoader />}><SocialWorkListPage /></Suspense>} />
            <Route path="commission/social-work/create" element={<Suspense fallback={<PageLoader />}><SocialWorkFormPage /></Suspense>} />
            <Route path="commission/social-work/:id" element={<Suspense fallback={<PageLoader />}><SocialWorkFormPage /></Suspense>} />
            {/* Reports */}
            <Route path="reports/claims" element={<Suspense fallback={<PageLoader />}><ClaimReportPage /></Suspense>} />
            <Route path="reports/financial" element={<Suspense fallback={<PageLoader />}><FinancialReportPage /></Suspense>} />
            {/* Users */}
            <Route path="users" element={<Suspense fallback={<PageLoader />}><UserListPage /></Suspense>} />
            <Route path="users/create" element={<Suspense fallback={<PageLoader />}><UserFormPage /></Suspense>} />
            <Route path="users/:id/edit" element={<Suspense fallback={<PageLoader />}><UserFormPage /></Suspense>} />
            {/* Roles */}
            <Route path="roles" element={<Suspense fallback={<PageLoader />}><RoleListPage /></Suspense>} />
            <Route path="roles/create" element={<Suspense fallback={<PageLoader />}><RoleFormPage /></Suspense>} />
            <Route path="roles/:id/edit" element={<Suspense fallback={<PageLoader />}><RoleFormPage /></Suspense>} />
            {/* Audit */}
            <Route path="audit" element={<Suspense fallback={<PageLoader />}><AuditLogPage /></Suspense>} />
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'Vazirmatn', direction: 'rtl' },
        }}
      />
    </QueryClientProvider>
  );
}
